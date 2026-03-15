import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import type { Screen, Workspace, CompanyResearchNotes } from "../App";

interface CompanyResearchScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
  company: string;
  role: string;
  initialNotes?: CompanyResearchNotes;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
}

export function CompanyResearchScreen({
  onNavigate,
  applicationId,
  company,
  role,
  initialNotes,
  updateWorkspace,
}: CompanyResearchScreenProps) {
  const [whatDoesCompanyDo, setWhatDoesCompanyDo] = useState("");
  const [recentNews, setRecentNews] = useState("");
  const [cultureValues, setCultureValues] = useState("");
  const [whyWorkHere, setWhyWorkHere] = useState("");

  useEffect(() => {
    setWhatDoesCompanyDo(initialNotes?.whatDoesCompanyDo ?? "");
    setRecentNews(initialNotes?.recentNews ?? "");
    setCultureValues(initialNotes?.cultureValues ?? "");
    setWhyWorkHere(initialNotes?.whyWorkHere ?? "");
  }, [initialNotes]);

  const markAsChangesMade = () => {
    updateWorkspace(applicationId, { hasVersionChanges: true });
  };

  const handleSave = () => {
    const notes: CompanyResearchNotes = {
      whatDoesCompanyDo: whatDoesCompanyDo.trim(),
      recentNews: recentNews.trim(),
      cultureValues: cultureValues.trim(),
      whyWorkHere: whyWorkHere.trim(),
    };

    updateWorkspace(applicationId, { companyResearch: notes });
    onNavigate("evidence-mapper", applicationId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("job-spec-breakdown", applicationId)}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Company Research</Text>
          <Text style={styles.headerSubtitle}>
            {company || "Company"} • {role || "Role"}
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔍</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Research tips</Text>
            <Text style={styles.infoText}>
              Understanding the company helps you tailor your application and
              prepare for interviews.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Key information about {company || "the company"}
          </Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>What does the company do?</Text>
            <TextInput
              value={whatDoesCompanyDo}
              onChangeText={(value) => {
                setWhatDoesCompanyDo(value);
                markAsChangesMade();
              }}
              multiline
              placeholder="E.g., What the product is, who it serves, why it matters..."
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>
              Recent news or developments
            </Text>
            <TextInput
              value={recentNews}
              onChangeText={(value) => {
                setRecentNews(value);
                markAsChangesMade();
              }}
              multiline
              placeholder="Recent launches, acquisitions, strategy shifts, quarterly highlights..."
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Company culture & values</Text>
            <TextInput
              value={cultureValues}
              onChangeText={(value) => {
                setCultureValues(value);
                markAsChangesMade();
              }}
              multiline
              placeholder="Values, culture signals from careers page, leadership principles, team behaviours..."
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
            />
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>
              Why do you want to work here?
            </Text>
            <TextInput
              value={whyWorkHere}
              onChangeText={(value) => {
                setWhyWorkHere(value);
                markAsChangesMade();
              }}
              multiline
              placeholder="Your motivation, alignment, and how your experience connects to the mission..."
              placeholderTextColor="#9CA3AF"
              style={[styles.textInput, { minHeight: 110 }]}
            />
          </View>
        </View>

        <View style={styles.resourcesCard}>
          <Text style={styles.resourcesTitle}>📚 Helpful resources</Text>

          <View style={styles.resourceItem}>
            <Text style={styles.resourceText}>
              Company website & About page
            </Text>
            <Text style={styles.resourceArrow}>→</Text>
          </View>

          <View style={styles.resourceItem}>
            <Text style={styles.resourceText}>Recent news articles</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </View>

          <View style={styles.resourceItem}>
            <Text style={styles.resourceText}>
              Employee reviews (Glassdoor)
            </Text>
            <Text style={styles.resourceArrow}>→</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>
            Save Research & Start Mapping Evidence
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
    justifyContent: "space-between",
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 20, color: "#111827" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  spacer: { width: 40 },

  scrollView: { flex: 1 },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 24,
    marginBottom: 16,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: { fontSize: 20 },
  infoContent: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  infoText: { fontSize: 12, color: "#1E40AF", lineHeight: 16 },

  section: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 16 },

  questionCard: { marginBottom: 16 },
  questionLabel: { fontSize: 14, color: "#374151", marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    textAlignVertical: "top",
    minHeight: 80,
    backgroundColor: "#FFFFFF",
  },

  resourcesCard: {
    margin: 24,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 16,
  },
  resourcesTitle: { fontSize: 14, color: "#166534", marginBottom: 12 },
  resourceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  resourceText: { fontSize: 14, color: "#15803D" },
  resourceArrow: { fontSize: 16, color: "#15803D" },

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
