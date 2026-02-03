import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen } from "../App";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export interface WorkspaceOverviewScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
  company?: string;
  role?: string;
}

type FutureScreen =
  | "evidence-mapper"
  | "tailor-cv"
  | "versions-library"
  | "company-research"
  | "strength-breakdown";

type StepScreen = Screen | FutureScreen;

type Step = {
  id: number;
  title: string;
  completed: boolean;
  screen: StepScreen;
};

const stepsStorageKey = (applicationId: string) =>
  `workspace:${applicationId}:checklistSteps`;

const BASE_STEPS: Step[] = [
  {
    id: 1,
    title: "Review job description",
    completed: true,
    screen: "job-spec-breakdown",
  },
  {
    id: 2,
    title: "Key requirements extracted",
    completed: true,
    screen: "job-spec-breakdown",
  },
  {
    id: 3,
    title: "Map evidence to requirements",
    completed: false,
    screen: "evidence-mapper",
  },
  {
    id: 4,
    title: "Tailor CV bullets",
    completed: false,
    screen: "tailor-cv",
  },
  {
    id: 5,
    title: "Draft cover letter points",
    completed: false,
    screen: "versions-library",
  },
  {
    id: 6,
    title: "Company research notes",
    completed: false,
    screen: "company-research",
  },
  {
    id: 7,
    title: "Final review",
    completed: false,
    screen: "strength-breakdown",
  },
  {
    id: 8,
    title: "Export tailored version",
    completed: false,
    screen: "versions-library",
  },
];

