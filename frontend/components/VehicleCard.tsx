import { Vehicle } from '@/lib/api';

interface VehicleCardProps {
  vehicle: Vehicle;
  estimatedRideDurationHours: number;
  onBookNow: (vehicleId: string) => void;
  isBooking?: boolean;
}

export default function VehicleCard({ 
  vehicle, 
  estimatedRideDurationHours, 
  onBookNow, 
  isBooking = false 
}: VehicleCardProps) {
  const totalPrice = vehicle.pricePerHour * estimatedRideDurationHours;

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'AC': return '❄️';
      case 'GPS': return '📍';
      case 'Music System': return '🎵';
      case 'Bluetooth': return '🔊';
      case 'USB Charging': return '🔌';
      case 'Child Seat': return '👶';
      default: return '✓';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{vehicle.name}</h3>
            <p className="text-gray-600">{vehicle.type}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">₹{vehicle.pricePerHour}<span className="text-sm font-normal text-gray-500">/hr</span></p>
            <p className="text-sm text-gray-500">Total: ₹{totalPrice}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">👥</span>
            <span className="text-sm text-gray-700">{vehicle.capacity} seats</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">📍</span>
            <span className="text-sm text-gray-700">{vehicle.location.city}, {vehicle.location.pincode}</span>
          </div>
        </div>

        {vehicle.features.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature: string) => (
                <span
                  key={feature}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  <span className="mr-1">{getFeatureIcon(feature)}</span>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Est. ride: {estimatedRideDurationHours}h
          </div>
          <button
            onClick={() => onBookNow(vehicle._id)}
            disabled={!vehicle.isAvailable || isBooking}
            className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
              !vehicle.isAvailable || isBooking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {!vehicle.isAvailable ? 'Not Available' : isBooking ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}