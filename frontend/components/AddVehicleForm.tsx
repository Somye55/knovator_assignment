"use client";

import { useState } from "react";
import { createVehicle, CreateVehicleData } from "@/lib/api";

interface AddVehicleFormProps {
  onVehicleAdded?: () => void;
}


export default function AddVehicleForm({
  onVehicleAdded,
}: AddVehicleFormProps) {
  const [formData, setFormData] = useState<CreateVehicleData>({
    name: "",
    capacity: 0,
    tyres: 0, // Changed from 2 to 0 to show placeholder
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  // support both input and select change events
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: CreateVehicleData) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "tyres"
          ? value === "" ? 0 : Number(value)
          : value,
    }));
    checkFormCompletion();
  };

  const checkFormCompletion = () => {
    const isComplete = formData.name.trim() !== "" &&
                      formData.capacity > 0 &&
                      formData.tyres > 0;
    setIsFormComplete(isComplete);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Client-side validation to match backend rules: capacity 20-3000, tyres 2-6
    if (formData.capacity < 20 || formData.capacity > 3000) {
      setError('Capacity must be between 20 and 3000 KG');
      setLoading(false);
      return;
    }
    if (formData.tyres < 2 || formData.tyres > 6) {
      setError('Number of tyres must be between 2 and 6');
      setLoading(false);
      return;
    }

    try {
      const response = await createVehicle(formData);

      if (response.success && response.data) {
        setSuccess(true);
        // Reset form to initial empty/default values
        setFormData({
          name: "",
          capacity: 0,
          tyres: 0,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Capacity (KG) *
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity || ''}
              onChange={handleInputChange}
              required
              min="20"
              max="3000"
              placeholder="e.g., 500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="tyres"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Tyres *
            </label>
            <select
              id="tyres"
              name="tyres"
              value={formData.tyres || ''}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.tyres === 0 ? 'text-gray-400' : 'text-gray-900'}`}
            >
              <option value="">Select number of tyres</option>
              <option value={2}>2 tyres</option>
              <option value={3}>3 tyres</option>
              <option value={4}>4 tyres</option>
              <option value={5}>5 tyres</option>
              <option value={6}>6 tyres</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: "",
                capacity: 0,
                tyres: 0,
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
            disabled={loading || !isFormComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
