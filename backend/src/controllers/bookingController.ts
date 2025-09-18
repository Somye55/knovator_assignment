import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';
import expressValidator from 'express-validator';
import { IApiResponse, CreateBookingRequest } from '../types';
import { calculateRideDuration } from '../utils/rideUtils';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = (req as any).validationErrors || [];
        if (errors.length > 0) {
            const response: IApiResponse = {
                success: false,
                errors: errors
            };
            res.status(400).json(response);
            return;
        }

        const { vehicleId, from, to, startTime, customerId } = req.body;

        // Check if vehicle exists
        const vehicleDoc = await Vehicle.findById(vehicleId);
        if (!vehicleDoc) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }

        // Calculate estimated ride duration based on coordinates
        const estimatedRideDurationHours = calculateRideDuration(from, to);
 
        // Calculate bookingEndTime = startTime + estimatedRideDurationHours
        const startTimeDate = new Date(startTime);
        const bookingEndTime = new Date(startTimeDate.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

        // Re-verify that the vehicle does NOT have any conflicting bookings for the calculated time window
        const overlappingBooking = await Booking.findOne({
            vehicle: vehicleId,
            $or: [
                {
                    startTime: { $lte: bookingEndTime },
                    endTime: { $gte: startTimeDate }
                }
            ],
            status: { $in: ['pending', 'confirmed', 'in_progress'] }
        });

        if (overlappingBooking) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle is already booked for an overlapping time slot'
            };
            res.status(409).json(response);
            return;
        }

        // Create booking
        const booking = new Booking({
            vehicle: vehicleId,
            startTime: startTimeDate,
            endTime: bookingEndTime,
            totalHours: estimatedRideDurationHours,
            totalPrice: 0, // No pricing logic in requirements
            pickupLocation: {
                name: from.name,
                lat: from.lat,
                lon: from.lon,
                city: 'Unknown', // Not in requirements
                address: from.name // Use the location name as address
            },
            dropoffLocation: {
                name: to.name,
                lat: to.lat,
                lon: to.lon,
                city: 'Unknown', // Not in requirements
                address: to.name // Use the location name as address
            },
            estimatedRideDurationHours,
            customerId: customerId || 'default_customer_id' // Use provided customerId or default
        });

        const savedBooking = await booking.save();
 
        const response: IApiResponse = {
            success: true,
            data: savedBooking || booking
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

/**
 * @desc    Get bookings for a customer
 * @route   GET /api/bookings/my-bookings
 * @access  Private (simple public implementation for frontend demo)
 *
 * Accepts optional query param `customerId`. If not provided, defaults to the frontend static id used by the client.
 */
export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const customerId = String(req.query.customerId ?? 'frontend_customer');

        // Fetch bookings for the customer and include vehicle details
        const bookings = await Booking.find({ customerId })
            .populate('vehicle')
            .sort({ createdAt: -1 });

        const response: IApiResponse = {
            success: true,
            data: bookings,
            count: bookings.length
        };

        res.status(200).json(response);
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
        const { id } = req.params;
        
        // Find the booking
        const booking = await Booking.findById(id);
        if (!booking) {
            const response: IApiResponse = {
                success: false,
                error: 'Booking not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if booking can be cancelled (only pending or confirmed bookings)
        if (booking.status === 'cancelled') {
            const response: IApiResponse = {
                success: false,
                error: 'Booking is already cancelled'
            };
            res.status(400).json(response);
            return;
        }

        if (booking.status === 'in_progress' || booking.status === 'completed') {
            const response: IApiResponse = {
                success: false,
                error: 'Cannot cancel an in-progress or completed booking'
            };
            res.status(400).json(response);
            return;
        }

        // Update booking status to cancelled
        booking.status = 'cancelled';
        const updatedBooking = await booking.save();

        const response: IApiResponse = {
            success: true,
            data: updatedBooking,
            message: 'Booking cancelled successfully'
        };

        res.status(200).json(response);
    } catch (error) {
        const response: IApiResponse = {
            success: false,
            error: (error as Error).message
        };
        res.status(500).json(response);
    }
};