import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppNavigationTheme, AppPalette } from '@/constants/theme';

const LOGGED_USERNAME_KEY = 'loggedUsername';
const DEFAULT_LOCATION_KEY = 'defaultLocation';

type StoredLocation = {
  latitude: string;
  longitude: string;
  locationName: string;
};

const AppContext = createContext<{
  loggedUsername:string,
  setLoggedUsername:(username:string)=>void,
  defaultLocation: StoredLocation | null,
  setDefaultLocation:(location: StoredLocation | null) => void,
  locationLoaded: boolean,
}|null>(null)
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
  const [loggedUsername, setLoggedUsername] = useState('')
  const [defaultLocation, setDefaultLocationState] = useState<StoredLocation | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  useEffect(() => {
    const loadAppState = async() => {
      try {
        const [savedUsername, savedLocation] = await Promise.all([
          AsyncStorage.getItem(LOGGED_USERNAME_KEY),
          AsyncStorage.getItem(DEFAULT_LOCATION_KEY),
        ]);

        if (savedUsername) {
          setLoggedUsername(savedUsername);
        }

        if (savedLocation) {
          setDefaultLocationState(JSON.parse(savedLocation) as StoredLocation);
        }
      }
      catch(error) {
        console.log('Error loading saved app state:', error);
      }
      finally {
        setLocationLoaded(true);
      }
    }

    loadAppState();
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

  const updateDefaultLocation = async(location: StoredLocation | null) => {
    setDefaultLocationState(location);

    try {
      if (location) {
        await AsyncStorage.setItem(DEFAULT_LOCATION_KEY, JSON.stringify(location));
      }
      else {
        await AsyncStorage.removeItem(DEFAULT_LOCATION_KEY);
      }
    }
    catch(error) {
      console.log('Error saving location:', error);
    }
  }

  return (
    <ThemeProvider value={AppNavigationTheme}>
      <AppContext.Provider
        value={{
          loggedUsername,
          setLoggedUsername: updateLoggedUsername,
          defaultLocation,
          setDefaultLocation: updateDefaultLocation,
          locationLoaded,
        }}
      >
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: AppPalette.background },
          headerStyle: { backgroundColor: AppPalette.background },
          headerShadowVisible: false,
          headerTintColor: AppPalette.primary,
          headerTitleStyle: { color: AppPalette.textDark },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="userInfo" options={{ presentation: 'modal', title:'' }} />
        <Stack.Screen name="productDetails" options={{ presentation: 'modal', title: 'User Information' }} />
        <Stack.Screen name="addNewProduct" options={{ presentation: 'modal', title: 'Add Product' }} />
        <Stack.Screen name="mapScreen" options={{ presentation: 'modal', title: 'Select Location' }} />
      </Stack>
      <StatusBar style="dark"/>
      </AppContext.Provider>
    </ThemeProvider>
  );
}
