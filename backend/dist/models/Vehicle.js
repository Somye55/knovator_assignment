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
const vehicleSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});
vehicleSchema.index({ 'location.pincode': 1, capacity: 1 });
vehicleSchema.index({ type: 1, isAvailable: 1 });
exports.default = mongoose_1.default.model('Vehicle', vehicleSchema);
//# sourceMappingURL=Vehicle.js.map