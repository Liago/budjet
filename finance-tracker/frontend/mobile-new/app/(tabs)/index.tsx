import { StyleSheet, ScrollView } from "react-native";
import { Text, View } from "../../components/Themed";
import TransactionSummary from "../../components/TransactionSummary";
import { useEffect } from "react";

export default function TabOneScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <TransactionSummary />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.placeholderCard}>
          <Text>Your recent transactions will appear here</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  placeholderCard: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
});
