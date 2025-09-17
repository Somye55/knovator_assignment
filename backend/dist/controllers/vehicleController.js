"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.getVehicle = exports.getAllVehicles = exports.createVehicle = void 0;
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const createVehicle = async (req, res) => {
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
        const vehicleData = {
            ...req.body,
            owner: req.user.id
        };
        const vehicle = new Vehicle_1.default(vehicleData);
        await vehicle.save();
        const response = {
            success: true,
            data: vehicle
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
exports.createVehicle = createVehicle;
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle_1.default.find().populate('owner', 'name email');
        const response = {
            success: true,
            count: vehicles.length,
            data: vehicles
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
exports.getAllVehicles = getAllVehicles;
const getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findById(req.params.id).populate('owner', 'name email');
        if (!vehicle) {
            const response = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            data: vehicle
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
exports.getVehicle = getVehicle;
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findById(req.params.id);
        if (!vehicle) {
            const response = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }
        if (vehicle.owner.toString() !== req.user.id) {
            const response = {
                success: false,
                error: 'Not authorized to update this vehicle'
            };
            res.status(401).json(response);
            return;
        }
        const updatedVehicle = await Vehicle_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        const response = {
            success: true,
            data: updatedVehicle
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
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle_1.default.findById(req.params.id);
        if (!vehicle) {
            const response = {
                success: false,
                error: 'Vehicle not found'
            };
            res.status(404).json(response);
            return;
        }
        if (vehicle.owner.toString() !== req.user.id) {
            const response = {
                success: false,
                error: 'Not authorized to delete this vehicle'
            };
            res.status(401).json(response);
            return;
        }
        await vehicle.deleteOne();
        const response = {
            success: true,
            message: 'Vehicle deleted successfully'
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
exports.deleteVehicle = deleteVehicle;
//# sourceMappingURL=vehicleController.js.map