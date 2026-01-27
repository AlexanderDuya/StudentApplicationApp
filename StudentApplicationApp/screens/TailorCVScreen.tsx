import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import { Screen } from "../App";

interface TailorCVScreenProps {
  onNavigate: (screen: Screen) => void;
}

type Bullet = {
  id: string;
  text: string;
};

const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function TailorCVScreen({ onNavigate }: TailorCVScreenProps) {
  const [bullets, setBullets] = useState<Bullet[]>([{ id: newId(), text: "" }]);
  const [activeId, setActiveId] = useState<string>(bullets[0].id);

  const updateBullet = (id: string, value: string) => {
    setBullets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, text: value } : b)),
    );
  };

  const addBullet = () => {
    const id = newId();
    setBullets((prev) => [...prev, { id, text: "" }]);
    setActiveId(id);
  };

  const removeBullet = (id: string) => {
    setBullets((prev) => {
      const next = prev.filter((b) => b.id !== id);
      const safeNext = next.length ? next : [{ id: newId(), text: "" }];

      if (id === activeId) setActiveId(safeNext[0].id);
      return safeNext;
    });
  };

  const placeholderForIndex = (idx: number) => {
    if (idx === 0) {
      return (
        "Example (STAR → tailored for Google SWE Intern):\n" +
        "Situation: Built a React task app for coursework used by classmates.\n" +
        "Task: Create a responsive UI with real-time updates.\n" +
        "Action: Implemented reusable components + state management; optimized renders.\n" +
        "Result: 50+ users, 95% grade, faster interactions.\n\n" +
        "Tailored CV bullet:\n" +
        "• Built a scalable React UI with reusable components and optimized rendering, delivering real-time updates for 50+ users and improving responsiveness; collaborated with peers to iterate quickly and achieved a 95% project grade."
      );
    }

    return "Write a tailored bullet from your mapped evidence (include skill keywords + a measurable outcome)…";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("evidence-mapper")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Tailor CV Bullets</Text>
          <Text style={styles.headerSubtitle}>
            Refine mapped evidence into role + company aligned CV bullets
          </Text>
        </View>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeIcon}>🎯</Text>
        <Text style={styles.noticeText}>
          You’ve mapped your experience to the requirements. Now rewrite that
          evidence in a way that matches the
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
              <Text style={styles.feedbackIconText}>💡</Text>
            </View>
            <Text style={styles.feedbackTitle}>Coach feedback</Text>
          </View>

          <View style={styles.feedbackList}>
            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackCheckIcon}>✅</Text>
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackItemTitle}>
                  Tailoring checklist
                </Text>
                <Text style={styles.feedbackItemText}>
                  Start from one mapped requirement but with the role/company
                  keywords.
                </Text>
              </View>
            </View>

            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackTrendIcon}>🎯</Text>
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackItemTitlePurple}>
                  Make it role-specific
                </Text>
                <Text style={styles.feedbackItemTextPurple}>
                  Use keywords from the job description (e.g., scale,
                  reliability, performance, collaboration) and mention the
                  relevant tools.
                </Text>
              </View>
            </View>

            <View style={styles.feedbackItem}>
              <Text style={styles.feedbackTrendIcon}>📈</Text>
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackItemTitlePurple}>
                  Add measurable impact
                </Text>
                <Text style={styles.feedbackItemTextPurple}>
                  Use metrics where possible: users, %, time saved, latency
                  reduced, grades, bugs fixed.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onNavigate("workspace-overview")}
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
  noticeIcon: { fontSize: 16, marginTop: 2 },
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
    gap: 8,
    marginBottom: 16,
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

  feedbackList: { gap: 12 },
  feedbackItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  feedbackCheckIcon: { fontSize: 20, marginTop: 2 },
  feedbackTrendIcon: { fontSize: 20, marginTop: 2 },
  feedbackContent: { flex: 1 },
  feedbackItemTitle: { fontSize: 14, color: "#111827", marginBottom: 4 },
  feedbackItemTitlePurple: { fontSize: 14, color: "#581C87", marginBottom: 4 },
  feedbackItemText: { fontSize: 12, color: "#6B7280", lineHeight: 16 },
  feedbackItemTextPurple: { fontSize: 12, color: "#7C3AED", lineHeight: 16 },

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
