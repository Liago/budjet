import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionDto } from "./dto/query-transaction.dto";
import { Prisma } from "@prisma/client";
import { TransactionType } from "../common/constants";
// import { parse } from "csv-parse";
// import * as fs from "fs";
// import * as iconv from "iconv-lite";
// import { parse as parseDate } from "date-fns";

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const { tags, ...transactionData } = createTransactionDto;

    // Create or connect tags
    const tagConnectOrCreate =
      tags?.map((tagName) => ({
        where: { name_userId: { name: tagName, userId } },
        create: { name: tagName, userId },
      })) || [];

    return this.prisma.transaction.create({
      data: {
        ...transactionData,
        userId,
        tags: {
          connectOrCreate: tagConnectOrCreate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, queryDto: QueryTransactionDto) {
    const {
      startDate,
      endDate,
      type,
      categoryId,
      tag,
      page = 1,
      limit = 10,
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: Prisma.TransactionWhereInput = { userId };

    // Initialize date filter if needed
    let dateFilter: Prisma.DateTimeFilter = {};

    if (startDate) {
      dateFilter.gte = startDate;
    }

    if (endDate) {
      dateFilter.lte = endDate;
    }

    // Only add date filter if we have date constraints
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter;
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
          userId,
        },
      };
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
            },
          },
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto
  ) {
    // Check if transaction exists
    await this.findOne(id, userId);

    const { tags, ...transactionData } = updateTransactionDto;

    // If tags are provided, update them
    let tagsUpdate = {};
    if (tags) {
      // First disconnect all existing tags
      tagsUpdate = {
        tags: {
          set: [],
          connectOrCreate: tags.map((tagName) => ({
            where: { name_userId: { name: tagName, userId } },
            create: { name: tagName, userId },
          })),
        },
      };
    }

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...transactionData,
        ...tagsUpdate,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if transaction exists
    await this.findOne(id, userId);

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { success: true };
  }

  async removeAllForUser(userId: string) {
    try {
      console.log(`Starting transaction deletion for user: ${userId}`);

      // Check if the user has any transactions first
      const count = await this.prisma.transaction.count({
        where: { userId },
      });

      console.log(`Found ${count} transactions to delete for user: ${userId}`);

      if (count === 0) {
        return {
          success: true,
          message: "No transactions to delete",
          count: 0,
        };
      }

      // Delete all transactions for a specific user
      const result = await this.prisma.transaction.deleteMany({
        where: { userId },
      });

      console.log(`Deleted ${result.count} transactions for user: ${userId}`);

      return {
        success: true,
        message: `Successfully deleted ${result.count} transactions`,
        count: result.count,
      };
    } catch (error) {
      console.error("Error in removeAllForUser:", error);
      throw new BadRequestException(
        `Failed to delete transactions: ${error.message}`
      );
    }
  }

  // TEMPORANEAMENTE DISABILITATO PER NETLIFY FUNCTIONS
  // La funzione importFromCsv usa filesystem local che non è supportato
  // Dovrà essere reimplementata con memory storage o cloud storage
  /*
  async importFromCsv(
    userId: string,
    file: Express.Multer.File,
    defaultCategoryId?: string
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Get user's categories
    const userCategories = await this.prisma.category.findMany({
      where: { userId },
    });

    // Create a default category if not provided
    let defaultCategory;
    if (!defaultCategoryId) {
      // Check if an "Uncategorized" category exists
      defaultCategory = userCategories.find(
        (cat) => cat.name.toLowerCase() === "uncategorized"
      );

      // If not, create one
      if (!defaultCategory) {
        defaultCategory = await this.prisma.category.create({
          data: {
            name: "Uncategorized",
            icon: "question-mark",
            color: "#808080", // Gray color
            userId,
          },
        });
      }
      defaultCategoryId = defaultCategory.id;
    }

    // Function to find category ID by name
    const findCategoryId = (categoryName: string) => {
      if (!categoryName) return defaultCategoryId;

      const category = userCategories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      return category?.id || defaultCategoryId;
    };

    // Parse CSV
    return new Promise((resolve, reject) => {
      const results = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: ",",
      });

      // Process each record
      parser.on("readable", async () => {
        let record;
        while ((record = parser.read()) !== null) {
          try {
            if (!record.Type || !record.Transaction) {
              console.warn("Skipping row with missing required fields", record);
              continue;
            }

            // Process the transaction type
            const type = record.Type.toLowerCase().includes("expense")
              ? "EXPENSE"
              : "INCOME";

            // Process the amount (replace comma with period for decimal separator and remove any other non-numeric chars)
            const amountStr = record.Transaction.replace("−", "-").replace(
              ",",
              "."
            );
            const amount = Math.abs(
              parseFloat(amountStr.replace(/[^\d.-]/g, ""))
            );

            if (isNaN(amount)) {
              console.warn("Skipping row with invalid amount", record);
              continue;
            }

            // Process the date - supporta sia il formato ISO che il formato "MMM d, yyyy"
            let date;
            try {
              if (record.Date) {
                // Verifica se è già in formato ISO
                if (record.Date.includes("T")) {
                  date = new Date(record.Date);
                } else {
                  // Altrimenti usa il formato precedente
                  date = parseDate(record.Date, "MMM d, yyyy", new Date());
                }
              } else {
                date = new Date();
              }
            } catch (error) {
              console.warn("Error parsing date, using current date", error);
              date = new Date();
            }

            // Find category ID - always use defaultCategoryId as fallback
            const categoryId = findCategoryId(record.Category);

            // Extract tags from note
            const note = record.Note || "";
            const tags =
              note.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) || [];

            // Create transaction record
            results.push({
              type,
              amount: Number(amount),
              date,
              description:
                note.replace(/#\w+/g, "").trim() ||
                `Imported ${type.toLowerCase()}`,
              categoryId: categoryId, // Ensure categoryId is always defined
              tags,
            });
          } catch (error) {
            console.error("Error processing CSV row:", error, record);
          }
        }
      });

      // Handle errors
      parser.on("error", (err) => {
        reject(new BadRequestException(`CSV parsing error: ${err.message}`));
      });

      // When done parsing
      parser.on("end", async () => {
        try {
          // Batch insert transactions
          const createdTransactions = [];
          for (const transaction of results) {
            const { tags, ...transactionData } = transaction;

            const createdTransaction = await this.create(userId, {
              ...transactionData,
              tags: tags,
            });

            createdTransactions.push(createdTransaction);
          }

          resolve({
            success: true,
            count: createdTransactions.length,
            transactions: createdTransactions,
          });
        } catch (error) {
          reject(
            new BadRequestException(
              `Failed to import transactions: ${error.message}`
            )
          );
        }
      });

      // Read file and detect encoding
      try {
        // Read the first few bytes to check encoding
        const fileBuffer = fs.readFileSync(file.path);
        const hasUtf16Bom =
          (fileBuffer[0] === 0xff && fileBuffer[1] === 0xfe) || // UTF-16LE BOM
          (fileBuffer[0] === 0xfe && fileBuffer[1] === 0xff); // UTF-16BE BOM

        // Check for null bytes which suggest UTF-16 encoding
        const hasNullBytes = fileBuffer.includes(0x00);

        // If UTF-16 detected, convert to UTF-8 before parsing
        if (hasUtf16Bom || hasNullBytes) {
          console.log("Detected UTF-16 encoding, converting to UTF-8");

          // Determine if it's UTF-16LE or UTF-16BE
          let encoding = "utf16le"; // Default to LE (little endian)
          if (hasUtf16Bom && fileBuffer[0] === 0xfe && fileBuffer[1] === 0xff) {
            encoding = "utf16be";
          }

          // Convert to UTF-8
          const content = iconv.decode(fileBuffer, encoding);
          const utf8Buffer = iconv.encode(content, "utf8");

          // Create a stream from the converted buffer
          const Readable = require("stream").Readable;
          const readableStream = new Readable();
          readableStream.push(utf8Buffer);
          readableStream.push(null);

          // Pipe to parser
          readableStream.pipe(parser);
        } else {
          // Use normal file stream for UTF-8 files
          fs.createReadStream(file.path).pipe(parser);
        }
      } catch (error) {
        reject(
          new BadRequestException(`Error processing file: ${error.message}`)
        );
      }
    });
  }
  */
}
