import mongoose from 'mongoose';

// Vehicle Types
export interface IVehicle {
  name: string;
  type?: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Luxury';
  capacityKg: number;
  pricePerHour?: number;
  tyres: number;
  location?: {
    pincode?: string;
    city?: string;
  };
  features: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking {
  vehicle: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  estimatedRideDurationHours: number;
  customerId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Location Types
export interface ILocation {
  pincode: string;
  city: string;
  address?: string;
}

// API Response Types
export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
  count?: number;
  message?: string;
  estimatedRideDurationHours?: number;
}

// Request/Response Types
export interface CreateVehicleRequest {
  name: string;
  capacityKg: number;
  tyres: number;
}

export interface CreateBookingRequest {
  vehicleId: string;
  fromPincode: string;
  toPincode: string;
  startTime: string;
  customerId: string;
}

export interface AvailableVehiclesQuery {
  capacityRequired?: string;
  fromPincode?: string;
  toPincode?: string;
  startTime?: string;
}