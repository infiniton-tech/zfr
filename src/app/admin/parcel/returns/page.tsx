"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Loader2 } from "lucide-react";

interface ReturnRequest {
  returnId: string;
  trackingNumber: string;
  reason: string;
  status: string;
  requestedAt: string;
}

export default function AdminParcelReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/parcel/returns");
      const json = await res.json();
      setReturns(json.data || []);
    } catch {
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-2">Return Requests</h1>
      <p className="text-sm text-muted-foreground mb-8">View and manage parcel return requests</p>

      <div className="bg-white border border-border">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-border text-xs font-medium tracking-wider bg-muted">
          <span>RETURN ID</span>
          <span>TRACKING #</span>
          <span>REASON</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : returns.length === 0 ? (
          <div className="p-12 text-center">
            <RotateCcw className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No return requests found</p>
          </div>
        ) : (
          returns.map((ret) => (
            <div key={ret.returnId} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border text-sm">
              <span className="font-mono text-xs">{ret.returnId}</span>
              <span>{ret.trackingNumber}</span>
              <span className="truncate">{ret.reason}</span>
              <span className="capitalize">{ret.status}</span>
              <span className="text-muted-foreground">{new Date(ret.requestedAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
