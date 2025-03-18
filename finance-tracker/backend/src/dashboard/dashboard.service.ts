import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
constructor(private prisma: PrismaService) {}

async getStats(userId: string, startDate?: string, endDate?: string) {
	// Build date filter
	const dateFilter: any = {};
	if (startDate) {
	dateFilter.gte = new Date(startDate);
	}
	if (endDate) {
	dateFilter.lte = new Date(endDate);
	}

	// Query base for transactions within date range
	const whereClause: any = {
	userId,
	};

	if (Object.keys(dateFilter).length > 0) {
	whereClause.date = dateFilter;
	}

	// Get all transactions within date range
	const transactions = await this.prisma.transaction.findMany({
	where: whereClause,
	include: {
		category: {
		select: {
			id: true,
			name: true,
			color: true,
			budget: true,
		},
		},
	},
	orderBy: { date: "desc" },
	});

	// Get all categories with budget
	const categories = await this.prisma.category.findMany({
	where: { userId },
	select: {
		id: true,
		name: true,
		color: true,
		budget: true,
	},
	});

	// Calculate total budget
	const totalBudget = categories.reduce(
	(sum, category) => sum + (category.budget ? Number(category.budget) : 0),
	0
	);

	// Calculate total income and expense
	const totalIncome = transactions
	.filter((t) => t.type === "INCOME")
	.reduce((sum, t) => sum + Number(t.amount), 0);

	const totalExpense = transactions
	.filter((t) => t.type === "EXPENSE")
	.reduce((sum, t) => sum + Number(t.amount), 0);

	const balance = totalIncome - totalExpense;

	// Calculate budget remaining and percentage
	const budgetRemaining = totalBudget - totalExpense;
	const budgetPercentage =
	totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

	// Calculate spending by category (for expenses only)
	const expenseTransactions = transactions.filter(
	(t) => t.type === "EXPENSE"
	);
	const categoryMap = new Map();

	// Initialize categoryMap with all categories that have a budget
	for (const category of categories) {
	if (category.budget) {
		categoryMap.set(category.id, {
		categoryId: category.id,
		categoryName: category.name,
		categoryColor: category.color,
		amount: 0,
		budget: Number(category.budget),
		budgetPercentage: 0,
		});
	}
	}

	for (const transaction of expenseTransactions) {
	const categoryId = transaction.categoryId;
	const categoryName = transaction.category?.name || "Uncategorized";
	const categoryColor = transaction.category?.color || "#808080";
	const categoryBudget = transaction.category?.budget
		? Number(transaction.category.budget)
		: 0;
	const amount = Number(transaction.amount);

	if (categoryMap.has(categoryId)) {
		categoryMap.get(categoryId).amount += amount;
	} else {
		categoryMap.set(categoryId, {
		categoryId,
		categoryName,
		categoryColor,
		amount,
		budget: categoryBudget,
		budgetPercentage: 0,
		});
	}
	}

	// Group transactions by category and calculate total amounts
	const categoriesData = [];
	for (const [categoryId, data] of categoryMap.entries()) {
	// Calculate budget percentage for this category
	if (data.budget > 0) {
		data.budgetPercentage = Math.round((data.amount / data.budget) * 100);
	}

	categoriesData.push({
		categoryId,
		categoryName: data.categoryName,
		categoryColor: data.categoryColor,
		amount: data.amount,
		percentage: Math.round((data.amount / totalExpense) * 100) || 0,
		budget: data.budget || undefined,
		budgetPercentage: data.budgetPercentage || undefined,
	});
	}

	// Sort categories by amount in descending order
	categoriesData.sort((a, b) => b.amount - a.amount);

	// Get recent transactions
	const recentTransactions = transactions;

	return {
	totalIncome,
	totalExpense,
	balance,
	totalBudget,
	budgetRemaining,
	budgetPercentage,
	categories: categoriesData,
	recentTransactions,
	dateRange: {
		startDate,
		endDate,
	},
	};
}
}
