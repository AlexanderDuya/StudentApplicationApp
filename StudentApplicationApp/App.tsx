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

export type Screen =
  | "home"
  | "add-application"
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

export type Workspace = {
  id: string;
  jobUrl?: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  requirements?: Requirement[];
  companyResearch?: CompanyResearchNotes;
  createdAt: number;
};

export type CompanyResearchNotes = {
  whatDoesCompanyDo?: string;
  recentNews?: string;
  cultureValues?: string;
  whyWorkHere?: string;
};

const normalizeJobUrl = (url: string) => url.trim().toLowerCase();
const WORKSPACES_STORAGE_KEY = "workspaces:v1";
const LAST_WORKSPACE_ID_KEY = "lastWorkspaceId:v1";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  // local storage for now
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const updateWorkspace = (id: string, patch: Partial<Workspace>) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    );
  };
  const goJobSpec = () => {
    if (!selectedApplicationId) {
      navigate("add-application");
      return;
    }
    navigate("job-spec-breakdown", selectedApplicationId);
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

          console.log("Hydrated workspaces:", parsed.length);
        }

        if (lastId) {
          setSelectedApplicationId(lastId);

          console.log("Hydrated lastWorkspaceId:", lastId);
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

    console.log("Saved workspaces:", workspaces.length);
  }, [workspaces, isHydrated]);
  const findWorkspaceIdByJobUrl = (jobUrl: string) => {
    const target = normalizeJobUrl(jobUrl);
    const found = workspaces.find(
      (w) => w.jobUrl && normalizeJobUrl(w.jobUrl) === target,
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
    const id = String(now);

    setWorkspaces((prev) => [
      ...prev,
      {
        id,
        createdAt: now,
        ...data,
      },
    ]);

    return id;
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

      console.log("Cleared all applications and checklist progress");
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

        console.log("Set lastWorkspaceId:", applicationId);
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

        return (
          <TailorCoverLetterScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId}
            company={ws?.company ?? ""}
            role={ws?.role ?? ""}
            jobDescription={ws?.jobDescription}
          />
        );
      }
      case "application-library": {
        return <ApplicationLibraryScreen onNavigate={navigate} />;
      }

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

  const goWorkspace = () => {
    if (!selectedApplicationId) {
      navigate("add-application");
      return;
    }
    navigate("workspace-overview", selectedApplicationId);
  };
  // using emojis from now, will need to replace with suitable icons later
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

            <TouchableOpacity onPress={goWorkspace} style={styles.navButton}>
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "workspace-overview" &&
                    styles.navIconActive,
                ]}
              >
                🗂️
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "workspace-overview" &&
                    styles.navTextActive,
                ]}
              >
                Workspace
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={goJobSpec} style={styles.navButton}>
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "job-spec-breakdown" &&
                    styles.navIconActive,
                ]}
              >
                🧾
              </Text>
              <Text
                style={[
                  styles.navText,
                  currentScreen === "job-spec-breakdown" &&
                    styles.navTextActive,
                ]}
              >
                Job Spec
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
  navIcon: {
    fontSize: 22,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: { opacity: 1 },
  navText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  navTextActive: {
    color: "#14B8A6",
    fontWeight: "600",
  },
});
