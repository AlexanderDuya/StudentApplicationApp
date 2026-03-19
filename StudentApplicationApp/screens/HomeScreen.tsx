import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Screen, Workspace } from "../App";

interface HomeScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  workspaces: Workspace[];
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
  isComplete: boolean;
};

export function HomeScreen({ onNavigate, workspaces }: HomeScreenProps) {
  const apps = useMemo<AppSummary[]>(() => {
    const workspacesByRootId = new Map<string, Workspace[]>();

    for (const workspace of workspaces) {
      const applicationRootId = workspace.rootId ?? workspace.id;
      const relatedWorkspaces = workspacesByRootId.get(applicationRootId) ?? [];

      relatedWorkspaces.push(workspace);
      workspacesByRootId.set(applicationRootId, relatedWorkspaces);
    }

    const applicationSummaries: AppSummary[] = [];

    for (const [applicationRootId, relatedWorkspaces] of workspacesByRootId) {
      const latestWorkspace = [...relatedWorkspaces].sort(
        (firstWorkspace, secondWorkspace) =>
          (secondWorkspace.createdAt ?? 0) - (firstWorkspace.createdAt ?? 0),
      )[0];

      const company = latestWorkspace.company?.trim() || "Company not set";
      const role = latestWorkspace.role?.trim() || "Role not set";

      let versionCount = 0;
      for (const workspace of relatedWorkspaces) {
        versionCount += workspace.versions?.length ?? 0;
      }

      const completedChecklistSteps = Object.values(
        latestWorkspace.checklistSteps ?? {},
      ).filter(Boolean).length;

      const isComplete = completedChecklistSteps === 8;

      applicationSummaries.push({
        rootId: applicationRootId,
        company,
        role,
        latestWorkspaceId: latestWorkspace.id,
        createdAt: latestWorkspace.createdAt ?? 0,
        versionCount,
        isComplete,
      });
    }

    return applicationSummaries.sort(
      (firstApplication, secondApplication) =>
        (secondApplication.createdAt ?? 0) - (firstApplication.createdAt ?? 0),
    );
  }, [workspaces]);

  const activeApps = apps.filter((app) => !app.isComplete);
  const completedApps = apps.filter((app) => app.isComplete);

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
                  <Feather name="bookmark" size={20} color="#FFFFFF" />
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
                  <Feather name="star" size={20} color="#FFFFFF" />
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

                  <Text style={styles.openHint}>
                    Tap to view saved versions ({app.versionCount}) →
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
    marginBottom: 16,
  },
  sectionTitle: { color: "#111827", fontSize: 18, fontWeight: "600" },

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
});
