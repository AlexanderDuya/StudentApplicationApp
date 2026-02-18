import React from "react";
import { Screen } from "../App";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

interface StrengthBreakdownScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
  company?: string;
  role?: string;
}

type StrengthLevel = "weak" | "good" | "strong";

type BadgePalette = {
  backgroundColour: string;
  textColour: string;
  label: string;
};

const strengthPercentage = 55;

const strengthLevel: StrengthLevel = "good";

const badgePaletteByLevel: Record<StrengthLevel, BadgePalette> = {
  strong: {
    backgroundColour: "#DCFCE7",
    textColour: "#166534",
    label: "Strong",
  },
  good: { backgroundColour: "#FEF3C7", textColour: "#854D0E", label: "Good" },
  weak: { backgroundColour: "#FFE4E6", textColour: "#9F1239", label: "Weak" },
};

const strengthBadge = badgePaletteByLevel[strengthLevel];

const strengthBarFillColour = "#F59E0B";
const strengthBarEmptyColour = "#E9D5FF";

export function StrengthBreakdownScreen({
  onNavigate,
  applicationId,
  company,
  role,
}: StrengthBreakdownScreenProps) {
  const displayCompany = company?.trim() || "Company not set";
  const displayRole = role?.trim() || "Role not set";
  const subtitle = `${displayCompany} • ${displayRole}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("workspace-overview", applicationId)}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Application strength breakdown</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.strengthCard}>
          <Text style={styles.strengthPercentage}>{strengthPercentage}%</Text>
          <Text style={styles.strengthLabel}>Application strength</Text>

          <View style={styles.levelTag}>
            <Text style={styles.levelTagText}>{strengthBadge.label}</Text>
          </View>

          <View style={styles.segmentBlock}>
            <View style={styles.segmentRow}>
              <View style={[styles.segment, styles.segmentFilled]} />
              <View style={[styles.segment, styles.segmentFilled]} />
              <View style={[styles.segment, styles.segmentFilled]} />
              <View style={[styles.segment, styles.segmentEmpty]} />
              <View style={[styles.segment, styles.segmentEmpty]} />
            </View>

            <View style={styles.segmentLabels}>
              <View style={[styles.segmentLabelCol, styles.segmentLabelLeft]}>
                <Text style={styles.segmentLabel}>Weak</Text>
              </View>

              <View style={[styles.segmentLabelCol, styles.segmentLabelCentre]}>
                <Text style={styles.segmentLabel}>Good</Text>
              </View>

              <View style={[styles.segmentLabelCol, styles.segmentLabelRight]}>
                <Text style={styles.segmentLabel}>Strong</Text>
              </View>
            </View>
          </View>

          <View style={styles.changeCard}>
            <Text style={styles.changeTitle}>Why your score changed</Text>

            <View style={styles.changeRow}>
              <Text style={styles.changeIcon}>↗</Text>
              <Text style={styles.changeText}>
                <Text style={styles.changeHighlight}>+15 points:</Text> Mapped
                evidence to React requirement with a solid STAR example
              </Text>
            </View>

            <View style={styles.changeRow}>
              <Text style={styles.changeIcon}>↗</Text>
              <Text style={styles.changeText}>
                <Text style={styles.changeHighlight}>+10 points:</Text>
                Completed REST APIs requirement mapping
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score breakdown</Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Requirements coverage</Text>
                <Text style={styles.cardDetail}>
                  You’ve mapped evidence to 6 out of 8 requirements
                </Text>
              </View>
              <Text style={styles.cardValue}>75%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  styles.progressFill75,
                  styles.progressOrange,
                ]}
              />
            </View>

            <View style={styles.actionBox}>
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>✓</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionLabel}>Next action</Text>
                <Text style={styles.actionText}>
                  Map evidence to the remaining 2 requirements
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Evidence quality</Text>
                <Text style={styles.cardDetail}>
                  Most examples include metrics and clear impact
                </Text>
              </View>
              <Text style={styles.cardValue}>62%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  styles.progressFill62,
                  styles.progressOrange,
                ]}
              />
            </View>

            <View style={styles.actionBox}>
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>✓</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionLabel}>Next action</Text>
                <Text style={styles.actionText}>
                  Add 1 or 2 metrics to the weaker examples
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>CV tailoring</Text>
                <Text style={styles.cardDetail}>
                  Some bullets still are generic for this role
                </Text>
              </View>
              <Text style={styles.cardValue}>48%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  styles.progressFill48,
                  styles.progressRed,
                ]}
              />
            </View>

            <View style={styles.actionBox}>
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>✓</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionLabel}>Next action</Text>
                <Text style={styles.actionText}>
                  Rewrite 2 bullets using role keywords
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.flex1}>
                <Text style={styles.cardTitle}>Company research</Text>
                <Text style={styles.cardDetail}>
                  Research notes are complete!
                </Text>
              </View>
              <Text style={styles.cardValue}>100%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  styles.progressFill100,
                  styles.progressGreen,
                ]}
              />
            </View>

            <View style={styles.actionBox}>
              <View style={styles.actionIconWrap}>
                <Text style={styles.actionIcon}>✓</Text>
              </View>
              <View style={styles.flex1}>
                <Text style={styles.actionLabel}>Next action</Text>
                <Text style={styles.actionText}>Review Notes</Text>
              </View>
            </View>
          </View>
        </View>

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
  backIcon: { fontSize: 20, color: "#374151" },

  headerInfo: { flex: 1, paddingHorizontal: 10 },
  headerTitle: { fontSize: 19, color: "#111827" },
  headerSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  scrollView: { flex: 1 },
  content: { paddingBottom: 10 },

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
    fontWeight: "300",
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
    backgroundColor: strengthBadge.backgroundColour,
  },
  levelTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: strengthBadge.textColour,
  },

  segmentBlock: { marginTop: 14, paddingHorizontal: 10 },
  segmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 6,
  },
  segment: { flex: 1, height: 10, borderRadius: 999 },
  segmentFilled: { backgroundColor: strengthBarFillColour },
  segmentEmpty: { backgroundColor: strengthBarEmptyColour },

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

  changeCard: {
    marginTop: 16,
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
  changeIcon: { color: "#22C55E", fontSize: 14, marginTop: 1 },
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

  progressFill75: { width: "75%" },
  progressFill62: { width: "62%" },
  progressFill48: { width: "48%" },
  progressFill100: { width: "100%" },
  progressGreen: { backgroundColor: "#22C55E" },
  progressOrange: { backgroundColor: "#F59E0B" },
  progressRed: { backgroundColor: "#EF4444" },

  actionBox: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ECFEFF",
    borderWidth: 1,
    borderColor: "#CFFAFE",
  },
  actionIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#14B8A6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  actionIcon: { color: "#0F766E", fontSize: 12, fontWeight: "700" },
  actionLabel: { fontSize: 12, color: "#115E59", fontWeight: "600" },
  actionText: { fontSize: 12, color: "#115E59", marginTop: 4, lineHeight: 16 },

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
