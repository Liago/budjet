import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  Headers,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

// Interface for execution result
interface ExecutionResult {
  processedPayments: number;
  createdTransactions: number;
  totalAmount: number;
  executionDate: Date;
  details: {
    paymentName: string;
    amount: number;
    nextDate: Date;
  }[];
}

@ApiTags("direct")
@Controller("direct")
export class DirectController {
  constructor(private readonly prisma: PrismaService) {}

  // Helper function to determine category type from name
  private getCategoryType(categoryName: string): "INCOME" | "EXPENSE" {
    const name = categoryName.toLowerCase();

    // Income categories
    const incomeCategories = [
      "salary",
      "stipendio",
      "bonus",
      "gift",
      "regalo",
      "investment",
      "investimento",
      "refund",
      "rimborso",
      "special",
      "speciale",
      "income",
      "entrata",
    ];

    // Expense categories
    const expenseCategories = [
      "grocery",
      "alimentari",
      "spesa",
      "bar",
      "restaurant",
      "ristorante",
      "car",
      "auto",
      "transport",
      "trasporti",
      "health",
      "salute",
      "home",
      "casa",
      "utilities",
      "bollette",
      "pets",
      "animali",
      "shopping",
      "acquisti",
      "technology",
      "tecnologia",
      "taxes",
      "tasse",
      "food",
      "cibo",
      "entertainment",
      "svago",
      "travel",
      "viaggi",
      "education",
      "istruzione",
      "medical",
      "medico",
      "uncategorized",
    ];

    // Check for income first
    if (incomeCategories.some((income) => name.includes(income))) {
      return "INCOME";
    }

    // Check for expense
    if (expenseCategories.some((expense) => name.includes(expense))) {
      return "EXPENSE";
    }

    // Default to EXPENSE if unclear
    return "EXPENSE";
  }

