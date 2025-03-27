import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { ThemedView, ThemedText } from "../../components/themed";
import { backupService } from "../../services/backupService";
import { RootState } from "../../store";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export const BackupScreen: React.FC = () => {
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const backupFiles = await backupService.listBackups();
      setBackups(backupFiles);
    } catch (error) {
      Alert.alert("Errore", "Impossibile caricare i backup");
    }
  };

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      const filePath = await backupService.createBackup(state);
      await backupService.shareBackup(filePath);
      await loadBackups();
      Alert.alert("Successo", "Backup creato con successo");
    } catch (error) {
      Alert.alert("Errore", "Impossibile creare il backup");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (fileName: string) => {
    Alert.alert(
      "Ripristina Backup",
      "Sei sicuro di voler ripristinare questo backup? Tutti i dati attuali verranno sovrascritti.",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Ripristina",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const filePath = `${backupService.BACKUP_FOLDER}${fileName}`;
              await backupService.restoreBackup(filePath);
              Alert.alert("Successo", "Backup ripristinato con successo");
            } catch (error) {
              Alert.alert("Errore", "Impossibile ripristinare il backup");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteBackup = async (fileName: string) => {
    Alert.alert(
      "Elimina Backup",
      "Sei sicuro di voler eliminare questo backup?",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await backupService.deleteBackup(fileName);
              await loadBackups();
              Alert.alert("Successo", "Backup eliminato con successo");
            } catch (error) {
              Alert.alert("Errore", "Impossibile eliminare il backup");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <ThemedText style={{ fontSize: 24, marginBottom: 16 }}>
            Gestione Backup
          </ThemedText>

          <TouchableOpacity
            onPress={handleCreateBackup}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons
              name="save-outline"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <ThemedText style={{ color: "white", fontSize: 16 }}>
              Crea Nuovo Backup
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={{ fontSize: 18, marginBottom: 8 }}>
            Backup Disponibili
          </ThemedText>

          <ScrollView style={{ flex: 1 }}>
            {backups.map((fileName) => (
              <View
                key={fileName}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  backgroundColor: colors.card,
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <ThemedText style={{ flex: 1 }}>{fileName}</ThemedText>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    onPress={() => handleRestoreBackup(fileName)}
                    style={{ marginRight: 16 }}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteBackup(fileName)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={24}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {loading && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};
