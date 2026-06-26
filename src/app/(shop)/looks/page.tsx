import Image from "next/image";

const LOOKS = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=400&h=500&fit=crop&q=80",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=500&fit=crop&q=80",
];

export default function LooksPage() {
  return (
    <div className="pt-[56px] min-h-screen bg-white">
      <div className="px-4 md:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">#INZFR</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Get inspired by our community and share your looks using #INZFR
          </p>
        </div>

        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {LOOKS.map((img, i) => (
            <div key={i} className="break-inside-avoid relative group overflow-hidden">
              <div className={`relative ${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
                <Image
                  src={img}
                  alt={`Community look ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
