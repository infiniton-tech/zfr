"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2, RefreshCw } from "lucide-react";

export default function AdminParcelBalancePage() {
  const [balance, setBalance] = useState<{ currentBalance: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBalance = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/parcel/balance");
      const json = await res.json();
      if (json.data) {
        setBalance(json.data);
      } else {
        setError(json.error?.message || "Failed to fetch balance");
      }
    } catch {
      setError("Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-2">Parcel Balance</h1>
      <p className="text-sm text-muted-foreground mb-8">Check your parcel delivery account balance</p>

      <div className="max-w-xl bg-white border border-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Balance</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : balance ? (
              <p className="text-3xl font-semibold">
                {balance.currentBalance.toFixed(2)} {balance.currency}
              </p>
            ) : (
              <p className="text-lg text-red-500">{error || "N/A"}</p>
            )}
          </div>
        </div>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-border text-xs tracking-wider hover:border-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          REFRESH
        </button>
      </div>
    </div>
  );
}
