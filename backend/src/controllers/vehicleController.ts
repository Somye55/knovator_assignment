import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import expressValidator from 'express-validator';
import { IApiResponse, CreateVehicleRequest } from '../types';
import { calculateRideDuration } from '../utils/rideUtils';

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
        const { capacityRequired, fromLat, fromLon, toLat, toLon, startTime } = req.query;

        // Validate required parameters
        if (!capacityRequired || !fromLat || !fromLon || !toLat || !toLon || !startTime) {
            const response: IApiResponse = {
                success: false,
                error: 'Missing required parameters: capacityRequired, fromLat, fromLon, toLat, toLon, startTime'
            };
            res.status(400).json(response);
            return;
        }

        // Calculate estimated ride duration based on coordinates
        const fromCoords = {
            lat: parseFloat(fromLat as string),
            lon: parseFloat(fromLon as string)
        };
        const toCoords = {
            lat: parseFloat(toLat as string),
            lon: parseFloat(toLon as string)
        };
        
        const estimatedRideDurationHours = calculateRideDuration(fromCoords, toCoords);
 
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