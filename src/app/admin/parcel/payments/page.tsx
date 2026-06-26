"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2 } from "lucide-react";

interface Payment {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function AdminParcelPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/parcel/payments");
      const json = await res.json();
      setPayments(json.data || []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-2">Payments</h1>
      <p className="text-sm text-muted-foreground mb-8">View parcel delivery payments</p>

      <div className="bg-white border border-border">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-border text-xs font-medium tracking-wider bg-muted">
          <span>PAYMENT ID</span>
          <span>AMOUNT</span>
          <span>CURRENCY</span>
          <span>STATUS</span>
          <span>DATE</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No payments found</p>
          </div>
        ) : (
          payments.map((pay) => (
            <div key={pay.paymentId} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border text-sm">
              <span className="font-mono text-xs">{pay.paymentId}</span>
              <span>{pay.amount.toFixed(2)}</span>
              <span>{pay.currency}</span>
              <span className="capitalize">{pay.status}</span>
              <span className="text-muted-foreground">{new Date(pay.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
