"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Navigation, X, MapPin } from "lucide-react";

interface VisitationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberLat: number;
  memberLng: number;
}

export default function VisitationMapModal({
  isOpen,
  onClose,
  memberName,
  memberLat,
  memberLng,
}: VisitationMapModalProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation permission omitted or unavailable:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const destCoords = `${memberLat},${memberLng}`;
  const originCoords = userLocation
    ? `${userLocation.lat},${userLocation.lng}`
    : "My+Location";

  // Clean Embed URL (iwloc=near minimizes popups on top of the route)
  const embedIframeUrl = `https://maps.google.com/maps?saddr=${originCoords}&daddr=${destCoords}&iwloc=near&output=embed`;
  
  // Direct Native App Navigation URL
  const externalMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destCoords}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#151F32] border border-[#1E2D4A] rounded-2xl p-5 space-y-4 shadow-2xl text-white my-auto max-h-[95vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1E2D4A] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Navigation size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Turn-By-Turn Route Preview
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-emerald-400" />
                Visiting <span className="text-white font-semibold">{memberName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={externalMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <ExternalLink size={14} /> Open Maps App
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#0B1120] border border-[#1E2D4A] hover:bg-[#1E2D4A] text-slate-400 hover:text-white transition"
              title="Close Map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Embedded Route Iframe */}
        <div className="rounded-xl overflow-hidden border border-[#1E2D4A] h-[450px] w-full bg-[#0B1120] relative shrink-0 shadow-inner">
          <iframe
            title={`Route Preview to ${memberName}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={embedIframeUrl}
          />
        </div>

        {/* Modal Footer Note */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px]">
            {userLocation ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live GPS departure point active.
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Using standard local departure point.
              </>
            )}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0B1120] border border-[#1E2D4A] text-slate-300 font-bold hover:bg-[#1E2D4A] text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}