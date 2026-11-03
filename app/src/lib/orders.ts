"use client";
import { useEffect, useState } from "react";

export type OrderItem = { id: string; name: string; qty: number; price: number };
export type OrderStatus = "placed" | "accepted" | "rejected" | "dispatched" | "delivered";
export type Order = {
  id: string; // order number, e.g. RP-261103-0001
  shop: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  rejectReason: string;
  createdAt: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed · awaiting confirmation",
  accepted: "Accepted",
  rejected: "Rejected",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

// The server places the order (prices are re-read from the DB). Returns the order number or an error message.
export async function placeOrder(o: { shop: string; phone: string; address: string; note: string; items: { id: string; qty: number }[] }) {
  const r = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o) });
  const j = await r.json();
  return r.ok ? { id: String(j.id) } : { error: String(j.error) };
}

// null = still loading
export function useOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    fetch("/api/orders").then((r) => (r.ok ? r.json() : [])).then(setOrders, () => setOrders([]));
  }, []);
  return orders;
}
