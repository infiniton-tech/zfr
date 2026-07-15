import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Product, TrackingEvent, Order } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Listing all orders exposes customer PII — admin only
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      data: orders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch orders" } }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in to checkout" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress, billingAddress, shippingCost, discountAmount, paymentMethod } = body;

    if (!items || items.length === 0 || !shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required order information" } },
        { status: 400 }
      );
    }

    // 2. Validate stock and reprice every item from the database —
    // client-sent prices are display-only and never trusted
    const pricedItems: Array<Record<string, unknown>> = [];
    for (const item of items) {
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Product ${item.name} not found` } },
          { status: 404 }
        );
      }

      if (dbProduct.stockQuantity < quantity) {
        return NextResponse.json(
          {
            error: {
              code: "OUT_OF_STOCK",
              message: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stockQuantity}`,
            },
          },
          { status: 400 }
        );
      }

      pricedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        image: dbProduct.images?.[0] || item.image,
        price: dbProduct.price,
        quantity,
        size: item.size,
        color: item.color,
      });
    }

    const totalAmount = pricedItems.reduce(
      (sum, i) => sum + (i.price as number) * (i.quantity as number),
      0
    );
    const safeShipping = Math.max(0, Number(shippingCost) || 0);
    const safeDiscount = Math.min(Math.max(0, Number(discountAmount) || 0), totalAmount);
    const finalAmount = totalAmount + safeShipping - safeDiscount;

    // Deduct stock after validating all items
    for (const item of pricedItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -(item.quantity as number) },
      });
    }

    // 3. Generate unique order number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    const orderNumber = `ZFR-${dateStr}-${randomSuffix}`;

    // 4. Save order to database
    const order = await Order.create({
      orderNumber,
      userId: session.user.id,
      items: pricedItems,
      shippingAddress,
      billingAddress,
      totalAmount,
      shippingCost: safeShipping,
      discountAmount: safeDiscount,
      finalAmount,
      status: "pending",
      paymentMethod: paymentMethod || "card",
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
    });

    // 5. Track purchase event
    const visitorId = body.visitorId || `vis_purchase_${Date.now()}`;
    await TrackingEvent.create({
      visitorId,
      userId: session.user.id,
      eventType: "purchase",
      metadata: {
        orderNumber,
        finalAmount,
        itemsCount: items.length,
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("Order placement error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Failed to create order" } }, { status: 500 });
  }
}
