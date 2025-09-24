import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import PrakruitiTestScreen from '../screens/PrakruitiTestScreen';
import DietPlanScreen from '../screens/DietPlanScreen';
import RecipesScreen from '../screens/RecipesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Prakruiti Test') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Diet Plan') {
              iconName = focused ? 'nutrition' : 'nutrition-outline';
            } else if (route.name === 'Recipes') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#8B4513',
          tabBarInactiveTintColor: 'gray',
          headerStyle: {
            backgroundColor: '#F5F5DC',
          },
          headerTintColor: '#8B4513',
          tabBarStyle: {
            backgroundColor: '#F5F5DC',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Prakruiti Test" component={PrakruitiTestScreen} />
        <Tab.Screen name="Diet Plan" component={DietPlanScreen} />
        <Tab.Screen name="Recipes" component={RecipesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
