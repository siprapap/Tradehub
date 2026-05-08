import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Coordinate = {
  latitude: number;
  longitude: number;
};

const initialCoordinate: Coordinate = {
  latitude: 13.7563,
  longitude: 100.5018,
};

export default function MapScreen() {
  const [selectedLocation, setSelectedLocation] =
    useState<Coordinate>(initialCoordinate);

  const handleConfirmLocation = () => {
    router.dismissTo({
      pathname: "/home",
      params: {
        latitude: selectedLocation.latitude.toString(),
        longitude: selectedLocation.longitude.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...initialCoordinate,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(event) => setSelectedLocation(event.nativeEvent.coordinate)}
      >
        <Marker coordinate={selectedLocation} />
      </MapView>

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
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  locationText: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
