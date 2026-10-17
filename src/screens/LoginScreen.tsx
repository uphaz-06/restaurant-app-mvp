import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useForm } from "../hooks/useForm";

export default function LoginScreen({
  onGoSignup,
}: {
  onGoSignup?: () => void;
}) {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (values: { email: string; password: string }) => {
    const errors: Partial<Record<"email" | "password", string>> = {};
    if (!values.email.includes("@")) errors.email = "Please enter a valid email";
    if (values.password.length < 8 || !/\d/.test(values.password)) {
      errors.password = "Min 8 chars with at least 1 digit";
    }
    return errors;
  };

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    validate,
  );

  const submitForm = async () => {
    setIsSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
    } catch (error: unknown) {
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.card}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#ADB5BD"
            keyboardType="email-address"
            autoCapitalize="none"
            value={values.email}
            onChangeText={(t) => handleChange("email", t)}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#ADB5BD"
            secureTextEntry
            value={values.password}
            onChangeText={(t) => handleChange("password", t)}
          />
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {isSubmitting ? (
          <ActivityIndicator size="large" color="#E63946" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={() => handleSubmit(submitForm)}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onGoSignup} style={styles.linkWrap}>
          <Text style={styles.link}>Need an account? Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#1A1D20",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1D20",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#6C757D",
    marginBottom: 32,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 16 },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1A1D20",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  inputError: { borderColor: "#E63946", backgroundColor: "#FFF5F5" },
  errorText: {
    color: "#E63946",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#E63946",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  linkWrap: { marginTop: 16, alignItems: "center" },
  link: { color: "#457B9D", fontWeight: "600" },
});
