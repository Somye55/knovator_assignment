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
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: {
      values: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'],
      message: 'Invalid vehicle type'
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Vehicle capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [15, 'Capacity cannot exceed 15']
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Price per hour is required'],
    min: [0, 'Price cannot be negative']
  },
  location: {
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    }
  },
  features: [{
    type: String,
    enum: ['AC', 'GPS', 'Music System', 'Bluetooth', 'USB Charging', 'Child Seat']
  }],
  images: [{
    type: String,
    default: []
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
vehicleSchema.index({ 'location.pincode': 1, capacity: 1 });
vehicleSchema.index({ type: 1, isAvailable: 1 });

export default mongoose.model<IVehicleDocument>('Vehicle', vehicleSchema);