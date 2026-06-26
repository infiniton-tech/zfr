import {
  ParcelOrder,
  ParcelOrderResponse,
  ParcelDeliveryStatus,
  ParcelBalance,
  ParcelReturnRequest,
  ParcelPayment,
  PoliceStation,
} from "./parcel.types";

const BASE_URL = process.env.PARCEL_API_BASE_URL || "";
const API_KEY = process.env.PARCEL_API_KEY || "";
const SECRET_KEY = process.env.PARCEL_SECRET_KEY || "";

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
    "X-Secret-Key": SECRET_KEY,
  };
}

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Parcel API error (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

// 1. Placing an order
export async function placeOrder(order: ParcelOrder): Promise<ParcelOrderResponse> {
  return apiCall<ParcelOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

// 2. Bulk Order Create
export async function placeBulkOrders(orders: ParcelOrder[]): Promise<ParcelOrderResponse[]> {
  return apiCall<ParcelOrderResponse[]>("/orders/bulk", {
    method: "POST",
    body: JSON.stringify({ orders }),
  });
}

// 3. Checking Delivery Status
export async function getDeliveryStatus(trackingNumber: string): Promise<ParcelDeliveryStatus> {
  return apiCall<ParcelDeliveryStatus>(`/orders/${trackingNumber}/status`);
}

// 4. Checking Current Balance
export async function getBalance(): Promise<ParcelBalance> {
  return apiCall<ParcelBalance>("/account/balance");
}

// 5. Single Return Request View
export async function getReturnRequest(returnId: string): Promise<ParcelReturnRequest> {
  return apiCall<ParcelReturnRequest>(`/returns/${returnId}`);
}

// 6. Get Return Requests
export async function getReturnRequests(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: ParcelReturnRequest[]; total: number }> {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
  return apiCall<{ data: ParcelReturnRequest[]; total: number }>(`/returns?${qs}`);
}

// 7. Get Payments
export async function getPayments(params?: {
  page?: number;
  limit?: number;
}): Promise<{ data: ParcelPayment[]; total: number }> {
  const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : "";
  return apiCall<{ data: ParcelPayment[]; total: number }>(`/payments?${qs}`);
}

// 8. Get Single Payment with Consignments
export async function getPaymentWithConsignments(
  paymentId: string
): Promise<ParcelPayment> {
  return apiCall<ParcelPayment>(`/payments/${paymentId}`);
}

// 9. Get Policestations
export async function getPoliceStations(city?: string): Promise<PoliceStation[]> {
  const qs = city ? `?city=${encodeURIComponent(city)}` : "";
  return apiCall<PoliceStation[]>(`/policestations${qs}`);
}
