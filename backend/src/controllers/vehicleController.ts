import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';
import expressValidator from 'express-validator';
import { IApiResponse, CreateVehicleRequest } from '../types';

// @desc    Create a new vehicle
// @route   POST /api/vehicles
// @access  Private
export const createVehicle = async (req: Request, res: Response): Promise<void> => {
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

        const vehicleData: CreateVehicleRequest = {
            ...req.body,
            owner: req.user!.id
        };

        const vehicle = new Vehicle(vehicleData);
        await vehicle.save();

        const response: IApiResponse = {
            success: true,
            data: vehicle
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

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getAllVehicles = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicles = await Vehicle.find().populate('owner', 'name email');
        
        const response: IApiResponse = {
            success: true,
            count: vehicles.length,
            data: vehicles
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

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name email');

        if (!vehicle) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }

        const response: IApiResponse = {
            success: true,
            data: vehicle
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

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user owns the vehicle
        if (vehicle.owner.toString() !== req.user!.id) {
            const response: IApiResponse = {
                success: false,
                error: 'Not authorized to update this vehicle'
            };
            res.status(401).json(response);
            return;
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        const response: IApiResponse = {
            success: true,
            data: updatedVehicle
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

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            const response: IApiResponse = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user owns the vehicle
        if (vehicle.owner.toString() !== req.user!.id) {
            const response: IApiResponse = {
                success: false,
                error: 'Not authorized to delete this vehicle'
            };
            res.status(401).json(response);
            return;
        }

        await vehicle.deleteOne();

        const response: IApiResponse = {
            success: true,
            message: 'Vehicle deleted successfully'
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