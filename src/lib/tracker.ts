// Client-side analytics event tracker

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  
  let visitorId = localStorage.getItem("zfr_visitor_id");
  if (!visitorId) {
    visitorId = `vis_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    localStorage.setItem("zfr_visitor_id", visitorId);
  }
  return visitorId;
}

export async function trackEvent(
  eventType: string,
  productId?: string,
  metadata?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  const visitorId = getVisitorId();
  try {
    await fetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        eventType,
        productId,
        url: window.location.href,
        metadata,
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
