const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Vehicle {
  _id: string;
  name: string;
  type?: string;
  // capacity is the frontend-friendly name (backend uses capacityKg)
  capacityKg: number;
  // tyres count (backend includes this)
  tyres?: number;
  pricePerHour?: number;
  location?: {
    pincode?: string;
    city?: string;
  };
  // availability & metadata
  isAvailable: boolean;
  // owner is optional in this project (backend may omit it)
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  // estimated ride duration returned by backend for availability queries
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

  // Call the backend (use unknown so we can validate structure safely)
  const raw = await apiRequest<unknown>(`/api/vehicles/available?${queryParams.toString()}`);

  // If call failed, return a normalized error response
  if (!raw.success) {
    return { success: false, error: raw.error ?? 'Failed to fetch available vehicles' };
  }

  // Normalize vehicle shape to frontend-friendly Vehicle interface
  const payload = raw.data as { data?: unknown[]; count?: number } | undefined;
  const rawList = Array.isArray(payload?.data) ? (payload!.data as unknown[]) : [];

  const list: Vehicle[] = rawList.map((item) => {
    const v = item as Record<string, unknown>;
    const location = typeof v['location'] === 'object' && v['location'] !== null ? (v['location'] as Record<string, unknown>) : undefined;
    const ownerObj = typeof v['owner'] === 'object' && v['owner'] !== null ? (v['owner'] as Record<string, unknown>) : undefined;

    const capacityVal =
      typeof v['capacityKg'] === 'number'
        ? (v['capacityKg'] as number)
        : typeof v['capacity'] === 'number'
        ? (v['capacity'] as number)
        : Number(v['capacityKg'] ?? v['capacity'] ?? 0);

    const isAvailableVal = typeof v['isAvailable'] === 'boolean' ? (v['isAvailable'] as boolean) : true;
    const estimatedVal = typeof v['estimatedRideDurationHours'] === 'number' ? (v['estimatedRideDurationHours'] as number) : undefined;
 
    return {
      _id: String(v['_id'] ?? v['id'] ?? ''),
      name: String(v['name'] ?? 'Unnamed vehicle'),
      type: typeof v['type'] === 'string' ? (v['type'] as string) : undefined,
      capacity: capacityVal,
      // map tyres if provided by backend
      tyres:
        typeof v['tyres'] === 'number'
          ? (v['tyres'] as number)
          : Number(v['tyres'] ?? 0),
      pricePerHour: typeof v['pricePerHour'] === 'number' ? (v['pricePerHour'] as number) : undefined,
      location: location
        ? {
            pincode: typeof location['pincode'] === 'string' ? (location['pincode'] as string) : undefined,
            city: typeof location['city'] === 'string' ? (location['city'] as string) : undefined,
          }
        : undefined,
      isAvailable: isAvailableVal,
      owner: ownerObj
        ? {
            _id: String(ownerObj['_id'] ?? ownerObj['id'] ?? ''),
            name: String(ownerObj['name'] ?? ''),
            email: String(ownerObj['email'] ?? ''),
          }
        : undefined,
      estimatedRideDurationHours: estimatedVal,
      createdAt: String(v['createdAt'] ?? new Date().toISOString()),
      updatedAt: String(v['updatedAt'] ?? new Date().toISOString()),
    } as Vehicle;
  });

  return {
    success: true,
    data: { data: list, count: payload?.count ?? list.length },
  };
}

export async function getAllVehicles(): Promise<ApiResponse<{ data: Vehicle[]; count: number }>> {
  return apiRequest<{ data: Vehicle[]; count: number }>('/api/vehicles');
}

export async function getVehicle(id: string): Promise<ApiResponse<Vehicle>> {
  return apiRequest<Vehicle>(`/api/vehicles/${id}`);
}

export async function createVehicle(vehicleData: CreateVehicleData): Promise<ApiResponse<Vehicle>> {
  // Map frontend form shape to backend expected shape (backend expects capacityKg)
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
  // The backend expects: { vehicleId, from, to, startTime, customerId }
  // Map the frontend booking shape to the backend required shape.
  const body = {
    vehicleId: bookingData.vehicle,
    from: bookingData.from,
    to: bookingData.to,
    startTime: bookingData.startTime,
    customerId: 'frontend_customer', // simple static customer id for frontend usage
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