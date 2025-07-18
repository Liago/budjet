import React, { useState } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { savingsGoalsService } from "../../utils/apiServices";

interface SavingsGoalModalProps {
  open: boolean;
  onClose: () => void;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  open,
  onClose,
  suggestedAmount,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: suggestedAmount?.toString() || "",
    targetDate: "",
    description: "",
    category: "emergency",
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.targetAmount || !formData.targetDate) {
      enqueueSnackbar("Compila tutti i campi obbligatori", { variant: "error" });
      return;
    }

    if (isNaN(Number(formData.targetAmount))) {
      enqueueSnackbar("Inserisci un importo valido", { variant: "error" });
      return;
    }

    try {
      setLoading(true);
      await savingsGoalsService.create({
        name: formData.name,
        targetAmount: Number(formData.targetAmount),
        targetDate: formData.targetDate,
        description: formData.description,
        category: formData.category,
      });
      
      enqueueSnackbar(
        `Obiettivo di risparmio "${formData.name}" creato con successo`,
        { variant: "success" }
      );
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating savings goal:", error);
      enqueueSnackbar("Errore nella creazione dell'obiettivo", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      targetAmount: "",
      targetDate: "",
      description: "",
      category: "emergency",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Crea Obiettivo di Risparmio
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {suggestedAmount && (
            <Alert severity="info">
              <Typography variant="body2">
                Importo suggerito: €{suggestedAmount.toFixed(2)} al mese
              </Typography>
            </Alert>
          )}
          
          <TextField
            label="Nome obiettivo"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Es. Fondo emergenza"
            disabled={loading}
          />
          
          <TextField
            label="Importo obiettivo"
            type="number"
            value={formData.targetAmount}
            onChange={(e) => handleInputChange("targetAmount", e.target.value)}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            disabled={loading}
          />
          
          <TextField
            label="Data obiettivo"
            type="date"
            value={formData.targetDate}
            onChange={(e) => handleInputChange("targetDate", e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minDateString }}
            disabled={loading}
          />
          
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              label="Categoria"
            >
              <MenuItem value="emergency">Fondo Emergenza</MenuItem>
              <MenuItem value="vacation">Vacanze</MenuItem>
              <MenuItem value="house">Casa</MenuItem>
              <MenuItem value="car">Auto</MenuItem>
              <MenuItem value="education">Educazione</MenuItem>
              <MenuItem value="investment">Investimenti</MenuItem>
              <MenuItem value="other">Altro</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Descrizione (opzionale)"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            fullWidth
            multiline
            rows={2}
            variant="outlined"
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
          disabled={loading || !formData.name || !formData.targetAmount || !formData.targetDate}
        >
          Crea Obiettivo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavingsGoalModal;