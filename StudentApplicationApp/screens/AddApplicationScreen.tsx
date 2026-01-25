import React, { useState } from "react";
import type { Screen } from "../App";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";

interface AddApplicationScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function AddApplicationScreen({
  onNavigate,
}: AddApplicationScreenProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const handleCreate = () => {
    const newApplicationId = String(Date.now());
    onNavigate("workspace-overview", newApplicationId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Application</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContent}>
          <Text style={styles.description}>
            Add the job posting link and we'll help you break it down into
            manageable steps.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Job posting link <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔗</Text>
              <TextInput
                value={jobUrl}
                onChangeText={setJobUrl}
                placeholder="Input Link"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
            <Text style={styles.helperText}>
              We'll extract the key requirements automatically
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Company name <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🏢</Text>
              <TextInput
                value={company}
                onChangeText={setCompany}
                placeholder="e.g. Google, Microsoft, Amazon"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Role name <Text style={styles.optional}>(optional)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>💼</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="e.g. Software Engineer Intern"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>
                  We'll extract key requirements from the job spec
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>
                  Create a simple checklist to guide you
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!jobUrl}
          style={[
            styles.primaryButton,
            !jobUrl && styles.primaryButtonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>Create workspace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 20, color: "#374151" },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerSpacer: { width: 40 },

  scrollView: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingVertical: 24 },

  description: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },

  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8 },
  required: { color: "#EF4444" },
  optional: { color: "#9CA3AF" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: { fontSize: 20, marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
  },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 8 },

  infoCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#064E3B",
    marginBottom: 12,
  },
  infoList: { gap: 8 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#14B8A6",
    marginTop: 6,
  },
  infoText: { flex: 1, fontSize: 14, color: "#065F46", lineHeight: 20 },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  primaryButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
