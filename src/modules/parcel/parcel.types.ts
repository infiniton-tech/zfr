export interface ParcelAuthParams {
  apiKey: string;
  secretKey: string;
}

export interface ParcelOrder {
  orderId: string;
  consigneeName: string;
  consigneePhone: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState?: string;
  consigneeZip?: string;
  weight: number;
  pieces?: number;
  description: string;
  codAmount?: number;
  reference?: string;
}

export interface ParcelOrderResponse {
  success: boolean;
  trackingNumber?: string;
  message?: string;
  data?: Record<string, unknown>;
}

export interface ParcelDeliveryStatus {
  trackingNumber: string;
  status:
    | "pending"
    | "picked_up"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "returned"
    | "cancelled";
  currentLocation?: string;
  estimatedDelivery?: string;
  history?: Array<{
    status: string;
    location: string;
    timestamp: string;
  }>;
}

export interface ParcelBalance {
  currentBalance: number;
  currency: string;
}

export interface ParcelReturnRequest {
  returnId: string;
  trackingNumber: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedAt: string;
}

export interface ParcelPayment {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  consignments?: string[];
}

export interface PoliceStation {
  stationId: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
}
