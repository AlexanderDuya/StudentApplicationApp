import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { Screen } from "../App";

interface EvidenceMapperScreenProps {
  onNavigate: (screen: Screen) => void;
}

type Confidence = "high" | "medium" | null;

type EvidenceInputs = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

type Requirement = {
  id: string;
  title: string;
  hasMapped: boolean;
  confidence: Confidence;
};

const emptyEvidence = (): EvidenceInputs => ({
  situation: "",
  task: "",
  action: "",
  result: "",
});

export function EvidenceMapperScreen({
  onNavigate,
}: EvidenceMapperScreenProps) {
  const [expandedReq, setExpandedReq] = useState<string | null>("1");

  const requirements: Requirement[] = [
    {
      id: "1",
      title: "React & JavaScript",
      hasMapped: true,
      confidence: "high",
    },
    {
      id: "2",
      title: "Team collaboration",
      hasMapped: false,
      confidence: null,
    },
    { id: "3", title: "REST APIs", hasMapped: true, confidence: "medium" },
    { id: "4", title: "Problem solving", hasMapped: false, confidence: null },
  ];

  const [evidenceByReq, setEvidenceByReq] = useState<
    Record<string, EvidenceInputs>
  >({
    "1": emptyEvidence(),
    "2": emptyEvidence(),
    "3": emptyEvidence(),
    "4": emptyEvidence(),
  });

  const mappedCount = useMemo(
    () => requirements.filter((r) => r.hasMapped).length,
    [requirements],
  );
  const totalCount = requirements.length;
  const progressPct = Math.round((mappedCount / totalCount) * 100);

  const getConfidenceStyle = (confidence: Confidence) => {
    if (confidence === "high") return { bg: "#DCFCE7", text: "#166534" };
    if (confidence === "medium") return { bg: "#FEF3C7", text: "#854D0E" };
    return { bg: "#FFEDD5", text: "#9A3412" };
  };

  const updateEvidence = (
    reqId: string,
    field: keyof EvidenceInputs,
    value: string,
  ) => {
    setEvidenceByReq((prev) => ({
      ...prev,
      [reqId]: {
        ...(prev[reqId] ?? emptyEvidence()),
        [field]: value,
      },
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("workspace-overview")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Map Evidence</Text>
          <Text style={styles.headerSubtitle}>
            Match your experience to requirements
          </Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.progressIcon}>📈</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {mappedCount} of {totalCount} requirements mapped
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPct}%` }]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How to map evidence</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              • Use the STAR method: Situation, Task, Action, Result
            </Text>
            <Text style={styles.infoItem}>
              • Be specific with examples from projects, coursework, or work
            </Text>
            <Text style={styles.infoItem}>
              Evidence mapped will increase confidence!
            </Text>
          </View>
        </View>

        <View style={styles.requirementsList}>
          {requirements.map((req) => {
            const isExpanded = expandedReq === req.id;
            const ev = evidenceByReq[req.id] ?? emptyEvidence();

            return (
              <View key={req.id} style={styles.requirementCard}>
                <TouchableOpacity
                  onPress={() => setExpandedReq(isExpanded ? null : req.id)}
                  style={styles.requirementHeader}
                >
                  <Text style={styles.requirementIcon}>
                    {req.hasMapped ? "✅" : "⭕"}
                  </Text>

                  <View style={styles.requirementInfo}>
                    <Text style={styles.requirementTitle}>{req.title}</Text>

                    {req.hasMapped && req.confidence && (
                      <View
                        style={[
                          styles.confidenceBadge,
                          {
                            backgroundColor: getConfidenceStyle(req.confidence)
                              .bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.confidenceText,
                            { color: getConfidenceStyle(req.confidence).text },
                          ]}
                        >
                          {req.confidence} confidence
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.expandIcon}>
                    {isExpanded ? "–" : "+"}
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.evidenceDetails}>
                    <View style={styles.evidenceField}>
                      <Text style={styles.evidenceLabel}>Situation</Text>
                      <TextInput
                        value={ev.situation}
                        onChangeText={(t) =>
                          updateEvidence(req.id, "situation", t)
                        }
                        placeholder="e.g., Built a task management app for coursework"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        multiline
                      />
                    </View>

                    <View style={styles.evidenceField}>
                      <Text style={styles.evidenceLabel}>Task</Text>
                      <TextInput
                        value={ev.task}
                        onChangeText={(t) => updateEvidence(req.id, "task", t)}
                        placeholder="e.g., Create interactive UI with real-time updates"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        multiline
                      />
                    </View>

                    <View style={styles.evidenceField}>
                      <Text style={styles.evidenceLabel}>Action</Text>
                      <TextInput
                        value={ev.action}
                        onChangeText={(t) =>
                          updateEvidence(req.id, "action", t)
                        }
                        placeholder="e.g., Used React hooks, state management, and reusable components"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        multiline
                      />
                    </View>

                    <View style={styles.evidenceField}>
                      <Text style={styles.evidenceLabel}>Result</Text>
                      <TextInput
                        value={ev.result}
                        onChangeText={(t) =>
                          updateEvidence(req.id, "result", t)
                        }
                        placeholder="e.g., Achieved 95% grade and deployed to 50+ users"
                        placeholderTextColor="#9CA3AF"
                        style={styles.input}
                        multiline
                      />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onNavigate("tailor-cv")}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>Save and continue</Text>
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
    gap: 16,
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
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280" },

  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#FAF5FF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3E8FF",
  },
  progressIcon: { fontSize: 20 },
  progressInfo: { flex: 1 },
  progressText: { fontSize: 14, color: "#581C87", marginBottom: 4 },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E9D5FF",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: "#9333EA" },

  scrollView: { flex: 1 },

  infoCard: {
    margin: 24,
    marginBottom: 16,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: { fontSize: 14, color: "#134E4A", marginBottom: 8 },
  infoList: { gap: 4 },
  infoItem: { fontSize: 12, color: "#115E59", lineHeight: 16 },

  requirementsList: { paddingHorizontal: 24, gap: 12, paddingBottom: 24 },

  requirementCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  requirementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  requirementIcon: { fontSize: 24 },
  requirementInfo: { flex: 1 },
  requirementTitle: { fontSize: 16, color: "#111827", marginBottom: 4 },

  confidenceBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: { fontSize: 12 },

  expandIcon: { fontSize: 22, color: "#9CA3AF" },

  evidenceDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 12,
    paddingTop: 16,
  },
  evidenceField: { gap: 6 },
  evidenceLabel: { fontSize: 12, color: "#6B7280" },

  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 44,
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  saveButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
