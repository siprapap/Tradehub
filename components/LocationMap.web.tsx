import Constants from "expo-constants";
import { useEffect, useRef } from "react";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type LocationMapProps = {
  selectedLocation: Coordinate;
  initialCoordinate: Coordinate;
  onSelectLocation: (coordinate: Coordinate) => void;
};

type GoogleMapsWindow = Window & {
  google?: any;
  initTradehubMap?: () => void;
};

const googleMapsApiKey =
  Constants.expoConfig?.extra?.googleMapsApiKey ||
  Constants.expoConfig?.ios?.config?.googleMapsApiKey ||
  "";

function loadGoogleMapsScript() {
  return new Promise<void>((resolve, reject) => {
    const browserWindow = window as GoogleMapsWindow;

    if (browserWindow.google?.maps) {
      resolve();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject());
      return;
    }

    browserWindow.initTradehubMap = () => resolve();

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initTradehubMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject();

    document.body.appendChild(script);
  });
}

export function LocationMap({
  selectedLocation,
  initialCoordinate,
  onSelectLocation,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!googleMapsApiKey || !mapRef.current) {
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        if (!mapRef.current || googleMapRef.current) {
          return;
        }

        const browserWindow = window as GoogleMapsWindow;
        const googleMaps = browserWindow.google?.maps;

        if (!googleMaps) {
          return;
        }

        const map = new googleMaps.Map(mapRef.current, {
          center: {
            lat: initialCoordinate.latitude,
            lng: initialCoordinate.longitude,
          },
          zoom: 13,
        });

        const marker = new googleMaps.Marker({
          position: {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
          map,
        });

        map.addListener("click", (event: any) => {
          if (!event.latLng) {
            return;
          }

          onSelectLocation({
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng(),
          });
        });

        googleMapRef.current = map;
        markerRef.current = marker;
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error);
      });
  }, [initialCoordinate, onSelectLocation, selectedLocation]);

  useEffect(() => {
    markerRef.current?.setPosition({
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
    });
  }, [selectedLocation]);

  if (!googleMapsApiKey) {
    return (
      <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
        Google Maps API key is missing.
      </div>
    );
  }

  return <div ref={mapRef} style={{ flex: 1, width: "100%", height: "100%" }} />;
}
