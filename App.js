import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// screens
import LoginScreen from './src/screens/LoginScreen';
import SelectDoctorScreen from './src/screens/SelectDoctorScreen';
import DoctorDashboardScreen from './src/screens/DoctorDashboardScreen';
import PatientDashboardScreen from './src/screens/PatientDashboardScreen';
import PrakrutiTestScreen from './src/screens/PrakrutiTestScreen';
import DietPlanScreen from './src/screens/DietPlanScreen';
import DoctorLoginScreen from './src/screens/DoctorLoginScreen';
import PatientLoginScreen from './src/screens/PatientLoginScreen';
import DoctorCreateAccount from './src/screens/CreateAccountDoctor';
import PatientCreateAccount from './src/screens/CreateAccountPatient';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
