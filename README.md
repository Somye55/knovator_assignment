# FleetLink - Vehicle Rental Platform

A modern vehicle rental platform built with Next.js (frontend), Node.js/Express (backend), and MongoDB (database).

## Features

- **Vehicle Search & Booking**: Search for available vehicles based on capacity, location, and time
- **Add Vehicle**: Vehicle owners can add their vehicles to the platform
- **Real-time Availability**: Check vehicle availability for specific time slots
- **Booking Management**: Create and manage bookings with status tracking
- **Responsive Design**: Mobile-friendly interface built with Next.js and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Fetch API** for HTTP requests

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication (ready to implement)
- **Express-validator** for input validation

### Development & Deployment
- **Docker** for containerization (Dockerfiles use Node 20 LTS)
- **Docker Compose** for orchestration
- **ESLint** for code linting

## Project Structure

```
fleetlink/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Mongoose models
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── index.js       # Server entry point
│   ├── package.json
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── src/
│   │   └── app/           # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # API utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+ (for local development)
- MongoDB (local or cloud instance)
- Docker & Docker Compose (for containerized deployment)

### Local Development

#### Option 1: Run Both Servers Simultaneously (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleetlink
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start both frontend and backend**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000 (with nodemon for auto-reload)
   - Frontend server on http://localhost:3000 (with Next.js dev server)

#### Option 2: Run Servers Separately

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleetlink
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with your MongoDB connection string
   # Start the backend
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env.local with backend API URL
   # Start the frontend
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Docker Deployment

1. **Build and run all services**
   ```bash
   docker-compose up --build
   ```

2. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/available` - Get available vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Bookings
- `GET /api/bookings/my-bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/cancel` - Cancel booking

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fleetlink
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Features in Detail

### Vehicle Management
- Add vehicles with details like type, capacity, price, and location
- Vehicle features (AC, GPS, Music System, etc.)
- Real-time availability tracking

### Booking System
- Search for available vehicles based on:
  - Required capacity
  - Pickup location (pincode)
  - Date and time requirements
- Create bookings with:
  - Vehicle selection
  - Pickup/dropoff locations
  - Time duration
  - Automatic pricing calculation

### User Interface
- Clean, modern design with Tailwind CSS
- Responsive layout for all devices
- Intuitive navigation between Search & Book and Add Vehicle pages
- Real-time feedback for all operations

## Development

### Adding New Features
1. Backend: Add new routes in `src/api/`, controllers in `src/controllers/`, and models in `src/models/`
2. Frontend: Create new components in `components/` and pages in `src/app/`
3. Update API communication in `lib/api.ts`

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.