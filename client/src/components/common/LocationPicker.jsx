"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  MarkerF,
  StandaloneSearchBox,
  useJsApiLoader,
} from "@react-google-maps/api";

/**
 * Reusable Google‑Maps picker with Places search
 *
 * Props:
 *   value:    { lat, lng } | null
 *   onChange: (coords|null) => void
 *   height:   number|string – map height (default 320)
 */
const LocationPicker = ({ value, onChange, height = 320 }) => {
  /* --- load Maps + Places ---------------------------------------- */
  const { isLoaded } = useJsApiLoader({
    id: "script-loader",                         // MUST stay identical everywhere
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],                       // enable search predictions
  });

  /* --- refs & state ---------------------------------------------- */
  const mapRef    = useRef(null);
  const searchRef = useRef(null);
  const [marker, setMarker] = useState(value);   // {lat,lng}|null

  /* bubble up to parent */
  useEffect(() => {
    onChange?.(marker || null);
  }, [marker, onChange]);

  /* helpers -------------------------------------------------------- */
  const placeMarker = (pos) => {
    setMarker(pos);
    mapRef.current?.panTo(pos);
    mapRef.current?.setZoom(15);
  };

  const handleMapClick = (e) => {
    placeMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() });
  };

  const onPlacesChanged = () => {
    const places = searchRef.current?.getPlaces() || [];
    if (!places.length) return;
    const loc = places[0].geometry?.location;
    if (loc) placeMarker({ lat: loc.lat(), lng: loc.lng() });
  };

  /* render --------------------------------------------------------- */
  if (!isLoaded) return <p className="text-gray-500">Loading map…</p>;

  return (
    <div className="mt-6 rounded-lg overflow-hidden shadow" style={{ height }}>
      {/* search input */}
      <StandaloneSearchBox
        onLoad={(ref) => (searchRef.current = ref)}
        onPlacesChanged={onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Search location…"
          className="w-full p-2 border-b outline-none"
        />
      </StandaloneSearchBox>

      {/* map */}
      <GoogleMap
        center={marker || { lat: 31.5204, lng: 74.3587 }} // default Lahore
        zoom={marker ? 15 : 6}
        onLoad={(map) => (mapRef.current = map)}
        onClick={handleMapClick}
        mapContainerStyle={{ width: "100%", height: height - 42 }} // account for input height
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {marker && (
          <MarkerF
            position={marker}
            draggable
            onDragEnd={(e) =>
              placeMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
            }
          />
        )}
      </GoogleMap>

      {marker && (
        <p className="mt-2 text-sm text-gray-600">
          Selected: <strong>{marker.lat.toFixed(5)}</strong>,{" "}
          <strong>{marker.lng.toFixed(5)}</strong>
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
