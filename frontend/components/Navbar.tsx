'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-blue-600">
              FleetLink
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[80px] text-center ${
                  pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                href="/search-book"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[120px] text-center ${
                  pathname === '/search-book'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Search & Book
              </Link>
              <Link
                href="/add-vehicle"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[100px] text-center ${
                  pathname === '/add-vehicle'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Add Vehicle
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/my-bookings"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 min-w-[110px] text-center ${
                pathname === '/my-bookings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              My Bookings
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}