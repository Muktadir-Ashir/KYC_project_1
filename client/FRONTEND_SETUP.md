# KYC Frontend - React TypeScript Setup Guide

## Overview

This is a React TypeScript frontend for the KYC (Know Your Customer) system. It communicates with a backend API running on `http://localhost:5000`.

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── KYCForm.tsx       # Form to submit KYC information
│   │   └── KYCList.tsx       # Display list of KYC records
│   ├── services/
│   │   ├── api.ts            # Axios API instance with interceptors
│   │   └── kycService.ts     # KYC API service methods
│   ├── styles/
│   │   ├── KYCForm.css       # KYC form styling
│   │   └── KYCList.css       # KYC list styling
│   ├── App.tsx               # Main App component with routing
│   ├── App.css               # Main app styling
│   └── index.tsx             # React entry point
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

## Features

### 1. **KYC Form** (`/`)

- Submit KYC information including:
  - User ID, Name, Email, Phone
  - Address, City, State, Zip Code
  - Document Type (Passport, Driving License, etc.)
  - Document Number
- Form validation
- Error handling and success messages

### 2. **KYC Records** (`/records`)

- View all submitted KYC records
- Display records in a table format with:
  - Name
  - Email
  - Phone
  - Document Type
  - Status (Pending, Approved, Rejected)
  - Created Date

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   - Create or edit `.env` file:

   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   - The app will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (irreversible)

## API Integration

### Services Structure

#### `api.ts`

- Axios instance with base URL configuration
- Interceptors for:
  - Adding Authorization token to requests
  - Handling 401 unauthorized responses
  - Token refresh logic

#### `kycService.ts`

- Methods for KYC operations:
  - `getAllKYC()` - Fetch all KYC records
  - `getKYCById(id)` - Fetch specific KYC record
  - `createKYC(data)` - Submit new KYC
  - `updateKYC(id, data)` - Update existing KYC
  - `deleteKYC(id)` - Delete KYC record

## Component Details

### KYCForm Component

- **Props**: `onSuccess?: () => void`
- **State**: Form data, loading status, error/success messages
- **Features**:
  - Two-column form layout
  - Responsive design
  - Real-time validation
  - Error and success alerts

### KYCList Component

- **State**: KYC records, loading status, error messages
- **Features**:
  - Fetches records on component mount
  - Responsive table layout
  - Status badges with color coding
  - Loading state

## Styling

### Color Scheme

- **Primary Green**: `#4caf50` - Buttons, highlights
- **Dark Blue**: `#2c3e50` - Navigation, footer
- **Light Gray**: `#f9f9f9` - Backgrounds
- **Success**: `#d4edda` - Success alerts
- **Error**: `#f8d7da` - Error alerts
- **Warning**: `#fff3cd` - Pending status

### Responsive Design

- Mobile-first approach
- Breakpoint at 768px for desktop view
- Breakpoint at 600px for small screens

## Routing

The application uses React Router v7 for navigation:

- `/` - KYC Form page
- `/records` - KYC Records page

## Security Features

1. **Token Management**

   - Tokens stored in localStorage
   - Automatically added to API requests
   - Removed on 401 response

2. **CORS Support**

   - Backend configured with CORS for frontend requests
   - Environment-based API URL configuration

3. **Error Handling**
   - User-friendly error messages
   - API error interception
   - Network error handling

## Troubleshooting

### Issue: Cannot connect to backend

- **Solution**: Ensure backend is running on `http://localhost:5000`
- Check `.env` file for correct API URL
- Check browser console for network errors

### Issue: Port 3000 already in use

- **Solution**:
  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
  Or start on different port:
  ```bash
  PORT=3001 npm start
  ```

### Issue: Dependencies not installed

- **Solution**:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy to Hosting

- Netlify, Vercel, GitHub Pages, or similar services
- Update `REACT_APP_API_URL` to your production API URL
- Follow platform-specific deployment instructions

## Development Tips

1. **Debug Mode**

   - Install React Developer Tools browser extension
   - Open DevTools (F12)
   - Use Console tab for debugging

2. **API Testing**

   - Use Postman or similar tools to test API endpoints
   - Verify backend is responding correctly

3. **Hot Reload**
   - Changes to files automatically reload in browser
   - Check console for compilation errors

## Dependencies

### Main Dependencies

- `react@^19.2.0` - UI library
- `react-dom@^19.2.0` - DOM rendering
- `react-router-dom@^7.9.5` - Routing
- `axios@^1.13.2` - HTTP client
- `typescript@^4.9.5` - TypeScript support

### Dev Dependencies

- `react-scripts@5.0.1` - Build scripts
- `@testing-library/react@^16.3.0` - Testing utilities

## Next Steps

1. Enhance form validation with libraries like `react-hook-form`
2. Add file upload for documents
3. Implement user authentication
4. Add admin panel for KYC verification
5. Implement pagination for KYC records
6. Add filters and search functionality
7. Deploy to production environment

## Contact & Support

For issues or questions, contact the development team or check the backend documentation.
