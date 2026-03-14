import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Screen } from "../App";
import { analyseCvBullet } from "../lib/gemini";

interface TailorCVScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;

  applicationId: string;
  company: string;
  role: string;
  jobDescription?: string;
  initialBullets: string[];
  onSaveBullets?: (applicationId: string, bulletPoints: string[]) => void;
}

type Bullet = {
  id: string;
  text: string;
};

const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toBulletState = (strings: string[]): Bullet[] => {
  const cleaned = (strings ?? [])
    .map((s) => String(s ?? "").trim())
    .filter(Boolean);
  if (cleaned.length === 0) return [{ id: newId(), text: "" }];
  return cleaned.map((t) => ({ id: newId(), text: t }));
};

export function TailorCVScreen({
  onNavigate,
  applicationId,
  company,
  role,
  jobDescription,
  initialBullets,
  onSaveBullets,
}: TailorCVScreenProps) {
  const [bullets, setBullets] = useState<Bullet[]>(() =>
    toBulletState(initialBullets),
  );
  const [activeId, setActiveId] = useState<string>(() => {
    const seeded = toBulletState(initialBullets);
    return seeded[0].id;
  });

  const hydratedForIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (hydratedForIdRef.current === applicationId) return;

    const seeded = toBulletState(initialBullets);
    setBullets(seeded);
    setActiveId(seeded[0].id);

    hydratedForIdRef.current = applicationId;
  }, [applicationId]);

  const [coachTips, setCoachTips] = useState<string[]>([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  const activeBullet = useMemo(
    () => bullets.find((b) => b.id === activeId),
    [bullets, activeId],
  );

  const updateBullet = (id: string, value: string) => {
    setBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text: value } : b)),
    );

    if (id === activeId) {
      setCoachTips([]);
      setCoachError(null);
    }
  };

  const addBullet = () => {
    const id = newId();
    setBullets((prev) => [...prev, { id, text: "" }]);
    setActiveId(id);

    setCoachTips([]);
    setCoachError(null);
  };

  const removeBullet = (id: string) => {
    setBullets((prev) => {
      const next = prev.filter((b) => b.id !== id);
      const safeNext = next.length ? next : [{ id: newId(), text: "" }];

      if (id === activeId) {
        setActiveId(safeNext[0].id);
        setCoachTips([]);
        setCoachError(null);
      }

      return safeNext;
    });
  };

  const placeholderForIndex = (idx: number) => {
    if (idx === 0) {
      return (
        "Example (STAR → tailored):\n" +
        "Situation: Built a React task app for coursework.\n" +
        "Task: Create a responsive UI with real-time updates.\n" +
        "Action: Implemented reusable components + state management.\n" +
        "Result: 50+ users, 95% grade.\n\n" +
        "Tailored bullet:\n" +
        "• Built a scalable React UI with reusable components and optimized rendering, delivering real-time updates for 50+ users and improving responsiveness."
      );
    }
    return "Write a tailored bullet from your evidence (include keywords + a measurable outcome)…";
  };

  const handleAnalyse = async () => {
    setCoachError(null);
    setCoachTips([]);

    const bulletText = activeBullet?.text?.trim() ?? "";
    if (!bulletText) {
      setCoachError(
        "Write something in the active bullet first, then analyse.",
      );
      return;
    }

    if (!company?.trim() || !role?.trim()) {
      setCoachError(
        "Missing company/role. Go back and make sure they’re saved.",
      );
      return;
    }

    setCoachLoading(true);
    try {
      const tips = await analyseCvBullet({
        bullet: bulletText,
        company: company.trim(),
        role: role.trim(),
        jobDescription,
      });

      if (!tips.length) {
        setCoachError("No suggestions returned. Try adding a bit more detail.");
      } else {
        setCoachTips(tips);
      }
    } catch (e: any) {
      setCoachError(
        "Please try again later, there seems to be an issue with generating tailored feedback right now. This is likely due to high demand and should be resolved soon. In the meantime, try improving your points with the tips given and move on to tailoring your cover letter!",
      );
    } finally {
      setCoachLoading(false);
    }
  };

  const handleSaveAndContinue = () => {
    const bulletPoints = bullets.map((b) => b.text.trim()).filter(Boolean);
    onSaveBullets?.(applicationId, bulletPoints);
    onNavigate("tailor-cover-letter", applicationId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("evidence-mapper", applicationId)}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Tailor CV Bullets</Text>
          <Text style={styles.headerSubtitle}>
            {company} • {role}
          </Text>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Feather
          name="target"
          size={16}
          color="#134E4A"
          style={styles.noticeIcon}
        />
        <Text style={styles.noticeText}>
          Rewrite your evidence in a way that matches the
          <Text style={styles.noticeBold}> role, company, and keywords.</Text>
        </Text>
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.editorSection}>
          <View style={styles.editorHeader}>
            <Text style={styles.sectionTitle}>Your tailored bullet points</Text>

            <TouchableOpacity onPress={addBullet} style={styles.addButton}>
              <Text style={styles.addButtonText}>＋ Add bullet</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bulletsList}>
            {bullets.map((b, idx) => {
              const isActive = b.id === activeId;

              return (
                <View
                  key={b.id}
                  style={[
                    styles.bulletCard,
                    isActive && styles.bulletCardActive,
                  ]}
                >
                  <View style={styles.bulletTopRow}>
                    <TouchableOpacity
                      onPress={() => setActiveId(b.id)}
                      style={styles.bulletTitleWrap}
                    >
                      <Text style={styles.bulletLabel}>Bullet {idx + 1}</Text>
                      {isActive && (
                        <Text style={styles.activePill}>Active</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => removeBullet(b.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={b.text}
                    onChangeText={(t) => updateBullet(b.id, t)}
                    onFocus={() => setActiveId(b.id)}
                    multiline
                    placeholder={placeholderForIndex(idx)}
                    placeholderTextColor="#9CA3AF"
                    style={styles.textArea}
                  />

                  <View style={styles.editorFooter}>
                    <Text style={styles.charCount}>
                      {b.text.length} characters
                    </Text>
                    <Text style={styles.hintMini}>
                      Aim: action + keyword + impact + metric
                    </Text>
                  </View>
                </View>
              );
            })}
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
                Analyses your bullet and suggests improvements based on the job
                description.
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
          onPress={handleSaveAndContinue}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>
            Save & Start Tailoring A Cover Letter
          </Text>
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
  addButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addButtonText: { fontSize: 12, color: "#111827" },

  bulletsList: { gap: 12, paddingBottom: 8 },

  bulletCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  bulletCardActive: {
    borderColor: "#99F6E4",
    backgroundColor: "rgba(240, 253, 250, 0.35)",
  },
  bulletTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  bulletTitleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulletLabel: { fontSize: 14, color: "#374151" },
  activePill: {
    fontSize: 11,
    color: "#115E59",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  removeText: { fontSize: 12, color: "#EF4444" },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
  },
  editorFooter: {
    marginTop: 8,
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
  feedbackIconText: { fontSize: 16 },
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
});
