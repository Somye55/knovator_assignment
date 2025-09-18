// Simple validation middleware without express-validator
export const vehicleValidation = (req: any, res: any, next: any) => {
    const { name, capacityKg, tyres } = req.body;
    
    const errors = [];
    
    if (!name || name.length > 100) {
        errors.push('Vehicle name is required and cannot exceed 100 characters');
    }
    
    if (!capacityKg || capacityKg < 1 || capacityKg > 15) {
        errors.push('Capacity must be between 1 and 15');
    }

    if (!tyres || tyres < 1 || tyres > 6) {
        errors.push('Number of tyres must be between 1 and 6');
    }
    
    if (errors.length > 0) {
        req.validationErrors = errors;
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};

export const bookingValidation = (req: any, res: any, next: any) => {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
    
    const errors = [];
    
    if (!vehicleId) {
        errors.push('Vehicle ID is required');
    }
    
    if (!fromPincode || !/^\d{6}$/.test(fromPincode)) {
        errors.push('From pincode must be a 6-digit number');
    }
    
    if (!toPincode || !/^\d{6}$/.test(toPincode)) {
        errors.push('To pincode must be a 6-digit number');
    }
    
    if (!startTime || !Date.parse(startTime)) {
        errors.push('Start time must be a valid date');
    }
    
    if (!customerId) {
        errors.push('Customer ID is required');
    }
    
    if (errors.length > 0) {
        req.validationErrors = errors;
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};

// Handle validation errors
export const handleValidationErrors = (req: any, res: any, next: any) => {
    next();
};
