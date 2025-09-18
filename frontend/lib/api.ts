const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Vehicle {
  _id: string;
  name: string;
  type?: string;
  capacity: number;
  pricePerHour?: number;
  location?: {
    pincode?: string;
    city?: string;
  };
  features: string[];
  images: string[];
  isAvailable: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
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
  estimatedRideDurationHours: number;
}

// Generic API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function for API requests
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

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Vehicle API functions
export async function getAvailableVehicles(params: {
  capacityRequired?: number;
  fromPincode?: string;
  toPincode?: string;
  startTime?: string;
}): Promise<ApiResponse<{ data: Vehicle[]; count: number }>> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, value.toString());
    }
  });

  return apiRequest<{ data: Vehicle[]; count: number }>(
    `/api/vehicles/available?${queryParams.toString()}`
  );
}

export async function getAllVehicles(): Promise<ApiResponse<{ data: Vehicle[]; count: number }>> {
  return apiRequest<{ data: Vehicle[]; count: number }>('/api/vehicles');
}

export async function getVehicle(id: string): Promise<ApiResponse<Vehicle>> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`);
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<ApiResponse<Vehicle>> {
  return apiRequest<Vehicle>('/api/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  });
}

export async function updateVehicle(
  id: string,
  vehicleData: Partial<CreateVehicleData>
): Promise<ApiResponse<Vehicle>> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData),
  });
}

export async function deleteVehicle(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/api/vehicles/${id}`, {
    method: 'DELETE',
  });
}

// Booking API functions
export async function createBooking(bookingData: CreateBookingData): Promise<ApiResponse<Booking>> {
  return apiRequest<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
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