import { useEffect, useState } from "react";

const useGeoLocation = () => {
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    const geo = navigator.geolocation;

    const onSuccess = (position: GeolocationPosition) => {
      setPosition({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    };

    const onError = (error: any) => {
      console.log("Error retrieving geolocation", error);
    };

    const watcher = geo.watchPosition(onSuccess, onError);

    return () => geo.clearWatch(watcher);
  }, []);

  return position;
};

export default useGeoLocation;
