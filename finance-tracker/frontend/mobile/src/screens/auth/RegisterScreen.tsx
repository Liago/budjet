import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import { register, clearError } from "../../store/slices/authSlice";

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Register"
>;

export default function RegisterScreen() {
  const theme = useTheme();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();

  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Clear any errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show alert for API errors
  useEffect(() => {
    if (error) {
      Alert.alert("Errore di registrazione", error);
    }
  }, [error]);

  const validateName = (name: string) => {
    if (!name) {
      setNameError("Il nome è richiesto");
      return false;
    } else if (name.length < 2) {
      setNameError("Il nome deve contenere almeno 2 caratteri");
      return false;
    } else {
      setNameError("");
      return true;
    }
  };

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

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError("Conferma la password");
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Le password non corrispondono");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  const handleRegister = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (
      isNameValid &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid
    ) {
      dispatch(register({ name, email, password }));
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
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Crea un account
          </Text>

          <Input
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Il tuo nome"
            error={nameError}
            leftIcon="person-outline"
          />

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
            placeholder="Crea una password"
            isPassword
            error={passwordError}
            leftIcon="lock-closed-outline"
          />

          <Input
            label="Conferma password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Conferma la password"
            isPassword
            error={confirmPasswordError}
            leftIcon="checkmark-outline"
          />

          <Button
            title="Registrati"
            onPress={handleRegister}
            isLoading={isLoading}
            fullWidth
            style={{ marginTop: 10 }}
          />

          <View style={styles.loginContainer}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Hai già un account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={{ color: theme.colors.primary }}>Accedi</Text>
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
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
});
