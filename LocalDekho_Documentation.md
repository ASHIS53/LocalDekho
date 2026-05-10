# LocalDekho: Hyperlocal Shop Discovery Platform
**Complete Developer Guide & Walkthrough**

---

## 1. Project Overview

**LocalDekho** is a full-stack, mobile-first platform designed to connect local customers with nearby shop owners. It supports three distinct user roles, each with its own customized navigation and feature set.

### Tech Stack
* **Frontend:** React Native (Expo)
* **Backend:** Node.js, Express.js
* **Database:** Firebase Firestore (NoSQL)
* **Authentication:** Firebase Phone Auth (Client) + Custom JWT (Backend)
* **Media Storage:** Cloudinary

### User Roles
1. **Customer:** Can view nearby shops, browse products, and send inquiries.
2. **Shop Owner:** Can register their shop, add/manage products, and view customer inquiries.
3. **Admin:** Has a system overview dashboard to approve or reject new shop registrations.

---

## 2. Directory Structure

```text
NEARR/
├── localdekho-backend/
│   ├── src/
│   │   ├── config/       (Firebase & Cloudinary config)
│   │   ├── middleware/   (JWT Verification & Role Checking)
│   │   └── routes/       (Auth, Shops, Products, Inquiries, Admin, Upload)
│   ├── server.js         (Main Express Application)
│   └── .env              (Environment Variables)
│
└── localdekho-frontend/
    ├── src/
    │   ├── context/      (AuthContext for Global State)
    │   ├── navigation/   (AppNavigator, CustomerNavigator, OwnerNavigator)
    │   ├── screens/
    │   │   ├── auth/     (LoginScreen)
    │   │   ├── customer/ (CustomerHome, ShopDetail)
    │   │   ├── owner/    (OwnerDashboard, ShopRegistration, AddProduct, ManageProducts, InquiriesList)
    │   │   └── admin/    (AdminDashboard)
    │   └── services/     (Firebase Initialization)
    └── App.js            (Main Entry Point)
```

---

## 3. Setup & Installation Guide

### Prerequisites
* Node.js (v18+)
* Expo CLI (`npm install -g expo-cli`)
* Firebase Service Account JSON (for backend)
* Cloudinary API Credentials

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd localdekho-backend
   npm install
   ```
2. Create a `.env` file in the root of the backend:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FIREBASE_PROJECT_ID=localdekho-87c39
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   *The backend will start on `http://localhost:5000`.*

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd localdekho-frontend
   npm install
   ```
2. Create a `.env` file in the root of the frontend:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_WIFI_IP_ADDRESS:5000
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=localdekho-87c39
   ```
   *(Note: Replace `YOUR_WIFI_IP_ADDRESS` with your machine's local IP (e.g., 192.168.x.x) so your phone can connect to the backend).*
3. Start the Expo app:
   ```bash
   npx expo start
   ```

---

## 4. Application Walkthrough

### Step 1: Authentication (Login Screen)
* **Flow:** The user enters their 10-digit phone number. Recaptcha verifies the user, and an OTP is sent via Firebase. Upon entering the 6-digit OTP, the frontend requests a JWT and Role from the backend (`/api/auth/verify-otp`).
* **Routing:** `AuthContext` saves the token and user role. The `AppNavigator` reads the role and dynamically routes the user to their specific dashboard.

### Step 2: Customer Experience
* **Home Screen:** Shows shops nearby using the Haversine formula (Distance calculation). The UI is visually appealing with a green theme.
* **Shop Detail:** Clicking on a shop shows its products in a grid.
* **Inquiry:** Customers can click "💬 Send Inquiry to Owner", which instantly notifies the shop owner.

### Step 3: Shop Owner Experience
* **Dashboard:** Owners see their shop status (Pending/Approved) and can toggle their shop "Open" or "Closed".
* **Registration:** If they haven't registered yet, they are forced to the Registration screen.
* **Manage Products:** They can view their inventory, toggle "In Stock / Out of Stock", or delete items.
* **Add Product:** They can take/select a photo, fill in details, and upload it to Cloudinary.
* **Inquiries:** A dedicated inbox for messages sent by customers. Clicking "Mark as Read" changes the UI state.

### Step 4: Admin Experience
* **Dashboard:** A secure, dark-blue themed panel.
* **Animated Stats:** Shows total counts of Users, Shops, and Products smoothly counting up from zero.
* **Approval Queue:** Displays newly registered shops that are awaiting review.
* **Action Logic:** Tapping "Approve" or "Reject" triggers an Alert dialog. Upon confirmation, the backend updates the shop's status, determining whether it will be visible to Customers.

---

## 5. Security & Architecture Notes
* **Role-Based Access Control (RBAC):** Every protected backend route uses a `roleCheck` middleware (e.g., `roleCheck(['admin'])`) to ensure users cannot access unauthorized data.
* **Token Verification:** The backend completely trusts Firebase Admin to verify the ID Token before issuing a custom JWT session token.
* **Storage Optimization:** Images are uploaded directly to Cloudinary using `multer` memory storage, meaning the Node.js server does not clog up its local hard drive with user images.

---
*Generated by Antigravity AI for LocalDekho Project.*
