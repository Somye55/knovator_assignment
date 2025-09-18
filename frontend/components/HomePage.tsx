import Link from 'next/link';
import BookingCard from './BookingCard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">FleetLink</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Your trusted vehicle rental platform for all your transportation needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto items-stretch">
          <BookingCard
            title="Search & Book"
            description="Find and book available vehicles for your transportation needs with our easy-to-use platform"
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            linkHref="/search-book"
            buttonText="Start Searching"
            buttonColor="blue"
            iconBgColor="bg-blue-100"
            iconHoverBgColor="group-hover:bg-blue-200"
          />
          
          <BookingCard
            title="My Bookings"
            description="View and manage all your current and past vehicle rental bookings in one place"
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            linkHref="/my-bookings"
            buttonText="View Bookings"
            buttonColor="purple"
            iconBgColor="bg-purple-100"
            iconHoverBgColor="group-hover:bg-purple-200"
          />
          
          <BookingCard
            title="Add Vehicle"
            description="List your vehicle for rent and earn money from rentals with our simple listing process"
            icon={
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            linkHref="/add-vehicle"
            buttonText="Add Vehicle"
            buttonColor="green"
            iconBgColor="bg-green-100"
            iconHoverBgColor="group-hover:bg-green-200"
          />
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white rounded-full shadow-md">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 font-medium">Choose your option to get started with FleetLink</span>
          </div>
        </div>
      </div>
    </div>
  );
}