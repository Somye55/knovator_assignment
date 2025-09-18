const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Vehicle {
  _id: string;
  name: string;
  type?: string;
  capacityKg: number;
  capacity?: number; // Deprecated alias for capacityKg
  tyres?: number;
  pricePerHour?: number;
  location?: {
    pincode?: string;
    city?: string;
  };
  isAvailable: boolean;
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  estimatedRideDurationHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  _id: string;
  vehicle: Vehicle;
  user: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  pickupLocation: {
    pincode: string;
    city: string;
    address: string;
  };
  dropoffLocation: {
    pincode: string;
    city: string;
    address: string;
  };
  status: string;
  paymentStatus: string;
  estimatedRideDurationHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  name: string;
  capacity: number;
  tyres: number;
}

export interface CreateBookingData {
  vehicle: string;
  startTime: string;
  endTime: string;
  from: {
    name: string;
    lat: number;
    lon: number;
  };
  to: {
    name: string;
    lat: number;
    lon: number;
  };
  estimatedRideDurationHours: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || 'Request failed');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getAvailableVehicles(params: {
  capacityRequired?: number;
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
  startTime?: string;
}): Promise<ApiResponse<{ data: Vehicle[]; count: number }>> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await apiRequest<{ data: Vehicle[]; count: number }>(`/api/vehicles/available?${queryParams.toString()}`);
  return response;
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<ApiResponse<Vehicle>> {
  const body = {
    name: vehicleData.name,
    capacityKg: vehicleData.capacity,
    tyres: vehicleData.tyres,
  };
  return apiRequest<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createBooking(bookingData: CreateBookingData): Promise<ApiResponse<Booking>> {
  const body = {
    vehicleId: bookingData.vehicle,
    from: bookingData.from,
    to: bookingData.to,
    startTime: bookingData.startTime,
    customerId: 'frontend_customer',
  };

  return apiRequest<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getMyBookings(): Promise<ApiResponse<{ data: Booking[]; count: number }>> {
  return apiRequest<{ data: Booking[]; count: number }>('/api/bookings/my-bookings');
}

export async function cancelBooking(id: string): Promise<ApiResponse<Booking>> {
  return apiRequest<Booking>(`/api/bookings/${id}/cancel`, {
    method: 'PUT',
  });
}