export function WorkspaceOverviewScreen({
  onNavigate,
  applicationId,
  company,
  role,
}: WorkspaceOverviewScreenProps) {
  const [steps, setSteps] = useState<Step[]>(BASE_STEPS);

  const displayCompany = company?.trim() || "Company not set";
  const displayRole = role?.trim() || "Role not set";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(stepsStorageKey(applicationId));

        console.log(
          "Loaded steps for key:",
          stepsStorageKey(applicationId),
          raw,
        );

        if (!raw) return;

        const saved: Record<string, boolean> = JSON.parse(raw);
        if (cancelled) return;

        setSteps((prev) =>
          prev.map((s) => ({
            ...s,
            completed: saved[String(s.id)] ?? s.completed,
          })),
        );
      } catch {
        // ignore load errors for now
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const saveSteps = async (nextSteps: Step[]) => {
    const map: Record<string, boolean> = {};
    nextSteps.forEach((s) => {
      map[String(s.id)] = s.completed;
    });

    await AsyncStorage.setItem(
      stepsStorageKey(applicationId),
      JSON.stringify(map),
    );

    console.log("Saved steps for key:", stepsStorageKey(applicationId));
  };

  const toggleStep = (stepId: number) => {
    setSteps((prev) => {
      const next = prev.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s,
      );

      void saveSteps(next);
      return next;
    });
  };

  const completedSteps = useMemo(
    () => steps.filter((s) => s.completed).length,
    [steps],
  );

  // progress calc (10% increments for now)
  const progressPercentage = useMemo(() => {
    const raw = (completedSteps / steps.length) * 100;
    const roundedDownTo10 = Math.floor(raw / 10) * 10;
    return Math.min(100, Math.max(0, roundedDownTo10));
  }, [completedSteps, steps.length]);

  // TODO: application strength should come from an API later sprint will cover
  const strengthPercentage = progressPercentage;

  const strengthLabel = useMemo(() => {
    if (strengthPercentage >= 80) return "Excellent - Nearly there!";
    if (strengthPercentage >= 60) return "Strong - Keep going!";
    if (strengthPercentage >= 40) return "Getting there - Nice progress!";
    return "Needs work - You’ve got this!";
  }, [strengthPercentage]);

  const strengthBarFillColor = useMemo(() => {
    if (strengthPercentage >= 80) return "#22C55E";
    if (strengthPercentage >= 50) return "#EAB308";
    return "#EF4444";
  }, [strengthPercentage]);

  const filledStrengthBars = Math.ceil(strengthPercentage / 20);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => {
              // TODO: decide what screen to open for completed steps
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.companyName}>{displayCompany}</Text>
            <Text style={styles.roleName}>{displayRole}</Text>

            <Text style={styles.workspaceId}>
              Workspace ID: {applicationId}
            </Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall progress</Text>
            <Text style={styles.progressSteps}>
              {completedSteps}/{steps.length} steps
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.strengthCard}>
        <View style={styles.strengthHeader}>
          <View style={styles.strengthTitleContainer}>
            <Text style={styles.strengthIcon}>📈</Text>
            <Text style={styles.strengthTitle}>Application strength</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              // TODO: add "strength-breakdown" screen later
              // onNavigate("strength-breakdown")
            }}
          >
            <Text style={styles.strengthDetailsButton}>Details →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.strengthMeter}>
          <View style={styles.strengthBarsContainer}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    {
                      backgroundColor:
                        i <= filledStrengthBars
                          ? strengthBarFillColor
                          : "#E9D5FF",
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.strengthDescription}>{strengthLabel}</Text>
          </View>
          <Text style={styles.strengthPercentage}>{strengthPercentage}%</Text>
        </View>

        <View style={styles.strengthInfo}>
          <Text style={styles.strengthInfoIcon}>ℹ️</Text>
          <Text style={styles.strengthInfoText}>
            Your score improves as you complete checklist steps.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.checklistScroll}
        contentContainerStyle={styles.checklistContent}
      >
        <Text style={styles.checklistTitle}>Your checklist</Text>

        <View style={styles.stepsList}>
          {steps.map((step) => (
            <TouchableOpacity
              key={step.id}
              onPress={() => {
                // TODO: decide what screen to open for completed steps
                toggleStep(step.id);
              }}
              style={styles.stepItem}
            >
              <Text style={styles.stepIcon}>
                {step.completed ? "✅" : "⭕"}
              </Text>

              <View style={styles.stepText}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.completed && styles.stepTitleCompleted,
                  ]}
                >
                  {step.title}
                </Text>
              </View>

              {!step.completed && step.id === completedSteps + 1 && (
                <View style={styles.nextBadge}>
                  <Text style={styles.nextBadgeText}>Next</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>Suggested next step</Text>
          <Text style={styles.suggestionDescription}>
            Map your evidence to the key requirements we found. This helps show
            you're a strong match.
          </Text>

          <TouchableOpacity
            onPress={() => onNavigate("job-spec-breakdown", applicationId)}
            style={styles.suggestionButton}
          >
            <Text style={styles.suggestionButtonText}>Go to job spec</Text>
          </TouchableOpacity>
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
  backIcon: { fontSize: 20, color: "#374151" },
  headerInfo: { flex: 1 },
  companyName: { fontSize: 20, color: "#111827" },
  roleName: { fontSize: 14, color: "#6B7280" },
  workspaceId: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },

  progressCard: { backgroundColor: "#F9FAFB", borderRadius: 12, padding: 16 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#374151" },
  progressSteps: { fontSize: 14, color: "#111827" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#14B8A6",
    borderRadius: 4,
  },

  strengthCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#F3E8FF",
    borderBottomWidth: 1,
    borderBottomColor: "#E9D5FF",
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  strengthTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthIcon: { fontSize: 20 },
  strengthTitle: { fontSize: 16, color: "#581C87" },
  strengthDetailsButton: { fontSize: 14, color: "#9333EA" },

  strengthMeter: { flexDirection: "row", alignItems: "center", gap: 16 },
  strengthBarsContainer: { flex: 1 },
  strengthBars: { flexDirection: "row", gap: 8, marginBottom: 8 },
  strengthBar: { flex: 1, height: 12, borderRadius: 6 },
  strengthDescription: { fontSize: 14, color: "#7C3AED" },
  strengthPercentage: { fontSize: 30, color: "#581C87" },

  strengthInfo: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    padding: 12,
  },
  strengthInfoIcon: { fontSize: 16, marginTop: 2 },
  strengthInfoText: { flex: 1, fontSize: 12, color: "#6B21A8" },

  checklistScroll: { flex: 1 },
  checklistContent: { paddingHorizontal: 24, paddingVertical: 16 },
  checklistTitle: { fontSize: 16, color: "#111827", marginBottom: 16 },

  stepsList: { gap: 8 },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 8,
  },
  stepIcon: { fontSize: 24 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 14, color: "#111827" },
  stepTitleCompleted: { color: "#6B7280", textDecorationLine: "line-through" },

  nextBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
  },
  nextBadgeText: { fontSize: 12, color: "#7C3AED" },

  suggestionCard: {
    marginTop: 24,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 12,
    padding: 16,
  },
  suggestionTitle: { fontSize: 14, color: "#134E4A", marginBottom: 8 },
  suggestionDescription: {
    fontSize: 14,
    color: "#115E59",
    marginBottom: 12,
    lineHeight: 20,
  },
  suggestionButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  suggestionButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
