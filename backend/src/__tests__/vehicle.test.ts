import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import { createVehicle, getAvailableVehicles } from '../controllers/vehicleController';

// Mock mongoose models
jest.mock('../models/Vehicle');
jest.mock('../models/Booking');

const mockVehicle = Vehicle as jest.Mocked<typeof Vehicle>;
const mockBooking = Booking as jest.Mocked<typeof Booking>;

// Mock response object
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Vehicle Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVehicle', () => {
    it('should create a new vehicle successfully', async () => {
      const req = {
        body: {
          name: 'Test Vehicle',
          capacityKg: 1000,
          tyres: 4
        },
        validationErrors: []
      } as any;

      const res = mockResponse();
      
      const mockVehicleDoc = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Vehicle',
        capacityKg: 1000,
        tyres: 4,
        isAvailable: true,
        save: jest.fn().mockResolvedValue(true)
      };

      mockVehicle.prototype.save = jest.fn().mockResolvedValue(mockVehicleDoc);

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: 'Test Vehicle',
          capacityKg: 1000,
          tyres: 4
        })
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: {
          name: '',
          capacityKg: 0,
          tyres: 0
        },
        validationErrors: ['Vehicle name is required', 'Capacity must be between 1 and 15']
      } as any;

      const res = mockResponse();

      await createVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Vehicle name is required', 'Capacity must be between 1 and 15']
      });
    });
  });

  describe('getAvailableVehicles', () => {
    it('should return available vehicles successfully', async () => {
      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z'
        }
      } as any;

      const res = mockResponse();

      const mockVehicles = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Vehicle 1',
          capacityKg: 1000,
          tyres: 4,
          isAvailable: true,
          toObject: jest.fn().mockReturnValue({
            name: 'Test Vehicle 1',
            capacityKg: 1000,
            tyres: 4,
            isAvailable: true
          })
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Vehicle 2',
          capacityKg: 600,
          tyres: 6,
          isAvailable: true,
          toObject: jest.fn().mockReturnValue({
            name: 'Test Vehicle 2',
            capacityKg: 600,
            tyres: 6,
            isAvailable: true
          })
        }
      ];

      mockVehicle.find = jest.fn().mockResolvedValue(mockVehicles);
      mockBooking.findOne = jest.fn().mockResolvedValue(null); // No overlapping bookings

      await getAvailableVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Vehicle 1',
            capacityKg: 1000,
            tyres: 4,
            estimatedRideDurationHours: 1 // Math.abs(110001 - 110002) % 24 = 1
          }),
          expect.objectContaining({
            name: 'Test Vehicle 2',
            capacityKg: 600,
            tyres: 6,
            estimatedRideDurationHours: 1
          })
        ])
      });
    });

    it('should return 400 if required parameters are missing', async () => {
      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '110001',
          // Missing toPincode and startTime
        }
      } as any;

      const res = mockResponse();

      await getAvailableVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing required parameters: capacityRequired, fromPincode, toPincode, startTime'
      });
    });

    it('should filter out vehicles with overlapping bookings', async () => {
      const req = {
        query: {
          capacityRequired: '500',
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z'
        }
      } as any;

      const res = mockResponse();

      const mockVehicles = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Test Vehicle 1',
          capacityKg: 1000,
          tyres: 4,
          isAvailable: true,
          toObject: jest.fn().mockReturnValue({
            name: 'Test Vehicle 1',
            capacityKg: 1000,
            tyres: 4,
            isAvailable: true
          })
        }
      ];

      mockVehicle.find = jest.fn().mockResolvedValue(mockVehicles);
      mockBooking.findOne = jest.fn().mockResolvedValue({ // Has overlapping booking
        _id: new mongoose.Types.ObjectId(),
        startTime: new Date('2023-10-27T10:00:00Z'),
        endTime: new Date('2023-10-27T11:00:00Z')
      });

      await getAvailableVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });
  });
});