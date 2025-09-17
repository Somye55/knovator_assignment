"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    vehicle: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle is required']
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
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
        min: [1, 'Total hours must be at least 1']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative']
    },
    pickupLocation: {
        pincode: {
            type: String,
            required: [true, 'Pickup pincode is required'],
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
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
        pincode: {
            type: String,
            required: [true, 'Dropoff pincode is required'],
            match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
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
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});
bookingSchema.index({ vehicle: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.virtual('isActive').get(function () {
    return ['pending', 'confirmed', 'in_progress'].includes(this.status);
});
bookingSchema.pre('save', function (next) {
    if (this.startTime && this.endTime) {
        const durationMs = this.endTime.getTime() - this.startTime.getTime();
        this.totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
    }
    next();
});
exports.default = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map