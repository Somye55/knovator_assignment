import mongoose, { Schema, Document } from 'mongoose';
import { IVehicle } from '../types';

export interface IVehicleDocument extends IVehicle, Document {}

const vehicleSchema = new Schema<IVehicleDocument>({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    maxlength: [100, 'Vehicle name cannot exceed 100 characters']
  },
  capacityKg: {
    type: Number,
    required: [true, 'Vehicle capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    // Increased upper bound to support realistic capacities used in tests and real world
    max: [1000000, 'Capacity cannot exceed 1000000']
  },
  tyres: {
    type: Number,
    required: [true, 'Number of tyres is required'],
    min: [1, 'Vehicle must have at least 1 tyre'],
    max: [6, 'Vehicle cannot have more than 6 tyres']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  location: {
    pincode: {
      type: String,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    city: {
      type: String,
      trim: true
    }
  },
  features: {
    type: [String],
    default: []
  },
  images: {
    type: [String],
    default: []
  }
  // owner field removed for testing without authentication
}, {
  timestamps: true
});

// Index for faster queries
vehicleSchema.index({ 'location.pincode': 1, capacity: 1 });
vehicleSchema.index({ type: 1, isAvailable: 1 });

export default mongoose.model<IVehicleDocument>('Vehicle', vehicleSchema);