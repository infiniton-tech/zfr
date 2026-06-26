"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white">
      <div className="flex items-center justify-between px-4 md:px-8 h-[56px] border-b border-border">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </form>
        <button onClick={onClose} className="p-2 hover:opacity-70" aria-label="Close search">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-2xl mx-auto">
        {query.length > 0 && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 w-full p-4 text-sm hover:bg-muted transition-colors"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span>Search for &quot;{query}&quot;</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        )}

        <div className="mt-8">
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground mb-4">TRENDING SEARCHES</h3>
          <div className="flex flex-wrap gap-2">
            {["Dresses", "T-shirts", "Jeans", "Blazers", "Shoes", "Bags"].map((term) => (
              <button
                key={term}
                onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                  onClose();
                }}
                className="px-4 py-2 text-xs border border-border hover:border-foreground transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
