"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, AlertCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/v1/reviews?productId=${productId}`);
      const json = await res.json();
      if (res.ok) {
        setReviews(json.data || []);
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Review submitted successfully");
        setComment("");
        setRating(5);
        fetchReviews();
      } else {
        toast.error(json.error?.message || "Failed to submit review");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <div className="mt-12 pt-10 border-t border-border space-y-8">
      <div>
        <h2 className="text-sm font-medium tracking-[0.1em] uppercase mb-1">REVIEWS & RATINGS</h2>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-5 h-5",
                  i < Math.round(Number(averageRating)) ? "fill-current" : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{averageRating} out of 5</span>
          <span className="text-xs text-muted-foreground">({totalReviews} {totalReviews === 1 ? "review" : "reviews"})</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Reviews list */}
        <div className="space-y-6">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            CUSTOMER REVIEWS
          </h3>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="divide-y divide-border space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider">{review.userName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-yellow-500 gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3.5 h-3.5",
                          i < review.rating ? "fill-current" : "text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit review */}
        <div>
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
            WRITE A REVIEW
          </h3>

          {session?.user ? (
            <form onSubmit={handleSubmit} className="space-y-4 border border-border p-6 bg-muted/10">
              <div className="space-y-2">
                <label className="text-xs tracking-wider block">YOUR RATING</label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ratingValue = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-yellow-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6 transition-colors",
                            ratingValue <= (hoverRating ?? rating)
                              ? "fill-current"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-xs tracking-wider block">YOUR COMMENT</label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full text-xs p-3 border border-border rounded-none bg-background focus:outline-none focus:border-black resize-none"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white text-xs font-medium tracking-[0.2em] py-3 hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
              </button>
            </form>
          ) : (
            <div className="border border-border p-6 text-center bg-muted/5">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                You must be logged in to write a review.
              </p>
              <a
                href="/login"
                className="inline-block mt-4 bg-black text-white text-xs font-medium tracking-[0.2em] px-6 py-2.5 hover:bg-black/90 transition-colors"
              >
                LOG IN
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
