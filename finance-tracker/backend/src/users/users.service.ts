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
  constructor(@Inject(DATABASE_PROVIDER) private db: PrismaService) {}

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
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.db.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    // Create default categories for the user
    await this.createDefaultCategories(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
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
