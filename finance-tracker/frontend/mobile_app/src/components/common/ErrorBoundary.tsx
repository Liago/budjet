import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { GlobalError } from "./GlobalError";
import { useError } from "../../hooks/useError";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <ThemedText className="text-xl font-semibold mb-4">
            Qualcosa è andato storto
          </ThemedText>
          <ThemedText className="text-center mb-4">
            {this.state.error?.message ||
              "Si è verificato un errore imprevisto"}
          </ThemedText>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <ThemedText className="text-white font-semibold">
              Riprova
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export const ErrorProvider: React.FC<Props> = ({ children }) => {
  const { error, hideError } = useError();

  return (
    <>
      <GlobalError
        message={error.message}
        visible={error.visible}
        onDismiss={hideError}
      />
      <ErrorBoundary>{children}</ErrorBoundary>
    </>
  );
};
