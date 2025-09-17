"use client";

import { useState } from "react";
import { createVehicle, CreateVehicleData } from "@/lib/api";

interface AddVehicleFormProps {
  onVehicleAdded?: () => void;
}

const VEHICLE_TYPES = ["Hatchback", "Sedan", "SUV", "MUV", "Luxury"] as const;
const FEATURES = [
  "AC",
  "GPS",
  "Music System",
  "Bluetooth",
  "USB Charging",
  "Child Seat",
] as const;

export default function AddVehicleForm({
  onVehicleAdded,
}: AddVehicleFormProps) {
  const [formData, setFormData] = useState<CreateVehicleData>({
    name: "",
    type: "Hatchback",
    capacity: 4,
    pricePerHour: 0,
    tyres: 4,
    location: {
      pincode: "",
      city: "",
    },
    features: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: CreateVehicleData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateVehicleData] as Record<
            string,
            unknown
          >),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev: CreateVehicleData) => ({
        ...prev,
        [name]:
          name === "capacity" || name === "pricePerHour"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleFeatureToggle = (feature: (typeof FEATURES)[number]) => {
    setFormData((prev: CreateVehicleData) => ({
      ...prev,
      features: (prev.features || []).includes(feature)
        ? (prev.features || []).filter((f: string) => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createVehicle(formData);

      if (response.success && response.data) {
        setSuccess(true);
        setFormData({
          name: "",
          type: "Hatchback",
          capacity: 4,
          pricePerHour: 0,
          tyres: 4,
          location: {
            pincode: "",
            city: "",
          },
          features: [],
        });

        if (onVehicleAdded) {
          onVehicleAdded();
        }
      } else {
        setError(response.error || "Failed to add vehicle");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          Vehicle added successfully!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-blue-700 mb-1"
          >
            Vehicle Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Toyota Innova"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vehicle Type *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacity *
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              required
              min="1"
              max="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="pricePerHour"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price per Hour (₹) *
            </label>
            <input
              type="number"
              id="pricePerHour"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="tyres"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Tyres *
            </label>
            <input
              type="number"
              id="tyres"
              name="tyres"
              value={formData.tyres}
              onChange={handleInputChange}
              required
              min="2"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="location.pincode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pincode *
            </label>
            <input
              type="text"
              id="location.pincode"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleInputChange}
              required
              pattern="\d{6}"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6-digit pincode"
            />
          </div>

          <div>
            <label
              htmlFor="location.city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              City *
            </label>
            <input
              type="text"
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Delhi"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Features
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FEATURES.map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(formData.features || []).includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                type: "Hatchback",
                capacity: 4,
                pricePerHour: 0,
                tyres: 4,
                location: {
                  pincode: "",
                  city: "",
                },
                features: [],
              });
              setError(null);
              setSuccess(false);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
