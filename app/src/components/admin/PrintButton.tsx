"use client";
import { Printer } from "lucide-react";
import { btnDark } from "./tokens";

export default function PrintButton() {
  return <button onClick={() => window.print()} className={`${btnDark} no-print mt-6 w-full`}><Printer size={16} />Print / Save as PDF</button>;
}
