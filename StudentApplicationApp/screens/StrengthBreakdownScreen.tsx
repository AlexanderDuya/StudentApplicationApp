import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Screen } from "../App";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { strengthStorageKey, type StrengthResult } from "../lib/gemini";

interface StrengthBreakdownScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
  strengthApplicationId: string;
  company?: string;
  role?: string;
}

export function StrengthBreakdownScreen({
  onNavigate,
  applicationId,
  strengthApplicationId,
  company,
  role,
}: StrengthBreakdownScreenProps) {
  const [result, setResult] = useState<StrengthResult | null>(null);
  const [loading, setLoading] = useState(true);

  const displayCompany = company?.trim() || "Company not set";
  const displayRole = role?.trim() || "Role not set";

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(
          strengthStorageKey(strengthApplicationId),
        );
        if (raw) setResult(JSON.parse(raw) as StrengthResult);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [strengthApplicationId]);

  const overall = result?.overall ?? 0;

  const strengthLevel =
    overall >= 75 ? "Strong" : overall >= 45 ? "Good" : "Weak";

  const badgePalette = {
    Strong: { bg: "#DCFCE7", text: "#166534" },
    Good: { bg: "#FEF3C7", text: "#854D0E" },
    Weak: { bg: "#FFE4E6", text: "#9F1239" },
  }[strengthLevel];

  const barColour =
    overall >= 75 ? "#22C55E" : overall >= 45 ? "#F59E0B" : "#EF4444";

  const filledBars = Math.ceil(overall / 20);

  const componentBarColour = (score: number) => {
    if (score >= 75) return "#22C55E";
    if (score >= 45) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("workspace-overview", applicationId)}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Application strength breakdown</Text>
          <Text style={styles.headerSubtitle}>
            {displayCompany} • {displayRole}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#9333EA" />
            <Text style={styles.loadingText}>Loading score…</Text>
          </View>
        ) : !result ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Feather name="bar-chart-2" size={36} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No score yet</Text>
            <Text style={styles.emptyText}>
              Complete and save your application to calculate your application
              strength.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.strengthCard}>
              <Text style={styles.strengthPercentage}>{overall}%</Text>
              <Text style={styles.strengthLabel}>Application strength</Text>

              <View
                style={[styles.levelTag, { backgroundColor: badgePalette.bg }]}
              >
                <Text
                  style={[styles.levelTagText, { color: badgePalette.text }]}
                >
                  {strengthLevel}
                </Text>
              </View>

              <View style={styles.segmentBlock}>
                <View style={styles.segmentRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.segment,
                        {
                          backgroundColor:
                            i <= filledBars ? barColour : "#E9D5FF",
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.segmentLabels}>
                  <View
                    style={[styles.segmentLabelCol, styles.segmentLabelLeft]}
                  >
                    <Text style={styles.segmentLabel}>Weak</Text>
                  </View>
                  <View
                    style={[styles.segmentLabelCol, styles.segmentLabelCentre]}
                  >
                    <Text style={styles.segmentLabel}>Good</Text>
                  </View>
                  <View
                    style={[styles.segmentLabelCol, styles.segmentLabelRight]}
                  >
                    <Text style={styles.segmentLabel}>Strong</Text>
                  </View>
                </View>
              </View>

              <View style={styles.explanationCard}>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>

              <View style={styles.changeCard}>
                <Text style={styles.changeTitle}>Why your score changed</Text>
                {result.changes.map((change, changeIndex) => (
                  <View key={changeIndex} style={styles.changeRow}>
                    <Feather
                      name="trending-up"
                      size={14}
                      color="#22C55E"
                      style={styles.changeIcon}
                    />
                    <Text style={styles.changeText}>
                      <Text style={styles.changeHighlight}>
                        +{change.points} pts:
                      </Text>
                      {change.reason}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Score breakdown</Text>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>Role alignment</Text>
                    <Text style={styles.cardDetail}>
                      How well your cover letter and bullet points address the
                      job requirements
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {result.components.roleAlignment}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.components.roleAlignment}%`,
                        backgroundColor: componentBarColour(
                          result.components.roleAlignment,
                        ),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>Evidence quality</Text>
                    <Text style={styles.cardDetail}>
                      Strength of examples and use of metrics to support your
                      application
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {result.components.evidenceQuality}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.components.evidenceQuality}%`,
                        backgroundColor: componentBarColour(
                          result.components.evidenceQuality,
                        ),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>Cover letter structure</Text>
                    <Text style={styles.cardDetail}>
                      Clarity of motivation, achievements, fit for the role and
                      research on the company.
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {result.components.coverLetterStructure}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.components.coverLetterStructure}%`,
                        backgroundColor: componentBarColour(
                          result.components.coverLetterStructure,
                        ),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.flex1}>
                    <Text style={styles.cardTitle}>
                      Personalisation to company
                    </Text>
                    <Text style={styles.cardDetail}>
                      Genuine integration of company values and culture
                    </Text>
                  </View>
                  <Text style={styles.cardValue}>
                    {result.components.companyPersonalisation}%
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${result.components.companyPersonalisation}%`,
                        backgroundColor: componentBarColour(
                          result.components.companyPersonalisation,
                        ),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.actionCard}>
              <View style={styles.actionIconWrap}>
                <Feather name="check" size={14} color="#0F766E" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionLabel}>Most impactful next step</Text>
                <Text style={styles.actionText}>{result.nextAction}</Text>
              </View>
            </View>

            {result.calculatedAt && (
              <Text style={styles.timestamp}>
                Last calculated:
                {new Date(result.calculatedAt).toLocaleString()}
              </Text>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onNavigate("workspace-overview", applicationId)}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Back to workspace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  flex1: { flex: 1 },
  bottomSpacer: { height: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
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
  headerInfo: { flex: 1, paddingHorizontal: 10 },
  headerTitle: { fontSize: 20, color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  scrollView: { flex: 1 },
  content: { paddingBottom: 10 },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 80,
  },
  loadingText: { fontSize: 14, color: "#6B7280" },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, color: "#111827" },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  strengthCard: {
    backgroundColor: "#F3E8FF",
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E9D5FF",
  },
  strengthPercentage: {
    fontSize: 50,
    color: "#581C87",
    textAlign: "center",
    marginTop: 6,
  },
  strengthLabel: {
    fontSize: 14,
    color: "#7C3AED",
    textAlign: "center",
    marginTop: 4,
  },

  levelTag: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  levelTagText: { fontSize: 12, fontWeight: "600" },

  segmentBlock: { marginTop: 14, paddingHorizontal: 10 },
  segmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 6,
  },
  segment: { flex: 1, height: 10, borderRadius: 999 },
  segmentLabels: {
    flexDirection: "row",
    marginTop: 10,
    paddingHorizontal: 6,
  },
  segmentLabelCol: { flex: 1 },
  segmentLabelLeft: { alignItems: "flex-start" },
  segmentLabelCentre: { alignItems: "center" },
  segmentLabelRight: { alignItems: "flex-end" },
  segmentLabel: { fontSize: 12, color: "#6B7280" },

  explanationCard: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  explanationText: { fontSize: 13, color: "#4C1D95", lineHeight: 18 },

  changeCard: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  changeTitle: { fontSize: 14, color: "#7C3AED", marginBottom: 8 },
  changeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    alignItems: "flex-start",
  },
  changeIcon: { marginTop: 1 },
  changeText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 16 },
  changeHighlight: { color: "#7C3AED", fontWeight: "600" },

  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 6,
  },
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 12 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  cardTitle: { fontSize: 14, color: "#111827" },
  cardDetail: { fontSize: 12, color: "#6B7280", marginTop: 6, lineHeight: 16 },
  cardValue: { fontSize: 16, color: "#111827" },

  progressTrack: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  progressFill: { height: "100%", borderRadius: 999 },

  actionCard: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ECFEFF",
    borderWidth: 1,
    borderColor: "#CFFAFE",
    alignItems: "flex-start",
  },
  actionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  actionLabel: { fontSize: 12, color: "#115E59", fontWeight: "600" },
  actionText: { fontSize: 12, color: "#115E59", marginTop: 4, lineHeight: 16 },

  timestamp: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
