"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: string;
  totalAmount: number;
  finalAmount: number;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/v1/orders/me");
        const json = await res.json();
        if (res.ok) {
          setOrders(json.data || []);
        } else {
          toast.error(json.error?.message || "Failed to load orders");
        }
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2 className="text-sm font-medium tracking-wide mb-6">ORDER HISTORY</h2>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border border-border p-6 space-y-4 bg-muted/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Number</p>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Date Placed</p>
                  <p className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Amount</p>
                  <p className="text-xs font-semibold">{order.finalAmount.toFixed(2)} AED</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                  <Badge variant="outline" className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="w-12 h-16 relative bg-muted shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium truncate">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {item.color && `Color: ${item.color} / `}{item.size && `Size: ${item.size}`}
                      </p>
                      <p className="text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-xs font-medium shrink-0">
                      {(item.price * item.quantity).toFixed(2)} AED
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
