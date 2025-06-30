import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecurrentPayment, RecurrenceInterval } from "../../utils/types";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
} from "../../components/Icons";
import { Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

// 🔧 Safe date formatting helper
const formatSafeDate = (
  date: string | Date | null | undefined,
  formatString: string = "d MMMM yyyy"
): string => {
  if (!date) return "Data non disponibile";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Data non valida";
    return format(dateObj, formatString, { locale: it });
  } catch (error) {
    return "Data non valida";
  }
};

interface RecurrentPaymentCardProps {
  payment: RecurrentPayment;
  formatAmount: (amount: number | string | null | undefined) => string; // 🔧 Updated to match fixed function
  onToggleActive: (payment: RecurrentPayment) => void;
  onEdit: (payment: RecurrentPayment) => void;
  onDelete: (id: string) => void;
}

// Funzione per ottenere il testo dell'intervallo
const getIntervalText = (
  interval: RecurrenceInterval,
  dayOfMonth?: number,
  dayOfWeek?: number
): string => {
  switch (interval) {
    case "daily":
      return "Ogni giorno";
    case "weekly":
      return "Ogni settimana";
    case "monthly":
      return dayOfMonth ? `Il giorno ${dayOfMonth} di ogni mese` : "Ogni mese";
    case "yearly":
      return "Ogni anno";
    default:
      return "Personalizzato";
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

const iconVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

const actionsVariants = {
  rest: {
    opacity: 0.6,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
};

const RecurrentPaymentCard: React.FC<RecurrentPaymentCardProps> = ({
  payment,
  formatAmount,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        className={cn(
          "p-6 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200",
          !payment.isActive && "opacity-75"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left section - Icon and basic info */}
          <div className="flex items-start">
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: payment.category.color }}
            >
              {payment.category.icon ? (
                <span className="text-lg font-medium">
                  {payment.category.icon.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="text-lg">€</span>
              )}
            </motion.div>

            <div className="ml-4">
              <div className="flex items-center gap-2">
                <motion.h3
                  className="text-lg font-semibold text-gray-900"
                  layout
                >
                  {payment.name}
                </motion.h3>
                <AnimatePresence>
                  {!payment.isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        Inattivo
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div className="mt-1 space-y-1.5" layout>
                {payment.description && (
                  <motion.p className="text-sm text-gray-600" layout>
                    {payment.description}
                  </motion.p>
                )}

                <motion.div className="flex items-center gap-4 text-sm" layout>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Repeat className="h-4 w-4" />
                    <span>
                      {getIntervalText(
                        payment.interval,
                        payment.dayOfMonth,
                        payment.dayOfWeek
                      )}
                    </span>
                  </div>
                </motion.div>

                <motion.div className="flex items-center gap-4 text-sm" layout>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      Prossimo: {formatSafeDate(payment.nextPaymentDate)}
                    </span>
                  </div>
                  {payment.endDate && (
                    <motion.div
                      className="flex items-center gap-1.5 text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span>Fine: {formatSafeDate(payment.endDate)}</span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Right section - Amount and actions */}
          <div className="flex flex-col items-end gap-3">
            <motion.div layout>
              <motion.div className="text-xl font-bold text-gray-900" layout>
                {formatAmount(payment.amount)}
              </motion.div>
              <motion.div className="text-sm text-gray-500 text-right" layout>
                {payment.category.name}
              </motion.div>
            </motion.div>

            <motion.div
              className="flex space-x-1"
              variants={actionsVariants}
              initial="rest"
              whileHover="hover"
              layout
            >
              <Button
                onClick={() => onToggleActive(payment)}
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-gray-100 transition-colors",
                  payment.isActive ? "text-green-600" : "text-gray-400"
                )}
                title={payment.isActive ? "Disattiva" : "Attiva"}
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {payment.isActive ? (
                    <ArrowUpIcon className="h-5 w-5" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5" />
                  )}
                </motion.div>
              </Button>

              <Button
                onClick={() => onEdit(payment)}
                variant="ghost"
                size="icon"
                className="text-blue-600 hover:bg-blue-50 transition-colors"
                title="Modifica"
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <EditIcon className="h-5 w-5" />
                </motion.div>
              </Button>

              <Button
                onClick={() => onDelete(payment.id)}
                variant="ghost"
                size="icon"
                className="text-red-600 hover:bg-red-50 transition-colors"
                title="Elimina"
              >
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecurrentPaymentCard;
