import React, { useState } from "react";
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

type Screen =
  | "home"
  | "add-application"
  | "workspace-overview"
  | "job-spec-breakdown";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const navigate = (screen: Screen, applicationId?: string) => {
    setCurrentScreen(screen);
    if (applicationId) setSelectedApplicationId(applicationId);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onNavigate={navigate} />;

      case "add-application":
        return <AddApplicationScreen onNavigate={navigate} />;

      case "workspace-overview":
        return (
          <WorkspaceOverviewScreen
            onNavigate={navigate}
            applicationId={selectedApplicationId || "1"}
          />
        );

      case "job-spec-breakdown":
        return <JobSpecBreakdownScreen onNavigate={navigate} />;

      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  const goWorkspace = () =>
    navigate("workspace-overview", selectedApplicationId || "1");

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

            <TouchableOpacity
              onPress={() => navigate("job-spec-breakdown")}
              style={styles.navButton}
            >
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
  navIconActive: {
    opacity: 1,
  },
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
