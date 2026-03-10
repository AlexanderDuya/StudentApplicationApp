import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Screen, Workspace, ApplicationVersion } from "../App";
import { strengthStorageKey, type StrengthResult } from "../lib/gemini";

interface ApplicationLibraryScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  workspaces: Workspace[];
  rootApplicationId?: string;
  onEditVersion: (rootWorkspaceId: string, versionId: string) => void;
}

const buildHtml = (version: ApplicationVersion) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body>
  <div style="page-break-after: always;">
    <h1 style="font-size:24px; font-weight:700; margin:0 0 12px 0;">Research</h1>
    <div style="white-space: pre-wrap; font-size:14px;">
What does the company do?
${version.companyResearch?.whatDoesCompanyDo ?? "Not Completed Yet"}

Recent news / developments
${version.companyResearch?.recentNews ?? "Not Completed Yet"}

Culture & values
${version.companyResearch?.cultureValues ?? "Not Completed Yet"}

Why work here?
${version.companyResearch?.whyWorkHere ?? "Not Completed Yet"}
    </div>
  </div>

  <div style="page-break-after: always;">
    <h1 style="font-size:24px; font-weight:700; margin:0 0 12px 0;">CV</h1>
    <div style="white-space: pre-wrap; font-size:14px;">
${(version.cvBullets?.length ?? 0) > 0 ? version.cvBullets!.join("\n") : "Not Completed Yet"}
    </div>
  </div>

  <div>
    <h1 style="font-size:24px; font-weight:700; margin:0 0 12px 0;">Cover Letter</h1>
    <div style="white-space: pre-wrap; font-size:14px;">
${version.coverLetter?.trim() ? version.coverLetter : "Not Completed Yet"}
    </div>
  </div>
</body>
</html>`;

const getMissingSections = (version: ApplicationVersion) => {
  const missing: string[] = [];

  const r = version.companyResearch;
  const researchComplete =
    !!r?.whatDoesCompanyDo?.trim() ||
    !!r?.recentNews?.trim() ||
    !!r?.cultureValues?.trim() ||
    !!r?.whyWorkHere?.trim();

  const cvComplete = (version.cvBullets?.length ?? 0) > 0;
  const coverComplete = !!version.coverLetter?.trim();

  if (!researchComplete) missing.push("Research");
  if (!cvComplete) missing.push("CV");
  if (!coverComplete) missing.push("Cover Letter");

  return missing;
};

const buildPlainText = (version: ApplicationVersion) => {
  const r = version.companyResearch;

  const research = `Research
What does the company do?
${r?.whatDoesCompanyDo?.trim() || "Not Completed Yet"}

Recent news / developments
${r?.recentNews?.trim() || "Not Completed Yet"}

Culture & values
${r?.cultureValues?.trim() || "Not Completed Yet"}

Why work here?
${r?.whyWorkHere?.trim() || "Not Completed Yet"}`;

  const cv = `CV
${
  (version.cvBullets?.length ?? 0) > 0
    ? version.cvBullets!.join("\n")
    : "Not Completed Yet"
}`;

  const cover = `Cover Letter
