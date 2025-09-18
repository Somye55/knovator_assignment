// Simple validation middleware without express-validator
export const vehicleValidation = (req: any, res: any, next: any) => {
    const { name, capacityKg, tyres } = req.body;
    
    const errors: string[] = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        errors.push('Vehicle name is required and cannot exceed 100 characters');
    }

    const capacityNum = Number(capacityKg);
    // Allow large realistic capacities (tests / real world may use 1000+)
    if (!capacityKg || Number.isNaN(capacityNum) || capacityNum < 1 || capacityNum > 1000000) {
        errors.push('Capacity must be between 1 and 1000000');
    }

    const tyresNum = Number(tyres);
    if (!tyres || Number.isNaN(tyresNum) || tyresNum < 1 || tyresNum > 6) {
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
    
    const errors: string[] = [];
    
    if (!vehicleId) {
        errors.push('Vehicle ID is required');
    }
    
    if (!fromPincode || !/^\d{6}$/.test(fromPincode)) {
        errors.push('From pincode must be a 6-digit number');
    }
    
    if (!toPincode || !/^\d{6}$/.test(toPincode)) {
        errors.push('To pincode must be a 6-digit number');
    }
    
    if (!startTime || Number.isNaN(Date.parse(startTime))) {
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

// Handle validation errors (kept as passthrough for compatibility with controllers/tests)
export const handleValidationErrors = (req: any, res: any, next: any) => {
    next();
};
