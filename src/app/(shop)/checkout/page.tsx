"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/store/cart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getVisitorId } from "@/lib/tracker";

const STEPS = ["Shipping", "Payment", "Review"];

interface SavedAddress {
  _id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Shipping form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United Arab Emirates");
  const [saveAddress, setSaveAddress] = useState(false);

  // Payment form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const total = getTotalPrice();

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please log in to proceed with checkout");
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Fetch saved addresses if logged in
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/v1/users/addresses");
        const json = await res.json();
        if (res.ok && json.data) {
          const list = json.data as SavedAddress[];
          setSavedAddresses(list);
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setStreet(defaultAddr.street);
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setZip(defaultAddr.zip);
            setCountry(defaultAddr.country);
          }
        }
      } catch {
        console.error("Failed to load saved addresses");
      }
    };

    if (session?.user) {
      setEmail(session.user.email || "");
      if (session.user.name) {
        const parts = session.user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      fetchAddresses();
    }
  }, [session]);

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setStreet("");
      setCity("");
      setState("");
      setZip("");
      setCountry("United Arab Emirates");
    } else {
      const addr = savedAddresses.find((a) => a._id === id);
      if (addr) {
        setStreet(addr.street);
        setCity(addr.city);
        setState(addr.state);
        setZip(addr.zip);
        setCountry(addr.country);
      }
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phone || !street || !city || !state || !zip || !country) {
      toast.error("Please fill in all shipping fields");
      return;
    }
    setStep(1);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      toast.error("Please fill in all payment details");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // 1. Optionally save address to profile if checked
      if (saveAddress && selectedAddressId === "new") {
        await fetch("/api/v1/users/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ street, city, state, zip, country, isDefault: false }),
        });
      }

      // 2. Submit order to database
      const orderItems = items.map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      }));

      const shippingAddress = {
        street,
        city,
        state,
        zip,
        country,
        isDefault: false,
      };

      const visitorId = getVisitorId();

      const orderPayload = {
        items: orderItems,
        shippingAddress,
        billingAddress: shippingAddress, // simplify billing to match shipping
        totalAmount: total,
        shippingCost: 0,
        discountAmount: 0,
        finalAmount: total,
        visitorId,
      };

      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        toast.success("Order placed successfully!");
        setOrderNumber(json.data.orderNumber);
        clearCart();
        setCompleted(true);
      } else {
        toast.error(json.error?.message || "Order placement failed");
      }
    } catch {
      toast.error("An error occurred during order placement");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="pt-[56px] min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  if (items.length === 0 && !completed) {
    return (
      <div className="pt-[56px] min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-medium mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Add items to proceed to checkout</p>
        <Link href="/woman" className="bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3">
          SHOP NOW
        </Link>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="pt-[56px] min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-medium mb-2">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground mb-1 text-center">
          Thank you for your order. Your order number is: <span className="font-semibold text-foreground">{orderNumber}</span>
        </p>
        <p className="text-xs text-muted-foreground mb-8 text-center">
          You can track this order in your account dashboard.
        </p>
        <div className="flex gap-4">
          <Link href="/orders" className="border border-black text-black text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-neutral-50 transition-colors">
            MY ORDERS
          </Link>
          <Link href="/" className="bg-black text-white text-xs font-medium tracking-[0.2em] px-8 py-3 hover:bg-black/90 transition-colors">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Back link */}
        <Link href="/cart" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to cart
        </Link>

        {/* Steps header */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i <= step ? "bg-black text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form container */}
          <div className="md:col-span-2">
            {step === 0 && (
              <form className="space-y-5" onSubmit={handleShippingSubmit}>
                <h2 className="text-sm font-medium tracking-wide">SHIPPING INFORMATION</h2>
                
                {savedAddresses.length > 0 && (
                  <div className="space-y-2 border border-border p-4 bg-muted/10 mb-4">
                    <Label className="text-xs tracking-wider">SELECT SAVED ADDRESS</Label>
                    <select
                      className="w-full border rounded-none p-2.5 text-xs bg-background"
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                    >
                      {savedAddresses.map((addr) => (
                        <option key={addr._id} value={addr._id}>
                          {addr.street}, {addr.city} ({addr.isDefault ? "Default" : "Saved"})
                        </option>
                      ))}
                      <option value="new">+ Enter New Address</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider">FIRST NAME</Label>
                    <Input className="rounded-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider">LAST NAME</Label>
                    <Input className="rounded-none" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider">EMAIL</Label>
                  <Input type="email" className="rounded-none" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider">PHONE</Label>
                  <Input className="rounded-none" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 XX XXX XXXX" required />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider">ADDRESS / STREET</Label>
                  <Input className="rounded-none" value={street} onChange={(e) => setStreet(e.target.value)} required disabled={selectedAddressId !== "new" && selectedAddressId !== ""} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider">CITY</Label>
                    <Input className="rounded-none" value={city} onChange={(e) => setCity(e.target.value)} required disabled={selectedAddressId !== "new" && selectedAddressId !== ""} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider">ZIP CODE</Label>
                    <Input className="rounded-none" value={zip} onChange={(e) => setZip(e.target.value)} required disabled={selectedAddressId !== "new" && selectedAddressId !== ""} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-wider">COUNTRY</Label>
                  <Input className="rounded-none" value={country} onChange={(e) => setCountry(e.target.value)} required disabled={selectedAddressId !== "new" && selectedAddressId !== ""} />
                </div>

                {selectedAddressId === "new" && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="saveAddress"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <Label htmlFor="saveAddress" className="text-xs cursor-pointer">Save this address to my profile</Label>
                  </div>
                )}

                <button type="submit" className="w-full bg-black text-white text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors">
                  CONTINUE TO PAYMENT
                </button>
              </form>
            )}

            {step === 1 && (
              <form className="space-y-5" onSubmit={handlePaymentSubmit}>
                <h2 className="text-sm font-medium tracking-wide">PAYMENT METHOD</h2>
                <div className="border border-border p-4 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <input type="radio" name="payment" id="card" defaultChecked className="w-4 h-4" />
                    <Label htmlFor="card" className="text-sm">Credit / Debit Card</Label>
                  </div>
                  <div className="space-y-3 pl-7">
                    <Input
                      placeholder="Card number"
                      className="rounded-none"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="MM/YY"
                        className="rounded-none"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                      />
                      <Input
                        placeholder="CVV"
                        className="rounded-none"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      placeholder="Name on card"
                      className="rounded-none"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(0)} className="flex-1 text-xs tracking-[0.2em] py-4 border border-border hover:border-foreground transition-colors">
                    BACK
                  </button>
                  <button type="submit" className="flex-1 bg-black text-white text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors">
                    REVIEW ORDER
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-sm font-medium tracking-wide">REVIEW YOUR ORDER</h2>
                <div className="border border-border p-4 space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{(item.price * item.quantity).toFixed(2)} AED</span>
                    </div>
                  ))}
                </div>
                <div className="border border-border p-4 space-y-2 text-xs">
                  <h3 className="font-semibold uppercase tracking-wider">Shipping Address</h3>
                  <p>{firstName} {lastName}</p>
                  <p>{street}, {city}, {state} {zip}</p>
                  <p>{country}</p>
                  <p>Phone: {phone}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 text-xs tracking-[0.2em] py-4 border border-border hover:border-foreground transition-colors">
                    BACK
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-black text-white text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "PLACING ORDER..." : "PLACE ORDER"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted p-6 h-fit">
            <h3 className="text-sm font-medium tracking-wide mb-4">ORDER SUMMARY</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{total.toFixed(2)} AED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-semibold mt-4 pt-4 border-t border-border">
              <span>Total</span>
              <span>{total.toFixed(2)} AED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
