import haversine from 'haversine-distance';

const AVERAGE_SPEED_KMPH = 50;  // Average speed for a logistics vehicle
const PADDING_FACTOR = 1.4;     // Factor to convert straight-line distance to estimated road distance

// The function now expects objects with lat/lon properties
export function calculateRideDuration(fromCoords: { lat: number; lon: number }, toCoords: { lat: number; lon: number }): number {
  if (!fromCoords || !toCoords || !fromCoords.lat || !fromCoords.lon || !toCoords.lat || !toCoords.lon) {
    console.warn('Invalid coordinates provided.');
    return 8; // Return a default fallback duration
  }

  // haversine() returns distance in meters
  const distanceMeters = haversine(fromCoords, toCoords);
  const distanceKm = distanceMeters / 1000;

  // Estimate the actual road distance
  const estimatedRoadDistanceKm = distanceKm * PADDING_FACTOR;

  // Calculate duration in hours
  const durationHours = estimatedRoadDistanceKm / AVERAGE_SPEED_KMPH;

  // Return a whole number, rounded up
  return Math.ceil(durationHours);
}