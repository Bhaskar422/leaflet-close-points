import { useEffect, useRef } from "react";
import leaflet, { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import useLocalStorage from "../hooks/useLocalStorage";
import useGeoLocation from "../hooks/useGeoLocation";

const MapComponent = () => {
  const mapRef = useRef<Map | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<leaflet.Marker | null>(null);

  const [userMarker, setUserMarker] = useLocalStorage({
    key: "USER_MARKER",
    initialValue: {
      latitude: 0,
      longitude: 0,
    },
  });

  const [nearByMarker, setNearByMarker] = useLocalStorage({
    key: "NEAR_BY_MARKER",
    initialValue: [],
  });

  const location = useGeoLocation();

  useEffect(() => {
    if (mapRef.current || !divRef.current) return;
    mapRef.current = leaflet
      .map(divRef.current)
      .setView([userMarker.latitude, userMarker.longitude], 13);

    leaflet
      .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(mapRef.current);

    if (Array.isArray(nearByMarker)) {
      nearByMarker.forEach(
        ({ latitude, longitude }: { latitude: number; longitude: number }) => {
          leaflet
            .marker([latitude, longitude])
            .addTo(mapRef.current!)
            .bindPopup(`lat ${latitude.toFixed(2)}, long ${longitude.toFixed(2)}`);
        }
      );
    }

    mapRef.current.addEventListener("click", (e) => {
      const { lat: latitude, lng: longitude } = e.latlng;
      leaflet
        .marker([latitude, longitude])
        .addTo(mapRef.current!)
        .bindPopup(`lat ${latitude}, long ${longitude}`);
      setNearByMarker((prevMarkers: any) => [...prevMarkers, { latitude, longitude }]);
      // Ensure we're working with an array
      //   const currentMarkers = Array.isArray(nearByMarker) ? nearByMarker : [];
      //   setNearByMarker([...currentMarkers, { latitude: lat, longitude: lng }]);
    });
  }, []);

  useEffect(() => {
    setUserMarker({ ...userMarker });

    if (userMarkerRef.current) {
      mapRef.current?.removeLayer(userMarkerRef.current);
    }

    userMarkerRef.current = leaflet
      .marker([location.latitude, location.longitude])
      .addTo(mapRef.current!)
      .bindPopup("You are here");

    const el = userMarkerRef.current.getElement();
    if (el) {
      el.style.filter = "hue-rotate(120deg)";
    }

    mapRef.current?.setView([location.latitude, location.longitude], 13);
  }, [location, userMarker.latitude, userMarker.longitude]);

  return <div id="map" className="h-screen" ref={divRef}></div>;
};

export default MapComponent;