${version.coverLetter?.trim() || "Not Completed Yet"}`;

  return `${research}\n\n---\n\n${cv}\n\n---\n\n${cover}\n`;
};

// using docs expo
const exportPdf = async (version: ApplicationVersion) => {
  /*
  throw new Error(
    "Testing error: forcing export to fail so clipboard fallback shows.",
  );
  */

  const html = buildHtml(version);
  const { uri } = await Print.printToFileAsync({ html });
  await shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
};

export function ApplicationLibraryScreen({
  onNavigate,
  workspaces,
  rootApplicationId,
  onEditVersion,
}: ApplicationLibraryScreenProps) {
  const [strengthScores, setStrengthScores] = useState<Record<string, number>>(
    {},
  );

  const items = useMemo(() => {
    const roots = workspaces.filter((workspace) => {
      if (workspace.isSnapshot) return false;
      if (rootApplicationId) return workspace.id === rootApplicationId;
      return true;
    });

    const flat = roots.flatMap((rootApplication) =>
      (rootApplication.versions ?? []).map((savedVersion) => ({
        version: savedVersion,
        rootWorkspaceId: rootApplication.id,
        company: rootApplication.company ?? "Company not set",
        role: rootApplication.role ?? "Role not set",
      })),
    );

    return flat.sort((a, b) => b.version.createdAt - a.version.createdAt);
  }, [workspaces, rootApplicationId]);

  useEffect(() => {
    const loadAllVersionScores = async () => {
      const rootApplications = workspaces.filter((workspace) => {
        if (workspace.isSnapshot) return false;
        if (rootApplicationId) return workspace.id === rootApplicationId;
        return true;
      });

      const versionScores: Record<string, number> = {};

      await Promise.all(
        rootApplications.flatMap((rootApplication) =>
          (rootApplication.versions ?? []).map(async (savedVersion) => {
            try {
              const rawStoredScore = await AsyncStorage.getItem(
                strengthStorageKey(savedVersion.id),
              );
              if (rawStoredScore) {
                const parsedScore = JSON.parse(
                  rawStoredScore,
                ) as StrengthResult;
                versionScores[savedVersion.id] = parsedScore.overall;
              }
            } catch {
              // Ignore for now
            }
          }),
        ),
      );

      setStrengthScores(versionScores);
    };

    void loadAllVersionScores();
  }, [workspaces, rootApplicationId]);

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString();
    } catch {
      return "—";
    }
  };

  const strengthBadgeStyle = (score: number) => {
    if (score >= 75) return styles.strengthTagStrong;
    if (score >= 45) return styles.strengthTagGood;
    return styles.strengthTagWeak;
  };

  const handleExport = async (version: ApplicationVersion) => {
    const missing = getMissingSections(version);

    const doExport = async () => {
      try {
        await exportPdf(version);
      } catch (e: any) {
        Alert.alert("Export failed", e?.message ?? "Could not export PDF.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Copy to clipboard",
            onPress: async () => {
              try {
                await Clipboard.setStringAsync(buildPlainText(version));
                Alert.alert(
                  "Copied",
                  "Your Research, CV and Cover Letter were copied.",
                );
              } catch {
                Alert.alert("Copy failed", "Could not copy to clipboard.");
              }
            },
          },
        ]);
      }
    };

    if (missing.length > 0) {
      Alert.alert(
        "Application Incomplete",
        `Before exporting, please complete:\n\n• ${missing.join("\n• ")} \n\nfor a stronger application`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Export anyway", onPress: doExport },
        ],
      );
      return;
    }

    await doExport();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Library</Text>
        <Text style={styles.headerSubtitle}>Saved versions</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ padding: 24 }}
      >
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No saved versions yet.</Text>
        ) : (
          items.map((item) => {
            const score = strengthScores[item.version.id];
            const hasScore = score !== undefined;

            return (
              <View key={item.version.id} style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.company}>{item.version.name}</Text>
                  <Text style={styles.role}>
                    {item.company} • {item.role}
                  </Text>
                  <Text style={styles.meta}>
                    Saved: {formatDate(item.version.createdAt)}
                  </Text>

                  <View style={styles.tagsRow}>
                    <Text
                      style={[
                        styles.tag,
                        item.version.companyResearch
                          ? styles.tagOn
                          : styles.tagOff,
                      ]}
                    >
                      Research {item.version.companyResearch ? "✓" : "—"}
                    </Text>

                    <Text
                      style={[
                        styles.tag,
                        (item.version.cvBullets?.length ?? 0) > 0
                          ? styles.tagOn
                          : styles.tagOff,
                      ]}
                    >
                      CV {(item.version.cvBullets?.length ?? 0) > 0 ? "✓" : "—"}
                    </Text>

                    <Text
                      style={[
                        styles.tag,
                        item.version.coverLetter?.trim()
                          ? styles.tagOn
                          : styles.tagOff,
                      ]}
                    >
                      CL {item.version.coverLetter?.trim() ? "✓" : "—"}
                    </Text>

                    {hasScore && (
                      <Text style={[styles.tag, strengthBadgeStyle(score)]}>
                        Strength Score {score}%
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.exportBtn}
                    onPress={() => handleExport(item.version)}
                  >
                    <Text style={styles.exportText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      onEditVersion(item.rootWorkspaceId, item.version.id)
                    }
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
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
  headerTitle: { fontSize: 20, color: "#111827" },
  headerSubtitle: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  scrollView: { flex: 1 },
  emptyText: { color: "#6B7280", fontSize: 14 },

  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },

  company: { fontSize: 16, color: "#111827", marginBottom: 2 },
  role: { fontSize: 13, color: "#6B7280", marginBottom: 6 },
  meta: { fontSize: 12, color: "#9CA3AF" },

  tagsRow: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  tag: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagOn: { backgroundColor: "#CCFBF1", color: "#115E59" },
  tagOff: { backgroundColor: "#F3F4F6", color: "#6B7280" },

  strengthTagStrong: { backgroundColor: "#DCFCE7", color: "#166534" },
  strengthTagGood: { backgroundColor: "#FEF3C7", color: "#854D0E" },
  strengthTagWeak: { backgroundColor: "#FFE4E6", color: "#9F1239" },

  actions: { justifyContent: "center", gap: 10 },
  exportBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  exportText: { color: "#111827", fontSize: 12, fontWeight: "600" },

  editBtn: {
    backgroundColor: "#14B8A6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  editText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