  // 🚀 DEBUG ENDPOINT - Temporary for debugging
  @Get("debug-data")
  async getDebugData() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get sample transactions with amounts
      const transactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: { category: true },
      });

      // Get amount statistics
      const [positiveCount, negativeCount, totalCount] = await Promise.all([
        prisma.transaction.count({ where: { amount: { gt: 0 } } }),
        prisma.transaction.count({ where: { amount: { lt: 0 } } }),
        prisma.transaction.count(),
      ]);

      await prisma.$disconnect();

      return {
        sampleTransactions: transactions,
        stats: {
          totalTransactions: totalCount,
          positiveAmounts: positiveCount,
          negativeAmounts: negativeCount,
        },
        analysis: {
          issue:
            "If negativeAmounts = 0, then all expenses are saved as positive values",
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 TAG MIGRATION DEBUG - Verificare migrazione TagToTransaction
  @Get("debug-tags")
  async getTagsDebug() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 1. Conteggio totale di ogni tabella
      const [totalTransactions, totalTags, totalUsers, totalCategories] =
        await Promise.all([
          prisma.transaction.count(),
          prisma.tag.count(),
          prisma.user.count(),
          prisma.category.count(),
        ]);

      // 2. Alcuni tag esistenti
      const sampleTags = await prisma.tag.findMany({
        take: 10,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      });

      // 3. Alcuni transactions con tag
      const transactionsWithTags = await prisma.transaction.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: {
          tags: true,
          category: true,
        },
      });

      // 4. Conteggio relazioni many-to-many
      // Questo è un raw query per verificare se la tabella _TagToTransaction esiste
      let tagToTransactionCount = 0;
      try {
        const rawResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*) as count 
          FROM "_TagToTransaction"
        `;
        tagToTransactionCount = Number(rawResult[0].count);
      } catch (error) {
        console.log("_TagToTransaction table might not exist:", error.message);
      }

      await prisma.$disconnect();

      return {
        database_stats: {
          totalTransactions,
          totalTags,
          totalUsers,
          totalCategories,
          tagToTransactionRelations: tagToTransactionCount,
        },
        sample_tags: sampleTags,
        sample_transactions_with_tags: transactionsWithTags,
        analysis: {
          issue_detected: tagToTransactionCount === 0 && totalTags > 0,
          problem_description:
            tagToTransactionCount === 0 && totalTags > 0
              ? "Tags exist but no TagToTransaction relations found - migration issue"
              : "Tags and relations look normal",
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TAG MIGRATION FIX - Riparare relazioni TagToTransaction automaticamente (BATCH LIMITED)
  @Post("fix-tag-relations")
  async fixTagRelations(
    @Body() body: { limit?: number; offset?: number } = {}
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const limit = body.limit || 50; // Processa solo 50 transazioni per volta
      const offset = body.offset || 0;

      console.log(
        `🔧 Starting TagToTransaction relations repair (batch: ${limit}, offset: ${offset})...`
      );

      // 1. Verifica relazioni esistenti
      const existingRelations = await prisma.$queryRaw<
        Array<{ transaction_id: string; tag_id: string }>
      >`
        SELECT "A" as transaction_id, "B" as tag_id FROM "_TagToTransaction"
      `;
      console.log(`📊 Found ${existingRelations.length} existing relations`);

      // 2. Trova transazioni che potrebbero avere tag nei nomi/descrizioni (BATCH LIMITED)
      const transactions = await prisma.transaction.findMany({
        select: {
          id: true,
          description: true,
          tags: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      });

      const tags = await prisma.tag.findMany({
        select: { id: true, name: true },
      });

      console.log(
        `📊 Processing ${transactions.length} transactions against ${tags.length} tags`
      );

      // 3. Algoritmo di auto-associazione intelligente (OTTIMIZZATO)
      let matchedRelations = 0;
      let createdRelations = 0;
      const newRelations = [];

      for (const transaction of transactions) {
        const description = transaction.description.toLowerCase();
        const existingTagIds = new Set(transaction.tags.map((t) => t.id));

        for (const tag of tags) {
          const tagName = tag.name.toLowerCase();

          // Skip se la relazione esiste già
          if (existingTagIds.has(tag.id)) {
            continue;
          }

          // Verifica se il tag name è contenuto nella descrizione
          if (description.includes(tagName) && tagName.length >= 3) {
            matchedRelations++;
            newRelations.push({
              transactionId: transaction.id,
              tagId: tag.id,
              reason: `"${tagName}" found in "${transaction.description}"`,
            });
          }
        }
      }

      console.log(`🎯 Found ${matchedRelations} potential new relations`);

      // 4. Crea le nuove relazioni (batch di 5 per evitare timeout)
      const batchSize = 5;
      for (let i = 0; i < newRelations.length; i += batchSize) {
        const batch = newRelations.slice(i, i + batchSize);

        for (const relation of batch) {
          try {
            await prisma.transaction.update({
              where: { id: relation.transactionId },
              data: {
                tags: {
                  connect: { id: relation.tagId },
                },
              },
            });
            createdRelations++;
            console.log(`✅ Created relation: ${relation.reason}`);
          } catch (error) {
            console.log(`❌ Failed to create relation: ${error.message}`);
          }
        }
      }

      // 5. Verifica finale
      const finalRelations = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "_TagToTransaction"
      `;
      const finalCount = Number(finalRelations[0].count);

      // 6. Verifica se ci sono altre transazioni da processare
      const totalTransactions = await prisma.transaction.count();
      const hasMore = offset + limit < totalTransactions;

      await prisma.$disconnect();

      return {
        status: "TAG_RELATIONS_FIX_COMPLETED",
        batch_info: {
          processed: transactions.length,
          offset: offset,
          limit: limit,
          hasMore: hasMore,
          nextOffset: hasMore ? offset + limit : null,
          totalTransactions: totalTransactions,
        },
        results: {
          initial_relations: existingRelations.length,
          potential_matches: matchedRelations,
          created_relations: createdRelations,
          final_relations: finalCount,
          improvement: `+${createdRelations} relations created`,
        },
        sample_new_relations: newRelations.slice(0, 10),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "TAG_RELATIONS_FIX_FAILED",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TAG MIGRATION QUICK FIX - Riparare velocemente le prime 25 transazioni
  @Get("quick-fix-tags")
  async quickFixTags() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      console.log(
        "🔧 Quick TagToTransaction relations repair (25 transactions)..."
      );

      // 1. Verifica relazioni esistenti
      const existingRelations = await prisma.$queryRaw<
        Array<{ transaction_id: string; tag_id: string }>
      >`
        SELECT "A" as transaction_id, "B" as tag_id FROM "_TagToTransaction"
      `;

      // 2. Trova le prime 25 transazioni senza tag
      const transactions = await prisma.transaction.findMany({
        select: {
          id: true,
          description: true,
          tags: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        take: 25,
      });

      const tags = await prisma.tag.findMany({
        select: { id: true, name: true },
      });

      console.log(
        `📊 Processing ${transactions.length} transactions against ${tags.length} tags`
      );

      // 3. Algoritmo di auto-associazione intelligente
      let matchedRelations = 0;
      let createdRelations = 0;
      const newRelations = [];

      for (const transaction of transactions) {
        const description = transaction.description.toLowerCase();
        const existingTagIds = new Set(transaction.tags.map((t) => t.id));

        for (const tag of tags) {
          const tagName = tag.name.toLowerCase();

          // Skip se la relazione esiste già
          if (existingTagIds.has(tag.id)) {
            continue;
          }

          // Verifica se il tag name è contenuto nella descrizione
          if (description.includes(tagName) && tagName.length >= 3) {
            matchedRelations++;
            newRelations.push({
              transactionId: transaction.id,
              tagId: tag.id,
              reason: `"${tagName}" found in "${transaction.description}"`,
            });
          }
        }
      }

      console.log(`🎯 Found ${matchedRelations} potential new relations`);

      // 4. Crea le nuove relazioni (batch di 3 per velocità)
      const batchSize = 3;
      for (let i = 0; i < newRelations.length; i += batchSize) {
        const batch = newRelations.slice(i, i + batchSize);

        for (const relation of batch) {
          try {
            await prisma.transaction.update({
              where: { id: relation.transactionId },
              data: {
                tags: {
                  connect: { id: relation.tagId },
                },
              },
            });
            createdRelations++;
            console.log(`✅ Created relation: ${relation.reason}`);
          } catch (error) {
            console.log(`❌ Failed to create relation: ${error.message}`);
          }
        }
      }

      // 5. Verifica finale
      const finalRelations = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "_TagToTransaction"
      `;
      const finalCount = Number(finalRelations[0].count);

      await prisma.$disconnect();

      return {
        status: "QUICK_TAG_FIX_COMPLETED",
        results: {
          processed_transactions: transactions.length,
          initial_relations: existingRelations.length,
          potential_matches: matchedRelations,
          created_relations: createdRelations,
          final_relations: finalCount,
          improvement: `+${createdRelations} relations created`,
        },
        sample_new_relations: newRelations.slice(0, 5),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "QUICK_TAG_FIX_FAILED",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 CATEGORIES - Direct endpoint
  @Get("categories")
  async getCategories() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      });

      await prisma.$disconnect();

      return categories;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TRANSACTIONS - Direct endpoint
  @Get("transactions")
  async getTransactions(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("categoryId") categoryId?: string,
    @Query("type") type?: string, // 🔧 BUG FIX: Aggiunto parametro type mancante
    @Query("page") page = "1",
    @Query("limit") limit = "50"
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Add category filter
      if (categoryId && categoryId !== "all") {
        where.categoryId = categoryId;
      }

      // 🔧 BUG FIX: Add type filter - CRITICO per calcoli corretti
      if (type && (type === "EXPENSE" || type === "INCOME")) {
        where.type = type;
      }

      console.log("🔧 Transactions Debug - Applied filters:", {
        startDate,
        endDate,
        categoryId,
        type,
        whereClause: where,
      });

      // Get transactions with relations
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            category: true,
            tags: true,
          },
          orderBy: { date: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.transaction.count({ where }),
      ]);

      // 🔧 BUG FIX: Calculate sum for verification when type filter is applied
      let totalAmount = 0;
      if (type === "EXPENSE" || type === "INCOME") {
        const sumResult = await prisma.transaction.aggregate({
          where,
          _sum: { amount: true },
        });
        totalAmount = Number(sumResult._sum.amount || 0);
      }

      console.log("🔧 Transactions Debug - Results:", {
        totalTransactions: total,
        returnedTransactions: transactions.length,
        totalAmount: type ? totalAmount : "N/A (no type filter)",
        typeFilter: type || "none",
      });

      await prisma.$disconnect();

      return {
        data: transactions,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          totalAmount: type ? totalAmount : undefined, // Include sum when filtering by type
          appliedFilters: {
            startDate,
            endDate,
            categoryId,
            type,
          },
        },
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 CATEGORY SPENDING STATS - Direct endpoint
  @Get("category-spending")
  async getCategorySpending(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Default to current month if no dates provided
      const start = startDate
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      // Get spending by category
      const categorySpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          date: { gte: start, lte: end },
          type: "EXPENSE",
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      // Get category details
      const categoriesData = await Promise.all(
        categorySpending.map(async (item) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId },
            select: { id: true, name: true, color: true, budget: true },
          });

          return {
            categoryId: item.categoryId,
            categoryName: category?.name || "Unknown",
            color: category?.color || "#999999",
            budget: Number(category?.budget || 0),
            spent: Number(item._sum.amount || 0),
            transactionCount: item._count.id,
          };
        })
      );

      await prisma.$disconnect();
      return categoriesData.sort((a, b) => b.spent - a.spent);
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 RECENT TRANSACTIONS - Direct endpoint
  @Get("recent-transactions")
  async getRecentTransactions(@Query("limit") limit = "5") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const transactions = await prisma.transaction.findMany({
        take: parseInt(limit),
        orderBy: { date: "desc" },
        include: { category: true },
      });

      await prisma.$disconnect();
      return transactions;
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 DASHBOARD STATS - Direct endpoint
  @Get("stats")
  async getDashboardStats(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Default to current month if no dates provided
      const start = startDate
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      // Get basic stats using transaction TYPE instead of amount sign
      const [transactions, income, expenses] = await Promise.all([
        prisma.transaction.count({
          where: {
            date: { gte: start, lte: end },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            type: "INCOME",
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            type: "EXPENSE",
          },
          _sum: { amount: true },
        }),
      ]);

      // Calculate balance (all amounts are positive, so expenses are subtracted)
      const totalIncome = Number(income._sum.amount || 0);
      const totalExpenses = Number(expenses._sum.amount || 0);
      const balance = totalIncome - totalExpenses;

      await prisma.$disconnect();

      return {
        totalTransactions: transactions,
        totalIncome,
        totalExpenses,
        balance,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATIONS - Direct endpoint (placeholder)
  @Get("notifications")
  async getNotifications() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      await prisma.$disconnect();

      return notifications;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATIONS COUNT - Direct endpoint
  @Get("notifications/unread/count")
  async getUnreadNotificationsCount() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const count = await prisma.notification.count({
        where: { isRead: false },
      });

      await prisma.$disconnect();

      return { count };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATION MARK AS READ - Direct endpoint
  @Patch("notifications/:id/read")
  async markNotificationAsRead(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update notification to mark as read
      const updatedNotification = await prisma.notification.update({
        where: { id: id },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        notification: updatedNotification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 MARK ALL NOTIFICATIONS AS READ - Direct endpoint (PATCH)
  @Patch("notifications/mark-all-read")
  async markAllNotificationsAsRead() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update all unread notifications
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        updatedCount: result.count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 MARK ALL NOTIFICATIONS AS READ - Direct endpoint (POST - Frontend compatibility)
  @Post("notifications/read-all")
  async markAllNotificationsAsReadPost() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update all unread notifications
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        updatedCount: result.count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 USERS/ME - Direct endpoint
  @Get("users/me")
  async getCurrentUser() {
    try {
      // Note: In a real app, you'd get user ID from JWT token
      // For now, return a basic user info
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get first user as example (in real app, extract from JWT)
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });

      await prisma.$disconnect();

      return user || { error: "User not found" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS - Direct endpoint
  @Get("recurrent-payments")
  async getRecurrentPayments() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const payments = await prisma.recurrentPayment.findMany({
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      await prisma.$disconnect();

      return payments;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS LAST EXECUTION - Direct endpoint (fixed schema)
  @Get("recurrent-payments/last-execution")
  async getLastExecution() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get the most recent execution log
      const lastExecution = await prisma.automaticExecutionLog.findFirst({
        orderBy: { executionDate: "desc" },
        select: {
          executionDate: true,
          processedPayments: true,
          createdTransactions: true,
          totalAmount: true,
          details: true,
        },
      });

      await prisma.$disconnect();

      if (!lastExecution) {
        return {
          executionDate: null,
          processedPayments: 0,
          createdTransactions: 0,
          totalAmount: 0,
          details: [], // 🔧 Always return an array even if empty
        };
      }

      // Parse details JSON string back to array
      let parsedDetails = [];
      try {
        parsedDetails = lastExecution.details
          ? JSON.parse(lastExecution.details)
          : [];
      } catch (parseError) {
        console.error("Error parsing execution details:", parseError);
        parsedDetails = [];
      }

      return {
        executionDate: lastExecution.executionDate.toISOString(),
        processedPayments: lastExecution.processedPayments,
        createdTransactions: lastExecution.createdTransactions,
        totalAmount: Number(lastExecution.totalAmount),
        details: parsedDetails, // 🔧 Ensure details is always an array
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS EXECUTE - Direct endpoint
  @Post("recurrent-payments/execute")
  async executeRecurrentPayments(): Promise<
    ExecutionResult | { error: string }
  > {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result: ExecutionResult = {
        processedPayments: 0,
        createdTransactions: 0,
        totalAmount: 0,
        executionDate: new Date(),
        details: [],
      };

      // Find all active recurrent payments that are due today
      const duePayments = await prisma.recurrentPayment.findMany({
        where: {
          isActive: true,
          nextPaymentDate: {
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Include payments due until the end of today
          },
        },
        include: {
          category: true,
        },
      });

      result.processedPayments = duePayments.length;

      // Create execution log
      const executionLog = await prisma.automaticExecutionLog.create({
        data: {
          executionDate: result.executionDate,
          processedPayments: result.processedPayments,
          createdTransactions: 0, // Will be updated later
          totalAmount: 0, // Will be updated later
          details: "[]", // Will be updated later
        },
      });

      // Process each payment
      for (const payment of duePayments) {
        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: payment.amount,
            description: `${payment.name} - Pagamento automatico`,
            date: today,
            type: "EXPENSE", // TransactionType.EXPENSE
            categoryId: payment.categoryId,
            userId: payment.userId,
            executionLogId: executionLog.id,
          },
        });

        // Calculate next payment date
        const nextDate = this.calculateNextPaymentDate(
          payment.nextPaymentDate,
          payment.interval,
          payment.dayOfMonth,
          payment.dayOfWeek
        );

        // Update next payment date
        await prisma.recurrentPayment.update({
          where: { id: payment.id },
          data: { nextPaymentDate: nextDate },
        });

        // Add to result details
        const transactionDetails = {
          paymentName: payment.name,
          amount: Number(payment.amount),
          nextDate,
        };
        result.details.push(transactionDetails);

        result.createdTransactions++;
        result.totalAmount += Number(payment.amount);
      }

      // Update execution log with final results
      if (result.processedPayments > 0) {
        await prisma.automaticExecutionLog.update({
          where: { id: executionLog.id },
          data: {
            createdTransactions: result.createdTransactions,
            totalAmount: result.totalAmount,
            details: JSON.stringify(result.details),
          },
        });
      }

      await prisma.$disconnect();
      return result;
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  // Helper method to calculate next payment date
  private calculateNextPaymentDate(
    currentDate: Date,
    interval: string,
    dayOfMonth?: number,
    dayOfWeek?: number
  ): Date {
    const nextDate = new Date(currentDate);

    switch (interval) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case "weekly":
        if (dayOfWeek !== undefined) {
          const currentDayOfWeek = nextDate.getDay();
          let daysToAdd = dayOfWeek - currentDayOfWeek;
          if (daysToAdd <= 0) {
            daysToAdd += 7;
          }
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;

      case "monthly":
        if (dayOfMonth !== undefined) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(dayOfMonth);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;

      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;

      default:
        break;
    }

    return nextDate;
  }

  // 🚀 CATEGORIES CRUD - Direct endpoints
  @Post("categories")
  async createCategory(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const category = await prisma.category.create({
        data: {
          name: body.name,
          icon: body.icon || null,
          color: body.color || null,
          budget: body.budget ? Number(body.budget) : null,
          userId: userId,
        },
      });

      await prisma.$disconnect();
      return category;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("categories/:id")
  async updateCategory(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const category = await prisma.category.update({
        where: { id },
        data: {
          name: body.name,
          icon: body.icon,
          color: body.color,
          budget: body.budget ? Number(body.budget) : null,
        },
      });

      await prisma.$disconnect();
      return category;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("categories/:id")
  async deleteCategory(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.category.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Category deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TRANSACTIONS CRUD - Direct endpoints
  @Post("transactions")
  async createTransaction(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      // 🔧 FIX: Handle tags like in TransactionsService
      const { tags, ...transactionData } = body;

      // Create or connect tags
      const tagConnectOrCreate =
        tags?.map((tagName: string) => ({
          where: { name_userId: { name: tagName, userId } },
          create: { name: tagName, userId },
        })) || [];

      const transaction = await prisma.transaction.create({
        data: {
          amount: Number(transactionData.amount),
          description: transactionData.description || null,
          date: new Date(transactionData.date),
          type: transactionData.type,
          categoryId: transactionData.categoryId,
          userId: userId,
          tags: {
            connectOrCreate: tagConnectOrCreate,
          },
        },
        include: {
          category: true,
          tags: true, // 🔧 Include tags to prevent frontend crash
        },
      });

      await prisma.$disconnect();
      return transaction;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("transactions/:id")
  async updateTransaction(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 FIX: Handle tags like in TransactionsService
      const { tags, ...transactionData } = body;

      // Get userId from existing transaction for tag management
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      const userId = existingTransaction.userId;

      // If tags are provided, update them
      let tagsUpdate = {};
      if (tags) {
        tagsUpdate = {
          tags: {
            set: [], // First disconnect all existing tags
            connectOrCreate: tags.map((tagName: string) => ({
              where: { name_userId: { name: tagName, userId } },
              create: { name: tagName, userId },
            })),
          },
        };
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          amount: transactionData.amount
            ? Number(transactionData.amount)
            : undefined,
          description: transactionData.description,
          date: transactionData.date
            ? new Date(transactionData.date)
            : undefined,
          type: transactionData.type,
          categoryId: transactionData.categoryId,
          ...tagsUpdate,
        },
        include: {
          category: true,
          tags: true, // 🔧 Include tags to prevent frontend crash
        },
      });

      await prisma.$disconnect();
      return transaction;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("transactions/:id")
  async deleteTransaction(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.transaction.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Transaction deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS CRUD - Direct endpoints
  @Post("recurrent-payments")
  async createRecurrentPayment(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const payment = await prisma.recurrentPayment.create({
        data: {
          name: body.name,
          amount: Number(body.amount),
          description: body.description || null,
          interval: body.interval,
          dayOfMonth: body.dayOfMonth || null,
          dayOfWeek: body.dayOfWeek || null,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          nextPaymentDate: new Date(body.nextPaymentDate || body.startDate),
          categoryId: body.categoryId,
          userId: userId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return payment;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("recurrent-payments/:id")
  async updateRecurrentPayment(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const payment = await prisma.recurrentPayment.update({
        where: { id },
        data: {
          name: body.name,
          amount: body.amount ? Number(body.amount) : undefined,
          description: body.description,
          interval: body.interval,
          dayOfMonth: body.dayOfMonth,
          dayOfWeek: body.dayOfWeek,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          nextPaymentDate: body.nextPaymentDate
            ? new Date(body.nextPaymentDate)
            : undefined,
          isActive: body.isActive,
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return payment;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("recurrent-payments/:id")
  async deleteRecurrentPayment(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.recurrentPayment.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Recurrent payment deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 DASHBOARD ADVANCED ENDPOINTS - Direct endpoints for Netlify compatibility
  @Get("dashboard/budget-analysis")
  async getBudgetAnalysis(@Query("timeRange") timeRange = "1m") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "1m":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "3m":
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case "6m":
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case "1y":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get categories with budget - 🔧 BUG FIX: Filter out INCOME categories
      const allCategories = await prisma.category.findMany({
        where: { budget: { not: null } },
      });

      // Filter out INCOME categories (like "Salary") from budget analysis
      const categories = allCategories.filter(
        (category) => this.getCategoryType(category.name) === "EXPENSE"
      );

      console.log(
        `🔧 Budget Analysis: Found ${allCategories.length} categories with budget, ${categories.length} are EXPENSE categories`
      );

      const budgetAnalysis = await Promise.all(
        categories.map(async (category) => {
          const expenses = await prisma.transaction.aggregate({
            where: {
              categoryId: category.id,
              type: "EXPENSE",
              date: { gte: startDate, lte: now },
            },
            _sum: { amount: true },
          });

          const spent = Number(expenses._sum.amount || 0);
          const budget = Number(category.budget || 0);
          const remaining = budget - spent;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const deviation = spent - budget;
          const deviationPercentage =
            budget > 0 ? Math.abs((deviation / budget) * 100) : 0;

          return {
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color || "#999999",
            budget,
            spent,
            amount: spent, // 🔧 Add 'amount' field for frontend compatibility
            remaining,
            percentage: Math.round(percentage * 100) / 100,
            budgetPercentage: Math.round(percentage * 100) / 100, // 🔧 Add budgetPercentage field
            deviation,
            deviationPercentage: Math.round(deviationPercentage * 100) / 100,
            status:
              percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
            color: category.color,
            isOverBudget: percentage > 100,
          };
        })
      );

      // 🔧 Calculate totals for frontend compatibility
      const totalBudget = budgetAnalysis.reduce(
        (sum, cat) => sum + cat.budget,
        0
      );
      const totalSpent = budgetAnalysis.reduce(
        (sum, cat) => sum + cat.spent,
        0
      );
      const totalRemaining = totalBudget - totalSpent;
      const totalDeviation = totalSpent - totalBudget;
      const totalDeviationPercentage =
        totalBudget > 0
          ? Math.round((Math.abs(totalDeviation) / totalBudget) * 100 * 100) /
            100
          : 0;

      // 🔧 Return structured response that frontend expects
      const response = {
        categoryAnalysis: budgetAnalysis.sort(
          (a, b) => b.percentage - a.percentage
        ),
        totalBudget,
        totalSpent,
        totalRemaining,
        totalDeviation,
        totalDeviationPercentage,
        summary: {
          categoriesOverBudget: budgetAnalysis.filter((cat) => cat.isOverBudget)
            .length,
          categoriesWithBudget: budgetAnalysis.length,
          averageSpendingPercentage:
            budgetAnalysis.length > 0
              ? Math.round(
                  (budgetAnalysis.reduce(
                    (sum, cat) => sum + cat.percentage,
                    0
                  ) /
                    budgetAnalysis.length) *
                    100
                ) / 100
              : 0,
        },
      };

      await prisma.$disconnect();
      return response;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/trends")
  async getTrends(@Query("timeRange") timeRange = "3m") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const months = parseInt(timeRange.replace("m", "")) || 3;
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

      console.log("🔍 getTrends Debug - Date ranges:", {
        timeRange,
        months,
        startDate: startDate.toISOString(),
      });

      // Get all transactions for analysis
      const allTransactions = await prisma.transaction.findMany({
        where: { date: { gte: startDate } },
        include: { category: true },
        orderBy: { date: "asc" },
      });

      console.log(
        "🔍 getTrends Debug - Found transactions:",
        allTransactions.length
      );

      // 1. Generate monthly trends
      const monthlyData = new Map<
        string,
        {
          income: number;
          expenses: number;
          transactions: number;
        }
      >();
      const monthKeys: string[] = [];

      // Create entries for each month
      for (let i = months - 1; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toISOString().substring(0, 7);
        monthKeys.push(monthKey);
        monthlyData.set(monthKey, {
          income: 0,
          expenses: 0,
          transactions: 0,
        });
      }

      allTransactions.forEach((transaction) => {
        const monthKey = transaction.date.toISOString().substring(0, 7);
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          if (transaction.type === "INCOME") {
            data.income += Number(transaction.amount);
          } else {
            data.expenses += Number(transaction.amount);
          }
          data.transactions += 1;
        }
      });

      const trends = monthKeys.map((monthKey) => {
        const data = monthlyData.get(monthKey)!;
        return {
          period: monthKey,
          income: data.income,
          expenses: data.expenses,
          balance: data.income - data.expenses,
          transactions: data.transactions,
        };
      });

      // 2. Calculate category trends (current vs previous period) - FIXED LOGIC
      // For realistic comparison, use month-based periods instead of arbitrary divisions
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;
      let previousPeriodEnd: Date;

      if (months === 1) {
        // For 1 month: current month vs previous month
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
      } else if (months === 3) {
        // For 3 months: last month vs month before that (not cumulative)
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - 2,
          1
        );
        previousPeriodEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      } else {
        // For other periods: divide equally
        const halfMonths = Math.floor(months / 2);
        currentPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - halfMonths,
          1
        );
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - months,
          1
        );
        previousPeriodEnd = new Date(
          now.getFullYear(),
          now.getMonth() - halfMonths,
          0
        );
      }

      const currentPeriodTransactions = allTransactions.filter(
        (tx) => tx.date >= currentPeriodStart
      );
      const previousPeriodTransactions = allTransactions.filter(
        (tx) => tx.date >= previousPeriodStart && tx.date <= previousPeriodEnd
      );

      console.log("🔍 getTrends Debug - FIXED Period transactions:", {
        timeRange,
        months,
        currentPeriodStart: currentPeriodStart.toISOString(),
        previousPeriodStart: previousPeriodStart.toISOString(),
        previousPeriodEnd: previousPeriodEnd.toISOString(),
        current: currentPeriodTransactions.length,
        previous: previousPeriodTransactions.length,
      });

      // 3. Calculate category trends (current vs previous period) - IMPROVED
      const currentCategoryMap = new Map<
        string,
        {
          id: string;
          name: string;
          color: string;
          amount: number;
        }
      >();
      const previousCategoryMap = new Map<
        string,
        {
          amount: number;
        }
      >();

      // Calculate current period spending by category
      currentPeriodTransactions
        .filter((tx) => tx.type === "EXPENSE")
        .forEach((tx) => {
          const categoryId = tx.category.id;
          if (!currentCategoryMap.has(categoryId)) {
            currentCategoryMap.set(categoryId, {
              id: categoryId,
              name: tx.category.name,
              color: tx.category.color,
              amount: 0,
            });
          }
          currentCategoryMap.get(categoryId)!.amount += Number(tx.amount);
        });

      // Calculate previous period spending by category
      previousPeriodTransactions
        .filter((tx) => tx.type === "EXPENSE")
        .forEach((tx) => {
          const categoryId = tx.category.id;
          if (!previousCategoryMap.has(categoryId)) {
            previousCategoryMap.set(categoryId, { amount: 0 });
          }
          previousCategoryMap.get(categoryId)!.amount += Number(tx.amount);
        });

      console.log("🔍 getTrends Debug - Category maps:", {
        currentCategories: currentCategoryMap.size,
        previousCategories: previousCategoryMap.size,
        currentSample: Array.from(currentCategoryMap.entries()).slice(0, 2),
        previousSample: Array.from(previousCategoryMap.entries()).slice(0, 2),
      });

      // Generate category trends with improved logic
      const categoryTrends: {
        id: string;
        name: string;
        color: string;
        currentAmount: number;
        previousAmount: number;
        change: number;
        percentChange: number;
      }[] = [];

      // Get all categories that have spending in either period
      const allCategoryIds = new Set([
        ...Array.from(currentCategoryMap.keys()),
        ...Array.from(previousCategoryMap.keys()),
      ]);

      console.log(
        "🔍 getTrends Debug - All category IDs:",
        Array.from(allCategoryIds)
      );

      allCategoryIds.forEach((categoryId) => {
        const currentData = currentCategoryMap.get(categoryId) || {
          amount: 0,
          name: "",
          color: "",
          id: categoryId,
        };
        const previousData = previousCategoryMap.get(categoryId) || {
          amount: 0,
        };

        // Get category info (prioritize current data, fallback to finding in transactions)
        let categoryInfo = currentData;
        if (!categoryInfo.name || !categoryInfo.color) {
          const categoryTx = allTransactions.find(
            (tx) => tx.category.id === categoryId
          );
          if (categoryTx) {
            categoryInfo = {
              id: categoryId,
              name: categoryTx.category.name,
              color: categoryTx.category.color,
              amount: currentData.amount,
            };
          }
        }

        if (!categoryInfo.name) {
          console.warn("🚨 Category info missing for ID:", categoryId);
          return; // Skip if we can't find category info
        }

        const change = currentData.amount - previousData.amount;
        let percentChange = 0;

        if (previousData.amount > 0) {
          percentChange = (change / previousData.amount) * 100;
        } else if (currentData.amount > 0) {
          percentChange = 100; // 100% increase if previous was 0
        }

        // Include all categories that have meaningful spending in either period
        if (currentData.amount > 0 || previousData.amount > 0) {
          const trend = {
            id: categoryId,
            name: categoryInfo.name,
            color: categoryInfo.color,
            currentAmount: Math.round(currentData.amount * 100) / 100,
            previousAmount: Math.round(previousData.amount * 100) / 100,
            change: Math.round(change * 100) / 100,
            percentChange: Math.round(percentChange * 100) / 100,
          };

          categoryTrends.push(trend);

          console.log("🔍 getTrends Debug - Added trend:", trend);
        }
      });

      // Sort by absolute percent change (most significant changes first)
      categoryTrends.sort(
        (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)
      );

      console.log(
        "🔍 getTrends Debug - Final category trends count:",
        categoryTrends.length
      );
      console.log(
        "🔍 getTrends Debug - Sample trends:",
        categoryTrends.slice(0, 3)
      );

      // 3. FIXED: Detect spending anomalies with robust validation
      const spendingAnomalies: {
        category: string;
        color: string;
        month: string;
        amount: number;
        averageAmount: number;
        percentDeviation: number;
      }[] = [];

      // Use only the analysis period (not 12 months) for more accurate anomalies
      const anomalyPeriodMonths = Math.min(months, 6); // Max 6 months for anomaly detection
      const anomalyStartDate = new Date(
        now.getFullYear(),
        now.getMonth() - anomalyPeriodMonths,
        1
      );

      console.log("🔍 getTrends Debug - Anomaly detection period:", {
        anomalyPeriodMonths,
        anomalyStartDate: anomalyStartDate.toISOString(),
      });

      const anomalyTransactions = await prisma.transaction.findMany({
        where: {
          date: { gte: anomalyStartDate },
          type: "EXPENSE",
        },
        include: { category: true },
        orderBy: { date: "asc" },
      });

      console.log(
        "🔍 getTrends Debug - Anomaly transactions found:",
        anomalyTransactions.length
      );

      // Group spending by category and month for anomaly detection
      const categoryMonthlyMap = new Map<
        string,
        {
          monthlyData: Map<string, number>;
          categoryName: string;
          categoryColor: string;
        }
      >();

      for (let i = 0; i < anomalyPeriodMonths; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthKey = month.toISOString().substring(0, 7);

        const monthTransactions = anomalyTransactions.filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= monthStart && txDate <= monthEnd;
        });

        monthTransactions.forEach((tx) => {
          const categoryId = tx.category.id;
          const amount = Number(tx.amount);

          // Validate transaction amount
          if (isNaN(amount) || amount < 0 || amount > 50000) {
            console.warn("🚨 Invalid transaction amount detected:", {
              id: tx.id,
              amount: tx.amount,
              category: tx.category.name,
              date: tx.date,
            });
            return; // Skip invalid transactions
          }

          if (!categoryMonthlyMap.has(categoryId)) {
            categoryMonthlyMap.set(categoryId, {
              monthlyData: new Map<string, number>(),
              categoryName: tx.category.name,
              categoryColor: tx.category.color,
            });
          }

          const categoryData = categoryMonthlyMap.get(categoryId)!;
          const currentAmount = categoryData.monthlyData.get(monthKey) || 0;
          categoryData.monthlyData.set(monthKey, currentAmount + amount);
        });
      }

      console.log(
        "🔍 getTrends Debug - Categories processed for anomalies:",
        categoryMonthlyMap.size
      );

      // Find anomalies with improved algorithm
      categoryMonthlyMap.forEach((categoryData, categoryId) => {
        const monthlyAmounts: number[] = Array.from(
          categoryData.monthlyData.values()
        );

        // Need at least 2 months of data for comparison
        if (monthlyAmounts.length < 2) return;

        // Remove zero values for average calculation
        const nonZeroAmounts: number[] = monthlyAmounts.filter(
          (amount: number) => amount > 0
        );
        if (nonZeroAmounts.length === 0) return;

        const sum: number = nonZeroAmounts.reduce(
          (acc: number, val: number) => acc + val,
          0
        );
        const average: number = sum / nonZeroAmounts.length;

        // Calculate standard deviation for better anomaly detection
        const variance: number =
          nonZeroAmounts.reduce(
            (acc: number, val: number) => acc + Math.pow(val - average, 2),
            0
          ) / nonZeroAmounts.length;
        const standardDeviation: number = Math.sqrt(variance);

        // Skip categories with very low average spending (less than 50€/month)
        if (average < 50) return;

        console.log("🔍 getTrends Debug - Category analysis:", {
          category: categoryData.categoryName,
          average: average.toFixed(2),
          standardDeviation: standardDeviation.toFixed(2),
          monthlyAmounts: monthlyAmounts.map((a: number) => a.toFixed(2)),
        });

        categoryData.monthlyData.forEach((amount: number, monthKey: string) => {
          if (amount === 0) return; // Skip zero months

          const deviationFromMean = Math.abs(amount - average);
          const zScore =
            standardDeviation > 0 ? deviationFromMean / standardDeviation : 0;

          // Use Z-score for more scientific anomaly detection
          // Z-score > 1.5 indicates significant deviation (roughly 87% of data falls within 1.5 standard deviations)
          if (zScore > 1.5 && deviationFromMean > 50) {
            // Also require at least 50€ difference
            const percentDeviation = ((amount - average) / average) * 100;

            console.log("🔍 getTrends Debug - Anomaly found:", {
              category: categoryData.categoryName,
              month: monthKey,
              amount: amount.toFixed(2),
              average: average.toFixed(2),
              zScore: zScore.toFixed(2),
              percentDeviation: percentDeviation.toFixed(2),
            });

            spendingAnomalies.push({
              category: categoryData.categoryName,
              color: categoryData.categoryColor,
              month: monthKey,
              amount: Math.round(amount * 100) / 100,
              averageAmount: Math.round(average * 100) / 100,
              percentDeviation: Math.round(percentDeviation * 100) / 100,
            });
          }
        });
      });

      // Sort anomalies by absolute percent deviation
      spendingAnomalies.sort(
        (a, b) => Math.abs(b.percentDeviation) - Math.abs(a.percentDeviation)
      );

      console.log(
        "🔍 getTrends Debug - Final anomalies:",
        spendingAnomalies.length
      );

      await prisma.$disconnect();
      return {
        trends,
        categoryTrends,
        spendingAnomalies,
      };
    } catch (error) {
      console.error("Error in getTrends:", error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/expense-forecast")
  async getExpenseForecast(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const now = new Date();

      // 🔧 BUG FIX: Rispetta i parametri di data invece di forzare sempre il mese corrente
      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        // Usa le date fornite come parametri
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        // Fallback al mese corrente se non fornite
        start = new Date(now.getFullYear(), now.getMonth(), 1); // 1° del mese corrente
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ultimo giorno del mese corrente
      }

      console.log("🔧 Expense Forecast Debug - Date Range:", {
        providedStartDate: startDate,
        providedEndDate: endDate,
        actualStart: start.toISOString(),
        actualEnd: end.toISOString(),
        today: now.toISOString(),
        periodDescription: `${start.toLocaleDateString(
          "it-IT"
        )} - ${end.toLocaleDateString("it-IT")}`,
      });

      // 🔧 BUG FIX CRITICO: Gestione corretta di periodi passati, presenti e futuri
      let actualEndDate: Date;
      let actualExpensesAmount: number;

      if (startDate && endDate) {
        // Se l'utente specifica date esplicite, usa sempre l'intero periodo richiesto
        actualEndDate = end;
        console.log("🔧 Expense Forecast Debug - Explicit date range provided, using full period");
      } else {
        // Solo per il caso "default" (mese corrente), limita fino ad oggi
        if (end < now) {
          actualEndDate = end;
          console.log("🔧 Expense Forecast Debug - Past period detected, using full range");
        } else if (start > now) {
          actualEndDate = start;
          actualExpensesAmount = 0;
          console.log("🔧 Expense Forecast Debug - Future period detected, no actual expenses");
        } else {
          actualEndDate = now;
          console.log("🔧 Expense Forecast Debug - Current period detected, calculating until today");
        }
      }

      console.log("🔧 Expense Forecast Debug - Date Logic Check:", {
        providedStartDate: startDate,
        providedEndDate: endDate,
        start: start.toISOString(),
        end: end.toISOString(), 
        now: now.toISOString(),
        selectedActualEndDate: actualEndDate.toISOString(),
        logic: startDate && endDate ? "explicit_range" : "default_behavior",
      });

      // Calcola actualExpenses (sempre, tranne per periodi futuri senza date esplicite)
      if (!(start > now && !startDate && !endDate)) {
        const actualExpenses = await prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: actualEndDate },
            type: "EXPENSE",
          },
          _sum: { amount: true },
        });
        actualExpensesAmount = Number(actualExpenses._sum.amount || 0);
      }

      console.log("🔧 Expense Forecast Debug - Actual Expenses Calculation:", {
        actualExpensesQuery: {
          dateGte: start.toISOString(),
          dateLte: actualEndDate.toISOString(),
          type: "EXPENSE",
        },
        actualExpensesAmount,
        periodType: end < now ? "past" : start > now ? "future" : "current",
      });

      // Pagamenti ricorrenti attivi
      const recurringPayments = await prisma.recurrentPayment.findMany({
        where: {
          isActive: true,
          startDate: { lte: end }, // Iniziati prima della fine del periodo
          OR: [
            { endDate: null }, // Nessuna data di fine
            { endDate: { gte: now } }, // Data di fine dopo oggi
          ],
        },
        include: {
          category: true,
        },
      });

      // Calcola forecast: pagamenti ricorrenti da now alla fine del periodo (solo se now < end)
      let recurringForecast = 0;
      const recurringDetails = [];

      if (now < end) {
        console.log("🔧 Expense Forecast Debug - Recurring Payments Period:", {
          forecastPeriodStart: now.toISOString(),
          forecastPeriodEnd: end.toISOString(),
          recurringPaymentsFound: recurringPayments.length,
        });

        for (const payment of recurringPayments) {
          // Controlla se questo pagamento è dovuto da now alla fine del periodo
          const isPaymentDue = this.isPaymentDueInPeriod(payment, now, end);

          if (isPaymentDue) {
            const paymentAmount = Number(payment.amount);
            recurringForecast += paymentAmount;

            recurringDetails.push({
              id: payment.id,
              name: payment.name,
              amount: paymentAmount,
              category: payment.category.name,
              categoryColor: payment.category.color,
              interval: payment.interval,
              nextPaymentDate: payment.nextPaymentDate,
            });
          }
        }
      } else {
        console.log(
          "🔧 Expense Forecast Debug - No recurring forecast: period is in the past"
        );
      }

      // Forecast totale: spese attuali + pagamenti ricorrenti rimasti
      const totalForecast = actualExpensesAmount + recurringForecast;

      console.log("🔧 Expense Forecast Debug - Final Calculation:", {
        actualExpensesInPeriod: actualExpensesAmount,
        recurringPaymentsRemaining: recurringForecast,
        totalForecast: totalForecast,
        duePaymentsCount: recurringDetails.length,
      });

      await prisma.$disconnect();

      return {
        actualExpenses: Math.round(actualExpensesAmount * 100) / 100,
        recurringForecast: Math.round(recurringForecast * 100) / 100,
        totalForecast: Math.round(totalForecast * 100) / 100,
        recurringDetails,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          currentDate: now.toISOString(),
          actualEndDate: actualEndDate.toISOString(),
          description: `Periodo: ${start.toLocaleDateString(
            "it-IT"
          )} - ${end.toLocaleDateString("it-IT")}`,
          isCurrentPeriod: startDate === undefined && endDate === undefined,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper method to check if a payment is due in a specific period
  private isPaymentDueInPeriod(
    payment: any,
    periodStart: Date,
    periodEnd: Date
  ): boolean {
    // Simple check: if nextPaymentDate is within the period
    if (
      payment.nextPaymentDate >= periodStart &&
      payment.nextPaymentDate <= periodEnd
    ) {
      return true;
    }

    // More complex check: calculate if any payment would be due in this period
    // based on the payment schedule
    const currentDate = new Date(payment.nextPaymentDate);
    let iterationCount = 0;
    const maxIterations = 50; // Prevent infinite loops

    while (currentDate <= periodEnd && iterationCount < maxIterations) {
      if (currentDate >= periodStart) {
        return true;
      }

      // Calculate next payment date
      currentDate.setTime(
        this.calculateNextPaymentDate(
          currentDate,
          payment.interval,
          payment.dayOfMonth,
          payment.dayOfWeek
        ).getTime()
      );

      iterationCount++;
    }

    return false;
  }

  @Get("dashboard/savings")
  async getSavingSuggestions() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get spending by category for analysis
      const categorySpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          type: "EXPENSE",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      const suggestions = [];
      let totalPotentialSavings = 0;

      // Simple suggestions based on spending patterns
      for (const spending of categorySpending) {
        const category = await prisma.category.findUnique({
          where: { id: spending.categoryId },
        });

        if (category && spending._sum.amount) {
          const monthlySpent = Number(spending._sum.amount);
          let potentialSaving = 0;
          let suggestion = "";

          if (monthlySpent > 200) {
            potentialSaving = monthlySpent * 0.1; // 10% reduction
            suggestion = `Riduci le spese in ${category.name} del 10%`;
          } else if (monthlySpent > 100) {
            potentialSaving = monthlySpent * 0.05; // 5% reduction
            suggestion = `Ottimizza le spese in ${category.name}`;
          }

          if (potentialSaving > 0) {
            suggestions.push({
              id: category.id,
              category: category.name,
              categoryColor: category.color || "#999999",
              description: suggestion,
              potentialSaving: Math.round(potentialSaving),
              type: "spending_reduction",
              difficulty: potentialSaving > 50 ? "medium" : "easy",
              impact:
                potentialSaving > 100
                  ? "high"
                  : potentialSaving > 50
                  ? "medium"
                  : "low",
            });
            totalPotentialSavings += potentialSaving;
          }
        }
      }

      // Calculate averages
      const avgIncome = await prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
      });

      const avgExpense = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
      });

      await prisma.$disconnect();
      return {
        suggestions,
        averageIncome: Number(avgIncome._sum.amount || 0),
        averageExpense: Number(avgExpense._sum.amount || 0),
        potentialMonthlySavings: Math.round(totalPotentialSavings),
        yearlyProjection: Math.round(totalPotentialSavings * 12),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 SAVINGS GOALS CRUD - Direct endpoints for Netlify compatibility
  @Get("savings-goals")
  async getSavingsGoals() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get default user ID (in real app, would get from JWT)
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        await prisma.$disconnect();
        return { error: "No user found" };
      }

      const savingsGoals = await prisma.savingsGoal.findMany({
        where: { userId: firstUser.id },
        orderBy: { createdAt: "desc" },
      });

      await prisma.$disconnect();
      return savingsGoals;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("savings-goals")
  async createSavingsGoal(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get default user ID (in real app, would get from JWT)
      let userId = body.userId;
      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password",
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const savingsGoal = await prisma.savingsGoal.create({
        data: {
          name: body.name,
          targetAmount: Number(body.targetAmount),
          currentAmount: Number(body.currentAmount || 0),
          deadline: body.deadline ? new Date(body.deadline) : null,
          description: body.description || null,
          userId: userId,
        },
      });

      await prisma.$disconnect();
      return savingsGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("savings-goals/:id")
  async updateSavingsGoal(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const savingsGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          name: body.name,
          targetAmount: body.targetAmount
            ? Number(body.targetAmount)
            : undefined,
          currentAmount: body.currentAmount
            ? Number(body.currentAmount)
            : undefined,
          deadline: body.deadline ? new Date(body.deadline) : undefined,
          description: body.description,
          isCompleted: body.isCompleted,
        },
      });

      await prisma.$disconnect();
      return savingsGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("savings-goals/:id")
  async deleteSavingsGoal(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.savingsGoal.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Savings goal deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("savings-goals/:id/add-amount")
  async addAmountToSavingsGoal(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const savingsGoal = await prisma.savingsGoal.findUnique({
        where: { id },
      });

      if (!savingsGoal) {
        await prisma.$disconnect();
        return { error: "Savings goal not found" };
      }

      const newCurrentAmount =
        Number(savingsGoal.currentAmount) + Number(body.amount);
      const isCompleted = newCurrentAmount >= Number(savingsGoal.targetAmount);

      const updatedGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted,
        },
      });

      await prisma.$disconnect();
      return updatedGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 EMAIL TEST - Direct endpoint for Netlify compatibility
  @Post("email/test")
  async sendTestEmail(@Body() body: { template?: string }) {
    try {
      // Get email configuration from environment
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpPort = process.env.SMTP_PORT || "587";
      const smtpFrom = process.env.SMTP_FROM || "noreply@bud-jet.app";

      if (!smtpHost || !smtpUser || !smtpPass) {
        return {
          success: false,
          error: "SMTP configuration incomplete",
          missing: {
            SMTP_HOST: !smtpHost,
            SMTP_USER: !smtpUser,
            SMTP_PASS: !smtpPass,
          },
        };
      }

      // Get test email (use default for testing)
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const firstUser = await prisma.user.findFirst();
      const testEmail = firstUser?.email || "test@budjet.app";

      await prisma.$disconnect();

      // Setup nodemailer
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: false,
        requireTLS: true,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false,
        },
      });

      // Generate HTML content based on template
      const template = body.template || "test";
      let html: string;
      let subject: string;

      if (template === "transactions") {
        // Example transactions for testing
        const exampleTransactions = [
          {
            paymentName: "Restituzione INPS",
            amount: 221.65,
            nextDate: new Date("2025-04-30"),
          },
          {
            paymentName: "AppleOne",
            amount: 25.95,
            nextDate: new Date("2025-04-30"),
          },
        ];
        const totalAmount = 247.6;

        // Generate transactions template
        const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
        const formatDate = (date: Date) =>
          new Date(date).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

        const transactionsHtml = exampleTransactions
          .map(
            (t) => `
            <tr>
              <td class="text-bold">${t.paymentName}</td>
              <td class="text-right">${formatCurrency(t.amount)}</td>
              <td>${formatDate(t.nextDate)}</td>
            </tr>
          `
          )
          .join("");

        const content = `
          <h1>Nuove Transazioni Automatiche</h1>
          
          <div class="mb-4">
            <p>
              Sono state create <span class="text-bold">${
                exampleTransactions.length
              }</span> nuove transazioni
              per un totale di <span class="text-bold text-blue">${formatCurrency(
                totalAmount
              )}</span>.
            </p>
          </div>

          <div style="background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <table class="table">
              <thead>
                <tr>
                  <th>Nome Transazione</th>
                  <th class="text-right">Importo</th>
                  <th>Prossima Data</th>
                </tr>
              </thead>
              <tbody>
                ${transactionsHtml}
                <tr style="background-color: #F9FAFB;">
                  <td colspan="3" class="text-right text-bold">
                    Totale: <span class="text-blue">${formatCurrency(
                      totalAmount
                    )}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4" style="background-color: #EFF6FF; border-radius: 8px; padding: 16px; border: 1px solid #BFDBFE;">
            <h2 style="color: #1E40AF; margin-bottom: 8px;">📅 Prossimi Passi</h2>
            <p style="color: #1E40AF; margin: 0;">
              Le transazioni verranno create automaticamente alle date specificate.
              Puoi modificare o cancellare queste transazioni in qualsiasi momento dal tuo pannello di controllo.
            </p>
          </div>
        `;

        html = this.generateEmailTemplate(content);
        subject = "Test Email - Template Transazioni";
      } else {
        // Test template
        const content = `
          <h1>Test Email da Bud-Jet</h1>
          <div class="mb-4">
            <p>👋 Ciao! Questa è una email di test per verificare la configurazione del sistema di notifiche.</p>
          </div>
          
          <div style="background-color: #F0FDF4; border-radius: 8px; padding: 16px; border: 1px solid #86EFAC;">
            <h2 style="color: #166534; margin-bottom: 8px;">✅ Configurazione Corretta!</h2>
            <p style="color: #166534; margin: 0;">
              Se stai vedendo questa email, significa che il sistema di notifiche è configurato correttamente.
              Riceverai notifiche per:
            </p>
            <ul style="color: #166534; margin: 12px 0 0 24px;">
              <li>Transazioni automatiche create</li>
              <li>Promemoria di pagamento</li>
              <li>Aggiornamenti importanti del tuo account</li>
            </ul>
          </div>
        `;

        html = this.generateEmailTemplate(content);
        subject = "Test Email da Bud-Jet";
      }

      // Send email
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: testEmail,
        subject,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
        template,
        emailSentTo: testEmail,
      };
    } catch (error) {
      console.error("Error sending test email:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Helper method to generate email template
  private generateEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset CSS */
    body, p, h1, h2, h3, h4, h5, h6, ul, ol, li {
      margin: 0;
      padding: 0;
    }
    
    /* Base styles */
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background-color: #F3F4F6;
    }

    /* Container */
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    /* Header */
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #E5E7EB;
      margin-bottom: 24px;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563EB;
      text-decoration: none;
    }

    /* Content */
    .content {
      padding: 0 24px;
    }

    /* Typography */
    h1 {
      color: #1F2937;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    h2 {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    p {
      color: #4B5563;
      margin-bottom: 16px;
    }

    /* Table */
    .table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      background-color: #FFFFFF;
      border-radius: 8px;
      overflow: hidden;
    }

    .table th {
      background-color: #F3F4F6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #E5E7EB;
    }

    .table td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
      color: #4B5563;
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    /* Utilities */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-bold { font-weight: 600; }
    .text-blue { color: #2563EB; }
    .text-gray { color: #6B7280; }
    .mt-4 { margin-top: 16px; }
    .mb-4 { margin-bottom: 16px; }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .container {
        width: 100%;
        padding: 16px;
      }
      
      .content {
        padding: 0 16px;
      }
      
      .table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Bud-Jet</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Bud-Jet. Tutti i diritti riservati.</p>
      <p class="mt-4">Questa è una notifica automatica. Non rispondere a questa email.</p>
    </div>
  </div>
</body>
</html>
`;
  }

  // 🚀 NOTIFICATIONS PREFERENCES - Direct endpoints for Netlify compatibility
  @Get("notifications/preferences/default")
  async getDefaultNotificationPreferences() {
    try {
      return [
        {
          type: "BUDGET_ALERT",
          enabled: true,
          channels: { email: false, app: true },
        },
        {
          type: "PAYMENT_REMINDER",
          enabled: true,
          channels: { email: true, app: true },
        },
        {
          type: "TRANSACTION_ALERT",
          enabled: true,
          channels: { email: false, app: true },
        },
        {
          type: "MILESTONE_REACHED",
          enabled: true,
          channels: { email: true, app: true },
        },
        {
          type: "PERIOD_SUMMARY",
          enabled: true,
          channels: { email: true, app: true },
        },
        {
          type: "TAX_DEADLINE",
          enabled: true,
          channels: { email: true, app: true },
        },
        {
          type: "NEW_FEATURE",
          enabled: true,
          channels: { email: false, app: true },
        },
        {
          type: "PERSONALIZED_TIP",
          enabled: true,
          channels: { email: false, app: true },
        },
      ];
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("notifications/preferences")
  async getNotificationPreferences(@Query("userId") userId?: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Default userId if not provided (for compatibility)
      if (!userId) {
        userId = "default-user-id";
      }

      const preferences = await prisma.notificationPreference.findMany({
        where: { userId },
      });

      await prisma.$disconnect();

      if (preferences.length === 0) {
        // Return default preferences if user has no custom ones
        return this.getDefaultNotificationPreferences();
      }

      return preferences.map((pref) => ({
        ...pref,
        channels: JSON.parse(pref.channels),
      }));
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("notifications/preferences")
  async updateNotificationPreferences(
    @Body() body: { userId?: string; preferences: any[] }
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const { userId = "default-user-id", preferences } = body;

      // Delete existing preferences
      await prisma.notificationPreference.deleteMany({
        where: { userId },
      });

      // Create new preferences
      const createdPrefs = await Promise.all(
        preferences.map(async (pref) => {
          return prisma.notificationPreference.create({
            data: {
              userId,
              type: pref.type,
              enabled: pref.enabled,
              channels: JSON.stringify(pref.channels),
            },
          });
        })
      );

      await prisma.$disconnect();

      return createdPrefs.map((pref) => ({
        ...pref,
        channels: JSON.parse(pref.channels),
      }));
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 USER CHANGE PASSWORD - Direct endpoint for Netlify compatibility
  @Post("users/change-password")
  async changePassword(
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      userId?: string;
    },
    @Headers("authorization") authHeader?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      let { currentPassword, newPassword, userId } = body;

      // 🔧 Extract user ID from JWT token if not provided
      if (!userId && authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const jwtSecret =
            process.env.JWT_SECRET ||
            "fallback-jwt-secret-for-development-minimum-32-chars";
          const decoded = jwt.verify(token, jwtSecret) as any;
          userId = decoded.sub;
          console.log("✅ User ID extracted from JWT:", userId);
        } catch (jwtError) {
          console.error("❌ JWT decode error:", jwtError.message);
          await prisma.$disconnect();
          return {
            success: false,
            error: "Token non valido o scaduto",
          };
        }
      }

      // Fallback to default if still no userId
      if (!userId) {
        userId = "default-user-id";
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        await prisma.$disconnect();
        return {
          success: false,
          error: "Utente non trovato",
        };
      }

      // Verify current password with bcrypt (imported statically)
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        await prisma.$disconnect();
        return {
          success: false,
          error: "Password attuale non corretta",
        };
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      await prisma.$disconnect();

      return {
        success: true,
        message: "Password cambiata con successo",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 CSV IMPORT - Direct endpoint compatible with Netlify Functions
  @Post("transactions/import/csv")
  @ApiOperation({ summary: "Import transactions from CSV data" })
  @ApiResponse({
    status: 201,
    description: "Transactions successfully imported",
  })
  async importTransactionsFromCsv(
    @Body()
    body: {
      csvData: string;
      userId?: string;
      defaultCategoryId?: string;
    }
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const { csvData, defaultCategoryId } = body;

      // Get userId - fallback to first user if not provided
      let userId = body.userId;
      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          throw new Error("No user found");
        }
      }

      // Get user's categories
      const userCategories = await prisma.category.findMany({
        where: { userId },
      });

      // Create default category if needed
      let defaultCategory;
      if (!defaultCategoryId) {
        defaultCategory = userCategories.find(
          (cat) => cat.name.toLowerCase() === "uncategorized"
        );

        if (!defaultCategory) {
          defaultCategory = await prisma.category.create({
            data: {
              name: "Uncategorized",
              icon: "question-mark",
              color: "#808080",
              userId,
            },
          });
        }
      }

      const finalDefaultCategoryId = defaultCategoryId || defaultCategory.id;

      // Parse CSV data
      const lines = csvData.split("\n");
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const results = [];

      // Function to find category ID by name
      const findCategoryId = (categoryName: string) => {
        if (!categoryName) return finalDefaultCategoryId;

        const category = userCategories.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        );
        return category?.id || finalDefaultCategoryId;
      };

      // Process each row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const record: any = {};

        // Map values to headers
        headers.forEach((header, index) => {
          record[header] = values[index] || "";
        });

        try {
          if (!record.Type || !record.Transaction) {
            console.warn("Skipping row with missing required fields", record);
            continue;
          }

          // Process transaction type
          const type = record.Type.toLowerCase().includes("expense")
            ? "EXPENSE"
            : "INCOME";

          // Process amount
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

          // Process date
          let date;
          try {
            if (record.Date) {
              if (record.Date.includes("T")) {
                date = new Date(record.Date);
              } else {
                // Try parsing different date formats
                const dateStr = record.Date;
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  date = new Date(dateStr);
                } else {
                  date = new Date(dateStr);
                }
              }
            } else {
              date = new Date();
            }
          } catch (error) {
            console.warn("Error parsing date, using current date", error);
            date = new Date();
          }

          // Find category
          const categoryId = findCategoryId(record.Category);

          // Extract tags from note
          const note = record.Note || "";
          const tags =
            note.match(/#(\w+)/g)?.map((tag) => tag.substring(1)) || [];

          // Create or connect tags
          const tagConnectOrCreate = tags.map((tagName: string) => ({
            where: { name_userId: { name: tagName, userId } },
            create: { name: tagName, userId },
          }));

          const transaction = await prisma.transaction.create({
            data: {
              type: type as "EXPENSE" | "INCOME",
              amount: Number(amount),
              date: date,
              description:
                note.replace(/#\w+/g, "").trim() ||
                `Imported ${type.toLowerCase()}`,
              categoryId: categoryId,
              userId: userId,
              tags: {
                connectOrCreate: tagConnectOrCreate,
              },
            },
            include: {
              category: true,
              tags: true,
            },
          });

          results.push(transaction);
        } catch (error) {
          console.error("Error processing CSV row:", error, record);
        }
      }

      await prisma.$disconnect();

      return {
        success: true,
        count: results.length,
        message: `Successfully imported ${results.length} transactions`,
        transactions: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 BULK UPDATE TRANSACTIONS - Direct endpoint compatible with Netlify Functions
  @Post("transactions/bulk-update")
  @ApiOperation({ summary: "Update multiple transactions at once" })
  @ApiResponse({ status: 200, description: "Batch update successful" })
  async bulkUpdateTransactions(@Body() body: { ids: string[]; data: any }) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
        throw new Error("No transaction IDs provided");
      }

      if (!body.data || Object.keys(body.data).length === 0) {
        throw new Error("No update data provided");
      }

      // 🔧 Handle tags like in TransactionsService
      const { tags, ...transactionData } = body.data;

      // Process each transaction update
      const results = [];
      for (const id of body.ids) {
        try {
          // Get userId from existing transaction for tag management
          const existingTransaction = await prisma.transaction.findUnique({
            where: { id },
            select: { userId: true },
          });

          if (!existingTransaction) {
            results.push({
              id,
              success: false,
              error: "Transaction not found",
            });
            continue;
          }

          const userId = existingTransaction.userId;

          // If tags are provided, update them
          let tagsUpdate = {};
          if (tags) {
            tagsUpdate = {
              tags: {
                set: [], // First disconnect all existing tags
                connectOrCreate: tags.map((tagName: string) => ({
                  where: { name_userId: { name: tagName, userId } },
                  create: { name: tagName, userId },
                })),
              },
            };
          }

          const transaction = await prisma.transaction.update({
            where: { id },
            data: {
              amount: transactionData.amount
                ? Number(transactionData.amount)
                : undefined,
              description: transactionData.description,
              date: transactionData.date
                ? new Date(transactionData.date)
                : undefined,
              type: transactionData.type,
              categoryId: transactionData.categoryId,
              ...tagsUpdate,
            },
            include: {
              category: true,
              tags: true,
            },
          });

          results.push({ id, success: true, transaction });
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      await prisma.$disconnect();

      const successCount = results.filter((r) => r.success).length;

      return {
        success: true,
        count: successCount,
        message: `Updated ${successCount} of ${body.ids.length} transactions`,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 BULK DELETE TRANSACTIONS - Direct endpoint compatible with Netlify Functions
  @Post("transactions/bulk-delete")
  @ApiOperation({ summary: "Delete multiple transactions at once" })
  @ApiResponse({ status: 200, description: "Batch delete successful" })
  async bulkDeleteTransactions(@Body() body: { ids: string[] }) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
        throw new Error("No transaction IDs provided");
      }

      // Process each transaction deletion
      const results = [];
      for (const id of body.ids) {
        try {
          // Check if transaction exists
          const existingTransaction = await prisma.transaction.findUnique({
            where: { id },
            select: { id: true, userId: true },
          });

          if (!existingTransaction) {
            results.push({
              id,
              success: false,
              error: "Transaction not found",
            });
            continue;
          }

          // Delete the transaction
          await prisma.transaction.delete({
            where: { id },
          });

          results.push({ id, success: true });
        } catch (error) {
          console.error(`Failed to delete transaction ${id}:`, error);
          results.push({
            id,
            success: false,
            error: error.message,
          });
        }
      }

      await prisma.$disconnect();

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      return {
        success: true,
        count: successCount,
        message: `Deleted ${successCount} of ${body.ids.length} transactions`,
        results,
        deleted: successCount,
        failed: failedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚨 DEBUG ENDPOINT - Analisi discrepanze calcolo spese luglio 2025
  @Get("debug/expense-analysis")
  async debugExpenseAnalysis(
    @Query("startDate") startDate = "2025-07-01",
    @Query("endDate") endDate = "2025-07-31"
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      console.log("🚨 DEBUG Expense Analysis - Date Setup:", {
        startDate,
        endDate,
        start: start.toISOString(),
        end: end.toISOString(),
        now: now.toISOString(),
      });

      // 1. Ottieni TUTTE le transazioni del periodo (senza filtri)
      const allTransactions = await prisma.transaction.findMany({
        where: {
          date: { gte: start, lte: end },
        },
        include: { category: true },
        orderBy: { date: "asc" },
      });

      // 2. Separa per tipo
      const expenseTransactions = allTransactions.filter(
        (tx) => tx.type === "EXPENSE"
      );
      const incomeTransactions = allTransactions.filter(
        (tx) => tx.type === "INCOME"
      );

      // 3. Calcola totali
      const totalExpenses = expenseTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      );
      const totalIncome = incomeTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
      );

      // 4. Calcolo con Prisma aggregate (come nell'endpoint originale)
      const aggregateExpenses = await prisma.transaction.aggregate({
        where: {
          date: { gte: start, lte: end },
          type: "EXPENSE",
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      // 5. Calcolo actualEndDate come nell'expense-forecast - FIXED LOGIC
      let actualEndDate: Date;

      if (end < now) {
        // Periodo completamente nel passato: usa tutto il periodo richiesto
        actualEndDate = end;
      } else if (start > now) {
        // Periodo completamente nel futuro: usa start (nessuna spesa attuale)
        actualEndDate = start;
      } else {
        // Periodo che include oggi: calcola fino ad oggi
        actualEndDate = now;
      }

      const actualExpensesAggregate = await prisma.transaction.aggregate({
        where: {
          date: { gte: start, lte: actualEndDate },
          type: "EXPENSE",
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      // 6. Analisi per categoria
      const categoryBreakdown = expenseTransactions.reduce((acc, tx) => {
        const categoryName = tx.category?.name || "Unknown";
        if (!acc[categoryName]) {
          acc[categoryName] = {
            count: 0,
            total: 0,
            transactions: [],
          };
        }
        acc[categoryName].count++;
        acc[categoryName].total += Number(tx.amount);
        acc[categoryName].transactions.push({
          id: tx.id,
          date: tx.date.toISOString().split("T")[0],
          amount: Number(tx.amount),
          description: tx.description,
        });
        return acc;
      }, {} as Record<string, any>);

      // 7. Transazioni sospette (importi molto alti o molto bassi)
      const suspiciousTransactions = expenseTransactions.filter((tx) => {
        const amount = Number(tx.amount);
        return amount > 1000 || amount < 0.01 || isNaN(amount);
      });

      // 8. Verifica duplicati potenziali
      const duplicateCandidates = expenseTransactions.filter((tx1, index1) => {
        return expenseTransactions.some((tx2, index2) => {
          if (index1 >= index2) return false;
          return (
            Math.abs(Number(tx1.amount) - Number(tx2.amount)) < 0.01 &&
            tx1.date.toDateString() === tx2.date.toDateString() &&
            tx1.categoryId === tx2.categoryId
          );
        });
      });

      await prisma.$disconnect();

      return {
        period: {
          startDate,
          endDate,
          actualEndDate: actualEndDate.toISOString(),
          isCurrentPeriod: now >= start && now <= end,
        },
        totals: {
          allTransactionsCount: allTransactions.length,
          expenseTransactionsCount: expenseTransactions.length,
          incomeTransactionsCount: incomeTransactions.length,
          manualExpenseSum: Math.round(totalExpenses * 100) / 100,
          manualIncomeSum: Math.round(totalIncome * 100) / 100,
          aggregateExpenseSum: Number(aggregateExpenses._sum.amount || 0),
          aggregateExpenseCount: aggregateExpenses._count,
          actualExpensesSum: Number(actualExpensesAggregate._sum.amount || 0),
          actualExpensesCount: actualExpensesAggregate._count,
        },
        discrepancies: {
          manualVsAggregate: Math.abs(
            totalExpenses - Number(aggregateExpenses._sum.amount || 0)
          ),
          aggregateVsActual: Math.abs(
            Number(aggregateExpenses._sum.amount || 0) -
              Number(actualExpensesAggregate._sum.amount || 0)
          ),
          manualVsUserCalculation: Math.abs(totalExpenses - 1052.82),
        },
        categoryBreakdown: Object.entries(categoryBreakdown)
          .map(([name, data]: [string, any]) => ({
            category: name,
            count: data.count,
            total: Math.round(data.total * 100) / 100,
            transactions: data.transactions,
          }))
          .sort((a, b) => b.total - a.total),
        suspiciousTransactions: suspiciousTransactions.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString().split("T")[0],
          amount: Number(tx.amount),
          description: tx.description,
          category: tx.category?.name,
          reason:
            Number(tx.amount) > 1000
              ? "High amount"
              : Number(tx.amount) < 0.01
              ? "Very low amount"
              : "Invalid amount",
        })),
        duplicateCandidates: duplicateCandidates.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString().split("T")[0],
          amount: Number(tx.amount),
          description: tx.description,
          category: tx.category?.name,
        })),
        rawExpenseTransactions: expenseTransactions.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString().split("T")[0],
          amount: Number(tx.amount),
          description: tx.description,
          category: tx.category?.name,
          type: tx.type,
        })),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/forecast")
  @ApiOperation({ summary: "Get forecast data for predictive analysis" })
  @ApiResponse({
    status: 200,
    description: "Returns historical and forecast data for financial prediction",
  })
  async getForecastData(@Query("months") months?: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const monthsValue = months ? parseInt(months) : 6; // Default to 6 months
      const { addMonths, endOfMonth, format, startOfMonth, subMonths } = await import("date-fns");
      
      const now = new Date();
      const historicalData = [];
      let totalIncome = 0;
      let totalExpense = 0;
      let monthsWithData = 0;
      let lastBalance = 0;

      // Retrieve historical data for the last 'months' months
      for (let i = monthsValue - 1; i >= 0; i--) {
        const currentMonth = subMonths(now, i);
        const startDate = startOfMonth(currentMonth);
        const endDate = endOfMonth(currentMonth);

        // Query for this specific month
        const whereClause = {
          date: {
            gte: startDate,
            lte: endDate,
          },
        };

        const [incomeTransactions, expenseTransactions] = await Promise.all([
          prisma.transaction.findMany({
            where: { ...whereClause, type: "INCOME" },
            select: { amount: true },
          }),
          prisma.transaction.findMany({
            where: { ...whereClause, type: "EXPENSE" },
            select: { amount: true },
          }),
        ]);

        const monthlyIncome = incomeTransactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );
        const monthlyExpense = expenseTransactions.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0
        );

        const netValue = monthlyIncome - monthlyExpense;
        lastBalance += netValue;

        // Only count months with actual transactions
        if (incomeTransactions.length > 0 || expenseTransactions.length > 0) {
          totalIncome += monthlyIncome;
          totalExpense += monthlyExpense;
          monthsWithData++;
        }

        historicalData.push({
          period: format(currentMonth, "yyyy-MM"),
          value: Math.round(lastBalance * 100) / 100,
          forecast: false,
        });
      }

      // Calculate average monthly income and expenses
      const averageIncome = monthsWithData > 0 ? totalIncome / monthsWithData : 0;
      const averageExpense = monthsWithData > 0 ? totalExpense / monthsWithData : 0;
      const averageNet = averageIncome - averageExpense;

      // Generate forecast data for the next 'months' months
      const forecastData = [];
      let currentBalance = lastBalance;

      for (let i = 1; i <= monthsValue; i++) {
        const futureMonth = addMonths(now, i);
        currentBalance += averageNet;

        forecastData.push({
          period: format(futureMonth, "yyyy-MM"),
          value: Math.round(currentBalance * 100) / 100,
          forecast: true,
        });
      }

      await prisma.$disconnect();

      return {
        historicalData,
        forecastData,
        averageIncome: Math.round(averageIncome * 100) / 100,
        averageExpense: Math.round(averageExpense * 100) / 100,
      };
    } catch (error) {
      console.error("Error in getForecastData:", error);
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
