import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CreateArisanScreen from '../screens/CreateArisanScreen';
import ArisanDetailScreen from '../screens/ArisanDetailScreen';
import JoinArisanScreen from '../screens/JoinArisanScreen';
import PaymentScreen from '../screens/PaymentScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#6C63FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'ArisanKu' }}
        />
        <Stack.Screen
          name="CreateArisan"
          component={CreateArisanScreen}
          options={{ title: 'Buat Arisan' }}
        />
        <Stack.Screen
          name="ArisanDetail"
          component={ArisanDetailScreen}
          options={{ title: 'Detail Arisan' }}
        />
        <Stack.Screen
          name="JoinArisan"
          component={JoinArisanScreen}
          options={{ title: 'Gabung Arisan' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Pembayaran' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
