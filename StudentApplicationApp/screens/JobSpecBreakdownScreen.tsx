import React from "react";
import { View, Text } from "react-native";
import type { Screen } from "./HomeScreen";

export interface JobSpecBreakdownScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function JobSpecBreakdownScreen({
  onNavigate,
}: JobSpecBreakdownScreenProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>This is the job spec breakdown screen</Text>
    </View>
  );
}
