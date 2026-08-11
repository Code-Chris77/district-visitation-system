"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocalAssembly } from "../services/local.service";
import { Navigation, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocalMapProps {
  locals: LocalAssembly[];
}

export default function LocalMap({ locals }: LocalMapProps) {
  const router = useRouter();
  const defaultCenter: [number, number] = [6.6885, -1.6244]; 

  const openGoogleMapsNav = (address?: string | null) => {
    const destination = encodeURIComponent(address || "Kumasi, Ghana");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
  };

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-xl border shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {locals.map((local, index) => {
          const lat = 6.6885 + (index * 0.02 - 0.05);
          const lng = -1.6244 + (index * 0.015 - 0.04);

          return (
            <Marker key={local.id} position={[lat, lng]} icon={defaultIcon}>
              <Popup>
                <div className="p-1 space-y-2 max-w-[220px]">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{local.name}</h3>
                    {local.code && (
                      <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        {local.code}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {local.address || "Location set near district center"}
                  </p>

                  <div className="pt-1 flex flex-col gap-1.5">
                    <button
                      onClick={() => openGoogleMapsNav(local.address || local.name)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-2 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <Navigation size={12} /> Open GPS Navigation
                    </button>
                    
                    <button
                      onClick={() => router.push("/visitations")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-md border bg-gray-50 px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
                    >
                      <CalendarPlus size={12} /> Log Visit Here
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}