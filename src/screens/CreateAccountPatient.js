import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createAccount } from "../services/authService";

const CreateAccountPatient = ({ navigation }) => {
  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(""); // format YYYY-MM-DD for demo
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState(""); // auto-calc from DOB if provided
  const [profilePhoto, setProfilePhoto] = useState(null); // placeholder

  // Patient-specific fields
  const [height, setHeight] = useState(""); // in cm
  const [weight, setWeight] = useState(""); // in kg
  const [bloodGroup, setBloodGroup] = useState("");
  const [medicalConditions, setMedicalConditions] = useState(""); // comma separated
  const [allergies, setAllergies] = useState(""); // comma separated
  const [activityLevel, setActivityLevel] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState(""); // Veg / Vegan / Non-Veg / Satvik
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dob) {
      // more accurate DOB -> age calculation (YYYY-MM-DD)
      const parts = dob.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const birth = new Date(y, m, d);
        if (!isNaN(birth.getTime())) {
          const today = new Date();
          let calcAge = today.getFullYear() - birth.getFullYear();
          const mDiff = today.getMonth() - birth.getMonth();
          if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) {
            calcAge -= 1;
          }
          setAge(String(calcAge));
        }
      }
    }
  }, [dob]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === "dismissed") return;
    const current = selectedDate || new Date();
    setDob(formatDate(current));
  };

  const handleCreate = async () => {
    // Basic validation
    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      Alert.alert(
        "Error",
        "Please fill all required fields (Name, Mobile, Email, Password)"
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    // Build patient data object
    const patientData = {
      name: fullName,
      fullName: fullName,
      email: email.trim().toLowerCase(),
      mobile,
      password, // Will be used for Firebase auth, not stored in Firestore
      role: "patient",
      gender: gender || null,
      dob: dob || null,
      age: age || null,
      height: height || null,
      weight: weight || null,
      bloodGroup: bloodGroup || null,
      medicalConditions: medicalConditions
        ? medicalConditions.split(",").map((s) => s.trim())
        : [],
      allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
      lifestyle: lifestyle || null,
      dietaryPreference: dietaryPreference || null,
      address: address || null,
      emergencyContact: emergencyContact || null,
      profilePhoto: profilePhoto || null,
    };

    try {
      const result = await createAccount(patientData);

      setLoading(false);

      if (result.success) {
        Alert.alert("Success", "Patient account created successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("PatientLogin"),
          },
        ]);
      } else {
        Alert.alert("Error", result.error || "Failed to create account");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const handleUploadPhoto = () => {
    Alert.alert("Upload Photo", "Photo upload not implemented in demo");
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>Create Patient Account</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={64} color="#667eea" />
            <Text style={styles.title}>Patient Details</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Full name *"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile number *"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* Gender picker */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => setGender(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          {/* Date of Birth - opens native date picker */}
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={dob ? styles.inputText : styles.placeholderText}>
              {dob || "Date of Birth (tap to select)"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob ? new Date(dob) : new Date(1990, 0, 1)}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Age (auto or manual)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.smallButton}
            onPress={handleUploadPhoto}
          >
            <Text style={styles.smallButtonText}>
              {profilePhoto
                ? "Change Profile Photo"
                : "Upload Profile Photo (Optional)"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.subHeading]}>Health & Lifestyle</Text>
          <TextInput
            style={styles.input}
            placeholder="Height (cm)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Weight (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={bloodGroup}
              onValueChange={(itemValue) => setBloodGroup(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Blood Group" value="" />
              <Picker.Item label="A+" value="A+" />
              <Picker.Item label="A-" value="A-" />
              <Picker.Item label="B+" value="B+" />
              <Picker.Item label="B-" value="B-" />
              <Picker.Item label="AB+" value="AB+" />
              <Picker.Item label="AB-" value="AB-" />
              <Picker.Item label="O+" value="O+" />
              <Picker.Item label="O-" value="O-" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Medical Conditions (comma separated)"
            value={medicalConditions}
            onChangeText={setMedicalConditions}
          />
          <TextInput
            style={styles.input}
            placeholder="Allergies (comma separated)"
            value={allergies}
            onChangeText={setAllergies}
          />
          <View style={styles.pickerContainer}>
                <Picker
            selectedValue={activityLevel}
            onValueChange={(itemValue) => setActivityLevel(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Activity Level" value="" />
            <Picker.Item
              label="Sedentary (Little to no exercise)"
              value="Sedentary"
            />
            <Picker.Item
              label="Lightly Active (1-3 days/week)"
              value="Lightly Active"
            />
            <Picker.Item
              label="Moderately Active (3-5 days/week)"
              value="Moderately Active"
            />
            <Picker.Item
              label="Very Active (6-7 days/week)"
              value="Very Active"
            />
            <Picker.Item
              label="Extra Active (Athlete/Physical job)"
              value="Extra Active"
            />
          </Picker>
          </View>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dietaryPreference}
              onValueChange={(itemValue) => setDietaryPreference(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Dietary Preference" value="" />
              <Picker.Item label="Veg" value="Veg" />
              <Picker.Item label="Vegan" value="Vegan" />
              <Picker.Item label="Non-Veg" value="Non-Veg" />
              <Picker.Item label="Satvik" value="Satvik" />
            </Picker>
          </View>

          <Text style={[styles.subHeading]}>Other Info</Text>
          <TextInput
            style={styles.input}
            placeholder="Address (Optional)"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Emergency Contact (Optional)"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 12 },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  cardHeader: {
    alignItems: "center",
    marginBottom: 10,
  },
  backButton: {
    marginLeft: -20,
    position: "absolute",
    left: 20,
    marginTop: 12,
  },
  appTitle: { color: "white", fontSize: 20, fontWeight: "700" },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 6,
    alignItems: "stretch",
    width: "100%",
  },
  title: { fontSize: 18, fontWeight: "700", marginTop: 8, color: "#2b2b5c" },
  subHeading: {
    width: "100%",
    marginTop: 12,
    fontWeight: "700",
    color: "#2b2b5c",
  },
  input: {
    width: "100%",
    height: 52,
    borderWidth: 1,
    borderColor: "#e6e9fb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: "#fbfbff",
    justifyContent: "center",
  },
  dateInput: { paddingVertical: 12 },
  inputText: { color: "#111" },
  placeholderText: { color: "#999" },
  pickerContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#e6e9fb",
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#fbfbff",
    overflow: "hidden",
  },
  picker: { width: "100%", height: 52 },
  button: {
    backgroundColor: "#6b4697",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: { color: "white", fontWeight: "700" },
  smallButton: {
    marginTop: 10,
    backgroundColor: "#677be5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  smallButtonText: { color: "#fff" },
});

export default CreateAccountPatient;
