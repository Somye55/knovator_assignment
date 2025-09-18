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
        errors: ['Capacity must be between 1 and 15']
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
          vehicle: new require('mongoose').Types.ObjectId().toHexString(),
          startTime: '2023-10-27T10:00:00Z',
          endTime: '2023-10-27T11:00:00Z',
          pickupLocation: {
            pincode: '110001',
            city: 'Delhi',
            address: '123 Main St'
          },
          dropoffLocation: {
            pincode: '110002',
            city: 'Delhi',
            address: '456 Side St'
          },
          estimatedRideDurationHours: 1
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

    it('should fail validation for missing vehicle', () => {
      const req = {
        body: {
          startTime: '2023-10-27T10:00:00Z',
          endTime: '2023-10-27T11:00:00Z',
          pickupLocation: {
            pincode: '110001',
            city: 'Delhi',
            address: '123 Main St'
          },
          dropoffLocation: {
            pincode: '110002',
            city: 'Delhi',
            address: '456 Side St'
          },
          estimatedRideDurationHours: 1
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
        errors: ['Vehicle is required']
      });
    });

    it('should fail validation for invalid pincode', () => {
      const req = {
        body: {
          vehicle: new require('mongoose').Types.ObjectId().toHexString(),
          startTime: '2023-10-27T10:00:00Z',
          endTime: '2023-10-27T11:00:00Z',
          pickupLocation: {
            pincode: '123', // Invalid pincode
            city: 'Delhi',
            address: '123 Main St'
          },
          dropoffLocation: {
            pincode: '110002',
            city: 'Delhi',
            address: '456 Side St'
          },
          estimatedRideDurationHours: 1
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
        errors: ['Pickup pincode must be a 6-digit number']
      });
    });

    it('should fail validation for missing pickup city', () => {
      const req = {
        body: {
          vehicle: new require('mongoose').Types.ObjectId().toHexString(),
          startTime: '2023-10-27T10:00:00Z',
          endTime: '2023-10-27T11:00:00Z',
          pickupLocation: {
            pincode: '110001',
            address: '123 Main St'
          },
          dropoffLocation: {
            pincode: '110002',
            city: 'Delhi',
            address: '456 Side St'
          },
          estimatedRideDurationHours: 1
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
        errors: ['Pickup city is required']
      });
    });

    it('should fail validation for invalid estimated ride duration', () => {
      const req = {
        body: {
          vehicle: new require('mongoose').Types.ObjectId().toHexString(),
          startTime: '2023-10-27T10:00:00Z',
          endTime: '2023-10-27T11:00:00Z',
          pickupLocation: {
            pincode: '110001',
            city: 'Delhi',
            address: '123 Main St'
          },
          dropoffLocation: {
            pincode: '110002',
            city: 'Delhi',
            address: '456 Side St'
          },
          estimatedRideDurationHours: 0.1 // Too short
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
        errors: ['Estimated ride duration must be at least 0.5 hours']
      });
    });
  });
});