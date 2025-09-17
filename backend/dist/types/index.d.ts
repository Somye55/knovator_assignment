import mongoose from 'mongoose';
export interface IVehicle {
    name: string;
    type: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Luxury';
    capacity: number;
    pricePerHour: number;
    location: {
        pincode: string;
        city: string;
    };
    features: string[];
    images: string[];
    isAvailable: boolean;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBooking {
    vehicle: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
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
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ILocation {
    pincode: string;
    city: string;
    address?: string;
}
export interface IApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: any[];
    count?: number;
    message?: string;
    estimatedRideDurationHours?: number;
}
export interface CreateVehicleRequest {
    name: string;
    type: 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Luxury';
    capacity: number;
    pricePerHour: number;
    location: ILocation;
    features?: string[];
    images?: string[];
}
export interface CreateBookingRequest {
    vehicle: string;
    startTime: string;
    endTime: string;
    pickupLocation: ILocation & {
        address: string;
    };
    dropoffLocation: ILocation & {
        address: string;
    };
    estimatedRideDurationHours: number;
}
export interface AvailableVehiclesQuery {
    capacity?: string;
    pickupPincode?: string;
    startTime?: string;
    endTime?: string;
    estimatedRideDurationHours?: string;
}
//# sourceMappingURL=index.d.ts.map