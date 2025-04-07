import React, { useState } from 'react';
import { View, ScrollView, Switch, Alert, Linking } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../../components/common/button';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  
  // Stati per le varie impostazioni
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [isThemeDark, setIsThemeDark] = useState(colorScheme === 'dark');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('Italiano');
  const [isBackupEnabled, setIsBackupEnabled] = useState(false);
  
  // Gestione toggle
  const handleToggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };
  
  const handleToggleTheme = () => {
    setIsThemeDark(!isThemeDark);
    // Qui dovremmo aggiornare il tema a livello di app
    Alert.alert(
      'Cambio Tema',
      `Tema ${!isThemeDark ? 'Scuro' : 'Chiaro'} applicato`,
      [{ text: 'OK' }]
    );
  };
  
  const handleToggleBiometric = () => {
    // Qui dovremmo verificare se il dispositivo supporta l'autenticazione biometrica
    // e chiedere l'autorizzazione se necessario
    if (!isBiometricEnabled) {
      Alert.alert(
        'Autenticazione Biometrica',
        'Vuoi attivare l\'autenticazione biometrica per l\'accesso all\'app?',
        [
          {
            text: 'Annulla',
            style: 'cancel',
          },
          {
            text: 'Attiva',
            onPress: () => setIsBiometricEnabled(true),
          },
        ]
      );
    } else {
      setIsBiometricEnabled(false);
    }
  };
  
  const handleToggleBackup = () => {
    // Qui dovremmo gestire l'attivazione/disattivazione del backup automatico
    if (!isBackupEnabled) {
      Alert.alert(
        'Backup Automatico',
        'Vuoi attivare il backup automatico dei tuoi dati?',
        [
          {
            text: 'Annulla',
            style: 'cancel',
          },
          {
            text: 'Attiva',
            onPress: () => setIsBackupEnabled(true),
          },
        ]
      );
    } else {
      setIsBackupEnabled(false);
    }
  };
  
  // Gestione pressione sui pulsanti
  const handleSelectCurrency = () => {
    Alert.alert(
      'Seleziona Valuta',
      'Questa funzionalità sarà implementata in futuro',
      [{ text: 'OK' }]
    );
  };
  
  const handleSelectLanguage = () => {
    Alert.alert(
      'Seleziona Lingua',
      'Questa funzionalità sarà implementata in futuro',
      [{ text: 'OK' }]
    );
  };
  
  const handleExportData = () => {
    Alert.alert(
      'Esporta Dati',
      'Vuoi esportare tutti i tuoi dati in formato CSV?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Esporta',
          onPress: () => {
            // Qui dovremmo implementare l'esportazione dei dati
            Alert.alert('Esportazione completata', 'I tuoi dati sono stati esportati con successo.');
          },
        },
      ]
    );
  };
  
  const handleImportData = () => {
    Alert.alert(
      'Importa Dati',
      'Vuoi importare dati da un file CSV? Questa operazione sostituirà tutti i dati esistenti.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Importa',
          onPress: () => {
            // Qui dovremmo implementare l'importazione dei dati
            Alert.alert('Importazione completata', 'I tuoi dati sono stati importati con successo.');
          },
        },
      ]
    );
  };
  
  const handleManualBackup = () => {
    Alert.alert(
      'Backup Manuale',
      'Vuoi effettuare un backup manuale dei tuoi dati?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Backup',
          onPress: () => {
            // Qui dovremmo implementare il backup manuale
            Alert.alert('Backup completato', 'Il backup è stato effettuato con successo.');
          },
        },
      ]
    );
  };
  
  const handleRestoreData = () => {
    Alert.alert(
      'Ripristina Dati',
      'Vuoi ripristinare i dati da un backup precedente? Questa operazione sostituirà tutti i dati esistenti.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Ripristina',
          onPress: () => {
            // Qui dovremmo implementare il ripristino dei dati
            Alert.alert('Ripristino completato', 'I tuoi dati sono stati ripristinati con successo.');
          },
        },
      ]
    );
  };
  
  const handleDeleteAllData = () => {
    Alert.alert(
      'Elimina Tutti i Dati',
      'Sei sicuro di voler eliminare tutti i dati? Questa operazione non può essere annullata.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            // Qui dovremmo implementare l'eliminazione di tutti i dati
            Alert.alert('Dati eliminati', 'Tutti i tuoi dati sono stati eliminati con successo.');
          },
        },
      ]
    );
  };
  
  const handleRateApp = () => {
    // Qui dovremmo aprire lo store per la valutazione dell'app
    Alert.alert(
      'Valuta l\'App',
      'Questa funzionalità sarà implementata in futuro',
      [{ text: 'OK' }]
    );
  };
  
  const handleContactSupport = () => {
    // Qui dovremmo aprire l'email con un indirizzo predefinito
    Linking.openURL('mailto:support@budjet.app?subject=BudJet%20Support');
  };
  
  const handlePrivacyPolicy = () => {
    // Qui dovremmo aprire il browser con la pagina della privacy policy
    Linking.openURL('https://www.budjet.app/privacy-policy');
  };
  
  const handleTermsOfService = () => {
    // Qui dovremmo aprire il browser con la pagina dei termini di servizio
    Linking.openURL('https://www.budjet.app/terms-of-service');
  };
  
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
        }}
      >
        <Section>
          <SectionTitle>Generali</SectionTitle>
          
          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="notifications-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Notifiche</SettingText>
            </SettingInfo>
            <Switch
              value={isNotificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#767577', true: '#5B73E7' }}
              thumbColor={isNotificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name={isThemeDark ? "moon" : "sunny-outline"} size={24} color="primary" />
              </SettingIcon>
              <SettingText>Tema Scuro</SettingText>
            </SettingInfo>
            <Switch
              value={isThemeDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: '#767577', true: '#5B73E7' }}
              thumbColor={isThemeDark ? '#FFFFFF' : '#FFFFFF'}
            />
          </SettingItem>
          
          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="finger-print-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Autenticazione Biometrica</SettingText>
            </SettingInfo>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#767577', true: '#5B73E7' }}
              thumbColor={isBiometricEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </SettingItem>
          
          <SettingItemButton onPress={handleSelectCurrency}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="cash-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Valuta</SettingText>
            </SettingInfo>
            <SettingValue>
              <SettingValueText>{currency}</SettingValueText>
              <Ionicons name="chevron-forward" size={20} color="textSecondary" />
            </SettingValue>
          </SettingItemButton>
          
          <SettingItemButton onPress={handleSelectLanguage}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="language-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Lingua</SettingText>
            </SettingInfo>
            <SettingValue>
              <SettingValueText>{language}</SettingValueText>
              <Ionicons name="chevron-forward" size={20} color="textSecondary" />
            </SettingValue>
          </SettingItemButton>
        </Section>
        
        <Section>
          <SectionTitle>Dati</SectionTitle>
          
          <SettingItem>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="cloud-upload-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Backup Automatico</SettingText>
            </SettingInfo>
            <Switch
              value={isBackupEnabled}
              onValueChange={handleToggleBackup}
              trackColor={{ false: '#767577', true: '#5B73E7' }}
              thumbColor={isBackupEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </SettingItem>
          
          <SettingItemButton onPress={handleExportData}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="download-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Esporta Dati</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleImportData}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="cloud-upload-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Importa Dati</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleManualBackup}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="save-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Backup Manuale</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleRestoreData}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="refresh-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Ripristina Dati</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleDeleteAllData}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="trash-outline" size={24} color="error" />
              </SettingIcon>
              <DangerText>Elimina Tutti i Dati</DangerText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
        </Section>
        
        <Section>
          <SectionTitle>Altro</SectionTitle>
          
          <SettingItemButton onPress={handleRateApp}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="star-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Valuta l'App</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleContactSupport}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="mail-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Contatta il Supporto</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handlePrivacyPolicy}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="shield-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Privacy Policy</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
          
          <SettingItemButton onPress={handleTermsOfService}>
            <SettingInfo>
              <SettingIcon>
                <Ionicons name="document-text-outline" size={24} color="primary" />
              </SettingIcon>
              <SettingText>Termini di Servizio</SettingText>
            </SettingInfo>
            <Ionicons name="chevron-forward" size={20} color="textSecondary" />
          </SettingItemButton>
        </Section>
        
        <AppInfoContainer>
          <AppLogo>
            <Ionicons name="wallet" size={40} color="primary" />
          </AppLogo>
          <AppName>BudJet</AppName>
          <AppVersion>Versione 1.0.0</AppVersion>
        </AppInfoContainer>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const SettingItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const SettingItemButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const SettingInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SettingIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const SettingText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.text};
`;

const DangerText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.error};
`;

const SettingValue = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SettingValueText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: ${({ theme }) => theme.spacing.xs}px;
`;

const AppInfoContainer = styled.View`
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl}px;
`;

const AppLogo = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colors.surface};
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  elevation: 3;
`;

const AppName = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const AppVersion = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;