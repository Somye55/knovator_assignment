"use client";

import React from "react";
import { Vehicle } from "@/lib/api";

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  fromPincode: string;
  toPincode: string;
  startTimeIso: string; // ISO string
  estimatedRideDurationHours: number;
  onConfirm: () => Promise<void>;
  isConfirming?: boolean;
  error?: string | null;
}

export default function BookingConfirmModal({
  isOpen,
  onClose,
  vehicle,
  fromPincode,
  toPincode,
  startTimeIso,
  estimatedRideDurationHours,
  onConfirm,
  isConfirming = false,
  error = null,
}: BookingConfirmModalProps) {
  if (!isOpen || !vehicle) return null;

  const start = new Date(startTimeIso);
  const end = new Date(start.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Confirm Booking</h2>

        <div className="mb-4">
          <h3 className="font-medium">{vehicle.name}</h3>
          <p className="text-sm text-gray-600">{vehicle.type ?? "Vehicle"}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 mb-4">
          <div>
            <div className="text-xs text-gray-500">Pickup Pincode</div>
            <div className="text-sm">{fromPincode}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Dropoff Pincode</div>
            <div className="text-sm">{toPincode}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Start Time</div>
            <div className="text-sm">{start.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">End Time</div>
            <div className="text-sm">{end.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Estimated Duration</div>
            <div className="text-sm">{estimatedRideDurationHours} hours</div>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isConfirming}
          >
            {isConfirming ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}