import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      errorInfo,
    });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.toString()}
            </Text>

            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={this.resetError} />
            </View>

            {__DEV__ && this.state.errorInfo && (
              <View style={styles.stackContainer}>
                <Text style={styles.stackTitle}>Stack Trace:</Text>
                <Text style={styles.stackText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  errorContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e63946",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 15,
  },
  stackContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
  },
  stackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  stackText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});

export default ErrorBoundary;
