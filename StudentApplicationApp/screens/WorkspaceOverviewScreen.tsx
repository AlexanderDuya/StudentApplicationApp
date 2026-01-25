import React from "react";
import { View, Text } from "react-native";
import type { Screen } from "./HomeScreen";

export interface WorkspaceOverviewScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
  applicationId: string;
}

export function WorkspaceOverviewScreen({
  onNavigate,
  applicationId,
}: WorkspaceOverviewScreenProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>This is the workspace overview screen</Text>
      <Text>applicationId: {applicationId}</Text>
    </View>
  );
}
