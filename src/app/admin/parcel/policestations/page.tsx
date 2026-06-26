"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PoliceStation {
  stationId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
}

export default function AdminParcelPoliceStationsPage() {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");

  const fetchStations = async () => {
    setLoading(true);
    try {
      const qs = city ? `?city=${encodeURIComponent(city)}` : "";
      const res = await fetch(`/api/v1/parcel/policestations${qs}`);
      const json = await res.json();
      setStations(json.data || []);
    } catch {
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-2">Police Stations</h1>
      <p className="text-sm text-muted-foreground mb-8">View police stations for parcel delivery</p>

      <div className="flex gap-3 mb-6 max-w-md">
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city..."
          className="rounded-none"
        />
        <button
          onClick={fetchStations}
          className="px-4 py-2 bg-black text-white text-xs tracking-wider hover:bg-black/90 transition-colors"
        >
          SEARCH
        </button>
      </div>

      <div className="bg-white border border-border">
        <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-border text-xs font-medium tracking-wider bg-muted">
          <span>STATION ID</span>
          <span>NAME</span>
          <span>ADDRESS</span>
          <span>CITY</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : stations.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No police stations found</p>
          </div>
        ) : (
          stations.map((station) => (
            <div key={station.stationId} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-border text-sm">
              <span className="font-mono text-xs">{station.stationId}</span>
              <span>{station.name}</span>
              <span className="truncate">{station.address}</span>
              <span>{station.city}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
