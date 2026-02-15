import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import type { Screen, Workspace } from "../App";

interface ApplicationLibraryScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  workspaces: Workspace[];
  onEditVersion: (rootWorkspaceId: string, versionId: string) => void;
}

export function ApplicationLibraryScreen({
  onNavigate,
  workspaces,
  onEditVersion,
}: ApplicationLibraryScreenProps) {
  const items = useMemo(() => {
    const roots = workspaces.filter((w) => !w.isSnapshot);

    const flat = roots.flatMap((w) =>
      (w.versions ?? []).map((v) => ({
        version: v,
        rootWorkspaceId: w.id,
        company: w.company ?? "Company not set",
        role: w.role ?? "Role not set",
      }))
    );

    return flat.sort((a, b) => b.version.createdAt - a.version.createdAt);
  }, [workspaces]);

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleDateString();
    } catch {
      return "—";
    }
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
          items.map((item) => (
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
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.exportBtn}
                  onPress={() =>
                    Alert.alert(
                      "Export",
                      "Static export for now (hook up PDF/DOCX later)."
                    )
                  }
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
          ))
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
