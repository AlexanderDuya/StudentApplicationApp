import React from "react";
import { View, Text } from "react-native";
import type { Screen } from "./HomeScreen";

export interface AddApplicationScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function AddApplicationScreen({
  onNavigate,
}: AddApplicationScreenProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>This is the add application screen</Text>
    </View>
  );
}
