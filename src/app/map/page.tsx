'use client';
import HomeShell from '@/components/HomeShell';
import MapView from '@/components/MapView';
import { useLocationContext } from '@/context/LocationContext'; // however you provide your location list

export default function MapPage() {
  const { mappableLocations, userCoords } = useLocationContext();
  return (
    <HomeShell>
      <div className="h-screen w-full">
        <MapView
          locations={mappableLocations}
          center={[userCoords?.lat ?? 39.5, userCoords?.lon ?? -98.35]}
          className="h-full w-full"
        />
      </div>
    </HomeShell>
  );
}
