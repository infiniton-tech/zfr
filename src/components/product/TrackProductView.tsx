"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracker";

interface TrackProductViewProps {
  productId: string;
  productName: string;
  price: number;
}

export function TrackProductView({ productId, productName, price }: TrackProductViewProps) {
  useEffect(() => {
    trackEvent("product_view", productId, { productName, price });
  }, [productId, productName, price]);

  return null;
}
