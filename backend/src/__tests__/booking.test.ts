import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle';
import Booking from '../models/Booking';
import { createBooking } from '../controllers/bookingController';

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

describe('Booking Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        },
        validationErrors: []
      } as any;

      const res = mockResponse();

      const mockVehicleDoc = {
        _id: new mongoose.Types.ObjectId(),
        capacityKg: 1000,
        isAvailable: true,
        save: jest.fn()
      };

      const mockBookingDoc = {
        _id: new mongoose.Types.ObjectId(),
        vehicle: mockVehicleDoc._id,
        startTime: new Date('2023-10-27T10:00:00Z'),
        endTime: new Date('2023-10-27T11:00:00Z'), // +1 hour ride duration
        totalHours: 1,
        totalPrice: 0,
        pickupLocation: {
          pincode: '110001',
          city: 'Unknown',
          address: 'Unknown'
        },
        dropoffLocation: {
          pincode: '110002',
          city: 'Unknown',
          address: 'Unknown'
        },
        estimatedRideDurationHours: 1,
        customerId: 'customer123',
        status: 'pending',
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      mockVehicle.findById = jest.fn().mockResolvedValue(mockVehicleDoc);
      mockBooking.findOne = jest.fn().mockResolvedValue(null); // No overlapping bookings
      mockBooking.prototype.save = jest.fn().mockResolvedValue(mockBookingDoc);

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          vehicle: mockVehicleDoc._id,
          startTime: expect.any(Date),
          endTime: expect.any(Date),
          totalHours: 1,
          estimatedRideDurationHours: 1,
          customerId: 'customer123'
        })
      });
    });

    it('should return 404 if vehicle is not found', async () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        },
        validationErrors: []
      } as any;

      const res = mockResponse();

      mockVehicle.findById = jest.fn().mockResolvedValue(null);

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Vehicle not found'
      });
    });

    it('should return 409 if vehicle has overlapping booking', async () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        },
        validationErrors: []
      } as any;

      const res = mockResponse();

      const mockVehicleDoc = {
        _id: new mongoose.Types.ObjectId(),
        capacityKg: 1000,
        isAvailable: true,
        save: jest.fn()
      };

      const overlappingBooking = {
        _id: new mongoose.Types.ObjectId(),
        vehicle: mockVehicleDoc._id,
        startTime: new Date('2023-10-27T10:30:00Z'), // Overlaps with requested time
        endTime: new Date('2023-10-27T11:30:00Z'),
        status: 'confirmed'
      };

      mockVehicle.findById = jest.fn().mockResolvedValue(mockVehicleDoc);
      mockBooking.findOne = jest.fn().mockResolvedValue(overlappingBooking);

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Vehicle is already booked for an overlapping time slot'
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: {
          vehicleId: '',
          fromPincode: 'invalid',
          toPincode: 'invalid',
          startTime: 'invalid-date',
          customerId: ''
        },
        validationErrors: [
          'Vehicle ID is required',
          'From pincode must be a 6-digit number',
          'To pincode must be a 6-digit number',
          'Start time must be a valid date',
          'Customer ID is required'
        ]
      } as any;

      const res = mockResponse();

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [
          'Vehicle ID is required',
          'From pincode must be a 6-digit number',
          'To pincode must be a 6-digit number',
          'Start time must be a valid date',
          'Customer ID is required'
        ]
      });
    });

    it('should calculate ride duration correctly', async () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110025', // Difference of 24, modulo 24 = 0, but should be 24
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        },
        validationErrors: []
      } as any;

      const res = mockResponse();

      const mockVehicleDoc = {
        _id: new mongoose.Types.ObjectId(),
        capacityKg: 1000,
        isAvailable: true,
        save: jest.fn()
      };

      const mockBookingDoc = {
        _id: new mongoose.Types.ObjectId(),
        vehicle: mockVehicleDoc._id,
        startTime: new Date('2023-10-27T10:00:00Z'),
        endTime: new Date('2023-10-28T10:00:00Z'), // +24 hours ride duration
        totalHours: 24,
        totalPrice: 0,
        pickupLocation: {
          pincode: '110001',
          city: 'Unknown',
          address: 'Unknown'
        },
        dropoffLocation: {
          pincode: '110025',
          city: 'Unknown',
          address: 'Unknown'
        },
        estimatedRideDurationHours: 24,
        customerId: 'customer123',
        status: 'pending',
        paymentStatus: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      mockVehicle.findById = jest.fn().mockResolvedValue(mockVehicleDoc);
      mockBooking.findOne = jest.fn().mockResolvedValue(null);
      mockBooking.prototype.save = jest.fn().mockResolvedValue(mockBookingDoc);

      await createBooking(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          estimatedRideDurationHours: 24,
          totalHours: 24,
          endTime: expect.any(Date)
        })
      });
    });
  });
});