import mongoose from 'mongoose';
import { vehicleValidation, bookingValidation } from '../middleware/validation';

describe('Validation Middleware', () => {
  describe('vehicleValidation', () => {
    it('should pass validation for valid vehicle data', () => {
      const req = {
        body: {
          name: 'Test Vehicle',
          capacityKg: 1000,
          tyres: 4
        }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      const next = jest.fn();

      vehicleValidation(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail validation for missing name', () => {
      const req = {
        body: {
          capacityKg: 1000,
          tyres: 4
        }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      vehicleValidation(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Vehicle name is required and cannot exceed 100 characters']
      });
    });

    it('should fail validation for invalid capacity', () => {
      const req = {
        body: {
          name: 'Test Vehicle',
          capacityKg: 0,
          tyres: 4
        }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      vehicleValidation(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Capacity must be between 1 and 1000000']
      });
    });

    it('should fail validation for invalid tyres', () => {
      const req = {
        body: {
          name: 'Test Vehicle',
          capacityKg: 1000,
          tyres: 0
        }
      } as any;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      vehicleValidation(req, res, () => {});

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Number of tyres must be between 1 and 6']
      });
    });
  });

  describe('bookingValidation', () => {
    it('should pass validation for valid booking data', () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        }
      } as any;
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
  
      const next = jest.fn();
  
      bookingValidation(req, res, next);
  
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  
    it('should fail validation for missing vehicleId', () => {
      const req = {
        body: {
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        }
      } as any;
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
  
      bookingValidation(req, res, () => {});
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Vehicle ID is required']
      });
    });
  
    it('should fail validation for invalid fromPincode', () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '123', // Invalid pincode
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z',
          customerId: 'customer123'
        }
      } as any;
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
  
      bookingValidation(req, res, () => {});
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['From pincode must be a 6-digit number']
      });
    });
  
    it('should fail validation for invalid startTime', () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: 'invalid-date',
          customerId: 'customer123'
        }
      } as any;
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
  
      bookingValidation(req, res, () => {});
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Start time must be a valid date']
      });
    });
  
    it('should fail validation for missing customerId', () => {
      const req = {
        body: {
          vehicleId: new mongoose.Types.ObjectId().toHexString(),
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2023-10-27T10:00:00Z'
        }
      } as any;
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;
  
      bookingValidation(req, res, () => {});
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: ['Customer ID is required']
      });
    });
  });
});