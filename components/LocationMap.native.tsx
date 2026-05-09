import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type LocationMapProps = {
  selectedLocation: Coordinate;
  initialCoordinate: Coordinate;
  onSelectLocation: (coordinate: Coordinate) => void;
};

export function LocationMap({
  selectedLocation,
  initialCoordinate,
  onSelectLocation,
}: LocationMapProps) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 1 }}
      initialRegion={{
        ...initialCoordinate,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      onPress={(event) => onSelectLocation(event.nativeEvent.coordinate)}
    >
      <Marker coordinate={selectedLocation} />
    </MapView>
  );
}
