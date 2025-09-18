"use client";

import { useState } from "react";
import { getAvailableVehicles, createBooking, Vehicle } from "@/lib/api";
import VehicleCard from "./VehicleCard";
import BookingConfirmModal from "./BookingConfirmModal";
import LocationAutocomplete, { Location } from "./LocationAutocomplete";

interface SearchAndBookProps {
  onVehicleBooked?: () => void;
}

export default function SearchAndBook({ onVehicleBooked }: SearchAndBookProps) {
  const [searchParams, setSearchParams] = useState({
    capacityRequired: "",
    startTime: "",
  });
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);

  // booking / modal state
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingFieldErrors, setBookingFieldErrors] = useState<{
    [key: string]: string;
  }>({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalConfirming, setModalConfirming] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setBookingSuccess(false);
    setBookingError(null);
    setHasSearched(true);

    try {
      // Client-side validation: backend requires capacityRequired, fromLocation, toLocation and startTime
      if (
        !searchParams.capacityRequired ||
        !fromLocation ||
        !toLocation ||
        !searchParams.startTime
      ) {
        const errors: { [key: string]: string } = {};
        if (!searchParams.capacityRequired)
          errors.capacityRequired = "Capacity Required is required";
        if (!fromLocation) errors.fromLocation = "From Location is required";
        if (!toLocation) errors.toLocation = "To Location is required";
        if (!searchParams.startTime)
          errors.startTime = "Start Time is required";
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      // Validate capacity range (20 - 1500 KG) to match backend constraints
      const capacityNum = Number(searchParams.capacityRequired);
      if (Number.isNaN(capacityNum) || capacityNum < 20 || capacityNum > 1500) {
        setFieldErrors({
          capacityRequired:
            "Capacity Required must be a number between 20 and 1500 KG.",
        });
        setLoading(false);
        return;
      }

      // Check if from and to locations are the same
      if (
        fromLocation.lat === toLocation.lat &&
        fromLocation.lon === toLocation.lon
      ) {
        setFieldErrors({
          fromLocation: "From and to locations cannot be the same",
        });
        setLoading(false);
        return;
      }

      // Convert startTime to ISO before sending (datetime-local returns local string)
      const startTimeIso = new Date(searchParams.startTime).toISOString();

      const response = await getAvailableVehicles({
        capacityRequired: capacityNum,
        fromLat: fromLocation.lat,
        fromLon: fromLocation.lon,
        toLat: toLocation.lat,
        toLon: toLocation.lon,
        startTime: startTimeIso,
      });

      if (response.success && response.data) {
        setVehicles(response.data.data);
      } else {
        setError(response.error || "Failed to search vehicles");
        setVehicles([]);
      }
    } catch {
      setError("An unexpected error occurred");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (vehicleId: string) => {
    // Open confirmation modal with selected vehicle
    const vehicle = vehicles.find((v) => v._id === vehicleId) || null;
    setSelectedVehicle(vehicle);
    setModalError(null);
    setModalOpen(true);
  };

  // Called when user confirms in modal
  const confirmBooking = async () => {
    if (!selectedVehicle) return;
    const vehicleId = selectedVehicle._id;
    setModalConfirming(true);
    setModalError(null);
    setBookingError(null);
    setBookingFieldErrors({});
    setBookingLoading(vehicleId);

    try {
      // Validate locations are not null
      if (!fromLocation || !toLocation) {
        const errors: { [key: string]: string } = {};
        if (!fromLocation) errors.fromLocation = "From location is required";
        if (!toLocation) errors.toLocation = "To location is required";
        setBookingFieldErrors(errors);
        return;
      }

      // Check if from and to locations are the same
      if (
        fromLocation.lat === toLocation.lat &&
        fromLocation.lon === toLocation.lon
      ) {
        setBookingFieldErrors({
          fromLocation: "From and to locations cannot be the same",
        });
        return;
      }

      const estimatedRideDurationHours =
        selectedVehicle.estimatedRideDurationHours ?? 2;
      const startISO = searchParams.startTime
        ? new Date(searchParams.startTime).toISOString()
        : new Date().toISOString();
      const endISO = new Date(
        new Date(startISO).getTime() +
          estimatedRideDurationHours * 60 * 60 * 1000
      ).toISOString();

      const bookingData = {
        vehicle: vehicleId,
        startTime: startISO,
        endTime: endISO,
        from: fromLocation,
        to: toLocation,
        estimatedRideDurationHours,
      };

      const response = await createBooking(bookingData);

      if (response.success && response.data) {
        setBookingSuccess(true);
        // Remove the booked vehicle from the list
        setVehicles((prev) => prev.filter((v) => v._id !== vehicleId));

        if (onVehicleBooked) {
          onVehicleBooked();
        }

        // Close modal on success
        setModalOpen(false);
        setSelectedVehicle(null);

        // Clear form after successful booking
        setSearchParams({
          capacityRequired: "",
          startTime: "",
        });
        setFromLocation(null);
        setToLocation(null);
        setFieldErrors({});
        setBookingFieldErrors({});
        setHasSearched(false);
      } else {
        // Handle backend errors
        if (response.error) {
          setModalError(response.error);
          setBookingError(response.error);
        } else if (response.errors && Array.isArray(response.errors)) {
          // Handle field-specific errors from backend
          const fieldErrorMap: { [key: string]: string } = {};
          response.errors.forEach((error: string) => {
            if (error.includes("Capacity")) {
              fieldErrorMap.capacityRequired = error;
            } else if (error.includes("From location")) {
              fieldErrorMap.fromLocation = error;
            } else if (error.includes("To location")) {
              fieldErrorMap.toLocation = error;
            } else if (error.includes("Start time")) {
              fieldErrorMap.startTime = error;
            } else if (error.includes("Vehicle ID")) {
              fieldErrorMap.vehicleId = error;
            } else if (error.includes("Customer ID")) {
              fieldErrorMap.customerId = error;
            } else if (
              error.includes("From and to locations cannot be the same")
            ) {
              fieldErrorMap.fromLocation = error;
            } else {
              // Generic error
              setModalError(error);
              setBookingError(error);
            }
          });
          setBookingFieldErrors(fieldErrorMap);
          if (Object.keys(fieldErrorMap).length === 0) {
            setModalError("Failed to create booking");
            setBookingError("Failed to create booking");
          }
        } else {
          const err = response.error || "Failed to create booking";
          setModalError(err);
          setBookingError(err);
        }
      }
    } catch (err) {
      setModalError("An unexpected error occurred");
      setBookingError("An unexpected error occurred");
    } finally {
      setModalConfirming(false);
      setBookingLoading(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
    checkFormCompletion();
  };

  const handleFromLocationSelect = (location: Location) => {
    setFromLocation(location);
    checkFormCompletion();
  };

  const handleToLocationSelect = (location: Location) => {
    setToLocation(location);
    checkFormCompletion();
  };

  const checkFormCompletion = () => {
    const isComplete = Boolean(searchParams.capacityRequired) &&
                      Boolean(fromLocation) &&
                      Boolean(toLocation) &&
                      Boolean(searchParams.startTime) &&
                      Object.keys(fieldErrors).length === 0;
    setIsFormComplete(isComplete);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search & Book Vehicles
          </h1>
          <p className="text-lg text-gray-600">
            Find the perfect vehicle for your transportation needs
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="capacityRequired"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Capacity Required (KG)</span>
                  </div>
                </label>
                <input
                  type="number"
                  id="capacityRequired"
                  name="capacityRequired"
                  value={searchParams.capacityRequired}
                  onChange={handleInputChange}
                  min="20"
                  max="1500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>From Location</span>
                  </div>
                </label>
                <LocationAutocomplete
                  placeholder="Enter pickup location..."
                  onLocationSelect={handleFromLocationSelect}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>To Location</span>
                  </div>
                </label>
                <LocationAutocomplete
                  placeholder="Enter destination location..."
                  onLocationSelect={handleToLocationSelect}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !isFormComplete}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>Search Vehicles</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Start Time</span>
                  </div>
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={searchParams.startTime}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!searchParams.startTime ? 'text-gray-400' : 'text-gray-900'}`}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {bookingSuccess && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Booking Confirmed!
                </h3>
                <p className="text-green-700">
                  Your vehicle has been successfully booked.
                </p>
              </div>
            </div>
          </div>
        )}

        {bookingError && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Booking Failed
                </h3>
                <p className="text-red-700">{bookingError}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  Search Error
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600">
              Searching for available vehicles...
            </p>
          </div>
        )}

        {!loading && vehicles.length === 0 && hasSearched && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No vehicles found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria to find available vehicles.
            </p>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}{" "}
                found
              </h2>
              <div className="text-sm text-gray-500">
                Showing available vehicles for your requirements
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  estimatedRideDurationHours={
                    vehicle.estimatedRideDurationHours ?? 0
                  }
                  onBookNow={handleBookNow}
                  isBooking={bookingLoading === vehicle._id}
                />
              ))}

              {/* Booking confirmation modal */}
              <BookingConfirmModal
                isOpen={modalOpen}
                onClose={() => {
                  setModalOpen(false);
                  setSelectedVehicle(null);
                  setModalError(null);
                }}
                vehicle={selectedVehicle}
                fromLocation={fromLocation}
                toLocation={toLocation}
                startTimeIso={
                  searchParams.startTime
                    ? new Date(searchParams.startTime).toISOString()
                    : new Date().toISOString()
                }
                estimatedRideDurationHours={
                  selectedVehicle?.estimatedRideDurationHours ?? 0
                }
                onConfirm={confirmBooking}
                isConfirming={modalConfirming}
                error={modalError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
