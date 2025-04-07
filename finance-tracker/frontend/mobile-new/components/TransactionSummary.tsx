import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Using a mock implementation instead of real Redux to avoid API errors
export default function TransactionSummary() {
  // Mock data
  const monthlySummary = {
    income: 2500,
    expenses: 1800,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Summary</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Income:</Text>
        <Text style={styles.income}>€{monthlySummary.income.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Expenses:</Text>
        <Text style={styles.expense}>
          €{monthlySummary.expenses.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.label}>Balance:</Text>
        <Text
          style={
            monthlySummary.income - monthlySummary.expenses >= 0
              ? styles.income
              : styles.expense
          }
        >
          €{(monthlySummary.income - monthlySummary.expenses).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    marginTop: 6,
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  income: {
    fontSize: 16,
    color: "#2ecc71",
    fontWeight: "bold",
  },
  expense: {
    fontSize: 16,
    color: "#e74c3c",
    fontWeight: "bold",
  },
});
