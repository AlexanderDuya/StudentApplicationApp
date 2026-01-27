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
  onNavigate: (screen: Screen) => void;
}

export function JobSpecDescriptionScreen({
  onNavigate,
}: JobSpecDescriptionScreenProps) {
  // For now its a fake job despcription and needs to be populated correctly based on the extract job link
  const fullJobDescription =
    `We're looking for a talented Software Engineer Intern to join our team.\n\n` +
    `You'll work on building scalable web applications using React and modern JavaScript.\n\n` +
    `Responsibilities:\n` +
    `• Build and improve user-facing features\n` +
    `• Collaborate with engineers and product partners\n` +
    `• Work with APIs and data flows\n\n` +
    `Requirements:\n` +
    `• Strong JavaScript fundamentals\n` +
    `• React experience (projects/coursework is fine)\n` +
    `• Good communication and teamwork\n\n` +
    `Nice-to-have:\n` +
    `• TypeScript\n` +
    `• Agile experience\n`;

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
              Google • Software Engineer Intern
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
