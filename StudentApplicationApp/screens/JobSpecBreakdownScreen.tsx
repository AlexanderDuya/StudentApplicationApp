import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Screen } from "../App";

interface JobSpecBreakdownScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function JobSpecBreakdownScreen({
  onNavigate,
}: JobSpecBreakdownScreenProps) {
  const [filter, setFilter] = useState<"all" | "must-have" | "nice-to-have">(
    "all",
  );

  const requirements = [
    {
      id: "1",
      title: "React & JavaScript",
      type: "must-have",
      category: "Technical",
    },
    {
      id: "2",
      title: "Team collaboration",
      type: "must-have",
      category: "Soft Skills",
    },
    { id: "3", title: "REST APIs", type: "must-have", category: "Technical" },
    {
      id: "4",
      title: "Problem solving",
      type: "must-have",
      category: "Soft Skills",
    },
    {
      id: "5",
      title: "TypeScript",
      type: "nice-to-have",
      category: "Technical",
    },
    {
      id: "6",
      title: "Communication skills",
      type: "must-have",
      category: "Soft Skills",
    },
    {
      id: "7",
      title: "Git & version control",
      type: "must-have",
      category: "Technical",
    },
    {
      id: "8",
      title: "Agile experience",
      type: "nice-to-have",
      category: "Process",
    },
  ];

  const filteredRequirements = requirements.filter(
    (req) => filter === "all" || req.type === filter,
  );

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
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Job Spec Breakdown</Text>
            <Text style={styles.headerSubtitle}>
              Google • Software Engineer Intern
            </Text>
          </View>
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            onPress={() => setFilter("all")}
            style={[
              styles.filterTab,
              filter === "all" && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "all" && styles.filterTabTextActive,
              ]}
            >
              All ({requirements.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("must-have")}
            style={[
              styles.filterTab,
              filter === "must-have" && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "must-have" && styles.filterTabTextActive,
              ]}
            >
              Must-have
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter("nice-to-have")}
            style={[
              styles.filterTab,
              filter === "nice-to-have" && styles.filterTabActive,
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === "nice-to-have" && styles.filterTabTextActive,
              ]}
            >
              Nice-to-have
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.aiNotice}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>✨</Text>
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>AI extracted requirements</Text>
            <Text style={styles.aiDescription}>
              We've analyzed the job spec and identified 8 key requirements.
            </Text>
          </View>
        </View>

        <View style={styles.jobPreview}>
          <Text style={styles.jobPreviewTitle}>Original job description</Text>
          <View style={styles.jobPreviewContent}>
            <Text style={styles.jobPreviewText}>
              We're looking for a talented Software Engineer Intern to join our
              team. You'll work on building scalable web applications using
              React and modern JavaScript...
            </Text>
            <Text style={styles.jobPreviewMore}>Show full description →</Text>
          </View>
        </View>

        <View style={styles.requirementsSection}>
          <View style={styles.requirementsHeader}>
            <Text style={styles.requirementsTitle}>Key requirements</Text>
          </View>

          <View style={styles.requirementsList}>
            {filteredRequirements.map((req) => (
              <View key={req.id} style={styles.requirementCard}>
                <View style={styles.requirementHeader}>
                  <Text style={styles.requirementTitle}>{req.title}</Text>

                  <View
                    style={[
                      styles.typeBadge,
                      req.type === "must-have"
                        ? styles.mustHaveBadge
                        : styles.niceToHaveBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        req.type === "must-have"
                          ? styles.mustHaveText
                          : styles.niceToHaveText,
                      ]}
                    >
                      {req.type === "must-have" ? "Must-have" : "Nice-to-have"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requirementCategory}>{req.category}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => console.log("TODO: go to evidence mapper")}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaButtonText}>Start mapping evidence</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#374151",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  filterTabs: {
    flexDirection: "row",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  filterTabActive: {
    backgroundColor: "#CCFBF1",
  },
  filterTabText: {
    fontSize: 14,
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#115E59",
  },
  scrollView: {
    flex: 1,
  },
  aiNotice: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FAF5FF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3E8FF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  aiIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  aiIconText: {
    fontSize: 16,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    color: "#581C87",
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 12,
    color: "#7C3AED",
    lineHeight: 16,
  },
  jobPreview: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  jobPreviewTitle: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
  },
  jobPreviewContent: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  jobPreviewText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  jobPreviewMore: {
    fontSize: 12,
    color: "#14B8A6",
  },
  requirementsSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  requirementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    color: "#111827",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  filterIcon: {
    fontSize: 16,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#14B8A6",
  },
  requirementsList: {
    gap: 12,
  },
  requirementCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requirementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  requirementTitle: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mustHaveBadge: {
    backgroundColor: "#FEE2E2",
  },
  niceToHaveBadge: {
    backgroundColor: "#DBEAFE",
  },
  typeBadgeText: {
    fontSize: 12,
  },
  mustHaveText: {
    color: "#991B1B",
  },
  niceToHaveText: {
    color: "#1E40AF",
  },
  requirementCategory: {
    fontSize: 14,
    color: "#6B7280",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  ctaButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
