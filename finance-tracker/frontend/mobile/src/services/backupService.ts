import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { RootState } from "../store";

interface BackupData {
  transactions: any[];
  categories: any[];
  settings: any;
  timestamp: string;
  version: string;
}

class BackupService {
  private static instance: BackupService;
  private readonly BACKUP_FOLDER = `${FileSystem.documentDirectory}backups/`;
  private readonly APP_VERSION = "1.0.0";

  private constructor() {
    this.initializeBackupFolder();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  private async initializeBackupFolder() {
    const folderInfo = await FileSystem.getInfoAsync(this.BACKUP_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.BACKUP_FOLDER);
    }
  }

  public async createBackup(state: RootState): Promise<string> {
    try {
      const backupData: BackupData = {
        transactions: state.transactions.items,
        categories: state.categories.items,
        settings: state.settings,
        timestamp: new Date().toISOString(),
        version: this.APP_VERSION,
      };

      const backupString = JSON.stringify(backupData, null, 2);
      const fileName = `budjet_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;
      const filePath = `${this.BACKUP_FOLDER}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, backupString);
      return filePath;
    } catch (error) {
      console.error("Error creating backup:", error);
      throw new Error("Failed to create backup");
    }
  }

  public async restoreBackup(filePath: string): Promise<BackupData> {
    try {
      const backupString = await FileSystem.readAsStringAsync(filePath);
      const backupData: BackupData = JSON.parse(backupString);

      // Validate backup data
      if (!this.validateBackupData(backupData)) {
        throw new Error("Invalid backup data");
      }

      // Restore data to AsyncStorage
      await AsyncStorage.setItem(
        "transactions",
        JSON.stringify(backupData.transactions)
      );
      await AsyncStorage.setItem(
        "categories",
        JSON.stringify(backupData.categories)
      );
      await AsyncStorage.setItem(
        "settings",
        JSON.stringify(backupData.settings)
      );

      return backupData;
    } catch (error) {
      console.error("Error restoring backup:", error);
      throw new Error("Failed to restore backup");
    }
  }

  private validateBackupData(data: any): data is BackupData {
    return (
      data &&
      Array.isArray(data.transactions) &&
      Array.isArray(data.categories) &&
      typeof data.settings === "object" &&
      typeof data.timestamp === "string" &&
      typeof data.version === "string"
    );
  }

  public async listBackups(): Promise<string[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.BACKUP_FOLDER);
      return files.filter((file) => file.endsWith(".json"));
    } catch (error) {
      console.error("Error listing backups:", error);
      return [];
    }
  }

  public async deleteBackup(fileName: string): Promise<void> {
    try {
      const filePath = `${this.BACKUP_FOLDER}${fileName}`;
      await FileSystem.deleteAsync(filePath);
    } catch (error) {
      console.error("Error deleting backup:", error);
      throw new Error("Failed to delete backup");
    }
  }

  public async shareBackup(filePath: string): Promise<void> {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this device");
      }

      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Condividi Backup",
      });
    } catch (error) {
      console.error("Error sharing backup:", error);
      throw new Error("Failed to share backup");
    }
  }
}

export const backupService = BackupService.getInstance();
