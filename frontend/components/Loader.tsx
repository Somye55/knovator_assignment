'use client';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50" style={{ top: '64px' }}>
      <div className="text-center">
        {/* Pulse animation circle */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        
        {/* Pulsing dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}