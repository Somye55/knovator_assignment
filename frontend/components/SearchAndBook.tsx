'use client';

import { useState } from 'react';
import { getAvailableVehicles, createBooking, Vehicle } from '@/lib/api';
import VehicleCard from './VehicleCard';
import BookingConfirmModal from './BookingConfirmModal';

interface SearchAndBookProps {
  onVehicleBooked?: () => void;
}

export default function SearchAndBook({ onVehicleBooked }: SearchAndBookProps) {
  const [searchParams, setSearchParams] = useState({
    capacityRequired: '',
    fromPincode: '',
    toPincode: '',
    startTime: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // booking / modal state
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalConfirming, setModalConfirming] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBookingSuccess(false);
    setBookingError(null);

    try {
      // Client-side validation: backend requires capacityRequired, fromPincode, toPincode and startTime
      if (
        !searchParams.capacityRequired ||
        !searchParams.fromPincode ||
        !searchParams.toPincode ||
        !searchParams.startTime
      ) {
        setError('Please provide Capacity Required, From Pincode, To Pincode and Start Time before searching.');
        setLoading(false);
        return;
      }

      // Validate capacity range (20 - 1500 KG) to match backend constraints
      const capacityNum = Number(searchParams.capacityRequired);
      if (Number.isNaN(capacityNum) || capacityNum < 20 || capacityNum > 1500) {
        setError('Capacity Required must be a number between 20 and 1500 KG.');
        setLoading(false);
        return;
      }

      // Convert startTime to ISO before sending (datetime-local returns local string)
      const startTimeIso = new Date(searchParams.startTime).toISOString();

      const response = await getAvailableVehicles({
        capacityRequired: capacityNum,
        fromPincode: searchParams.fromPincode,
        toPincode: searchParams.toPincode,
        startTime: startTimeIso,
      });

      if (response.success && response.data) {
        setVehicles(response.data.data);
      } else {
        setError(response.error || 'Failed to search vehicles');
        setVehicles([]);
      }
    } catch {
      setError('An unexpected error occurred');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (vehicleId: string) => {
    // Open confirmation modal with selected vehicle
    const vehicle = vehicles.find(v => v._id === vehicleId) || null;
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
    setBookingLoading(vehicleId);

    try {
      const estimatedRideDurationHours = selectedVehicle.estimatedRideDurationHours ?? 2;
      const startISO = searchParams.startTime ? new Date(searchParams.startTime).toISOString() : new Date().toISOString();
      const endISO = new Date(new Date(startISO).getTime() + estimatedRideDurationHours * 60 * 60 * 1000).toISOString();

      const bookingData = {
        vehicle: vehicleId,
        startTime: startISO,
        endTime: endISO,
        pickupLocation: {
          pincode: searchParams.fromPincode || '110001',
          city: 'Delhi',
          address: '123 Main Street',
        },
        dropoffLocation: {
          pincode: searchParams.toPincode || '110002',
          city: 'Delhi',
          address: '456 Another Street',
        },
        estimatedRideDurationHours,
      };

      const response = await createBooking(bookingData);

      if (response.success && response.data) {
        setBookingSuccess(true);
        // Remove the booked vehicle from the list
        setVehicles(prev => prev.filter(v => v._id !== vehicleId));

        if (onVehicleBooked) {
          onVehicleBooked();
        }

        // Close modal on success
        setModalOpen(false);
        setSelectedVehicle(null);
      } else {
        const err = response.error || 'Failed to create booking';
        setModalError(err);
        setBookingError(err);
      }
    } catch (err) {
      setModalError('An unexpected error occurred');
      setBookingError('An unexpected error occurred');
    } finally {
      setModalConfirming(false);
      setBookingLoading(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search & Book Vehicles</h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="capacityRequired" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity Required (KG)
                </label>
                <input
                  type="number"
                  id="capacityRequired"
                  name="capacityRequired"
                  value={searchParams.capacityRequired}
                  onChange={handleInputChange}
                  min="20"
                  max="1500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label htmlFor="fromPincode" className="block text-sm font-medium text-gray-700 mb-1">
                  From Pincode
                </label>
                <input
                  type="text"
                  id="fromPincode"
                  name="fromPincode"
                  value={searchParams.fromPincode}
                  onChange={handleInputChange}
                  pattern="\d{6}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6-digit pincode"
                />
              </div>

              <div>
                <label htmlFor="toPincode" className="block text-sm font-medium text-gray-700 mb-1">
                  To Pincode
                </label>
                <input
                  type="text"
                  id="toPincode"
                  name="toPincode"
                  value={searchParams.toPincode}
                  onChange={handleInputChange}
                  pattern="\d{6}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6-digit pincode"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search Vehicles'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (ISO Date format)
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={searchParams.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {bookingSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            Booking confirmed successfully!
          </div>
        )}

        {bookingError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {bookingError}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Searching for available vehicles...</p>
          </div>
        )}

        {!loading && vehicles.length === 0 && (searchParams.fromPincode || searchParams.capacityRequired) && (
          <div className="text-center py-8">
            <p className="text-gray-600">No vehicles found matching your criteria.</p>
          </div>
        )}

        {!loading && vehicles.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  estimatedRideDurationHours={vehicle.estimatedRideDurationHours ?? 0}
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
                fromPincode={searchParams.fromPincode}
                toPincode={searchParams.toPincode}
                startTimeIso={searchParams.startTime ? new Date(searchParams.startTime).toISOString() : new Date().toISOString()}
                estimatedRideDurationHours={selectedVehicle?.estimatedRideDurationHours ?? 0}
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