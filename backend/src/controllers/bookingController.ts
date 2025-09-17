import { Request, Response } from 'express';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';
import expressValidator from 'express-validator';
import { IApiResponse, CreateBookingRequest, AvailableVehiclesQuery } from '../types';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = (req as any).validationErrors || [];
        if (!errors.isEmpty()) {
            const response: IApiResponse = {
                success: false,
                errors: errors.array()
            };
            res.status(400).json(response);
            return;
        }

        const bookingData: CreateBookingRequest = req.body;

        // Check if vehicle exists and is available
        const vehicleDoc = await Vehicle.findById(bookingData.vehicle);
        if (!vehicleDoc) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }

        if (!vehicleDoc.isAvailable) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle is not available'
            };
            res.status(400).json(response);
            return;
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
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
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle is already booked for the selected time period'
            };
            res.status(409).json(response);
            return;
        }

        // Calculate total price
        const durationMs = new Date(bookingData.endTime).getTime() - new Date(bookingData.startTime).getTime();
        const totalHours = Math.ceil(durationMs / (1000 * 60 * 60));
        const totalPrice = totalHours * vehicleDoc.pricePerHour;

        // Create booking
        const booking = new Booking({
            vehicle: bookingData.vehicle,
            user: req.user!.id,
            startTime: new Date(bookingData.startTime),
            endTime: new Date(bookingData.endTime),
            totalHours,
            totalPrice,
            pickupLocation: bookingData.pickupLocation,
            dropoffLocation: bookingData.dropoffLocation,
            estimatedRideDurationHours: bookingData.estimatedRideDurationHours
        });

        await booking.save();

        // Update vehicle availability
        vehicleDoc.isAvailable = false;
        await vehicleDoc.save();

        const response: IApiResponse = {
            success: true,
            data: booking
        };
        res.status(201).json(response);
    } catch (error) {
        const response: IApiResponse = {
            success: false,
            error: (error as Error).message
        };
        res.status(500).json(response);
    }
};

// @desc    Get available vehicles
// @route   GET /api/vehicles/available
// @access  Public
export const getAvailableVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const query: AvailableVehiclesQuery = req.query;

        // Build query
        let mongoQuery: any = { isAvailable: true };

        // Add capacity filter
        if (query.capacity) {
            mongoQuery.capacity = { $gte: parseInt(query.capacity) };
        }

        // Add location filter
        if (query.pickupPincode) {
            mongoQuery['location.pincode'] = query.pickupPincode;
        }

        // Find vehicles that match basic criteria
        const vehicles = await Vehicle.find(mongoQuery);

        // Filter out vehicles with overlapping bookings
        const availableVehicles = [];
        for (const vehicle of vehicles) {
            if (query.startTime && query.endTime) {
                const overlappingBooking = await Booking.findOne({
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
            } else {
                availableVehicles.push(vehicle);
            }
        }

        const response: IApiResponse = {
            success: true,
            count: availableVehicles.length,
            estimatedRideDurationHours: query.estimatedRideDurationHours ? parseFloat(query.estimatedRideDurationHours) : 1,
            data: availableVehicles
        };
        res.json(response);
    } catch (error) {
        const response: IApiResponse = {
            success: false,
            error: (error as Error).message
        };
        res.status(500).json(response);
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const bookings = await Booking.find({ user: req.user!.id })
            .populate('vehicle', 'name type capacity pricePerHour')
            .sort('-createdAt');

        const response: IApiResponse = {
            success: true,
            count: bookings.length,
            data: bookings
        };
        res.json(response);
    } catch (error) {
        const response: IApiResponse = {
            success: false,
            error: (error as Error).message
        };
        res.status(500).json(response);
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            const response: IApiResponse = {
                success: false,
                error: 'Booking not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user owns the booking
        if (booking.user.toString() !== req.user!.id) {
            const response: IApiResponse = {
                success: false,
                error: 'Not authorized to cancel this booking'
            };
            res.status(401).json(response);
            return;
        }

        // Check if booking can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            const response: IApiResponse = {
                success: false,
                error: 'Booking cannot be cancelled'
            };
            res.status(400).json(response);
            return;
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Make vehicle available again
        const vehicle = await Vehicle.findById(booking.vehicle);
        if (vehicle) {
            vehicle.isAvailable = true;
            await vehicle.save();
        }

        const response: IApiResponse = {
            success: true,
            data: booking
        };
        res.json(response);
    } catch (error) {
        const response: IApiResponse = {
            success: false,
            error: (error as Error).message
        };
        res.status(500).json(response);
    }
};