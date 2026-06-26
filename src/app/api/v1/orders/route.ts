import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Product, TrackingEvent, Order } from "@/models";

export async function GET(request: Request) {
  try {
    await connectDB();
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
    const { items, shippingAddress, billingAddress, totalAmount, shippingCost, discountAmount, finalAmount } = body;

    if (!items || items.length === 0 || !shippingAddress || !billingAddress) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required order information" } },
        { status: 400 }
      );
    }

    // 2. Validate and deduct stock for each product (Inventory management)
    for (const item of items) {
      const dbProduct = await Product.findById(item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Product ${item.name} not found` } },
          { status: 404 }
        );
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: {
              code: "OUT_OF_STOCK",
              message: `Insufficient stock for ${item.name}. Available: ${dbProduct.stockQuantity}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Deduct stock after validating all items
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity },
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
      items,
      shippingAddress,
      billingAddress,
      totalAmount,
      shippingCost: shippingCost || 0,
      discountAmount: discountAmount || 0,
      finalAmount,
      status: "pending",
      paymentStatus: "paid", // simulate payment complete
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
