import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Input } from "../../components/common/input";
import { Button } from "../../components/common/button";
import { useAppDispatch, useAppSelector } from "../../store";
import { login, clearError } from "../../store/slices/authSlice";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const { isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Clear any errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show alert for API errors
  useEffect(() => {
    if (error) {
      Alert.alert("Errore di accesso", error);
    }
  }, [error]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("L'email è richiesta");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Inserisci un'email valida");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("La password è richiesta");
      return false;
    } else if (password.length < 6) {
      setPasswordError("La password deve contenere almeno 6 caratteri");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      dispatch(login({ email, password }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={[styles.appName, { color: theme.colors.primary }]}>
            BudJet
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>
            Gestisci le tue finanze in modo intelligente
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Accedi
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="La tua email"
            error={emailError}
            leftIcon="mail-outline"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="La tua password"
            isPassword
            error={passwordError}
            leftIcon="lock-closed-outline"
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => {
              // Navigate to password recovery
            }}
          >
            <Text style={{ color: theme.colors.primary }}>
              Password dimenticata?
            </Text>
          </TouchableOpacity>

          <Button
            title="Accedi"
            onPress={handleLogin}
            isLoading={isLoading}
            fullWidth
          />

          <View style={styles.registerContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Non hai un account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={{ color: theme.colors.primary }}>Registrati</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
