import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { categoryService } from "../../utils/apiServices";

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  open,
  onClose,
  categoryName,
  suggestedAmount,
  onSuccess,
}) => {
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (open && categoryName) {
      // Find the category ID by name
      findCategoryByName();
    }
    if (suggestedAmount) {
      setBudgetAmount(suggestedAmount.toString());
    }
  }, [open, categoryName, suggestedAmount]);

  const findCategoryByName = async () => {
    try {
      setLoading(true);
      const categories = await categoryService.getCategories();
      const category = categories.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (category) {
        setCategoryId(category.id);
        if (category.budget) {
          setBudgetAmount(category.budget.toString());
        }
      }
    } catch (error) {
      console.error("Error finding category:", error);
      enqueueSnackbar("Errore nel caricamento della categoria", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!categoryId || !budgetAmount || isNaN(Number(budgetAmount))) {
      enqueueSnackbar("Inserisci un importo valido", { variant: "error" });
      return;
    }

    try {
      setLoading(true);
      await categoryService.updateCategory(categoryId, {
        budget: Number(budgetAmount),
      });
      
      enqueueSnackbar(
        `Budget di €${budgetAmount} impostato per ${categoryName}`,
        { variant: "success" }
      );
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating budget:", error);
      enqueueSnackbar("Errore nell'aggiornamento del budget", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBudgetAmount("");
    setCategoryId(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Imposta Budget per {categoryName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {suggestedAmount && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Importo suggerito: €{suggestedAmount.toFixed(2)} al mese
              </Typography>
            </Alert>
          )}
          
          <TextField
            label="Budget mensile"
            type="number"
            value={budgetAmount}
            onChange={(e) => setBudgetAmount(e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            helperText="Imposta il limite di spesa mensile per questa categoria"
            disabled={loading}
          />
          
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annulla
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !budgetAmount}
        >
          Imposta Budget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetModal;