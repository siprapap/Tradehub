import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LocationMap } from "@/components/LocationMap";
import { AppPalette } from "@/constants/theme";
import { useAppContext } from "./_layout";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const initialCoordinate: Coordinate = {
  latitude: 13.7563,
  longitude: 100.5018,
};

export default function MapScreen() {
  const { defaultLocation, setDefaultLocation } = useAppContext();
  const {
    source,
    latitude,
    longitude,
    productId,
    name,
    price,
    detail,
    category,
    contactDetails,
    imageUri,
  } = useLocalSearchParams<{
    source?: string;
    latitude?: string;
    longitude?: string;
    productId?: string;
    name?: string;
    price?: string;
    detail?: string;
    category?: string;
    contactDetails?: string;
    imageUri?: string;
  }>();
  const resolvedInitialCoordinate = useMemo(() => {
    if (latitude && longitude) {
      return {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    if (defaultLocation) {
      return {
        latitude: Number(defaultLocation.latitude),
        longitude: Number(defaultLocation.longitude),
      };
    }

    return initialCoordinate;
  }, [defaultLocation, latitude, longitude]);
  const [selectedLocation, setSelectedLocation] =
    useState<Coordinate>(resolvedInitialCoordinate);

  const handleConfirmLocation = () => {
    const nextLocation = {
      latitude: selectedLocation.latitude.toString(),
      longitude: selectedLocation.longitude.toString(),
      locationName: `${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`,
    };

    setDefaultLocation(nextLocation);

    if (source === "post") {
      router.dismissTo({
        pathname: "/addNewProduct",
        params: {
          ...nextLocation,
          productId,
          name,
          price,
          detail,
          category,
          contactDetails,
          imageUri,
        },
      });
      return;
    }

    router.dismissTo({
      pathname: "/home",
      params: nextLocation,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <LocationMap
          selectedLocation={selectedLocation}
          initialCoordinate={resolvedInitialCoordinate}
          onSelectLocation={setSelectedLocation}
        />
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.locationText}>
          {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
        </Text>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmLocation}>
          <Text style={styles.confirmButtonText}>Use This Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomBar: {
    backgroundColor: AppPalette.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: AppPalette.border,
  },
  locationText: {
    color: AppPalette.textBody,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: AppPalette.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: AppPalette.card,
    fontSize: 16,
    fontWeight: "700",
  },
});
