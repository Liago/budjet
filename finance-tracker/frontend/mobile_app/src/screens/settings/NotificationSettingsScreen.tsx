import React, { useEffect } from "react";
import { View, Switch, ScrollView, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { RootState } from "../../store";
import {
  updateSettings,
  setPushToken,
} from "../../store/slices/notificationSlice";
import { notificationService } from "../../services/notificationService";
import { colors } from "../../theme/colors";

export const NotificationSettingsScreen = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    const initializeNotifications = async () => {
      const token = await notificationService.getPushToken();
      dispatch(setPushToken(token));
    };

    initializeNotifications();
  }, [dispatch]);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    dispatch(updateSettings(newSettings));
    notificationService.updateSettings(newSettings);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1">
        <View className="p-4">
          <ThemedText className="text-2xl font-bold mb-4">
            Impostazioni Notifiche
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-4">
          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-1">
                <ThemedText className="text-lg font-semibold">
                  Avvisi Budget
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  Ricevi notifiche quando raggiungi i limiti di budget
                </ThemedText>
              </View>
              <Switch
                value={settings.budgetAlerts}
                onValueChange={() => handleToggle("budgetAlerts")}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={settings.budgetAlerts ? colors.white : colors.white}
              />
            </View>

            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-1">
                <ThemedText className="text-lg font-semibold">
                  Report Mensile
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  Ricevi un riepilogo mensile delle tue finanze
                </ThemedText>
              </View>
              <Switch
                value={settings.monthlyReport}
                onValueChange={() => handleToggle("monthlyReport")}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={
                  settings.monthlyReport ? colors.white : colors.white
                }
              />
            </View>

            <View className="flex-row justify-between items-center py-4 border-b border-gray-200">
              <View className="flex-1">
                <ThemedText className="text-lg font-semibold">
                  Promemoria Fatture
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  Ricevi promemoria per le fatture in scadenza
                </ThemedText>
              </View>
              <Switch
                value={settings.billReminders}
                onValueChange={() => handleToggle("billReminders")}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={
                  settings.billReminders ? colors.white : colors.white
                }
              />
            </View>

            <View className="flex-row justify-between items-center py-4">
              <View className="flex-1">
                <ThemedText className="text-lg font-semibold">
                  Obiettivi di Risparmio
                </ThemedText>
                <ThemedText className="text-sm text-gray-600">
                  Ricevi aggiornamenti sui tuoi obiettivi di risparmio
                </ThemedText>
              </View>
              <Switch
                value={settings.savingsGoals}
                onValueChange={() => handleToggle("savingsGoals")}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={settings.savingsGoals ? colors.white : colors.white}
              />
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};
