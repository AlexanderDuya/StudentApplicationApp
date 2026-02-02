import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { Screen } from "../App";

interface HomeScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

type ApplicationStatus = "active" | "completed";

type ApplicationCard = {
  id: string;
  company: string;
  role: string;
  progress: number;
  total: number;
  strength: number;
  nextStep: string;
  dueIn?: string;
  status: ApplicationStatus;
  completedOn?: string;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const applications: ApplicationCard[] = [
    {
      id: "1",
      company: "Google",
      role: "Software Engineer Intern",
      progress: 6,
      total: 8,
      strength: 75,
      nextStep: "Tailor CV bullets",
      dueIn: "3 days",
      status: "active",
    },
    {
      id: "2",
      company: "Microsoft",
      role: "Product Manager Intern",
      progress: 3,
      total: 8,
      strength: 45,
      nextStep: "Map evidence to requirements",
      dueIn: "5 days",
      status: "active",
    },
    {
      id: "3",
      company: "Amazon",
      role: "Software Engineer Intern",
      progress: 8,
      total: 8,
      strength: 82,
      nextStep: "Export tailored version",
      status: "completed",
      completedOn: "Jan 18",
    },
  ];

  const activeApps = applications.filter((a) => a.status === "active");
  const completedApps = applications.filter((a) => a.status === "completed");

  const getStrengthColor = (strength: number) => {
    if (strength >= 70) return "#10B981";
    if (strength >= 40) return "#EAB308";
    return "#F97316";
  };

  const nextUp = activeApps[0];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>Alexander Duya</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeApps.length}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedApps.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{applications.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {nextUp ? (
            <View style={styles.nextStepCard}>
              <View style={styles.nextStepContent}>
                <View style={styles.nextStepIcon}>
                  <Text style={styles.nextStepIconText}>📈</Text>
                </View>

                <View style={styles.nextStepText}>
                  <Text style={styles.nextStepTitle}>Your next step</Text>
                  <Text style={styles.nextStepDescription}>
                    {nextUp.nextStep} for {nextUp.company}
                  </Text>

                  <TouchableOpacity
                    onPress={() => onNavigate("workspace-overview", nextUp.id)}
                  >
                    <Text style={styles.nextStepButton}>Continue →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.nextStepCard}>
              <View style={styles.nextStepContent}>
                <View style={styles.nextStepIcon}>
                  <Text style={styles.nextStepIconText}>✨</Text>
                </View>
                <View style={styles.nextStepText}>
                  <Text style={styles.nextStepTitle}>
                    No active applications
                  </Text>
                  <Text style={styles.nextStepDescription}>
                    Add a job link to create your first workspace.
                  </Text>
                  <TouchableOpacity
                    onPress={() => onNavigate("add-application")}
                  >
                    <Text style={styles.nextStepButton}>Add one →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Applications</Text>

            <TouchableOpacity
              onPress={() => onNavigate("add-application")}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.applicationsList}>
            {activeApps.length === 0 ? (
              <Text style={styles.emptyText}>
                You don’t have any active applications yet.
              </Text>
            ) : (
              activeApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  onPress={() => onNavigate("workspace-overview", app.id)}
                  style={styles.applicationCard}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.companyName}>{app.company}</Text>
                    <Text style={styles.roleName}>{app.role}</Text>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressSteps}>
                        {app.progress}/{app.total} steps
                      </Text>
                    </View>

                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${(app.progress / app.total) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.strengthSection}>
                    <Text style={styles.strengthLabel}>
                      Application strength
                    </Text>

                    <View style={styles.strengthMeter}>
                      <View style={styles.strengthBars}>
                        {[1, 2, 3, 4, 5].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.strengthBar,
                              {
                                backgroundColor:
                                  i <= Math.ceil(app.strength / 20)
                                    ? getStrengthColor(app.strength)
                                    : "#E5E7EB",
                              },
                            ]}
                          />
                        ))}
                      </View>

                      <Text style={styles.strengthPercent}>
                        {app.strength}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.nextStepLabel}>
                      Next: {app.nextStep}
                    </Text>
                    {!!app.dueIn && (
                      <Text style={styles.dueLabel}>Due in {app.dueIn}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Completed Applications</Text>
          </View>

          <View style={styles.applicationsList}>
            {completedApps.length === 0 ? (
              <Text style={styles.emptyText}>
                Completed applications will appear here once you finish a
                workspace.
              </Text>
            ) : (
              completedApps.map((app) => (
                <TouchableOpacity
                  key={app.id}
                  onPress={() => onNavigate("workspace-overview", app.id)}
                  style={[styles.applicationCard, styles.completedCard]}
                >
                  <View style={styles.completedTopRow}>
                    <View>
                      <Text style={styles.companyName}>{app.company}</Text>
                      <Text style={styles.roleName}>{app.role}</Text>
                    </View>

                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>
                        Completed ✅
                      </Text>
                    </View>
                  </View>

                  <View style={styles.completedMetaRow}>
                    <Text style={styles.completedMeta}>
                      Strength:{" "}
                      <Text style={styles.completedMetaBold}>
                        {app.strength}%
                      </Text>
                    </Text>
                    {!!app.completedOn && (
                      <Text style={styles.completedMeta}>
                        Finished: {app.completedOn}
                      </Text>
                    )}
                  </View>

                  <View style={[styles.progressBarBg, { marginTop: 10 }]}>
                    <View style={[styles.progressBarFill, { width: "100%" }]} />
                  </View>

                  <Text style={[styles.nextStepLabel, { marginTop: 10 }]}>
                    Final step: {app.nextStep}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <TouchableOpacity
            onPress={() => onNavigate("add-application")}
            style={styles.addApplicationButton}
          >
            <Text style={styles.addApplicationIcon}>+</Text>
            <Text style={styles.addApplicationText}>Add new application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollView: { flex: 1 },

  header: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: { color: "#99F6E4", fontSize: 14 },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },

  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIcon: { fontSize: 20 },

  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statValue: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  statLabel: { color: "#99F6E4", fontSize: 12, marginTop: 4 },

  mainContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    marginTop: -16,
  },

  nextStepCard: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  nextStepContent: { flexDirection: "row", gap: 12 },
  nextStepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  nextStepIconText: { fontSize: 20 },
  nextStepText: { flex: 1 },
  nextStepTitle: {
    color: "#581C87",
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 14,
  },
  nextStepDescription: { color: "#7C3AED", fontSize: 14, marginBottom: 8 },
  nextStepButton: { color: "#9333EA", fontSize: 14, fontWeight: "500" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { color: "#111827", fontSize: 18, fontWeight: "600" },
  addButton: { flexDirection: "row", alignItems: "center" },
  addButtonText: { color: "#14B8A6", fontSize: 14 },

  applicationsList: { gap: 12 },

  emptyText: { color: "#6B7280", fontSize: 14, lineHeight: 20 },

  applicationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  completedCard: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    opacity: 0.95,
  },

  cardHeader: { marginBottom: 12 },
  companyName: { color: "#111827", fontWeight: "600", fontSize: 16 },
  roleName: { color: "#6B7280", fontSize: 14, marginTop: 4 },

  progressSection: { marginBottom: 12 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabel: { color: "#6B7280", fontSize: 12 },
  progressSteps: { color: "#6B7280", fontSize: 12 },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#14B8A6",
    borderRadius: 4,
  },

  strengthSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  strengthLabel: { color: "#6B7280", fontSize: 12 },
  strengthMeter: { flexDirection: "row", alignItems: "center", gap: 8 },
  strengthBars: { flexDirection: "row", gap: 2 },
  strengthBar: { width: 6, height: 16, borderRadius: 2 },
  strengthPercent: { color: "#111827", fontSize: 12, fontWeight: "500" },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextStepLabel: { color: "#6B7280", fontSize: 12 },
  dueLabel: { color: "#9CA3AF", fontSize: 12 },

  completedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  completedBadge: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  completedBadgeText: { color: "#065F46", fontSize: 12, fontWeight: "600" },
  completedMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  completedMeta: { color: "#6B7280", fontSize: 12 },
  completedMetaBold: { color: "#111827", fontWeight: "600" },

  addApplicationButton: {
    marginTop: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addApplicationIcon: { fontSize: 24, color: "#9CA3AF", marginBottom: 8 },
  addApplicationText: { color: "#9CA3AF", fontSize: 14 },
});
