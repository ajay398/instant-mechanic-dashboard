// frontend/components/dashboard/RealtimeStatus.tsx

"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  WifiOff,
  Radio,
} from "lucide-react";

export default function RealtimeStatus() {
  const [connected, setConnected] =
    useState(false);

  const [lastUpdate, setLastUpdate] =
    useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/bookings"
    );

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log(
          "WebSocket update:",
          data
        );

        if (
          data.type === "booking_update"
        ) {
          setLastUpdate(
            new Date().toLocaleTimeString()
          );

          window.dispatchEvent(
            new CustomEvent(
              "booking-updated",
              {
                detail: data,
              }
            )
          );
        }
      } catch (error) {
        console.error(
          "WebSocket message error:",
          error
        );
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = () => {
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${
          connected
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {connected ? (
          <Wifi size={16} />
        ) : (
          <WifiOff size={16} />
        )}

        <span className="text-sm font-medium">
          {connected
            ? "Real-time connected"
            : "Real-time disconnected"}
        </span>
      </div>

      {lastUpdate && (
        <div className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <Radio size={13} />

          Updated {lastUpdate}
        </div>
      )}
    </div>
  );
}