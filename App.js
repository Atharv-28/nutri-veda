import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// screens
import LoginScreen from './src/screens/LoginScreen';
import SelectDoctorScreen from './src/screens/SelectDoctorScreen';
import DoctorDashboardScreen from './src/screens/DoctorDashboardScreen';
import PatientDashboardScreen from './src/screens/PatientDashboardScreen';
import PrakrutiTestScreen from './src/screens/PrakrutiTestScreen';
import DietPlanScreen from './src/screens/DietPlanScreen';
import EditDietPlanScreen from './src/screens/EditDietPlanScreen';
import DoctorLoginScreen from './src/screens/DoctorLoginScreen';
import PatientLoginScreen from './src/screens/PatientLoginScreen';
import DoctorCreateAccount from './src/screens/CreateAccountDoctor';
import PatientCreateAccount from './src/screens/CreateAccountPatient';
import AppointmentBookingScreen from './src/screens/AppointmentBookingScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import ProgressTrackingScreen from './src/screens/ProgressTrackingScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#2b2b5c' }} edges={['top', 'left', 'right', 'bottom']}>
        <NavigationContainer>
          <ExpoStatusBar style="light" backgroundColor="#2b2b5c" />
          <Stack.Navigator 
            screenOptions={{
              headerShown: false,
            }}
            initialRouteName="Login"
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="DoctorLogin" component={DoctorLoginScreen} />
            <Stack.Screen name="PatientLogin" component={PatientLoginScreen} />
            <Stack.Screen name="DoctorCreateAccount" component={DoctorCreateAccount} />
            <Stack.Screen name="PatientCreateAccount" component={PatientCreateAccount} />
            <Stack.Screen name="SelectDoctor" component={SelectDoctorScreen} />
            <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
            <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
            <Stack.Screen name="PrakrutiTest" component={PrakrutiTestScreen} />
            <Stack.Screen name="DietPlan" component={DietPlanScreen} />
            <Stack.Screen name="EditDietPlan" component={EditDietPlanScreen} />
            <Stack.Screen name="AppointmentBooking" component={AppointmentBookingScreen} />
            <Stack.Screen name="Appointments" component={AppointmentsScreen} />
            <Stack.Screen name="ProgressTracking" component={ProgressTrackingScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
   );
 }
