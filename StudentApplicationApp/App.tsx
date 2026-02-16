import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { HomeScreen } from "./screens/HomeScreen";
import { AddApplicationScreen } from "./screens/AddApplicationScreen";
import { WorkspaceOverviewScreen } from "./screens/WorkspaceOverviewScreen";
import { JobSpecBreakdownScreen } from "./screens/JobSpecBreakdownScreen";
import { JobSpecDescriptionScreen } from "./screens/JobSpecDescriptionScreen";
import { EvidenceMapperScreen } from "./screens/EvidenceMapperScreen";
import { TailorCVScreen } from "./screens/TailorCVScreen";
import { TailorCoverLetterScreen } from "./screens/TailorCLScreen";
import { CompanyResearchScreen } from "./screens/CompanyResearchScreen";
import { ApplicationLibraryScreen } from "./screens/TailoredApplicationScreen";
import { ProgressCompetencyScreen } from "./screens/CompetencyProgressScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

export type Screen =
  | "home"
  | "add-application"
  | "progress-competency"
  | "community"
  | "profile"
  | "workspace-overview"
  | "job-spec-breakdown"
  | "job-spec-description"
  | "evidence-mapper"
  | "tailor-cv"
  | "tailor-cover-letter"
  | "company-research"
  | "application-library";

export type RequirementType = "must-have" | "nice-to-have";

export type Requirement = {
  id: string;
  title: string;
  type: RequirementType;
  category: string;
};

export type CompanyResearchNotes = {
  whatDoesCompanyDo?: string;
  recentNews?: string;
  cultureValues?: string;
  whyWorkHere?: string;
};

export type EvidenceInputs = {
  situation: string;
  task: string;
  action: string;
  result: string;
};

export type EvidenceByReq = Record<string, EvidenceInputs>;

export type ApplicationVersion = {
  id: string;
  name: string;
  createdAt: number;
  jobUrl?: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  requirements?: Requirement[];
  companyResearch?: CompanyResearchNotes;
  cvBullets?: string[];
  coverLetter?: string;
  evidenceByReq?: EvidenceByReq;
};

export type Workspace = {
  id: string;
  rootId?: string; //version for the application
  isSnapshot?: boolean;
  jobUrl?: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  requirements?: Requirement[];
  companyResearch?: CompanyResearchNotes;
  cvBullets?: string[];
  coverLetter?: string;
  evidenceByReq?: EvidenceByReq;
  versions?: ApplicationVersion[]; // if root it may have versions
  createdAt: number;
};

