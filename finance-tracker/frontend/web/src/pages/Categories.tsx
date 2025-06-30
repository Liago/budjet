import { useState, useEffect } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setCurrentCategory,
} from "../store/slices/categorySlice";
import {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../utils/types";
import { PlusIcon } from "../components/Icons";
import {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useFormValidation,
} from "../utils/hooks";
import useCategorySpending from "../utils/hooks/useCategorySpending";

// Import presentational components
import CategoryFilter from "../components/categories/CategoryFilter";
import CategoryList from "../components/categories/CategoryList";
import TotalBudgetCard from "../components/categories/TotalBudgetCard";
import MonthlySpendingSection from "../components/categories/MonthlySpendingSection";
import CategoryForm, {
  CategoryFormData,
} from "../components/categories/CategoryForm";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Categories = () => {
  const dispatch = useAppDispatch();
  const { categories, isLoading, currentCategory } = useAppSelector(
    (state) => state.categories
  );
  const { errors, validate, clearErrors } = useFormValidation();
  useAuth(); // Make sure user is authenticated

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all">("all");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "current-month" | string
  >("current-month");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Custom hooks
  const { categorySpending, loadingSpending, availableMonths } =
    useCategorySpending(categories, timeFilter);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Reset form when modal is opened/closed or when editing a category
  useEffect(() => {
    if (!isModalOpen) {
      dispatch(setCurrentCategory(null));
    }
  }, [isModalOpen, dispatch]);

  // Handle form submission
  const handleSubmit = (formData: CategoryFormData) => {
    const validationRules = {
      name: (value: string) => (!value ? "Category name is required" : null),
      color: (value: string) => (!value ? "Color is required" : null),
      icon: (value: string) => (!value ? "Icon is required" : null),
      budget: (value: string) =>
        value && parseFloat(value) < 0 ? "Budget cannot be negative" : null,
    };

    if (validate(formData, validationRules)) {
      if (currentCategory) {
        const updateData: UpdateCategoryData = {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        };

        dispatch(
          updateCategory({
            id: currentCategory.id,
            data: updateData,
          })
        )
          .unwrap()
          .then(() => {
            setIsModalOpen(false);
          })
          .catch((error) => {
            console.error("Error updating category:", error);
          });
      } else {
        const createData: CreateCategoryData = {
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
        };

        dispatch(createCategory(createData))
          .unwrap()
          .then(() => {
            setIsModalOpen(false);
          })
          .catch((error) => {
            console.error("Error creating category:", error);
          });
      }
    }
  };

  // Handle opening the modal for editing
  const handleOpenModal = (category?: Category) => {
    clearErrors();
    if (category) {
      dispatch(setCurrentCategory(category));
    } else {
      dispatch(setCurrentCategory(null));
    }
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearErrors();
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This will affect all transactions using this category."
      )
    ) {
      dispatch(deleteCategory(id))
        .unwrap()
        .catch((error) => {
          console.error("Error deleting category:", error);
        });
    }
  };

  // Filter categories with safe null/undefined checks
  const filteredCategories = categories.filter((category) => {
    // Safety check: ensure category and category.name exist
    if (!category || !category.name) {
      console.warn("Category with missing name found:", category);
      return false;
    }

    // Filter by search term
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Total Budget Card */}
      <TotalBudgetCard categories={categories} />

      {/* Budget vs Spending Section */}
      <MonthlySpendingSection
        categories={categories}
        categorySpending={categorySpending}
        timeFilter={timeFilter}
        availableMonths={availableMonths}
        loadingSpending={loadingSpending}
        onTimeFilterChange={setTimeFilter}
        onEditCategory={handleOpenModal}
      />

      {/* Filters */}
      <CategoryFilter
        searchTerm={searchTerm}
        filterType={filterType}
        onSearchChange={setSearchTerm}
        onFilterChange={(value) => setFilterType(value as "all")}
      />

      {/* Categories Grid */}
      <CategoryList
        categories={filteredCategories}
        isLoading={isLoading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onAdd={() => handleOpenModal()}
      />

      {/* Category Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) handleCloseModal();
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <CategoryForm
            category={currentCategory}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            errors={errors}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
