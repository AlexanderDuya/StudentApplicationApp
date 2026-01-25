import React from "react";
import { View, Text } from "react-native";

export type Screen =
  | "home"
  | "add-application"
  | "workspace-overview"
  | "job-spec-breakdown";

export interface HomeScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>This is the home screen</Text>
    </View>
  );
}
