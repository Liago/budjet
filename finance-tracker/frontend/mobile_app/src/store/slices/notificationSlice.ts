import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NotificationSettings } from "../../services/notificationService";

interface NotificationState {
  settings: NotificationSettings;
  pushToken: string | null;
}

const initialState: NotificationState = {
  settings: {
    budgetAlerts: true,
    monthlyReport: true,
    billReminders: true,
    savingsGoals: true,
  },
  pushToken: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    updateSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setPushToken: (state, action: PayloadAction<string | null>) => {
      state.pushToken = action.payload;
    },
  },
});

export const { updateSettings, setPushToken } = notificationSlice.actions;
export default notificationSlice.reducer;
