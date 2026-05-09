import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';

const LOGGED_USERNAME_KEY = 'loggedUsername';

const AppContext = createContext<{loggedUsername:string, setLoggedUsername:(username:string)=>void}|null>(null)
export function useAppContext(){
  const context = useContext(AppContext);
  if (!context){
    throw new Error('useAppContext must be used inside AppContext.Provider');
  }
  return context
}

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loggedUsername, setLoggedUsername] = useState('')

  useEffect(() => {
    const loadLoggedUsername = async() => {
      try {
        const savedUsername = await AsyncStorage.getItem(LOGGED_USERNAME_KEY);

        if (savedUsername) {
          setLoggedUsername(savedUsername);
        }
      }
      catch(error) {
        console.log('Error loading saved username:', error);
      }
    }

    loadLoggedUsername();
  }, []);

  const updateLoggedUsername = async(username: string) => {
    setLoggedUsername(username);

    try {
      if (username) {
        await AsyncStorage.setItem(LOGGED_USERNAME_KEY, username);
      }
      else {
        await AsyncStorage.removeItem(LOGGED_USERNAME_KEY);
      }
    }
    catch(error) {
      console.log('Error saving username:', error);
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppContext.Provider value={{loggedUsername,setLoggedUsername:updateLoggedUsername}}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="userInfo" options={{ presentation: 'modal', title:'' }} />
        <Stack.Screen name="productDetails" options={{ presentation: 'modal', title: 'User Information' }} />
        <Stack.Screen name="addNewProduct" options={{ presentation: 'modal', title: 'Add Product' }} />
        <Stack.Screen name="mapScreen" options={{ presentation: 'modal', title: 'Select Location' }} />
      </Stack>
      <StatusBar style="auto"/>
      </AppContext.Provider>
    </ThemeProvider>
  );
}
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/use-color-scheme';

const LOGGED_USERNAME_KEY = 'loggedUsername';

const AppContext = createContext<{loggedUsername:string, setLoggedUsername:(username:string)=>void}|null>(null)
export function useAppContext(){
  const context = useContext(AppContext);
  if (!context){
    throw new Error('useAppContext must be used inside AppContext.Provider');
  }
  return context
}

export const unstable_settings = {
  anchor: 'login',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loggedUsername, setLoggedUsername] = useState('')

  useEffect(() => {
    const loadLoggedUsername = async() => {
      try {
        const savedUsername = await AsyncStorage.getItem(LOGGED_USERNAME_KEY);

        if (savedUsername) {
          setLoggedUsername(savedUsername);
        }
      }
      catch(error) {
        console.log('Error loading saved username:', error);
      }
    }

    loadLoggedUsername();
  }, []);

  const updateLoggedUsername = async(username: string) => {
    setLoggedUsername(username);

    try {
      if (username) {
        await AsyncStorage.setItem(LOGGED_USERNAME_KEY, username);
      }
      else {
        await AsyncStorage.removeItem(LOGGED_USERNAME_KEY);
      }
    }
    catch(error) {
      console.log('Error saving username:', error);
    }
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppContext.Provider value={{loggedUsername,setLoggedUsername:updateLoggedUsername}}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="userInfo" options={{ presentation: 'modal', title:'' }} />
        <Stack.Screen name="productDetails" options={{ presentation: 'modal', title: 'User Information' }} />
        <Stack.Screen name="addNewProduct" options={{ presentation: 'modal', title: 'Add Product' }} />
        <Stack.Screen name="mapScreen" options={{ presentation: 'modal', title: 'Select Location' }} />
      </Stack>
      <StatusBar style="auto"/>
      </AppContext.Provider>
    </ThemeProvider>
  );
}
