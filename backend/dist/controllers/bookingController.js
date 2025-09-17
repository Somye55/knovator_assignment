"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getMyBookings = exports.getAvailableVehicles = exports.createBooking = void 0;
const Booking_1 = __importDefault(require("../models/Booking"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const createBooking = async (req, res) => {
    try {
        const errors = req.validationErrors || [];
        if (!errors.isEmpty()) {
            const response = {
                success: false,
                errors: errors.array()
            };
            res.status(400).json(response);
            return;
        }
        const bookingData = req.body;
        const vehicleDoc = await Vehicle_1.default.findById(bookingData.vehicle);
        if (!vehicleDoc) {
            const response = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }
        if (!vehicleDoc.isAvailable) {
            const response = {
                success: false,
                error: 'Vehicle is not available'
            };
            res.status(400).json(response);
            return;
        }
        const overlappingBooking = await Booking_1.default.findOne({
            vehicle: bookingData.vehicle,
            $or: [
                {
                    startTime: { $lte: new Date(bookingData.startTime) },
                    endTime: { $gte: new Date(bookingData.startTime) }
                },
                {
                    startTime: { $lte: new Date(bookingData.endTime) },
                    endTime: { $gte: new Date(bookingData.endTime) }
                },
                {
                    startTime: { $gte: new Date(bookingData.startTime) },
                    endTime: { $lte: new Date(bookingData.endTime) }
                }
            ],
            status: { $in: ['pending', 'confirmed', 'in_progress'] }
        });
        if (overlappingBooking) {
            const response = {
                success: false,
                error: 'Vehicle is already booked for the selected time period'
            };
            res.status(409).json(response);
            return;
        }
        const durationMs = new Date(bookingData.endTime).getTime() - new Date(bookingData.startTime).getTime();
        const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
        const totalPrice = totalHours * vehicleDoc.pricePerHour;
        const booking = new Booking_1.default({
            vehicle: bookingData.vehicle,
            user: req.user.id,
            startTime: new Date(bookingData.startTime),
            endTime: new Date(bookingData.endTime),
            totalHours,
            totalPrice,
            pickupLocation: bookingData.pickupLocation,
            dropoffLocation: bookingData.dropoffLocation,
            estimatedRideDurationHours: bookingData.estimatedRideDurationHours
        });
        await booking.save();
        vehicleDoc.isAvailable = false;
        await vehicleDoc.save();
        const response = {
            success: true,
            data: booking
        };
        res.status(201).json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.createBooking = createBooking;
const getAvailableVehicles = async (req, res) => {
    try {
        const query = req.query;
        let mongoQuery = { isAvailable: true };
        if (query.capacity) {
            mongoQuery.capacity = { $gte: parseInt(query.capacity) };
        }
        if (query.pickupPincode) {
            mongoQuery['location.pincode'] = query.pickupPincode;
        }
        const vehicles = await Vehicle_1.default.find(mongoQuery);
        const availableVehicles = [];
        for (const vehicle of vehicles) {
            if (query.startTime && query.endTime) {
                const overlappingBooking = await Booking_1.default.findOne({
                    vehicle: vehicle._id,
                    $or: [
                        {
                            startTime: { $lte: new Date(query.startTime) },
                            endTime: { $gte: new Date(query.startTime) }
                        },
                        {
                            startTime: { $lte: new Date(query.endTime) },
                            endTime: { $gte: new Date(query.endTime) }
                        },
                        {
                            startTime: { $gte: new Date(query.startTime) },
                            endTime: { $lte: new Date(query.endTime) }
                        }
                    ],
                    status: { $in: ['pending', 'confirmed', 'in_progress'] }
                });
                if (!overlappingBooking) {
                    availableVehicles.push(vehicle);
                }
            }
            else {
                availableVehicles.push(vehicle);
            }
        }
        const response = {
            success: true,
            count: availableVehicles.length,
            estimatedRideDurationHours: query.estimatedRideDurationHours ? parseFloat(query.estimatedRideDurationHours) : 1,
            data: availableVehicles
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.getAvailableVehicles = getAvailableVehicles;
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ user: req.user.id })
            .populate('vehicle', 'name type capacity pricePerHour')
            .sort('-createdAt');
        const response = {
            success: true,
            count: bookings.length,
            data: bookings
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.getMyBookings = getMyBookings;
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking) {
            const response = {
                success: false,
                error: 'Booking not found'
            };
            res.status(404).json(response);
            return;
        }
        if (booking.user.toString() !== req.user.id) {
            const response = {
                success: false,
                error: 'Not authorized to cancel this booking'
            };
            res.status(401).json(response);
            return;
        }
        if (['completed', 'cancelled'].includes(booking.status)) {
            const response = {
                success: false,
                error: 'Booking cannot be cancelled'
            };
            res.status(400).json(response);
            return;
        }
        booking.status = 'cancelled';
        await booking.save();
        const vehicle = await Vehicle_1.default.findById(booking.vehicle);
        if (vehicle) {
            vehicle.isAvailable = true;
            await vehicle.save();
        }
        const response = {
            success: true,
            data: booking
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            error: error.message
        };
        res.status(500).json(response);
    }
};
exports.cancelBooking = cancelBooking;
//# sourceMappingURL=bookingController.js.map