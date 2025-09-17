FleetLink - Logistics Vehicle Booking System

📘 Scenario:
Your company is building FleetLink, a platform to manage and book
logistics vehicles for B2B clients. You are tasked with developing both the
core backend service and a simple web-based frontend interface. The
backend will manage the vehicle fleet, check availability based on capacity,
route, and time, and handle bookings. The frontend will allow
administrators/users to add vehicles, search for available vehicles based on
criteria, and initiate bookings. Reliability and accurate availability checking
remain paramount.

🎯 Objective:
Build a full-stack application (Node.js backend, React frontend, MongoDB
database) to:
1. Backend: Implement robust logic for managing vehicles, calculating
availability considering existing bookings and estimated ride times,
and handling booking requests. Ensure data integrity.
2. Frontend: Develop a user interface allowing users to:
a. Add new vehicles to the fleet.
b. Search for available vehicles based on capacity, route
(pincodes), and desired start time.
c. View search results displaying available vehicles and their
estimated ride duration for the requested route.
d. Initiate a booking for a selected available vehicle.
3. Testing: Write comprehensive unit tests for the critical backend logic
(availability check, booking validation).

📦 Tech Stack:
● Frontend: ReactJS
● Backend: NodeJS
● Database: MongoDB
● Testing: Jest (or a similar Node.js testing framework for the backend)

🔧 Functional Requirements:
Backend APIS:
● POST /api/vehicles: Add a new vehicle.
○ Request Body: { "name": "...", "capacityKg": ..., "tyres": ... }
○ Response: 201 Created with the created vehicle object.
○ Validation: Ensure required fields are present and have the
correct types.

● GET /api/vehicles/available: Find available vehicles.
○ Query Parameters:
■ capacityRequired: Number (e.g., ?capacityRequired=500)
■ fromPincode: String
■ toPincode: String
■ startTime: String (ISO Date format, e.g.,
2023-10-27T10:00:00Z) - The desired start time for the
booking.

○ Logic:
■ Calculate estimatedRideDurationHours based on the
provided pincodes (use the simplified logic below).
■ Calculate the required endTime = startTime +
estimatedRideDurationHours.
■ Find all vehicles where capacityKg >= capacityRequired.
■ From that list, filter out vehicles that have any existing
bookings in the Bookings collection that overlap with the
calculated time window (startTime to endTime). (See Core
Logic section).

■ Response: 200 OK with an array of available vehicle
objects. Along with estimatedRideDurationHours.

● POST /api/bookings: Book a vehicle.
○ Request Body: { "vehicleId": "...", "fromPincode": "...",
"toPincode": "...", "startTime": "...", "customerId": "..." }
○ Logic:
■ Calculate estimatedRideDurationHours based on
pincodes.
■ Calculate bookingEndTime = startTime +
estimatedRideDurationHours.
■ Crucially: Before creating the booking, re-verify that the
specified vehicleId does NOT have any conflicting
bookings for the calculated time window (startTime to
bookingEndTime). This prevents race conditions if
availability changed between the GET call and this POST
call.
■ If available, create a new document in the Bookings
collection.
○ Response:
■ 201 Created with the created booking object if successful.
■ 409 Conflict (or similar error) if the vehicle is already
booked for an overlapping time slot.
■ 404 Not Found if the vehicle ID doesn't exist.

Core Logic Details:
● Ride Duration Calculation:
○ For simplicity, use the formula: estimatedRideDurationHours
= Math.abs(parseInt(toPincode) - parseInt(fromPincode)) %
24 (Take the absolute difference of pincode numbers, modulo
24 to keep it within a day - treat this as hours).
○ Note: Acknowledge in your documentation that this is a highly
simplified placeholder logic.

Unit Testing (Backend - Using Jest or similar):
● (As previously defined): Cover POST /api/vehicles, GET
/api/vehicles/available logic (especially overlap cases), and POST
/api/bookings logic (success and conflict scenarios).

Frontend (React/Next):
● Pages/Components:
○ Add Vehicle Page:
■ A form with fields for Name, Capacity (KG), and Tyres.
■ A submit button that calls the POST /api/vehicles backend
endpoint.
■ Display success or error messages from the backend.
○ Search & Book Page:
■ A form with fields for Capacity Required, From Pincode, To
Pincode, and Start Date & Time (use a date-time picker).
■ A "Search Availability" button that calls the GET
/api/vehicles/available endpoint with the form data as
query parameters.
■ A results area to display the list of available vehicles
returned by the API. Each item should show:
● Vehicle Name
● Capacity
● Tyres
● Estimated Ride Duration (for this specific search)
● A "Book Now" button.
■ Clicking "Book Now" next to a vehicle should:
● Gather the necessary info (vehicleId from the search
result, plus the fromPincode, toPincode, startTime
from the search form, and potentially a hardcoded
customerId for simplicity).
● Call the POST /api/bookings backend endpoint.

● Display a confirmation message upon successful
booking or an error message (e.g., "Vehicle became
unavailable" if a booking conflict occurs).
● Interaction: Use standard HTTP requests (Fetch API or Axios) to
communicate with the backend APIS.
● UI/UX: Focus on functionality over aesthetics. Basic styling is
sufficient. Ensure clear feedback to the user (loading states,
success/error messages).

🏆 Bonus Points:
● Dockerize the entire application (docker-compose.yml for frontend,
backend, and MongoDB).
● Implement a more realistic ride duration logic.
● Add a DELETE /api/bookings/:id endpoint and a way to view/cancel
bookings on the frontend.
● Improve frontend UX with better loading indicators, date pickers, and
potentially basic routing (react-router-dom).