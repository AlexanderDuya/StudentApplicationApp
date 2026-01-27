import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Screen } from "../App";

interface JobSpecDescriptionScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  jobDescription?: string;
  company?: string;
  role?: string;
}

export function JobSpecDescriptionScreen({
  onNavigate,
  jobDescription,
  company,
  role,
}: JobSpecDescriptionScreenProps) {
  // If I get some time I can add a loading icon whilst its fetching so its not just static text
  const fullJobDescription =
    jobDescription?.trim() ||
    "Fetching job description this may take a few seconds…";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => onNavigate("job-spec-breakdown")}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Full job description</Text>
            <Text style={styles.headerSubtitle}>
              {company ?? "Company"} • {role ?? "Role"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.descriptionText}>{fullJobDescription}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280" },

  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 16 },

  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
