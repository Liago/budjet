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
import { DeleteConfirmationModal } from "../components/ui/confirmation-modal";

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
  const {
    categorySpending,
    monthlyAverages,
    loadingSpending,
    availableMonths,
  } = useCategorySpending(categories, timeFilter);

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

  // Filter categories based on search term and filter type
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all"; // We only have "all" for now
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleOpenModal = (category?: Category) => {
    if (category) {
      dispatch(setCurrentCategory(category));
    } else {
      dispatch(setCurrentCategory(null));
    }
    clearErrors();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    clearErrors();
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    formData: CategoryFormData
  ) => {
    event.preventDefault();

    // Validate the form
    const validationResult = validate(formData, {
      name: "required",
      color: "required",
      icon: "required",
    });

    if (!validationResult.isValid) {
      return;
    }

    try {
      if (currentCategory) {
        // Update existing category
        const updateData: UpdateCategoryData = {
          ...formData,
          budget: formData.budget ? Number(formData.budget) : undefined,
        };
        await dispatch(
          updateCategory({ id: currentCategory.id, ...updateData })
        );
      } else {
        // Create new category
        const createData: CreateCategoryData = {
          ...formData,
          budget: formData.budget ? Number(formData.budget) : undefined,
        };
        await dispatch(createCategory(createData));
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
  }>({ open: false, categoryId: "", categoryName: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setDeleteModal({
        open: true,
        categoryId: id,
        categoryName: category.name
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await dispatch(deleteCategory(deleteModal.categoryId));
      setDeleteModal({ open: false, categoryId: "", categoryName: "" });
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

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
        monthlyAverages={monthlyAverages}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, categoryId: "", categoryName: "" })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.categoryName}
        itemType="categoria"
        loading={deleteLoading}
        warning="Questa azione eliminerà la categoria e tutti i dati associati."
      />
    </div>
  );
};

export default Categories;
