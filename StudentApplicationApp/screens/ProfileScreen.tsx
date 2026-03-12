import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Screen } from "../App";
import { useNotifications } from "../useNotifications";

interface ProfileScreenProps {
  onNavigate: (screen: Screen, applicationId?: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { isEnabled } = useNotifications();

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>Alexander Duya</Text>
            <Text style={styles.userEmail}>K2363754@kingston.ac.uk</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Personal info")}
              style={[styles.menuRow, styles.menuRowBorder]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <Feather name="user" size={20} color="#596273" />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Personal information</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Privacy settings")}
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <Feather name="lock" size={20} color="#596273" />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Privacy settings</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigate("notification-reminder")}
              style={[styles.menuRow, styles.menuRowBorder]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <Feather name="bell" size={20} color="#596273" />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>
                    Notifications & reminders
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    {isEnabled ? "Gentle reminders" : "No reminders"}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Help & support")}
              style={styles.menuRow}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconWrap}>
                  <Feather name="help-circle" size={20} color="#596273" />
                </View>

                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Help & support</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Terms")}
              style={[styles.menuRow, styles.menuRowBorder]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Terms of service</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => console.log("Privacy policy")}
              style={[styles.menuRow, styles.menuRowBorder]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Privacy policy</Text>
                </View>
              </View>

              <Feather name="chevron-right" size={18} color="#A7AFBC" />
            </TouchableOpacity>

            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>Version 1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  header: {
    backgroundColor: "#14B8A6",
    minHeight: 158,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },

  userName: {
    fontSize: 22,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
  },

  section: {
    marginTop: 24,
    backgroundColor: "#F8FAFC",
  },
  sectionTitle: {
    marginHorizontal: 26,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    letterSpacing: 0.6,
  },
  sectionCard: {
    marginHorizontal: 26,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  menuRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 24,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#273142",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#8A93A2",
    marginTop: 3,
  },
  bottomSpacing: {
    height: 28,
  },
});
