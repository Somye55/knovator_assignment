import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import expressValidator from 'express-validator';
import { IApiResponse, CreateVehicleRequest } from '../types';

// Request augmentation is provided by src/types/express.d.ts

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
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

        const vehicleData: CreateVehicleRequest = {
            name: req.body.name,
            capacityKg: req.body.capacityKg,
            tyres: req.body.tyres
        };

        const vehicle = new Vehicle(vehicleData);
        const savedVehicle = await vehicle.save();
 
        const response: IApiResponse = {
            success: true,
            data: savedVehicle || vehicle
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
        const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

        // Validate required parameters
        if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
            const response: IApiResponse = {
                success: false,
                error: 'Missing required parameters: capacityRequired, fromPincode, toPincode, startTime'
            };
            res.status(400).json(response);
            return;
        }

        // Calculate estimated ride duration based on pincodes
        const fromPin = parseInt(fromPincode as string);
        const toPin = parseInt(toPincode as string);
        const rawDiff = Math.abs(fromPin - toPin);
        // Apply modulo 24 but treat differences that are exact multiples of 24 as 24 hours
        let estimatedRideDurationHours = rawDiff % 24;
        if (estimatedRideDurationHours === 0 && rawDiff !== 0) {
            estimatedRideDurationHours = 24;
        }
        // Enforce minimum duration to match Booking schema (0.5 hours)
        estimatedRideDurationHours = Math.max(estimatedRideDurationHours, 0.5);
 
        // Calculate endTime = startTime + estimatedRideDurationHours
        const startTimeDate = new Date(startTime as string);
        const endTime = new Date(startTimeDate.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

        // Build query
        let mongoQuery: any = { isAvailable: true };

        // Add capacity filter
        mongoQuery.capacityKg = { $gte: parseInt(capacityRequired as string) };

        // Find vehicles that match basic criteria
        const vehicles = await Vehicle.find(mongoQuery);

        // Filter out vehicles with overlapping bookings
        const availableVehicles = [];
        for (const vehicle of vehicles) {
            const overlappingBooking = await Booking.findOne({
                vehicle: vehicle._id,
                $or: [
                    {
                        startTime: { $lte: endTime },
                        endTime: { $gte: startTimeDate }
                    }
                ],
                status: { $in: ['pending', 'confirmed', 'in_progress'] }
            });

            if (!overlappingBooking) {
                // Add estimated ride duration to vehicle object for response
                const vehicleWithDuration = {
                    ...vehicle.toObject(),
                    estimatedRideDurationHours
                };
                availableVehicles.push(vehicleWithDuration);
            }
        }

        const response: IApiResponse = {
            success: true,
            count: availableVehicles.length,
            data: availableVehicles
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