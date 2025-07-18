import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Divider,
  Avatar,
  Button,
  Paper,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  LinearProgress,
  Skeleton,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AttachMoney,
  TrendingUp,
  ExpandMore,
  ArrowUpward,
  ArrowDownward,
  Insights,
  Lightbulb,
  Savings,
  Warning,
  CheckCircle,
  AccessTime,
  Bolt,
  AccountBalance,
  Receipt,
  Shop,
  LocalOffer,
} from "@mui/icons-material";
import numeral from "numeral";
import { dashboardService } from "../../utils/apiServices";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import BudgetModal from "../modals/BudgetModal";
import SavingsGoalModal from "../modals/SavingsGoalModal";

// Tipi per le proiezioni di risparmio
type SavingSuggestion = {
  id: string;
  category: string;
  categoryColor: string;
  description: string;
  potentialSaving: number;
  type:
    | "spending_reduction"
    | "automation"
    | "debt_management"
    | "subscription";
  difficulty: "easy" | "medium" | "hard";
  impact: "low" | "medium" | "high";
};

type SavingSuggestionsResponse = {
  suggestions: SavingSuggestion[];
  averageIncome: number;
  averageExpense: number;
  potentialMonthlySavings: number;
  yearlyProjection: number;
};

// Tipi per i dati di previsione
type ForecastDataPoint = {
  period: string;
  value: number;
  forecast: boolean;
};

type ForecastResponse = {
  historicalData: ForecastDataPoint[];
  forecastData: ForecastDataPoint[];
  averageIncome: number;
  averageExpense: number;
};

// Styling personalizzato
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const SavingChip = styled(Chip)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "0.9rem",
  height: "auto",
  padding: "4px 0",
}));

const ImpactIndicator = styled(Box)<{ impact: "low" | "medium" | "high" }>(
  ({ theme, impact }) => ({
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.grey[200],
    position: "relative",
    overflow: "hidden",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      width: impact === "low" ? "33%" : impact === "medium" ? "66%" : "100%",
      backgroundColor:
        impact === "low"
          ? theme.palette.success.light
          : impact === "medium"
          ? theme.palette.warning.main
          : theme.palette.success.dark,
      borderRadius: 4,
    },
  })
);

const DifficultyChip = styled(Chip)<{ difficulty: "easy" | "medium" | "hard" }>(
  ({ theme, difficulty }) => ({
    backgroundColor:
      difficulty === "easy"
        ? theme.palette.success.light
        : difficulty === "medium"
        ? theme.palette.warning.light
        : theme.palette.error.light,
    color:
      difficulty === "easy"
        ? theme.palette.success.contrastText
        : difficulty === "medium"
        ? theme.palette.warning.contrastText
        : theme.palette.error.contrastText,
    fontWeight: "bold",
    fontSize: "0.7rem",
  })
);

