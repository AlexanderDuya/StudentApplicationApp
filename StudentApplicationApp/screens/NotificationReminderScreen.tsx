import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Screen } from "../App";
import { useNotifications, NotificationInterval } from "../useNotifications";

interface NotificationReminderScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function NotificationReminderScreen({
  onNavigate,
}: NotificationReminderScreenProps) {
  const {
    isEnabled,
    interval,
    customDays,
    toggleNotifications,
    updateInterval,
  } = useNotifications();

  const [customDaysInput, setCustomDaysInput] = useState(customDays.toString());

  const selectedInterval = isEnabled ? interval : null;

  const handleCustomDaysChange = (text: string) => {
    setCustomDaysInput(text);
    const days = parseInt(text, 10);

    if (!isNaN(days) && days > 0 && days <= 365) {
      updateInterval("custom", days);
    }
  };

  const handleIntervalSelect = (selectedInterval: NotificationInterval) => {
    if (!isEnabled) return;

    if (selectedInterval === "custom") {
      const days = parseInt(customDaysInput, 10);
      if (!isNaN(days) && days > 0) {
        updateInterval(selectedInterval, days);
      } else {
        updateInterval(selectedInterval, customDays);
      }
    } else {
      updateInterval(selectedInterval);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onNavigate("profile")}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={20} color="#374151" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Reminders</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Reminder frequency</Text>
          <Text style={styles.sectionDescription}>
            Choose whether you'd like gentle nudges. These are supportive
            reminders, there is no pressure.
          </Text>

          <TouchableOpacity
            style={[styles.optionCard, isEnabled && styles.optionCardActive]}
            onPress={() => toggleNotifications(!isEnabled)}
            activeOpacity={0.7}
          >
            <View style={styles.optionHeader}>
              <View style={styles.iconWrap}>
                <Feather name="bell" size={20} color="#596273" />
              </View>

              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Gentle reminders</Text>
                <Text style={styles.optionDescription}>
                  Friendly nudges to help you keep progressing with your
                  applications.
                </Text>
              </View>

              <Switch
                value={isEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: "#E5E7EB", true: "#14B8A6" }}
                thumbColor={isEnabled ? "#FFFFFF" : "#9CA3AF"}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </TouchableOpacity>

          <View style={styles.intervalSection}>
            <Text style={styles.sectionTitle}>Reminder interval</Text>
            <Text style={styles.sectionDescription}>
              Choose how often you’d like to receive reminders.
            </Text>

            <TouchableOpacity
              style={[
                styles.intervalCard,
                !isEnabled && styles.intervalCardDisabled,
                selectedInterval === "12hours" && styles.intervalCardActive,
              ]}
              onPress={() => handleIntervalSelect("12hours")}
              activeOpacity={0.7}
              disabled={!isEnabled}
            >
              <View style={styles.intervalContent}>
                <Text style={styles.intervalLabel}>Every 12 hours</Text>
                <Text style={styles.intervalSubtext}>
                  Morning and evening reminders
                </Text>
              </View>

              {selectedInterval === "12hours" && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.intervalCard,
                !isEnabled && styles.intervalCardDisabled,
                selectedInterval === "24hours" && styles.intervalCardActive,
              ]}
              onPress={() => handleIntervalSelect("24hours")}
              activeOpacity={0.7}
              disabled={!isEnabled}
            >
              <View style={styles.intervalContent}>
                <Text style={styles.intervalLabel}>Every 24 hours</Text>
                <Text style={styles.intervalSubtext}>A daily reminder</Text>
              </View>

              {selectedInterval === "24hours" && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.intervalCard,
                !isEnabled && styles.intervalCardDisabled,
                selectedInterval === "custom" && styles.intervalCardActive,
              ]}
              onPress={() => handleIntervalSelect("custom")}
              activeOpacity={0.7}
              disabled={!isEnabled}
            >
              <View style={styles.intervalContent}>
                <View style={styles.customIntervalRow}>
                  <Text style={styles.intervalLabel}>Every</Text>

                  <TextInput
                    style={[
                      styles.customInput,
                      !isEnabled && styles.customInputDisabled,
                    ]}
                    value={customDaysInput}
                    onChangeText={handleCustomDaysChange}
                    keyboardType="number-pad"
                    maxLength={3}
                    placeholder="3"
                    placeholderTextColor="#9CA3AF"
                    editable={isEnabled}
                  />

                  <Text style={styles.intervalLabel}>days</Text>
                </View>

                <Text style={styles.intervalSubtext}>Set your own pace</Text>
              </View>

              {selectedInterval === "custom" && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  optionCardActive: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 24,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },

  intervalSection: {
    marginBottom: 8,
  },

  intervalCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  intervalCardActive: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  intervalCardDisabled: {
    opacity: 0.5,
  },
  intervalContent: {
    flex: 1,
  },
  intervalLabel: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  intervalSubtext: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "600",
    color: "#14B8A6",
    marginLeft: 12,
  },

  customIntervalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  customInput: {
    minWidth: 35,
    marginHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#111827",
    textAlign: "center",
  },
  customInputDisabled: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },
});
