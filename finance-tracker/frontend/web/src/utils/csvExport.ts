import { Transaction } from "./types";

export interface CsvExportTransaction {
  type: string;
  category: string;
  date: string;
  transaction: string;
  note: string;
}

/**
 * Converts transactions to CSV format as specified:
 * Type, Category, Date, Transaction, Note
 * "Expenses", "Grocery", "2025-03-25T00:00:00.000Z", "-30,50", "#fruttivendolo"
 * "Income", "Salary", "2025-03-17T00:00:00.000Z", "2133", "Stipendio"
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  filename?: string
): { success: boolean; error?: string } => {
  if (transactions.length === 0) {
    return { success: false, error: "Nessuna transazione selezionata per l'export" };
  }

  // Convert transactions to CSV format
  const csvData: CsvExportTransaction[] = transactions.map((transaction) => {
    // Format type
    const type = transaction.type === "INCOME" ? "Income" : "Expenses";

    // Format amount with Italian comma decimal separator
    const amount = Number(transaction.amount);
    const formattedAmount =
      transaction.type === "EXPENSE"
        ? `-${amount.toFixed(2).replace(".", ",")}`
        : amount.toFixed(2).replace(".", ",");

    // Combine description and tags
    const description = transaction.description || "";
    const tags = transaction.tags && transaction.tags.length > 0
      ? transaction.tags.map((tag) => `#${tag.name}`).join(" ")
      : "";
    
    // Create note field with both description and tags
    const note = [description, tags].filter(Boolean).join(" ");

    return {
      type,
      category: transaction.category.name,
      date: transaction.date,
      transaction: formattedAmount,
      note,
    };
  });

  // Create CSV header
  const headers = ["Type", "Category", "Date", "Transaction", "Note"];

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...csvData.map((row) =>
      [
        `"${row.type}"`,
        `"${row.category}"`,
        `"${row.date}"`,
        `"${row.transaction}"`,
        `"${row.note}"`,
      ].join(",")
    ),
  ].join("\n");

  // Create and download file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Generate filename
    const defaultFilename = `transazioni_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.setAttribute("download", filename || defaultFilename);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  }
  
  return { success: true };
};

/**
 * Preview CSV content for selected transactions
 */
export const previewCSVContent = (transactions: Transaction[]): string => {
  if (transactions.length === 0) {
    return "Nessuna transazione selezionata";
  }

  const csvData: CsvExportTransaction[] = transactions
    .slice(0, 5)
    .map((transaction) => {
      const type = transaction.type === "INCOME" ? "Income" : "Expenses";
      const amount = Number(transaction.amount);
      const formattedAmount =
        transaction.type === "EXPENSE"
          ? `-${amount.toFixed(2).replace(".", ",")}`
          : amount.toFixed(2).replace(".", ",");
      
      // Combine description and tags
      const description = transaction.description || "";
      const tags = transaction.tags && transaction.tags.length > 0
        ? transaction.tags.map((tag) => `#${tag.name}`).join(" ")
        : "";
      
      // Create note field with both description and tags
      const note = [description, tags].filter(Boolean).join(" ");

      return {
        type,
        category: transaction.category.name,
        date: transaction.date,
        transaction: formattedAmount,
        note,
      };
    });

  const headers = ["Type", "Category", "Date", "Transaction", "Note"];

  const preview = [
    headers.join(","),
    ...csvData.map((row) =>
      [
        `"${row.type}"`,
        `"${row.category}"`,
        `"${row.date}"`,
        `"${row.transaction}"`,
        `"${row.note}"`,
      ].join(",")
    ),
  ].join("\n");

  return transactions.length > 5
    ? preview + `\n... e altre ${transactions.length - 5} transazioni`
    : preview;
};
