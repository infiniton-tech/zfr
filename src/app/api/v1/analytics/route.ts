import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { TrackingEvent, User, Product, Order } from "@/models";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 403 }
      );
    }

    // 1. Get general stats
    const [productsCount, ordersCount, usersCount, orders] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      User.countDocuments({}),
      Order.find({}).select("finalAmount").lean(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

    // 2. Query event stats
    const [
      totalEvents,
      viewEvents,
      cartEvents,
      wishlistEvents,
      purchaseEvents,
      recentEvents,
    ] = await Promise.all([
      TrackingEvent.countDocuments({}),
      TrackingEvent.countDocuments({ eventType: "product_view" }),
      TrackingEvent.countDocuments({ eventType: "cart_add" }),
      TrackingEvent.countDocuments({ eventType: "wishlist_add" }),
      TrackingEvent.countDocuments({ eventType: "purchase" }),
      TrackingEvent.find({})
        .sort({ timestamp: -1 })
        .limit(10)
        .populate("productId", "name slug")
        .populate("userId", "name email")
        .lean(),
    ]);

    return NextResponse.json({
      data: {
        products: productsCount,
        orders: ordersCount,
        users: usersCount,
        revenue: totalRevenue,
        analytics: {
          totalEvents,
          views: viewEvents,
          cartAdds: cartEvents,
          wishlistAdds: wishlistEvents,
          purchases: purchaseEvents,
          conversionRate: viewEvents ? ((purchaseEvents / viewEvents) * 100).toFixed(1) + "%" : "0.0%",
        },
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch analytics" } },
      { status: 500 }
    );
  }
}
