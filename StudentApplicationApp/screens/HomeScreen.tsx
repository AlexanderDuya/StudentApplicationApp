import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import type { Screen, Workspace } from "../App";

interface HomeScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  workspaces: Workspace[];
  onClearAll: () => void;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
};

type AppSummary = {
  rootId: string;
  company: string;
  role: string;
  latestWorkspaceId: string;
  createdAt: number;
  versionCount: number;
};

export function HomeScreen({
  onNavigate,
  workspaces,
  onClearAll,
}: HomeScreenProps) {
  const apps = useMemo<AppSummary[]>(() => {
    const byRoot = new Map<string, Workspace[]>();

    for (const w of workspaces) {
      const rootId = (w.rootId ?? w.id) as string;
      const list = byRoot.get(rootId) ?? [];
      list.push(w);
      byRoot.set(rootId, list);
    }

    const summaries: AppSummary[] = [];

    for (const [rootId, family] of byRoot.entries()) {
      const latestWorkspace = [...family].sort(
        (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
      )[0];

      const company = latestWorkspace.company?.trim() || "Company not set";
      const role = latestWorkspace.role?.trim() || "Role not set";

      let versionCount = 0;
      for (const w of family) {
        versionCount += w.versions?.length ?? 0;
      }

      summaries.push({
        rootId,
        company,
        role,
        latestWorkspaceId: latestWorkspace.id,
        createdAt: latestWorkspace.createdAt ?? 0,
        versionCount,
      });
    }

    return summaries.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [workspaces]);

  const activeApps = apps;
  const completedApps: AppSummary[] = [];

  const latest = activeApps[0];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>Alexander Duya</Text>
            </View>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Delete all applications?",
                  "This will permanently delete all saved applications and checklist progress on this device.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset",
                      style: "destructive",
                      onPress: onClearAll,
                    },
                  ],
                )
              }
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>
                🗑️ Reset All Applications
              </Text>
            </TouchableOpacity>
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
                <Text style={styles.statValue}>{apps.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {latest ? (
            <View style={styles.nextStepCard}>
              <View style={styles.nextStepContent}>
                <View style={styles.nextStepIcon}>
                  <Text style={styles.nextStepIconText}>📌</Text>
                </View>

                <View style={styles.nextStepText}>
                  <Text style={styles.nextStepTitle}>Continue</Text>
                  <Text style={styles.nextStepDescription}>
                    {latest.company} • {latest.role}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      onNavigate("application-library", latest.rootId)
                    }
                  >
                    <Text style={styles.nextStepButton}>
                      Open application library →
                    </Text>
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
                  <Text style={styles.nextStepTitle}>No applications yet</Text>
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
                You don't have any active applications yet.
              </Text>
            ) : (
              activeApps.map((app) => (
                <TouchableOpacity
                  key={app.rootId}
                  onPress={() => onNavigate("application-library", app.rootId)}
                  style={styles.applicationCard}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.companyName}>{app.company}</Text>
                    <Text style={styles.roleName}>{app.role}</Text>
                  </View>

                  <Text style={styles.openHint}>
                    Tap to view saved versions ({app.versionCount}) →
                  </Text>
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
                  key={app.rootId}
                  onPress={() => onNavigate("application-library", app.rootId)}
                  style={[styles.applicationCard, styles.completedCard]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.companyName}>{app.company}</Text>
                    <Text style={styles.roleName}>{app.role}</Text>
                  </View>
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
  completedCard: { opacity: 0.9 },

  cardHeader: { marginBottom: 6 },
  companyName: { color: "#111827", fontWeight: "600", fontSize: 16 },
  roleName: { color: "#6B7280", fontSize: 14, marginTop: 4 },

  openHint: { color: "#9CA3AF", fontSize: 12, marginTop: 6 },

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

  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
