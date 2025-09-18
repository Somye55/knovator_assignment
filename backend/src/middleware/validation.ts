// Simple validation middleware without express-validator
export const vehicleValidation = (req: any, res: any, next: any) => {
    const { name, capacityKg, tyres } = req.body;
    
    const errors: string[] = [];
    
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        errors.push('Vehicle name is required and cannot exceed 100 characters');
    }

    const capacityNum = Number(capacityKg);
    // Enforce capacity between 20kg and 3000kg per requirements
    if (!capacityKg || Number.isNaN(capacityNum) || capacityNum < 20 || capacityNum > 3000) {
        errors.push('Capacity must be between 20 and 3000 (KG)');
    }

    const tyresNum = Number(tyres);
    // Enforce minimum of 2 tyres (and keep a reasonable upper bound)
    if (!tyres || Number.isNaN(tyresNum) || tyresNum < 2 || tyresNum > 6) {
        errors.push('Number of tyres must be between 2 and 6');
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
    const { vehicleId, from, to, startTime, customerId } = req.body;
    
    const errors: string[] = [];
    
    if (!vehicleId) {
        errors.push('Vehicle ID is required');
    }
    
    // Validate from location
    if (!from || !from.name || !from.lat || !from.lon) {
        errors.push('From location is required and must include name, lat, and lon');
    } else {
        if (typeof from.name !== 'string' || from.name.trim().length === 0) {
            errors.push('From location name is required and must be a string');
        }
        if (typeof from.lat !== 'number' || from.lat < -90 || from.lat > 90) {
            errors.push('From location latitude must be a number between -90 and 90');
        }
        if (typeof from.lon !== 'number' || from.lon < -180 || from.lon > 180) {
            errors.push('From location longitude must be a number between -180 and 180');
        }
    }
    
    // Validate to location
    if (!to || !to.name || !to.lat || !to.lon) {
        errors.push('To location is required and must include name, lat, and lon');
    } else {
        if (typeof to.name !== 'string' || to.name.trim().length === 0) {
            errors.push('To location name is required and must be a string');
        }
        if (typeof to.lat !== 'number' || to.lat < -90 || to.lat > 90) {
            errors.push('To location latitude must be a number between -90 and 90');
        }
        if (typeof to.lon !== 'number' || to.lon < -180 || to.lon > 180) {
            errors.push('To location longitude must be a number between -180 and 180');
        }
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
