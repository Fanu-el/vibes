import { StyleSheet, Text, View } from "react-native";
import { BaseToast, ErrorToast } from "react-native-toast-message";


export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.successIconContainer}>
          <Text style={styles.icon}>✓</Text>
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.errorIconContainer}>
          <Text style={styles.icon}>✕</Text>
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
      renderLeadingIcon={() => (
        <View style={styles.infoIconContainer}>
          <Text style={styles.icon}>ℹ</Text>
        </View>
      )}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: "#10B981",
    borderLeftWidth: 5,
    backgroundColor: "#1E293B",
    height: "auto",
    minHeight: 60,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  errorToast: {
    borderLeftColor: "#EF4444",
    borderLeftWidth: 5,
    backgroundColor: "#1E293B",
    height: "auto",
    minHeight: 60,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  infoToast: {
    borderLeftColor: "#14B8A6",
    borderLeftWidth: 5,
    backgroundColor: "#1E293B",
    height: "auto",
    minHeight: 60,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  text1: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F1F5F9",
    marginBottom: 2,
  },
  text2: {
    fontSize: 13,
    fontWeight: "400",
    color: "#CBD5E1",
    lineHeight: 18,
  },
  successIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  errorIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#14B8A6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  icon: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
