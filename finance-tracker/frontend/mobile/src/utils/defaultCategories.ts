import { createCategory } from "../store/slices/categorySlice";
import { AppDispatch } from "../store";

export const fetchDefaultCategoriesByType = async (
  dispatch: AppDispatch,
  type: "INCOME" | "EXPENSE"
) => {
  console.log(`Creazione categorie predefinite per tipo: ${type}`);

  const categoriesToCreate = [];

  if (type === "EXPENSE") {
    categoriesToCreate.push(
      { name: "Alimentari", color: "#FF5733", type: "EXPENSE" },
      { name: "Trasporti", color: "#33A8FF", type: "EXPENSE" },
      { name: "Casa", color: "#33FF57", type: "EXPENSE" },
      { name: "Svago", color: "#A833FF", type: "EXPENSE" },
      { name: "Salute", color: "#FF33A8", type: "EXPENSE" }
    );
  } else if (type === "INCOME") {
    categoriesToCreate.push(
      { name: "Stipendio", color: "#33FF57", type: "INCOME" },
      { name: "Bonus", color: "#FFDD33", type: "INCOME" },
      { name: "Regali", color: "#FF33A8", type: "INCOME" }
    );
  }

  console.log(
    `Creazione di ${categoriesToCreate.length} categorie predefinite con tipo=${type}`
  );

  // Creiamo le categorie in sequenza
  for (const category of categoriesToCreate) {
    try {
      console.log(
        `Creazione categoria: ${category.name} di tipo ${category.type}`
      );
      await dispatch(createCategory(category)).unwrap();
    } catch (error) {
      console.error(
        `Errore durante la creazione della categoria ${category.name}:`,
        error
      );
    }
  }

  console.log("Creazione categorie predefinite completata");
};
