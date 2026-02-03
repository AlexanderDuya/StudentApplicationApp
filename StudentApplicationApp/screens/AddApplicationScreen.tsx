import React, { useState } from "react";
import type { Screen, Workspace } from "../App";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  extractJobDescriptionFromUrl,
  extractRequirementsFromJobDescription,
} from "../lib/gemini";

interface AddApplicationScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  findWorkspaceIdByJobUrl: (jobUrl: string) => string | null;
  createWorkspace: (data: {
    jobUrl?: string;
    company?: string;
    role?: string;
    jobDescription?: string;
  }) => string;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
}

export function AddApplicationScreen({
  onNavigate,
  findWorkspaceIdByJobUrl,
  createWorkspace,
  updateWorkspace,
}: AddApplicationScreenProps) {
  const [jobUrl, setJobUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const [manualMode, setManualMode] = useState(false);
  const [manualJobDescription, setManualJobDescription] = useState("");

  // for duplicates
  const [duplicateWorkspaceId, setDuplicateWorkspaceId] = useState<
    string | null
  >(null);

  const isValidHttpUrl = (value: string) => {
    try {
      const url = new URL(value.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const checkUrlReachable = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        method: "GET",
        signal: controller.signal,
      });
      return res.status >= 200 && res.status < 400;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const createWorkspaceAndGo = (data: {
    jobUrl?: string;
    company?: string;
    role?: string;
    jobDescription?: string;
  }) => {
    const id = createWorkspace(data);
    onNavigate("workspace-overview", id);
    return id;
  };

  const MIN_JD_CHARS = 300;

  const handleCreate = async () => {
    setError(null);
    setDuplicateWorkspaceId(null);

    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();

    if (!trimmedCompany) {
      setError("Please enter a company name to continue.");
      return;
    }

    if (!trimmedRole) {
      setError("Please enter a role name to continue.");
      return;
    }

    if (manualMode) {
      const trimmedJD = manualJobDescription.trim();

      if (!trimmedJD) {
        setError(
          "Please paste the job description so we can create your workspace.",
        );
        return;
      }

      if (trimmedJD.length < MIN_JD_CHARS) {
        setError(
          `Please paste a fuller job description (at least ${MIN_JD_CHARS} characters).`,
        );
        return;
      }

      const id = createWorkspaceAndGo({
        company: trimmedCompany,
        role: trimmedRole,
        jobDescription: trimmedJD,
      });

      try {
        const reqs = await extractRequirementsFromJobDescription(trimmedJD);
        updateWorkspace(id, { requirements: reqs });
        console.log("Saved requirements count:", reqs.length, reqs);
      } catch (e) {
        console.log("Failed to extract requirements:", e);
      }

      return;
    }

    const trimmed = jobUrl.trim();

    if (!trimmed) {
      setError("Please paste a job link to continue.");
      return;
    }

    if (!isValidHttpUrl(trimmed)) {
      setError(
        "That link doesn’t look valid. Please check it, or paste the job description manually instead.",
      );
      return;
    }

    //  DUPLICATE CHECK
    const existingId = findWorkspaceIdByJobUrl(trimmed);
    if (existingId) {
      setDuplicateWorkspaceId(existingId);
      setError("Looks like you’ve already added this job.");
      return;
    }

    setIsChecking(true);
    try {
      const ok = await checkUrlReachable(trimmed);
      if (!ok) {
        setError(
          "We couldn’t access that job link right now. No stress, you can paste the job description manually instead.",
        );
        return;
      }

      const id = createWorkspaceAndGo({
        jobUrl: trimmed,
        company: trimmedCompany,
        role: trimmedRole,
      });

      try {
        const jd = await extractJobDescriptionFromUrl(trimmed);
        updateWorkspace(id, { jobDescription: jd });

        try {
          const reqs = await extractRequirementsFromJobDescription(jd);
          updateWorkspace(id, { requirements: reqs });
          console.log("Saved requirements count:", reqs.length, reqs);
        } catch (e) {
          console.log("❌ Requirements extraction failed:", e);
        }
      } catch (e) {
        console.log("❌ Job description extraction failed:", e);
      }
    } catch {
      setError(
        "We couldn’t reach that link (it might be blocked or offline). You can paste the job description manually instead.",
      );
    } finally {
      setIsChecking(false);
    }
  };

  const canSubmit =
    !isChecking &&
    !!company.trim() &&
    !!role.trim() &&
    (manualMode ? !!manualJobDescription.trim() : !!jobUrl.trim());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Application</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContent}>
          <Text style={styles.description}>
            Add the job posting link and we'll help you break it down into
            manageable steps.
          </Text>

          {!manualMode ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Job posting link <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔗</Text>
                <TextInput
                  value={jobUrl}
                  onChangeText={(v) => {
                    setJobUrl(v);
                    if (error) setError(null);
                    if (duplicateWorkspaceId) setDuplicateWorkspaceId(null);
                  }}
                  placeholder="Input Link"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <Text style={styles.helperText}>
                We'll extract the key requirements automatically
              </Text>

              {error && (
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.errorText}>{error}</Text>

                  {duplicateWorkspaceId ? (
                    <TouchableOpacity
                      onPress={() =>
                        onNavigate("workspace-overview", duplicateWorkspaceId)
                      }
                      style={{ marginTop: 8 }}
                    >
                      <Text style={styles.fallbackLink}>
                        Open existing workspace
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setManualMode(true);
                        setError(null);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      <Text style={styles.fallbackLink}>
                        Paste job description manually instead
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Paste job description <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.manualBox}>
                <TextInput
                  value={manualJobDescription}
                  onChangeText={(v) => {
                    setManualJobDescription(v);
                    if (error) setError(null);
                  }}
                  placeholder="Paste the full job description here…"
                  placeholderTextColor="#9CA3AF"
                  style={styles.manualInput}
                  multiline
                />
              </View>

              {error && (
                <Text style={[styles.errorText, { marginTop: 10 }]}>
                  {error}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => {
                  setManualMode(false);
                  setError(null);
                }}
                style={{ marginTop: 10 }}
              >
                <Text style={styles.fallbackLink}>Use job link instead</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Company name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🏢</Text>
              <TextInput
                value={company}
                onChangeText={(v) => {
                  setCompany(v);
                  if (error) setError(null);
                }}
                placeholder="e.g. Google, Microsoft, Amazon"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Role name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>💼</Text>
              <TextInput
                value={role}
                onChangeText={(v) => {
                  setRole(v);
                  if (error) setError(null);
                }}
                placeholder="e.g. Software Engineer Intern"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>
                  We'll extract key requirements from the job spec
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.bullet} />
                <Text style={styles.infoText}>
                  Create a simple checklist to guide you
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!canSubmit}
          style={[
            styles.primaryButton,
            (!canSubmit || isChecking) && styles.primaryButtonDisabled,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isChecking ? "Checking link..." : "Create workspace"}
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
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111827" },
  headerSpacer: { width: 40 },

  scrollView: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingVertical: 24 },

  description: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },

  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8 },
  required: { color: "#EF4444" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: { fontSize: 20, marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
  },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 8 },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    lineHeight: 18,
  },
  fallbackLink: {
    color: "#14B8A6",
    fontSize: 14,
    fontWeight: "500",
  },
  manualBox: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 140,
  },
  manualInput: {
    fontSize: 14,
    color: "#111827",
    minHeight: 120,
    textAlignVertical: "top",
  },

  infoCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#064E3B",
    marginBottom: 12,
  },
  infoList: { gap: 8 },
  infoItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#14B8A6",
    marginTop: 6,
  },
  infoText: { flex: 1, fontSize: 14, color: "#065F46", lineHeight: 20 },

  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  primaryButton: {
    backgroundColor: "#14B8A6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