// Componente per i suggerimenti di risparmio
const SavingSuggestions: React.FC<{
  suggestions: SavingSuggestion[];
  loading: boolean;
}> = ({ suggestions, loading }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Stati per i modals
  const [budgetModal, setBudgetModal] = useState({
    open: false,
    category: "",
    potentialSaving: 0,
  });
  const [savingsGoalModal, setSavingsGoalModal] = useState({
    open: false,
    suggestedAmount: 0,
  });

  // Funzione per gestire l'applicazione del suggerimento
  const handleApplySuggestion = (suggestion: SavingSuggestion) => {
    switch (suggestion.type) {
      case "spending_reduction":
        // Apri modal per impostare budget categoria
        setBudgetModal({
          open: true,
          category: suggestion.category,
          potentialSaving: suggestion.potentialSaving,
        });
        break;
      
      case "subscription":
        // Naviga alla pagina dei pagamenti ricorrenti
        navigate("/recurring-payments");
        enqueueSnackbar("Controlla i tuoi abbonamenti e pagamenti ricorrenti", {
          variant: "info",
        });
        break;
      
      case "automation":
        // Apri modal per creare obiettivo di risparmio
        setSavingsGoalModal({
          open: true,
          suggestedAmount: suggestion.potentialSaving,
        });
        break;
      
      case "debt_management":
        // Naviga alla pagina categorie per gestire debiti
        navigate("/categories");
        enqueueSnackbar("Gestisci i tuoi budget per controllare i debiti", {
          variant: "info",
        });
        break;
      
      default:
        // Azione generica - naviga alle categorie
        navigate("/categories");
        enqueueSnackbar("Gestisci le tue categorie di spesa", {
          variant: "info",
        });
    }
  };

  // Funzione per ottenere l'icona appropriata per il tipo di suggerimento
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "spending_reduction":
        return <Receipt />;
      case "automation":
        return <Bolt />;
      case "debt_management":
        return <AccountBalance />;
      case "subscription":
        return <LocalOffer />;
      default:
        return <Lightbulb />;
    }
  };

  if (loading) {
    return (
      <>
        <Box sx={{ p: 2 }}>
          {[1, 2, 3].map((item) => (
          <Box
            key={item}
            sx={{ mb: 2, p: 2, bgcolor: "background.paper", borderRadius: 1 }}
          >
            <Skeleton
              variant="rectangular"
              width="100%"
              height={30}
              sx={{ mb: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width="70%"
              height={20}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Skeleton variant="rectangular" width="30%" height={30} />
              <Skeleton variant="rectangular" width="20%" height={30} />
            </Box>
          </Box>
          ))}
        </Box>
      </>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        <AlertTitle>Ottimo lavoro!</AlertTitle>
        Non abbiamo trovato suggerimenti di risparmio significativi per te in
        questo momento. Continua così!
      </Alert>
    );
  }

  return (
    <>
      <List sx={{ width: "100%", p: 1 }}>
        {suggestions.map((suggestion) => (
        <Paper
          key={suggestion.id}
          elevation={1}
          sx={{
            mb: 2,
            p: 0,
            borderLeft: `6px solid ${suggestion.categoryColor}`,
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateX(4px)",
            },
          }}
        >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls={`suggestion-${suggestion.id}-content`}
              id={`suggestion-${suggestion.id}-header`}
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <Avatar
                    sx={{
                      bgcolor: suggestion.categoryColor,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getSuggestionIcon(suggestion.type)}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="body1" fontWeight="bold">
                    {suggestion.description}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      {suggestion.category}
                    </Typography>
                    <DifficultyChip
                      label={
                        suggestion.difficulty === "easy"
                          ? "Facile"
                          : suggestion.difficulty === "medium"
                          ? "Media"
                          : "Difficile"
                      }
                      size="small"
                      difficulty={suggestion.difficulty}
                    />
                  </Box>
                </Grid>
                <Grid item>
                  <SavingChip
                    label={`€${numeral(suggestion.potentialSaving).format(
                      "0,0"
                    )}/mese`}
                    color="success"
                    icon={<Savings />}
                  />
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 1, py: 1 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Impatto:</strong>
                </Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <ImpactIndicator impact={suggestion.impact} />
                  <Typography variant="caption" color="text.secondary">
                    {suggestion.impact === "low"
                      ? "Basso"
                      : suggestion.impact === "medium"
                      ? "Medio"
                      : "Alto"}
                  </Typography>
                </Box>

                {suggestion.type === "spending_reduction" && (
                  <Typography variant="body2">
                    Riducendo le spese in questa categoria potresti risparmiare
                    circa €
                    {numeral(suggestion.potentialSaving * 12).format("0,0")}{" "}
                    all'anno.
                  </Typography>
                )}

                {suggestion.type === "subscription" && (
                  <Typography variant="body2">
                    Verifica se ci sono abbonamenti che non utilizzi o che
                    potresti condividere con altri.
                  </Typography>
                )}

                {suggestion.type === "automation" && (
                  <Typography variant="body2">
                    Imposta un trasferimento automatico mensile verso un conto
                    di risparmio per costruire le tue riserve.
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => handleApplySuggestion(suggestion)}
                >
                  Applica questo suggerimento
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
        ))}
      </List>
    
    {/* Budget Modal */}
    <BudgetModal
      open={budgetModal.open}
      onClose={() => setBudgetModal({ open: false, category: "", potentialSaving: 0 })}
      categoryName={budgetModal.category}
      potentialSaving={budgetModal.potentialSaving}
      onSuccess={() => {
        enqueueSnackbar("Budget aggiornato con successo!", { variant: "success" });
      }}
    />
    
    {/* Savings Goal Modal */}
    <SavingsGoalModal
      open={savingsGoalModal.open}
      onClose={() => setSavingsGoalModal({ open: false, suggestedAmount: 0 })}
      suggestedAmount={savingsGoalModal.suggestedAmount}
      onSuccess={() => {
        enqueueSnackbar("Obiettivo di risparmio creato!", { variant: "success" });
      }}
    />
  </>
  );
};

// Componente principale per l'analisi predittiva
const PredictiveAnalysis = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [forecastMonths, setForecastMonths] = useState(6);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(
    null
  );
  const [savingsSuggestions, setSavingsSuggestions] =
    useState<SavingSuggestionsResponse | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  // Carica i dati di previsione
  useEffect(() => {
    const loadForecastData = async () => {
      setIsLoadingForecast(true);
      try {
        const data = await dashboardService.getForecastData(forecastMonths);
        setForecastData(data);
      } catch (error) {
        console.error("Error loading forecast data:", error);
        enqueueSnackbar("Errore nel caricamento dei dati di previsione", {
          variant: "error",
        });
      } finally {
        setIsLoadingForecast(false);
      }
    };

    loadForecastData();
  }, [forecastMonths, enqueueSnackbar]);

  // Carica i suggerimenti di risparmio
  useEffect(() => {
    const loadSavingSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const data = await dashboardService.getSavingSuggestions();
        setSavingsSuggestions(data);
      } catch (error) {
        console.error("Error loading saving suggestions:", error);
        enqueueSnackbar(
          "Errore nel caricamento dei suggerimenti di risparmio",
          { variant: "error" }
        );
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSavingSuggestions();
  }, [enqueueSnackbar]);

  // Gestisce il cambio di tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Prepara i dati combinati per il grafico di previsione
  const combinedChartData = React.useMemo(() => {
    if (!forecastData) return [];

    const historicalPoints = forecastData.historicalData.map((point) => ({
      period: point.period,
      storico: point.value,
      previsione: null,
    }));

    const forecastPoints = forecastData.forecastData.map((point) => ({
      period: point.period,
      storico: null,
      previsione: point.value,
    }));

    // Trova il punto di giunzione tra dati storici e previsione
    const lastHistoricalPoint = historicalPoints[historicalPoints.length - 1];
    const firstForecastPoint = forecastPoints[0];

    // Assicurati che ci sia continuità nel grafico aggiungendo il valore storico al primo punto di previsione
    if (lastHistoricalPoint && firstForecastPoint) {
      firstForecastPoint.storico = lastHistoricalPoint.storico;
    }

    return [...historicalPoints, ...forecastPoints];
  }, [forecastData]);

  // Calcola il potenziale di risparmio annuale
  const yearlyPotential = React.useMemo(() => {
    if (!savingsSuggestions) return 0;
    return savingsSuggestions.yearlyProjection;
  }, [savingsSuggestions]);

  // Calcola il principale suggerimento di risparmio
  const topSavingSuggestion = React.useMemo(() => {
    if (!savingsSuggestions?.suggestions.length) return null;
    return savingsSuggestions.suggestions[0];
  }, [savingsSuggestions]);

  return (
    <Box sx={{ width: "100%", p: { xs: 1, md: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Analisi Predittiva
      </Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="analisi predittiva tabs"
        variant="fullWidth"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Previsione Finanziaria"
          icon={<TrendingUp />}
          iconPosition="start"
        />
        <Tab
          label={
            <Badge
              badgeContent={savingsSuggestions?.suggestions.length || 0}
              color="error"
              sx={{ "& .MuiBadge-badge": { right: -12, top: -2 } }}
            >
              Suggerimenti per Risparmiare
            </Badge>
          }
          icon={<Lightbulb />}
          iconPosition="start"
        />
      </Tabs>

      {/* Tab per la previsione finanziaria */}
      {activeTab === 0 && (
        <Box>
          {/* Sezione di riepilogo della previsione */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <StyledCard variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Previsione Saldo
                  </Typography>
                  {isLoadingForecast ? (
                    <Skeleton variant="rectangular" width="100%" height={120} />
                  ) : (
                    <>
                      <Box
                        sx={{ display: "flex", alignItems: "baseline", mb: 2 }}
                      >
                        <Typography
                          variant="h3"
                          color="primary"
                          fontWeight="bold"
                        >
                          €
                          {numeral(
                            forecastData?.forecastData[
                              forecastData.forecastData.length - 1
                            ]?.value || 0
                          ).format("0,0")}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          previsto tra {forecastMonths} mesi
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        {combinedChartData.length > 2 &&
                        combinedChartData[combinedChartData.length - 1]
                          .previsione > (combinedChartData[0].storico || 0) ? (
                          <>
                            <ArrowUpward color="success" />
                            <Typography variant="body1" color="success.main">
                              +
                              {numeral(
                                (combinedChartData[combinedChartData.length - 1]
                                  .previsione || 0) -
                                  (combinedChartData[0].storico || 0)
                              ).format("0,0")}{" "}
                              (
                              {Math.round(
                                ((combinedChartData[
                                  combinedChartData.length - 1
                                ].previsione || 0) /
                                  (combinedChartData[0].storico || 1) -
                                  1) *
                                  100
                              )}
                              %)
                            </Typography>
                          </>
                        ) : (
                          <>
                            <ArrowDownward color="error" />
                            <Typography variant="body1" color="error.main">
                              {numeral(
                                (combinedChartData[combinedChartData.length - 1]
                                  .previsione || 0) -
                                  (combinedChartData[0].storico || 0)
                              ).format("0,0")}{" "}
                              (
                              {Math.round(
                                ((combinedChartData[
                                  combinedChartData.length - 1
                                ].previsione || 0) /
                                  (combinedChartData[0].storico || 1) -
                                  1) *
                                  100
                              )}
                              %)
                            </Typography>
                          </>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard variant="outlined">
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Media Mensile
                  </Typography>
                  {isLoadingForecast ? (
                    <>
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={30}
                        sx={{ mb: 2 }}
                      />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={30}
                      />
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 2,
                        }}
                      >
                        <Typography variant="body1">Entrate:</Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="success.main"
                        >
                          €
                          {numeral(forecastData?.averageIncome || 0).format(
                            "0"
                          )}
                          /mese
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1">Uscite:</Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color="error.main"
                        >
                          €
                          {numeral(forecastData?.averageExpense || 0).format(
                            "0"
                          )}
                          /mese
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body1">Bilancio:</Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          color={
                            (forecastData?.averageIncome || 0) -
                              (forecastData?.averageExpense || 0) >
                            0
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          €
                          {numeral(
                            (forecastData?.averageIncome || 0) -
                              (forecastData?.averageExpense || 0)
                          ).format("0,0")}
                          /mese
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          {/* Grafico della previsione */}
          <StyledCard variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Proiezione Finanziaria ({forecastMonths} mesi)
              </Typography>
              {isLoadingForecast ? (
                <Skeleton variant="rectangular" width="100%" height={300} />
              ) : (
                <Box sx={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={combinedChartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient
                          id="historicalGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="forecastGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={theme.palette.secondary.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.secondary.main}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          `€${numeral(value).format("0a")}`
                        }
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `€${numeral(value).format("0,0")}`,
                          undefined,
                        ]}
                        labelFormatter={(label) => `Periodo: ${label}`}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        name="Storico"
                        dataKey="storico"
                        stroke={theme.palette.primary.main}
                        fillOpacity={1}
                        fill="url(#historicalGradient)"
                        strokeWidth={2}
                        connectNulls
                      />
                      <Area
                        type="monotone"
                        name="Previsione"
                        dataKey="previsione"
                        stroke={theme.palette.secondary.main}
                        fillOpacity={1}
                        fill="url(#forecastGradient)"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant={forecastMonths === 3 ? "contained" : "outlined"}
                  onClick={() => setForecastMonths(3)}
                  size="small"
                >
                  3 mesi
                </Button>
                <Button
                  variant={forecastMonths === 6 ? "contained" : "outlined"}
                  onClick={() => setForecastMonths(6)}
                  size="small"
                >
                  6 mesi
                </Button>
                <Button
                  variant={forecastMonths === 12 ? "contained" : "outlined"}
                  onClick={() => setForecastMonths(12)}
                  size="small"
                >
                  12 mesi
                </Button>
              </Box>
            </CardContent>
          </StyledCard>

          {/* Note sulla previsione */}
          <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
            <AlertTitle>Come interpretare la previsione</AlertTitle>
            <Typography variant="body2">
              Questa previsione si basa sulle tue abitudini di spesa e guadagno
              degli ultimi mesi e utilizza tecniche di analisi predittiva per
              stimare la tua situazione finanziaria futura. Ricorda che si
              tratta di una stima e potrebbe variare in base a eventi
              imprevisti.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Tab per i suggerimenti di risparmio */}
      {activeTab === 1 && (
        <Box>
          {!isLoadingSuggestions && savingsSuggestions && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <StyledCard variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Potenziale di Risparmio
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "baseline", mb: 2 }}
                    >
                      <Typography
                        variant="h3"
                        color="success.main"
                        fontWeight="bold"
                      >
                        €
                        {numeral(
                          savingsSuggestions.potentialMonthlySavings
                        ).format("0,0")}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        /mese
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Insights color="primary" />
                      <Typography variant="body2">
                        Potenziale di risparmio annuale: €
                        {numeral(yearlyPotential).format("0,0")}
                      </Typography>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <StyledCard variant="outlined">
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Suggerimento Principale
                    </Typography>
                    {topSavingSuggestion ? (
                      <>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          {topSavingSuggestion.description}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                          }}
                        >
                          <Chip
                            label={topSavingSuggestion.category}
                            size="small"
                            sx={{
                              bgcolor: topSavingSuggestion.categoryColor,
                              color: "#fff",
                            }}
                          />
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color="success.main"
                          >
                            €
                            {numeral(
                              topSavingSuggestion.potentialSaving
                            ).format("0,0")}
                            /mese
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Alert severity="success" variant="outlined">
                        <AlertTitle>Ottima Gestione!</AlertTitle>
                        Non abbiamo trovato opportunità di risparmio
                        significative.
                      </Alert>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          )}

          <StyledCard variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                I Tuoi Suggerimenti Personalizzati
              </Typography>
              <SavingSuggestions
                suggestions={savingsSuggestions?.suggestions || []}
                loading={isLoadingSuggestions}
              />

              {!isLoadingSuggestions &&
                savingsSuggestions?.suggestions.length === 0 && (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h6">
                      Sei sulla buona strada!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Non abbiamo trovato opportunità di risparmio significative
                      per te in questo momento.
                    </Typography>
                  </Box>
                )}

              {!isLoadingSuggestions &&
                savingsSuggestions?.suggestions.length > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <AlertTitle>Sapevi che?</AlertTitle>
                    <Typography variant="body2">
                      Applicando questi suggerimenti potresti risparmiare fino a
                      €{numeral(yearlyPotential).format("0,0")} in un anno!
                    </Typography>
                  </Alert>
                )}
            </CardContent>
          </StyledCard>
        </Box>
      )}
    </Box>
  );
};

export default PredictiveAnalysis;
