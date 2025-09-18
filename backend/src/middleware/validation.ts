// Simple validation middleware without express-validator
export const vehicleValidation = (req: any, res: any, next: any) => {
    const { name, type, capacity, pricePerHour, tyres, location } = req.body;
    
    const errors = [];
    
    if (!name || name.length > 100) {
        errors.push('Vehicle name is required and cannot exceed 100 characters');
    }
    
    if (!['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury'].includes(type)) {
        errors.push('Invalid vehicle type');
    }
    
    if (!capacity || capacity < 1 || capacity > 15) {
        errors.push('Capacity must be between 1 and 15');
    }
    
    if (!pricePerHour || pricePerHour < 0) {
        errors.push('Price per hour must be a positive number');
    }

    if (!tyres || tyres < 1 || tyres > 6) {
        errors.push('Number of tyres must be between 1 and 6');
    }
    
    if (!location?.pincode || !/^\d{6}$/.test(location.pincode)) {
        errors.push('Pincode must be a 6-digit number');
    }
    
    if (!location?.city) {
        errors.push('City is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }
    
    next();
};

export const bookingValidation = (req: any, res: any, next: any) => {
    const { vehicle, startTime, endTime, pickupLocation, dropoffLocation, estimatedRideDurationHours } = req.body;
    
    const errors = [];
    
    if (!vehicle) {
        errors.push('Vehicle is required');
    }
    
    if (!startTime || !Date.parse(startTime)) {
        errors.push('Start time must be a valid date');
    }
    
    if (!endTime || !Date.parse(endTime)) {
        errors.push('End time must be a valid date');
    }
    
    if (!pickupLocation?.pincode || !/^\d{6}$/.test(pickupLocation.pincode)) {
        errors.push('Pickup pincode must be a 6-digit number');
    }
    
    if (!pickupLocation?.city) {
        errors.push('Pickup city is required');
    }
    
    if (!pickupLocation?.address) {
        errors.push('Pickup address is required');
    }
    
    if (!dropoffLocation?.pincode || !/^\d{6}$/.test(dropoffLocation.pincode)) {
        errors.push('Dropoff pincode must be a 6-digit number');
    }
    
    if (!dropoffLocation?.city) {
        errors.push('Dropoff city is required');
    }
    
    if (!dropoffLocation?.address) {
        errors.push('Dropoff address is required');
    }
    
    if (!estimatedRideDurationHours || estimatedRideDurationHours < 0.5) {
        errors.push('Estimated ride duration must be at least 0.5 hours');
    }
    
    if (errors.length > 0) {
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
