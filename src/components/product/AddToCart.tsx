"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

import { trackEvent } from "@/lib/tracker";

interface AddToCartProps {
  product: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    sizes?: Array<{ name: string; inStock: boolean }>;
    colors?: Array<{ name: string; hex: string }>;
    stockQuantity?: number;
  };
}

export function AddToCart({ product }: AddToCartProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    
    // Track cart add event
    trackEvent("cart_add", product._id, {
      name: product.name,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      price: product.price,
    });
    
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Color</p>
          <div className="flex items-center gap-2">
            {product.colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-8 h-8 rounded-full border-2 transition-colors ${
                  selectedColor === color.name ? "border-black" : "border-transparent hover:border-gray-400"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Size</p>
          <div className="flex items-center gap-2 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size.name}
                disabled={!size.inStock}
                onClick={() => setSelectedSize(size.name)}
                className={`min-w-[48px] px-3 py-2 text-xs border transition-colors ${
                  selectedSize === size.name
                    ? "bg-black text-white border-black"
                    : size.inStock
                    ? "border-border hover:border-black"
                    : "border-border text-muted-foreground line-through cursor-not-allowed"
                }`}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stockQuantity !== undefined && product.stockQuantity <= 0}
        className="w-full bg-black text-white text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed uppercase"
      >
        {product.stockQuantity !== undefined && product.stockQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}
