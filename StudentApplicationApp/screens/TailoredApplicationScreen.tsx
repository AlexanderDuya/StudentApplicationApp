import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import type { Screen } from "../App";

interface ApplicationLibraryScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

type LibraryTab = "company-research" | "cover-letter" | "cv-bullets";

type LibraryItem = {
  id: string;
  name: string;
  date: string;
};

export function ApplicationLibraryScreen({
  onNavigate,
}: ApplicationLibraryScreenProps) {
  const [tab, setTab] = useState<LibraryTab>("cv-bullets");

  const tabs: { id: LibraryTab; label: string }[] = [
    { id: "company-research", label: "Company Research" },
    { id: "cover-letter", label: "Cover Letter" },
    { id: "cv-bullets", label: "CV Bullet Points" },
  ];

  const itemsByTab: Record<LibraryTab, LibraryItem[]> = {
    "company-research": [
      { id: "r1", name: "Company Notes", date: "2 days ago" },
    ],
    "cover-letter": [
      { id: "c1", name: "CoverLetter_v1.docx", date: "1 day ago" },
      { id: "c2", name: "CoverLetter_v2.docx", date: "Today" },
    ],
    "cv-bullets": [
      { id: "b1", name: "Microsoft_CV_Bullets_v1", date: "Today" },
      { id: "b2", name: "Microsoft_CV_Bullets_v2", date: "1 day ago" },
    ],
  };

  const activeItems = itemsByTab[tab];

  const headerDescription =
    tab === "company-research"
      ? "Notes, culture insights & interview prep."
      : tab === "cover-letter"
        ? "Your tailored cover letter drafts."
        : "Tailored impact statements for this role.";

  const rowIcon =
    tab === "company-research" ? "🏢" : tab === "cover-letter" ? "✉️" : "🎯";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => onNavigate("workspace-overview")}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Your Tailored Application</Text>

          <View style={styles.spacer} />
        </View>

        <View style={styles.filterTabs}>
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.filterTab, tab === t.id && styles.filterTabActive]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  tab === t.id && styles.filterTabTextActive,
                ]}
                numberOfLines={1}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📁</Text>
          <Text style={styles.infoText}>{headerDescription}</Text>
        </View>

        <View style={styles.versionsList}>
          {activeItems.map((item) => (
            <View key={item.id} style={styles.versionCard}>
              <Text style={styles.versionIcon}>{rowIcon}</Text>

              <View style={styles.versionInfo}>
                <Text style={styles.versionName}>{item.name}</Text>
                <View style={styles.versionMeta}>
                  <Text style={styles.versionDate}>{item.date}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.downloadButton}>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => onNavigate("workspace-overview")}
        >
          <Text style={styles.exportButtonText}>Back to Workspace</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
    marginBottom: 12,
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
  headerTitle: { fontSize: 20, color: "#111827" },
  spacer: { width: 40 },

  filterTabs: { flexDirection: "row", gap: 8 },
  filterTab: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  filterTabActive: { backgroundColor: "#CCFBF1" },
  filterTabText: { fontSize: 12, color: "#6B7280" },
  filterTabTextActive: { color: "#115E59", fontWeight: "600" },

  scrollView: { flex: 1 },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 24,
    marginBottom: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, color: "#1E40AF", lineHeight: 20 },

  versionsList: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },

  versionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  versionIcon: { fontSize: 24 },
  versionInfo: { flex: 1 },
  versionName: { fontSize: 16, color: "#111827", marginBottom: 4 },
  versionMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  versionDate: { fontSize: 12, color: "#6B7280" },

  downloadButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  downloadIcon: { fontSize: 20 },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  exportButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  exportButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
