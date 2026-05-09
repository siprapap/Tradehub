declare module "@/components/LocationMap" {
  type Coordinate = {
    latitude: number;
    longitude: number;
  };

  type LocationMapProps = {
    selectedLocation: Coordinate;
    initialCoordinate: Coordinate;
    onSelectLocation: (coordinate: Coordinate) => void;
  };

  export function LocationMap(props: LocationMapProps): JSX.Element;
}
