import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id).select("addresses").lean();
    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user.addresses || [] });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch addresses" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { street, city, state, zip, country, isDefault } = body;

    if (!street || !city || !state || !zip || !country) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required address fields" } },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Handle isDefault logic
    if (isDefault) {
      user.addresses.forEach((addr: any) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      street,
      city,
      state,
      zip,
      country,
      isDefault: isDefault || user.addresses.length === 0, // make default if it is the first address
    };

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({ data: user.addresses }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to add address" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("addressId");

    if (!addressId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "addressId is required" } },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== addressId
    );
    
    // If we deleted the default address, set another one as default
    if (user.addresses.length > 0 && !user.addresses.some((addr: any) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({ data: user.addresses });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete address" } },
      { status: 500 }
    );
  }
}
