"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, CreditCard, TrendingUp, Activity, Eye, Heart, PlusCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Stats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
  analytics: {
    totalEvents: number;
    views: number;
    cartAdds: number;
    wishlistAdds: number;
    purchases: number;
    conversionRate: string;
  };
  recentEvents: Array<{
    _id: string;
    visitorId: string;
    eventType: string;
    productId?: { name: string; slug: string };
    userId?: { name: string; email: string };
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
}

const eventTypeColors: Record<string, string> = {
  product_view: "bg-blue-50 text-blue-700 border-blue-200",
  cart_add: "bg-green-50 text-green-700 border-green-200",
  wishlist_add: "bg-pink-50 text-pink-700 border-pink-200",
  wishlist_remove: "bg-neutral-50 text-neutral-600 border-neutral-200",
  checkout_start: "bg-purple-50 text-purple-700 border-purple-200",
  purchase: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/v1/analytics");
      const json = await res.json();
      if (res.ok) {
        setData(json.data);
      } else {
        toast.error("Failed to load dashboard metrics");
      }
    } catch {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Products", value: data?.products ?? 0, icon: Package, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Total Orders", value: data?.orders ?? 0, icon: ShoppingCart, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { title: "Total Users", value: data?.users ?? 0, icon: Users, color: "text-violet-600", bgColor: "bg-violet-50" },
    { title: "Revenue", value: `${(data?.revenue ?? 0).toFixed(2)} AED`, icon: CreditCard, color: "text-amber-600", bgColor: "bg-amber-50" },
  ];

  const trackingMetrics = [
    { name: "Total Visitor Events", count: data?.analytics.totalEvents ?? 0, icon: Activity, color: "text-neutral-600" },
    { name: "Product Views", count: data?.analytics.views ?? 0, icon: Eye, color: "text-blue-500" },
    { name: "Cart Additions", count: data?.analytics.cartAdds ?? 0, icon: PlusCircle, color: "text-green-500" },
    { name: "Wishlist Additions", count: data?.analytics.wishlistAdds ?? 0, icon: Heart, color: "text-pink-500" },
    { name: "Purchases", count: data?.analytics.purchases ?? 0, icon: ShoppingBag, color: "text-emerald-500" },
    { name: "Sales Conversion Rate", count: data?.analytics.conversionRate ?? "0.0%", icon: TrendingUp, color: "text-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time metrics, order volumes, and visitor conversion tracking.</p>
      </div>
      
      {/* 1. Core KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{card.title}</CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "—" : card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Visitor Event Tracking Analytics */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
          VISITOR & CLICK EVENT METRICS
        </h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {trackingMetrics.map((metric) => (
            <Card key={metric.name} className="border-border">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider block min-h-[24px]">
                  {metric.name}
                </span>
                <span className="text-lg font-bold">{loading ? "—" : metric.count}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 3. Real-Time Tracking Feed */}
        <Card className="md:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              Real-time Event Tracking Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-xs text-muted-foreground">Loading event logs...</p>
            ) : !data?.recentEvents || data.recentEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No visitor events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold">Event</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold">User / Visitor</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold">Product</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentEvents.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          <Badge variant="outline" className={eventTypeColors[event.eventType] || "bg-gray-100 text-gray-800"}>
                            {event.eventType.replace(/_/g, " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {event.userId ? (
                            <div className="font-semibold text-foreground">
                              👤 {event.userId.name}
                              <span className="text-[9px] font-normal text-muted-foreground block">{event.userId.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground block text-[10px]">
                              🌐 {event.visitorId.substring(0, 12)}...
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {event.productId ? (
                            <a href={`/product/${event.productId.slug}`} target="_blank" className="hover:underline text-blue-600">
                              {event.productId.name}
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Quick Actions */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/20 border border-border text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Stock Health</h4>
              <p className="text-[10px] text-muted-foreground mt-1">
                Order fulfillment dynamically updates stock levels in real time.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="/admin/products"
                className="text-center w-full bg-black text-white text-xs font-semibold tracking-wider py-3 hover:bg-black/90 transition-colors uppercase"
              >
                Manage Products
              </a>
              <a
                href="/admin/orders"
                className="text-center w-full border border-black text-black text-xs font-semibold tracking-wider py-3 hover:bg-neutral-50 transition-colors uppercase"
              >
                Fulfill Orders
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