const normaliseJobUrl = (url: string) => url.trim().toLowerCase();
const WORKSPACES_STORAGE_KEY = "workspaces:v1";
const LAST_WORKSPACE_ID_KEY = "lastWorkspaceId:v1";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// prevent versions from having same ref, making copy
const deepClone = <T,>(value: T): T => {
  try {
    if (typeof globalThis.structuredClone === "function") {
      return globalThis.structuredClone(value);
    }
  } catch {}
  return JSON.parse(JSON.stringify(value)) as T;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const updateWorkspace = (id: string, patch: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    );
  };

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [rawWorkspaces, lastId] = await Promise.all([
          AsyncStorage.getItem(WORKSPACES_STORAGE_KEY),
          AsyncStorage.getItem(LAST_WORKSPACE_ID_KEY),
        ]);

        if (rawWorkspaces) {
          const parsed = JSON.parse(rawWorkspaces) as Workspace[];
          setWorkspaces(parsed);
        }

        if (lastId) {
          setSelectedApplicationId(lastId);
        }
      } catch (e) {
        console.log("Hydration error:", e);
      } finally {
        setIsHydrated(true);
      }
    };

    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(
      WORKSPACES_STORAGE_KEY,
      JSON.stringify(workspaces),
    );
  }, [workspaces, isHydrated]);

  const findWorkspaceIdByJobUrl = (jobUrl: string) => {
    const target = normaliseJobUrl(jobUrl);
    const found = workspaces.find(
      (w) => w.jobUrl && normaliseJobUrl(w.jobUrl) === target,
    );
    return found?.id ?? null;
  };

  const createWorkspace = (data: {
    jobUrl?: string;
    company?: string;
    role?: string;
    jobDescription?: string;
  }) => {
    if (data.jobUrl) {
      const existingId = findWorkspaceIdByJobUrl(data.jobUrl);
      if (existingId) return existingId;
    }

    const now = Date.now();
    const id = makeId();

    setWorkspaces((prev) => [
      ...prev,
      {
        id,
        rootId: id,
        isSnapshot: false,
        createdAt: now,
        ...data,
        versions: [],
      },
    ]);

    return id;
  };

  const createWorkspaceFromVersion = (
    rootWorkspaceId: string,
    versionId: string,
  ) => {
    const root = workspaces.find((w) => w.id === rootWorkspaceId);
    if (!root) return null;

    const version = (root.versions ?? []).find((v) => v.id === versionId);
    if (!version) return null;

    const now = Date.now();
    const newId = makeId();

    const cloned: Workspace = {
      id: newId,
      rootId: root.rootId ?? root.id,
      isSnapshot: true,
      createdAt: now,
      jobUrl: version.jobUrl ?? root.jobUrl,
      company: version.company ?? root.company,
      role: version.role ?? root.role,
      jobDescription: version.jobDescription ?? root.jobDescription,
      requirements: deepClone(version.requirements ?? root.requirements ?? []),
      companyResearch: deepClone(
        version.companyResearch ?? root.companyResearch,
      ),
      cvBullets: deepClone(version.cvBullets ?? root.cvBullets ?? []),
      coverLetter: version.coverLetter ?? root.coverLetter ?? "",
      evidenceByReq: deepClone(
        version.evidenceByReq ?? root.evidenceByReq ?? {},
      ),
      versions: undefined,
    };

    setWorkspaces((prev) => [...prev, cloned]);
    return newId;
  };

  const clearAllApplications = async () => {
    try {
      const checklistKeys = workspaces.map(
        (w) => `workspace:${w.id}:checklistSteps`,
      );

      await AsyncStorage.multiRemove([
        WORKSPACES_STORAGE_KEY,
        LAST_WORKSPACE_ID_KEY,
        ...checklistKeys,
      ]);
    } catch (e) {
      console.log("Clear error:", e);
    } finally {
      setWorkspaces([]);
      setSelectedApplicationId(null);
      setCurrentScreen("home");
    }
  };

  const navigate = (screen: Screen, applicationId?: string) => {
    setCurrentScreen(screen);

    if (applicationId) {
      setSelectedApplicationId(applicationId);

      if (screen === "workspace-overview") {
        void AsyncStorage.setItem(LAST_WORKSPACE_ID_KEY, applicationId);
      }
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen
            onNavigate={navigate}
            workspaces={workspaces}
            onClearAll={clearAllApplications}
          />
        );

      case "add-application":
        return (
          <AddApplicationScreen
            onNavigate={navigate}
            findWorkspaceIdByJobUrl={findWorkspaceIdByJobUrl}
            createWorkspace={createWorkspace}
            updateWorkspace={updateWorkspace}
          />
        );

      case "progress-competency":
        return <ProgressCompetencyScreen onNavigate={navigate} />;

      case "community":
        return <CommunityScreen />;

      case "profile":
        return <ProfileScreen />;

      case "workspace-overview": {
        if (!selectedApplicationId) {
          return (
            <AddApplicationScreen
              onNavigate={navigate}
              findWorkspaceIdByJobUrl={findWorkspaceIdByJobUrl}
              createWorkspace={createWorkspace}
              updateWorkspace={updateWorkspace}
            />
          );
        }

        const ws = workspaces.find((w) => w.id === selectedApplicationId);

        return (
          <WorkspaceOverviewScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            company={ws?.company}
            role={ws?.role}
          />
        );
      }

      case "job-spec-breakdown": {
        const ws = selectedApplicationId
          ? workspaces.find((w) => w.id === selectedApplicationId)
          : undefined;

        return (
          <JobSpecBreakdownScreen
            onNavigate={navigate}
            jobDescription={ws?.jobDescription}
            requirements={ws?.requirements}
            company={ws?.company}
            role={ws?.role}
          />
        );
      }

      case "job-spec-description": {
        const ws = selectedApplicationId
          ? workspaces.find((w) => w.id === selectedApplicationId)
          : undefined;

        return (
          <JobSpecDescriptionScreen
            onNavigate={navigate}
            jobDescription={ws?.jobDescription}
            company={ws?.company}
            role={ws?.role}
          />
        );
      }

      case "evidence-mapper": {
        if (!selectedApplicationId) {
          return (
            <HomeScreen
              onNavigate={navigate}
              workspaces={workspaces}
              onClearAll={clearAllApplications}
            />
          );
        }

        const ws = workspaces.find((w) => w.id === selectedApplicationId);

        return (
          <EvidenceMapperScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            requirements={ws?.requirements ?? []}
            initialEvidenceByReq={ws?.evidenceByReq ?? {}}
            onSaveEvidenceByReq={(id, evidenceByReq) =>
              updateWorkspace(id, { evidenceByReq })
            }
          />
        );
      }

      case "tailor-cv": {
        if (!selectedApplicationId) {
          return (
            <HomeScreen
              onNavigate={navigate}
              workspaces={workspaces}
              onClearAll={clearAllApplications}
            />
          );
        }

        const ws = workspaces.find((w) => w.id === selectedApplicationId);

        return (
          <TailorCVScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            company={ws?.company ?? ""}
            role={ws?.role ?? ""}
            jobDescription={ws?.jobDescription}
            initialBullets={ws?.cvBullets ?? []}
            onSaveBullets={(id, bulletPoints) =>
              updateWorkspace(id, { cvBullets: bulletPoints })
            }
          />
        );
      }

      case "company-research": {
        if (!selectedApplicationId) {
          return (
            <HomeScreen
              onNavigate={navigate}
              workspaces={workspaces}
              onClearAll={clearAllApplications}
            />
          );
        }

        const ws = workspaces.find((w) => w.id === selectedApplicationId);

        return (
          <CompanyResearchScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            company={ws?.company ?? ""}
            role={ws?.role ?? ""}
            initialNotes={ws?.companyResearch}
            updateWorkspace={updateWorkspace}
          />
        );
      }

      case "tailor-cover-letter": {
        if (!selectedApplicationId) {
          return (
            <HomeScreen
              onNavigate={navigate}
              workspaces={workspaces}
              onClearAll={clearAllApplications}
            />
          );
        }

        const ws = workspaces.find((w) => w.id === selectedApplicationId);
        const rootId = ws?.rootId ?? ws?.id;
        const root = rootId
          ? workspaces.find((x) => x.id === rootId)
          : undefined;

        const nextVersionNumber = (root?.versions?.length ?? 0) + 1;

        return (
          <TailorCoverLetterScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            company={ws?.company ?? ""}
            role={ws?.role ?? ""}
            jobDescription={ws?.jobDescription}
            bulletPoints={ws?.cvBullets ?? []}
            initialCoverLetter={ws?.coverLetter ?? ""}
            nextVersionNumber={nextVersionNumber}
            onSaveNamedVersion={(workspaceId, versionName, coverLetterText) => {
              setWorkspaces((prev) =>
                prev.map((w) => {
                  const current = prev.find((x) => x.id === workspaceId);
                  const rootId = current?.rootId ?? current?.id;
                  if (w.id !== rootId) return w;

                  const now = Date.now();
                  const version: ApplicationVersion = {
                    id: makeId(),
                    name: versionName.trim(),
                    createdAt: now,
                    jobUrl: current?.jobUrl ?? w.jobUrl,
                    company: current?.company ?? w.company,
                    role: current?.role ?? w.role,
                    jobDescription: current?.jobDescription ?? w.jobDescription,
                    requirements: deepClone(
                      current?.requirements ?? w.requirements ?? [],
                    ),
                    companyResearch: deepClone(
                      current?.companyResearch ?? w.companyResearch,
                    ),
                    cvBullets: deepClone(
                      current?.cvBullets ?? w.cvBullets ?? [],
                    ),
                    coverLetter: coverLetterText,
                    evidenceByReq: deepClone(
                      current?.evidenceByReq ?? w.evidenceByReq ?? {},
                    ),
                  };

                  return {
                    ...w,
                    coverLetter: coverLetterText,
                    versions: [...(w.versions ?? []), version],
                  };
                }),
              );
            }}
          />
        );
      }

      case "application-library":
        return (
          <ApplicationLibraryScreen
            onNavigate={navigate}
            workspaces={workspaces}
            onEditVersion={(rootWorkspaceId, versionId) => {
              const newId = createWorkspaceFromVersion(
                rootWorkspaceId,
                versionId,
              );
              if (!newId) return;
              navigate("workspace-overview", newId);
            }}
          />
        );

      default:
        return (
          <HomeScreen
            onNavigate={navigate}
            workspaces={workspaces}
            onClearAll={clearAllApplications}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.screenContainer}>{renderScreen()}</View>

          <View style={styles.bottomNav}>
            <TouchableOpacity
              onPress={() => navigate("home")}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "home" && styles.navIconActive,
                ]}
              >
                🏠
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "home" && styles.navTextActive,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("add-application")}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "add-application" && styles.navIconActive,
                ]}
              >
                ➕
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "add-application" && styles.navTextActive,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("progress-competency")}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "progress-competency" &&
                    styles.navIconActive,
                ]}
              >
                📈
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "progress-competency" &&
                    styles.navTextActive,
                ]}
              >
                Progress
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("community")}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "community" && styles.navIconActive,
                ]}
              >
                💬
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "community" && styles.navTextActive,
                ]}
              >
                Community
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate("profile")}
              style={styles.navButton}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "profile" && styles.navIconActive,
                ]}
              >
                👤
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "profile" && styles.navTextActive,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { flex: 1 },
  screenContainer: { flex: 1 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    paddingBottom: 4,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  navIcon: { fontSize: 22, marginBottom: 2, opacity: 0.6 },
  navIconActive: { opacity: 1 },
  navText: { fontSize: 10, color: "#9CA3AF", marginTop: 2 },
  navTextActive: { color: "#14B8A6", fontWeight: "600" },
});
