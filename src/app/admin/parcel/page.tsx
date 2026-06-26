"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Wallet, RotateCcw, CreditCard, Building2 } from "lucide-react";

export default function AdminParcelPage() {
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/v1/parcel/balance");
        const json = await res.json();
        setBalance(json.data);
      } catch {
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Parcel Delivery</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "—" : balance?.amount !== undefined ? `${balance.amount} ${balance.currency || ""}` : "N/A"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm font-medium">Place Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Create a new parcel delivery order.</p>
            <Button size="sm" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-sm font-medium">Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Manage return requests.</p>
            <Button size="sm" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CreditCard className="h-5 w-5 text-violet-600" />
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">View payment history.</p>
            <Button size="sm" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-sm font-medium">Police Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Find pickup locations.</p>
            <Button size="sm" variant="outline">Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
