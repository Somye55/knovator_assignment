import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';
import expressValidator from 'express-validator';
import { IApiResponse, CreateBookingRequest } from '../types';

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

        const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

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

        // Calculate estimated ride duration based on pincodes
        const fromPin = parseInt(fromPincode);
        const toPin = parseInt(toPincode);
        const rawDiff = Math.abs(fromPin - toPin);
        // Apply modulo 24 but treat differences that are exact multiples of 24 as 24 hours
        let estimatedRideDurationHours = rawDiff % 24;
        if (estimatedRideDurationHours === 0 && rawDiff !== 0) {
            estimatedRideDurationHours = 24;
        }
        // Enforce minimum duration to match Booking schema (0.5 hours)
        estimatedRideDurationHours = Math.max(estimatedRideDurationHours, 0.5);
 
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
                pincode: fromPincode,
                city: 'Unknown', // Not in requirements
                address: 'Unknown' // Not in requirements
            },
            dropoffLocation: {
                pincode: toPincode,
                city: 'Unknown', // Not in requirements
                address: 'Unknown' // Not in requirements
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