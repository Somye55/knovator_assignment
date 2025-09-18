import mongoose, { Schema, Document } from 'mongoose';
import { IBooking } from '../types';

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new Schema<IBookingDocument>({
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    totalHours: {
        type: Number,
        required: [true, 'Total hours is required'],
        min: [0.5, 'Total hours must be at least 0.5']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    },
    pickupLocation: {
        name: {
            type: String,
            required: [true, 'Pickup location name is required'],
            trim: true
        },
        lat: {
            type: Number,
            required: [true, 'Pickup latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        lon: {
            type: Number,
            required: [true, 'Pickup longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        city: {
            type: String,
            required: [true, 'Pickup city is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Pickup address is required'],
            trim: true
        }
    },
    dropoffLocation: {
        name: {
            type: String,
            required: [true, 'Dropoff location name is required'],
            trim: true
        },
        lat: {
            type: Number,
            required: [true, 'Dropoff latitude is required'],
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90']
        },
        lon: {
            type: Number,
            required: [true, 'Dropoff longitude is required'],
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180']
        },
        city: {
            type: String,
            required: [true, 'Dropoff city is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Dropoff address is required'],
            trim: true
        }
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
            message: 'Invalid booking status'
        },
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['pending', 'paid', 'failed', 'refunded'],
            message: 'Invalid payment status'
        },
        default: 'pending'
    },
    estimatedRideDurationHours: {
        type: Number,
        required: [true, 'Estimated ride duration is required'],
        min: [0.5, 'Estimated duration must be at least 0.5 hours']
    },
    customerId: {
        type: String,
        required: [true, 'Customer ID is required']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for faster queries
bookingSchema.index({ vehicle: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function () {
    return ['pending', 'confirmed', 'in_progress'].includes(this.status);
});

// Pre-save hook to calculate total hours and price
bookingSchema.pre('save', function (next) {
    if (this.startTime && this.endTime) {
        const durationMs = this.endTime.getTime() - this.startTime.getTime();
        this.totalHours = durationMs / (1000 * 60 * 60); // Actual hours as decimal
    }
    next();
});

export default mongoose.model<IBookingDocument>('Booking', bookingSchema);