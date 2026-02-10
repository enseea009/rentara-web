# Rentara Car Rental Website

## Project Setup
This project is located in `c:\Users\Ense\Downloads\Rentara Web`.

## How to Run
1. **Open Terminal** in this folder.
2. **Install Dependencies**:
   ```powershell
   npm install
   ```
3. **Initialize Database** (Ensure MySQL is running):
   ```powershell
   npm run init-db
   ```
   *Note: Update `.env` if your MySQL root user has a password.*
4. **Start Server**:
   ```powershell
   npm run dev
   ```
5. **View Website**:
   Open `index.html` in your browser or use "Live Server".

## Features Implemented
- **Public Pages**: Home, About, Vehicles, Help
- **Authentication**: Login, Sign Up (with separated names)
- **Booking Flow**: Search -> Select Car -> Payment (Mock with GCash) -> Confirmation
- **Dashboard**: Manage Bookings, User Profile
- **Backend**: Node.js/Express API with MySQL database

## Admin
- Admin functionality is prepared in the database but currently uses manual entry or direct database access for management.
