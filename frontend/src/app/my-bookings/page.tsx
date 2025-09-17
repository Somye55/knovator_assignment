'use client';

import { useState, useEffect } from 'react';
import { Booking, getMyBookings, cancelBooking } from '@/lib/api';
import Link from 'next/link';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data.data);
      } else {
        setError(response.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      const response = await cancelBooking(bookingId);
      if (response.success) {
        // Refresh bookings after successful cancellation
        await fetchBookings();
      } else {
        setError(response.error || 'Failed to cancel booking');
      }
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <Link
          href="/search-book"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Book Another Vehicle
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Start by booking your first vehicle!</p>
          <Link
            href="/search-book"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Book a Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.vehicle.name}</h3>
                  <p className="text-gray-600">{booking.vehicle.type} • {booking.vehicle.capacity} seats</p>
                </div>
                <div className="mt-2 md:mt-0">
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Pickup</h4>
                  <p className="text-gray-900">{booking.pickupLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    {booking.pickupLocation.city}, {booking.pickupLocation.pincode}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(booking.startTime)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Dropoff</h4>
                  <p className="text-gray-900">{booking.dropoffLocation.address}</p>
                  <p className="text-sm text-gray-600">
                    {booking.dropoffLocation.city}, {booking.dropoffLocation.pincode}
                  </p>
                  <p className="text-sm text-gray-600">{formatDate(booking.endTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                  <p className="text-gray-900">{booking.totalHours} hours</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Total Price</h4>
                  <p className="text-gray-900">₹{booking.totalPrice}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Ride Duration</h4>
                  <p className="text-gray-900">{booking.estimatedRideDurationHours} hours</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-gray-600">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </div>
                
                {booking.status === 'pending' || booking.status === 'confirmed' ? (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    disabled={cancellingId === booking._id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}