import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DATABASE_PROVIDER } from "../database/database.module";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_PROVIDER) private db: PrismaService
  ) {
    console.log('🔧 UsersService initialized, db:', !!this.db);
    console.log('🔧 Database service type:', this.db ? this.db.constructor.name : 'undefined');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<Omit<User, "password">> {
    console.log('📝 UsersService.create called with data:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      hasPassword: !!data.password,
      passwordLength: data.password?.length
    });
    
    try {
      // STEP 1: Check if user exists (double check)
      console.log('🔍 USER SERVICE STEP 1: Checking if user exists...');
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        console.error('❌ User already exists in UsersService check');
        throw new ConflictException("Email already in use");
      }
      console.log('✅ USER SERVICE STEP 1: Email confirmed available');

      // STEP 2: Hash password
      console.log('🔍 USER SERVICE STEP 2: Hashing password...');
      console.log('🔍 Password to hash length:', data.password?.length);
      
      let hashedPassword: string;
      try {
        hashedPassword = await bcrypt.hash(data.password, 10);
        console.log('✅ USER SERVICE STEP 2: Password hashed successfully');
        console.log('🔍 Hashed password length:', hashedPassword?.length);
      } catch (hashError) {
        console.error('❌ Password hashing failed:', {
          message: hashError.message,
          stack: hashError.stack,
          passwordLength: data.password?.length
        });
        throw new Error(`Password hashing failed: ${hashError.message}`);
      }

      // STEP 3: Create user in database
      console.log('🔍 USER SERVICE STEP 3: Creating user in database...');
      console.log('🔍 User data for DB:', {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        hasHashedPassword: !!hashedPassword
      });
      
      let user: User;
      try {
        user = await this.db.user.create({
          data: {
            ...data,
            password: hashedPassword,
          },
        });
        console.log('✅ USER SERVICE STEP 3: User created in database with ID:', user.id);
      } catch (dbError) {
        console.error('❌ Database user creation failed:', {
          message: dbError.message,
          stack: dbError.stack,
          code: dbError.code,
          meta: dbError.meta
        });
        throw new Error(`Database user creation failed: ${dbError.message}`);
      }

      // STEP 4: Create default categories
      console.log('🔍 USER SERVICE STEP 4: Creating default categories...');
      try {
        await this.createDefaultCategories(user.id);
        console.log('✅ USER SERVICE STEP 4: Default categories created successfully');
      } catch (categoriesError) {
        console.error('❌ Default categories creation failed:', {
          message: categoriesError.message,
          stack: categoriesError.stack,
          userId: user.id
        });
        
        // Non throwamo l'errore qui perché l'utente è già stato creato
        // Logghiamo l'errore ma continuiamo
        console.warn('⚠️ User created but default categories failed - continuing...');
      }
      
      // STEP 5: Return user without password
      console.log('🔍 USER SERVICE STEP 5: Preparing final response...');
      const { password, ...result } = user;
      console.log('✅ USER SERVICE STEP 5: User creation completed successfully');
      return result;
      
    } catch (error) {
      console.error('❌ UsersService.create failed - DETAILED ERROR:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        email: data.email,
        userData: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          hasPassword: !!data.password
        }
      });
      throw error;
    }
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
    }
  ): Promise<Omit<User, "password">> {
    const user = await this.db.user.update({
      where: { id },
      data,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  private async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { name: "Food", icon: "restaurant", color: "#FF5733", isDefault: true },
      {
        name: "Transportation",
        icon: "directions_car",
        color: "#33FF57",
        isDefault: true,
      },
      { name: "Housing", icon: "home", color: "#3357FF", isDefault: true },
      {
        name: "Entertainment",
        icon: "movie",
        color: "#FF33F5",
        isDefault: true,
      },
      {
        name: "Shopping",
        icon: "shopping_cart",
        color: "#F5FF33",
        isDefault: true,
      },
      { name: "Utilities", icon: "power", color: "#33FFF5", isDefault: true },
      {
        name: "Healthcare",
        icon: "local_hospital",
        color: "#FF3333",
        isDefault: true,
      },
      {
        name: "Salary",
        icon: "attach_money",
        color: "#33FF33",
        isDefault: true,
      },
      {
        name: "Investments",
        icon: "trending_up",
        color: "#3333FF",
        isDefault: true,
      },
      {
        name: "Gifts",
        icon: "card_giftcard",
        color: "#FF33FF",
        isDefault: true,
      },
    ];

    await this.db.category.createMany({
      data: defaultCategories.map((category) => ({
        ...category,
        userId,
      })),
    });
  }
}
