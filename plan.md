Of course. Here is the modified high-level plan, updated to use **Next.js** for the frontend, the native **Fetch API** for HTTP requests, and **Vanilla CSS** (with CSS Modules) for styling.

### **Project Implementation Plan: FleetLink (Next.js Edition)**

This plan outlines the development process for the FleetLink application, incorporating Next.js as the frontend framework.

---

### **Phase 0: Foundation & Environment Setup**

**Objective:** Prepare the complete development environment, project structure, and database connection.

1.  **Version Control:**
    *   Initialize a Git repository.
    *   Create a `.gitignore` file for `node_modules`, `.env`, build artifacts (`.next`), etc.

2.  **Backend Setup (Node.js/Express):**
    *   *(No changes from the original plan)*
    *   Initialize a Node.js project (`npm init -y`).
    *   Install dependencies: `express`, `mongoose`, `cors`, `dotenv`.
    *   Install dev dependencies: `nodemon`, `jest`, `supertest`.
    *   Set up a standard folder structure (`/src`, `/api`, `/controllers`, `/models`, etc.).
    *   Set up the basic Express server.

3.  **Frontend Setup (Next.js):**
    *   Create a new Next.js application: `npx create-next-app@latest frontend`.
    *   When prompted, choose the **App Router**, TypeScript (recommended) or JavaScript, and Tailwind CSS **(No)**.
    *   Establish a Next.js folder structure:
        *   `/app` - For file-based routing.
            *   `/` - Root page (can be used for Search & Book).
            *   `/add-vehicle/` - Route for the Add Vehicle page.
            *   `layout.js`, `page.js`, `globals.css` - Core Next.js files.
        *   `/components` - For reusable UI components (e.g., VehicleCard, SearchForm).
        *   `/lib` or `/services` - For API communication logic using Fetch.

4.  **Database Setup (MongoDB):**
    *   *(No changes from the original plan)*
    *   Set up a MongoDB instance (local or cloud).
    *   Create a `.env` file in the backend root for the connection URI.
    *   Implement database connection logic in the backend.

5.  **Styling Setup (Vanilla CSS):**
    *   Utilize `app/globals.css` for site-wide base styles (fonts, colors, resets).
    *   For component-specific styling, use **CSS Modules**. Create files like `MyComponent.module.css` to scope styles locally and avoid class name collisions.

---

### **Phase 1: Backend - Core Models & Vehicle Management**

**(No changes from the original plan)**

This phase is entirely backend-focused and remains the same. You will still implement the Mongoose schemas for `Vehicle` and `Booking` and the `POST /api/vehicles` endpoint in your separate Node.js/Express application.

---

### **Phase 2: Backend - Core Logic (Availability & Booking)**

**(No changes from the original plan)**

This phase is entirely backend-focused and remains the same. You will implement the `GET /api/vehicles/available` and `POST /api/bookings` endpoints with their critical business logic in your Node.js/Express application.

---

### **Phase 3: Backend - Unit Testing**

**(No changes from the original plan)**

This phase is entirely backend-focused and remains the same. You will write Jest and Supertest unit tests for the backend APIs.

---

### **Phase 4: Frontend - UI Development & Integration (Next.js)**

**Objective:** Build the user interface using Next.js components and connect it to the backend APIs using the Fetch API.

1.  **API Communication Layer:**
    *   Create a file like `/lib/api.js`.
    *   Define async functions that use the **Fetch API** to communicate with your backend.
    *   Example `createBooking` function:
        ```javascript
        export async function createBooking(bookingData) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
          });

          if (!response.ok) {
            // Handle HTTP errors like 409 Conflict or 404 Not Found
            const errorData = await response.json();
            throw new Error(errorData.message || 'Booking failed');
          }
          return response.json();
        }
        ```
    *   Store the backend URL (`http://localhost:PORT`) in a `.env.local` file in the frontend as `NEXT_PUBLIC_API_URL`.

2.  **Add Vehicle Page:**
    *   Create the page file at `/app/add-vehicle/page.js`.
    *   Since this page contains an interactive form, its core component must be a **Client Component**. Create a new component file like `/components/AddVehicleForm.js` and place the `'use client'` directive at the top.
    *   Import and use this form component in `/app/add-vehicle/page.js`.
    *   The form will use `useState` to manage input state.
    *   On submit, call the `addVehicle` function from your API library.
    *   Use CSS Modules for styling: create `AddVehicleForm.module.css` and import it. Example: `import styles from './AddVehicleForm.module.css'; <form className={styles.form}>...`.

3.  **Search & Book Page:**
    *   Use the root page `/app/page.js` for this functionality.
    *   Create a `/components/SearchAndBook.js` component marked with `'use client'` to handle all state and interactivity.
    *   **Search Form:**
        *   Build the form with inputs for capacity, pincodes, and a date-time picker.
        *   On "Search Availability" click, call the `getAvailableVehicles` fetch function.
    *   **Results Display:**
        *   Manage state for search results (`vehicles`) and loading status (`isLoading`).
        *   Conditionally render a loading message or the results.
        *   Create a reusable `/components/VehicleCard.js` component to display each vehicle's details. Style it with its own `VehicleCard.module.css`.
        *   Pass the search's `estimatedRideDurationHours` down to each card.
    *   **Booking Action:**
        *   The "Book Now" button in `VehicleCard` will trigger a function passed down via props from `SearchAndBook.js`.
        *   This function will gather the required booking data and call the `createBooking` fetch function.
        *   Display a confirmation or error message based on the API response.

---

### **Phase 5: Refinements & Bonus Points**

**Objective:** Enhance the application and prepare for deployment.

1.  **Dockerization:**
    *   **Backend `Dockerfile`:** Remains the same.
    *   **Frontend `Dockerfile` (for Next.js):** This will be different from a standard React app. It will need to copy the entire project, install dependencies, run `npm run build`, and the final `CMD` will be `npm start` to run the optimized Next.js server.
    *   **`docker-compose.yml`:** Update the frontend service definition to build from the new Next.js Dockerfile and expose the correct port (3000 by default).

2.  **UX Improvements:**
    *   **Routing:** Use Next.js's built-in file-based routing and the `<Link>` component for navigation (e.g., creating a simple navbar in `app/layout.js` to switch between pages). No need for `react-router-dom`.
    *   Implement better loading states (e.g., disabling buttons during API calls) and user feedback messages (toasts or alerts).

3.  **Additional Features (Optional):**
    *   *(No changes from the original plan)*
    *   Implement `DELETE /api/bookings/:id` and a corresponding UI.
    *   Improve the ride duration logic.