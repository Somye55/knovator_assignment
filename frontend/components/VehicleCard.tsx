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
  isBooking = false,
}: VehicleCardProps) {
  // Display strictly the fields required by the spec:
  // - Vehicle Name
  // - Capacity (KG)
  // - Tyres
  // - Estimated Ride Duration
  // - Book Now button
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{vehicle.name}</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-xs text-gray-500">Capacity (KG)</div>
            <div className="text-sm text-gray-900">{vehicle.capacity}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Tyres</div>
            <div className="text-sm text-gray-900">{vehicle.tyres ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Est. ride</div>
            <div className="text-sm text-gray-900">{estimatedRideDurationHours}h</div>
          </div>
        </div>

        <div className="flex justify-end">
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