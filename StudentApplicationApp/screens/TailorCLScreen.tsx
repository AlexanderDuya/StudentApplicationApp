import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import type { Screen, Workspace } from "../App";
import {
  analyseCoverLetter,
  calculateApplicationStrength,
  strengthStorageKey,
} from "../lib/gemini";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface TailorCoverLetterScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
  company: string;
  role: string;
  jobDescription?: string;
  bulletPoints?: string[];
  initialCoverLetter?: string;
  nextVersionNumber: number;
  onSaveNamedVersion?: (
    applicationId: string,
    versionId: string,
    versionName: string,
    coverLetter: string,
  ) => void;
  isEditingVersion?: boolean;
  hasVersionChanges?: boolean;
  updateWorkspace?: (id: string, patch: Partial<Workspace>) => void;
}

export function TailorCoverLetterScreen({
  onNavigate,
  applicationId,
  company,
  role,
  jobDescription,
  bulletPoints,
  initialCoverLetter,
  nextVersionNumber,
  onSaveNamedVersion,
  isEditingVersion,
  hasVersionChanges,
  updateWorkspace,
}: TailorCoverLetterScreenProps) {
  const [coverLetter, setCoverLetter] = useState(initialCoverLetter ?? "");
  const [active] = useState(true);

  const [coachTips, setCoachTips] = useState<string[]>([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const charCount = useMemo(() => coverLetter.length, [coverLetter]);

  const [nameOpen, setNameOpen] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [strengthLoading, setStrengthLoading] = useState(false);
  const [noChangesOpen, setNoChangesOpen] = useState(false);
  const [firstSaveOpen, setFirstSaveOpen] = useState(false);

  useEffect(() => {
    setCoverLetter(initialCoverLetter ?? "");
    setNameOpen(false);
    setNameError(null);
    setNoChangesOpen(false);
    setFirstSaveOpen(false);
  }, [applicationId, initialCoverLetter]);

  const suggestedName = `${company || "Company"} - ${
    role || "Role"
  } (v${nextVersionNumber})`;

  const markAsChangesMade = () => {
    if (isEditingVersion && !hasVersionChanges) {
      updateWorkspace?.(applicationId, { hasVersionChanges: true });
    }
  };

  const openNameModal = () => {
    setNameError(null);
    setVersionName(suggestedName);
    setNameOpen(true);
  };

  const handleAnalyse = async () => {
    setCoachError(null);
    setCoachTips([]);

    const text = coverLetter.trim();
    if (!text) {
      setCoachError("Write your cover letter first, then analyse.");
      return;
    }

    if (!company?.trim() || !role?.trim()) {
      setCoachError(
        "Missing company/role. Go back and make sure they're saved.",
      );
      return;
    }

    setCoachLoading(true);
    try {
      const tips = await analyseCoverLetter({
        coverLetter: text,
        company: company.trim(),
        role: role.trim(),
        jobDescription,
        bulletPoints,
      });

      if (!tips.length) {
        setCoachError("No suggestions returned. Try adding a bit more detail.");
      } else {
        setCoachTips(tips);
      }
    } catch {
      setCoachError(
        "Please try again later, there seems to be an issue with generating tailored feedback right now. This is likely due to high demand and should be resolved soon. In the meantime, try improving your cover letter using the tips you already have and keep going!",
      );
    } finally {
      setCoachLoading(false);
    }
  };

  const handleSaveButtonPress = () => {
    if (isEditingVersion && !hasVersionChanges) {
      setNoChangesOpen(true);
      return;
    }

    if (!isEditingVersion) {
      setFirstSaveOpen(true);
      return;
    }

    openNameModal();
  };

  const handleContinueFirstSave = () => {
    setFirstSaveOpen(false);
    openNameModal();
  };

  const handleConfirmSaveVersion = async () => {
    const name = versionName.trim();
    const text = coverLetter.trim();

    if (!name) {
      setNameError("Please enter a name.");
      return;
    }

    if (isEditingVersion && !hasVersionChanges) {
      setNameOpen(false);
      setNoChangesOpen(true);
      return;
    }

    const versionId = makeId();

    updateWorkspace?.(applicationId, {
      coverLetter: text,
      hasVersionChanges: false,
      isEditingVersion: false,
    });

    onSaveNamedVersion?.(applicationId, versionId, name, text);
    setNameOpen(false);

    setStrengthLoading(true);
    try {
      const result = await calculateApplicationStrength({
        coverLetter: text,
        company: company.trim(),
        role: role.trim(),
        jobDescription,
        bulletPoints,
      });

      await AsyncStorage.setItem(
        strengthStorageKey(versionId),
        JSON.stringify(result),
      );

      console.log("Strength saved for version:", versionId, result.overall);
    } catch (e) {
      console.warn("Strength calculation failed:", e);
    } finally {
      setStrengthLoading(false);
      onNavigate("application-library");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("tailor-cv", applicationId)}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Tailor Cover Letter</Text>
          <Text style={styles.headerSubtitle}>
            {company} • {role}
          </Text>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Feather
          name="edit-2"
          size={16}
          color="#134E4A"
          style={styles.noticeIcon}
        />
        <Text style={styles.noticeText}>
          Write a cover letter that matches the
          <Text style={styles.noticeBold}> role, company, and keywords </Text>
          from the job description.
        </Text>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.editorSection}>
          <View style={styles.editorHeader}>
            <Text style={styles.sectionTitle}>Your cover letter</Text>
            {active && <Text style={styles.activePill}>Active</Text>}
          </View>

          <View style={[styles.letterCard, active && styles.letterCardActive]}>
            <TextInput
              value={coverLetter}
              onChangeText={(t) => {
                setCoverLetter(t);
                setCoachTips([]);
                setCoachError(null);
                markAsChangesMade();
              }}
              multiline
              placeholder={
                "Start with:\n" +
                "1) Why this company/role\n" +
                "2) 1–2 strongest achievements (with metrics)\n" +
                "3) Why you fit the team + close\n\n" +
                "Tip: Use keywords from the job description."
              }
              placeholderTextColor="#9CA3AF"
              style={styles.textArea}
            />

            <View style={styles.editorFooter}>
              <Text style={styles.charCount}>{charCount} characters</Text>
              <Text style={styles.hintMini}>
                Aim: motivation + evidence + impact
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackIcon}>
              <Feather name="zap" size={16} color="#FFFFFF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Coach feedback (AI)</Text>
              <Text style={styles.feedbackSubtitle}>
                Analyse your cover letter for role-specific improvements
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAnalyse}
              disabled={coachLoading}
              style={[styles.analyseButton, coachLoading && { opacity: 0.6 }]}
            >
              <Text style={styles.analyseButtonText}>
                {coachLoading ? "Analysing..." : "Analyse"}
              </Text>
            </TouchableOpacity>
          </View>

          {coachLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Getting suggestions…</Text>
            </View>
          )}

          {!!coachError && <Text style={styles.errorText}>{coachError}</Text>}

          {!coachLoading && !coachError && coachTips.length === 0 && (
            <Text style={styles.emptyCoachText}>
              Press Analyse to get 4 suggestions tailored to this role.
            </Text>
          )}

          {!coachLoading && coachTips.length > 0 && (
            <View style={styles.tipsList}>
              {coachTips.map((tip, idx) => (
                <View key={`${idx}-${tip}`} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleSaveButtonPress}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>
            Save & View Your Application
          </Text>
        </TouchableOpacity>
      </View>

      {strengthLoading && (
        <View style={styles.strengthOverlay}>
          <View style={styles.strengthOverlayCard}>
            <ActivityIndicator color="#14B8A6" size="large" />
            <Text style={styles.strengthOverlayTitle}>
              Calculating your application strength...
            </Text>
            <Text style={styles.strengthOverlaySubtitle}>
              This only takes a moment
            </Text>
          </View>
        </View>
      )}

      <Modal transparent visible={firstSaveOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Wait before you save!</Text>

            <Text style={styles.modalBody}>
              Try to fill out as much of the application as you can so we can
              give you a better analysis as you progress!
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setFirstSaveOpen(false)}
                style={styles.modalBtnSecondary}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleContinueFirstSave}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnPrimaryText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={nameOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name this saved version</Text>

            <TextInput
              value={versionName}
              onChangeText={(t) => {
                setVersionName(t);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Google SWE Intern (v3)"
              style={styles.modalInput}
            />

            {!!nameError && <Text style={styles.modalError}>{nameError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setNameOpen(false)}
                style={styles.modalBtnSecondary}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmSaveVersion}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={noChangesOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              No changes made! Try to fill out your application!
            </Text>

            <Text style={styles.modalBody}>
              You need to make a change in at least one section before saving a
              new version. The more complete your application, the better the
              feedback we will be able to give you and the stronger your future
              applications will be!
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setNoChangesOpen(false)}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnPrimaryText}>Okay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  noticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#F0FDFA",
    borderBottomWidth: 1,
    borderBottomColor: "#99F6E4",
  },
  noticeIcon: { marginTop: 2, marginRight: 4 },
  noticeText: { flex: 1, fontSize: 12, color: "#134E4A", lineHeight: 16 },
  noticeBold: { fontWeight: "700" },

  scrollView: { flex: 1 },

  editorSection: { paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 },
  editorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, color: "#111827" },
  activePill: {
    fontSize: 11,
    color: "#115E59",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  letterCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  letterCardActive: {
    borderColor: "#99F6E4",
    backgroundColor: "rgba(240, 253, 250, 0.35)",
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 220,
    backgroundColor: "#FFFFFF",
  },
  editorFooter: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  charCount: { fontSize: 12, color: "#6B7280" },
  hintMini: { fontSize: 12, color: "#6B7280" },

  feedbackCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 16,
    padding: 20,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A855F7",
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackTitle: { fontSize: 16, color: "#581C87" },
  feedbackSubtitle: { fontSize: 12, color: "#7C3AED", marginTop: 2 },

  analyseButton: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  analyseButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 12, color: "#6B7280" },

  errorText: { color: "#DC2626", fontSize: 12, lineHeight: 16 },
  emptyCoachText: { fontSize: 12, color: "#6B7280", lineHeight: 16 },

  tipsList: { gap: 10, marginTop: 8 },
  tipItem: { flexDirection: "row", gap: 8 },
  tipBullet: { color: "#581C87", fontSize: 16, marginTop: -1 },
  tipText: { flex: 1, fontSize: 12, color: "#6B7280", lineHeight: 16 },

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

  strengthOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  strengthOverlayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 12,
    marginHorizontal: 40,
  },
  strengthOverlayTitle: {
    fontSize: 15,
    color: "#111827",
    textAlign: "center",
  },
  strengthOverlaySubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16 },
  modalTitle: { fontSize: 16, color: "#111827", marginBottom: 10 },
  modalBody: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 8,
  },
  modalError: { marginBottom: 8, color: "#DC2626", fontSize: 12 },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  modalBtnSecondary: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnSecondaryText: { color: "#111827", fontWeight: "600", fontSize: 12 },
  modalBtnPrimary: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnPrimaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
});
