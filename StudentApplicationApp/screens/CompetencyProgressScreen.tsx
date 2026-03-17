import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Screen } from "../App";

interface ProgressCompetencyScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

type Level = "Gold" | "Silver" | "Bronze";

type Competency = {
  id: string;
  name: string;
  level: Level;
  description: string;
  progress: number;
  icon: keyof typeof Feather.glyphMap;
};

export function ProgressCompetencyScreen({
  onNavigate,
}: ProgressCompetencyScreenProps) {
  const stats = {
    applications: 6,
    competencies: 3,
    avgStrength: 82,
    streakDays: 5,
  };

  const competencies: Competency[] = [
    {
      id: "1",
      name: "Competency 1",
      level: "Gold",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      progress: 100,
      icon: "award",
    },
    {
      id: "2",
      name: "Competency 2",
      level: "Silver",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
      progress: 65,
      icon: "target",
    },
    {
      id: "3",
      name: "Competency 3",
      level: "Bronze",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam.",
      progress: 30,
      icon: "star",
    },
  ];

  const getLevelStyle = (level: Level) => {
    if (level === "Gold") return { bg: "#FEF3C7", text: "#92400E" };
    if (level === "Silver") return { bg: "#F3F4F6", text: "#374151" };
    return { bg: "#FFEDD5", text: "#9A3412" };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
          <Text style={styles.headerSubtitle}>Static data</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.applications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.competencies}</Text>
              <Text style={styles.statLabel}>Competencies</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.avgStrength}%</Text>
              <Text style={styles.statLabel}>Avg. Strength</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.streakDays}</Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather name="award" size={18} color="#111827" />
              <Text style={styles.sectionTitle}>Competencies</Text>
            </View>

            <Text style={styles.sectionDescription}>
              These Competencies reflect capability as you complete your
              application.
            </Text>

            <View style={styles.competenciesList}>
              {competencies.map((comp) => {
                const levelStyle = getLevelStyle(comp.level);

                return (
                  <View key={comp.id} style={styles.competencyCard}>
                    <View style={styles.competencyHeader}>
                      <Feather
                        name={comp.icon}
                        size={20}
                        color="#14B8A6"
                        style={styles.competencyIcon}
                      />

                      <View style={styles.competencyInfo}>
                        <View style={styles.competencyTitleRow}>
                          <Text style={styles.competencyName}>{comp.name}</Text>

                          <View
                            style={[
                              styles.levelBadge,
                              { backgroundColor: levelStyle.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.levelText,
                                { color: levelStyle.text },
                              ]}
                            >
                              {comp.level}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.competencyDescription}>
                          {comp.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.competencyProgress}>
                      <View style={styles.progressLabelRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressLabel}>
                          {comp.progress}%
                        </Text>
                      </View>

                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${comp.progress}%`,
                              backgroundColor: "#9333EA",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.suggestionCard}>
            <Text style={styles.suggestionTitle}>Suggested next action</Text>
            <Text style={styles.suggestionDescription}>
              View your current applications and continue working on the most
              recent one.
            </Text>

            <View style={styles.suggestionButtons}>
              <TouchableOpacity
                onPress={() => onNavigate("home")}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>
                  View Current Applications
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.trendCard}>
            <View style={styles.trendHeader}>
              <Feather name="bar-chart-2" size={18} color="#111827" />
              <Text style={styles.trendTitle}>Strength Trend</Text>
            </View>

            <View style={styles.trendList}>
              {[
                { company: "Google", pct: 75 },
                { company: "Microsoft", pct: 45 },
                { company: "Amazon", pct: 92 },
              ].map((item) => (
                <View key={item.company} style={styles.trendItem}>
                  <View style={styles.trendInfo}>
                    <Text style={styles.trendCompany}>{item.company}</Text>
                    <View style={styles.trendBarBg}>
                      <View
                        style={[styles.trendBarFill, { width: `${item.pct}%` }]}
                      />
                    </View>
                  </View>
                  <Text style={styles.trendPercent}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#99F6E4",
    marginBottom: 18,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "48%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#99F6E4",
  },

  content: { paddingHorizontal: 24, paddingVertical: 20 },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 14,
    lineHeight: 20,
  },

  competenciesList: { gap: 12 },

  competencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  competencyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  competencyIcon: {
    marginTop: 2,
  },
  competencyInfo: { flex: 1 },

  competencyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  competencyName: {
    fontSize: 16,
    color: "#111827",
  },

  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 12,
  },

  competencyDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  competencyProgress: { marginTop: 4 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },

  suggestionCard: {
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    color: "#134E4A",
    marginBottom: 6,
  },
  suggestionDescription: {
    fontSize: 14,
    color: "#115E59",
    lineHeight: 20,
    marginBottom: 12,
  },

  suggestionButtons: { flexDirection: "row" },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#14B8A6",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  trendHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  trendTitle: {
    fontSize: 16,
    color: "#111827",
  },

  trendList: { gap: 12 },
  trendItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  trendInfo: { flex: 1 },
  trendCompany: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 6,
  },
  trendBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  trendBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#9333EA",
  },
  trendPercent: {
    fontSize: 14,
    color: "#111827",
  },
});
