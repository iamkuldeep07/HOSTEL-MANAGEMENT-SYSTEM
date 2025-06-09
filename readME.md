# NITM Hostel Management System Backend

This is the backend for a **Hostel Management System** designed for a college with three hostels (Hostel A, Hostel B, Hostel C) at NIT Meghalaya (NITM). The system manages student registrations, room allocations, hostel-specific mess menus, complaints, fee payments, leave requests, visitor tracking, and automated notifications. It is built using Node.js, Express, MongoDB, and other modern technologies, ensuring scalability, security, and role-based access control for students, wardens, and admins.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## Features
- **User Authentication & Authorization**:
  - Role-based access for `Admin`, `Warden`, and `User` (students).
  - NITM-specific email validation (`@nitm.ac.in`).
  - OTP-based email verification and password reset.
  - JWT-based authentication with cookie storage.
- **Hostel and Room Management**:
  - Manage three hostels (3-Seater Boys Hostel, PhD Boys Hostel, Girls Hostel ) and their rooms.
  - Assign students to specific rooms with capacity checks.
- **Mess Menu Management**:
  - Create, update, and delete weekly menus specific to each hostel.
  - Students can only view their hostel’s menu.
  - Automated email notifications for menu updates, sent to hostel-specific students.
- **Complaint Management**:
  - Students can submit complaints with optional media uploads (via Cloudinary).
  - Wardens/admins can view and resolve complaints.
<!-- - **Fee Management**:
  - Process hostel fee payments via Stripe.
  - Generate PDF receipts for payments.
  - Track payment history and due dates. -->
- **Leave Request Management**:
  - Students can submit leave requests with start/end dates and reasons.
  - Wardens/admins approve or reject requests, with guardian notifications.
<!-- - **Visitor Management**:
  - Log visitor entries and exits with contact details and purpose.
  - Warden/admin approval for visitor records. -->
- **Automation Services**:
  - Send payment due reminders.
  - Remove unverified accounts after 24 hours.
  - Notify students of weekly mess menus every Sunday.
- **Security Features**:
  - Password hashing with bcrypt.
  - Rate-limiting for OTP requests.
  - Role-based access control for sensitive operations.

## Technologies Used
- **Node.js** & **Express**: Backend framework for RESTful APIs.
- **MongoDB** & **Mongoose**: Database for storing user, hostel, room, menu, complaint, payment, leave, and visitor data.
- **JWT**: For secure authentication.
- **Bcrypt**: For password hashing.
- **Cloudinary**: For media uploads (avatars, complaint images).
- **Nodemailer**: For sending emails (OTP, notifications).
- **Node-cron**: For scheduling automated tasks.
<!-- - **Stripe**: For payment processing.
- **PDFKit**: For generating payment receipts. -->
- **Express-rate-limit**: For API rate-limiting.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd hostel-management-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `config/config.env` file with the following:
   ```env
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/hostel_management
   JWT_SECRET_KEY=your-secret-key
   JWT_EXPIRE=7d
   COOKIE_EXPIRE=7
   SMTP_HOST=smtp.gmail.com
   SMTP_SERVICE=gmail
   SMTP_PORT=465
   SMTP_MAIL=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   CLOUDINARY_CLIENT_NAME=your-cloud-name
   CLOUDINARY_CLIENT_API=your-api-key
   CLOUDINARY_CLIENT_SECRET=your-api-secret
   <!-- STRIPE_SECRET_KEY=your-stripe-secret-key -->
   ```

4. **Run the Application**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000`.

## Project Structure
```
hostel-management-system/
├── config/
│   └── config.env           # Environment variables
├── database/
│   └── db.js               # MongoDB connection
├── models/
│   ├── userModel.js        # User schema (students, wardens, admins)
│   ├── hostelModel.js      # Hostel schema
│   ├── roomModel.js        # Room schema
│   ├── messModel.js        # Mess menu schema
│   ├── complaintModel.js   # Complaint schema
<!-- │   ├── paymentModel.js     # Payment schema -->
│   ├── leaveModel.js       # Leave request schema
<!-- │   └── visitorModel.js     # Visitor schema -->
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── roomController.js   # Room management
│   ├── messController.js   # Mess menu management
│   ├── complaintController.js # Complaint management
<!-- │   ├── paymentController.js # Payment processing -->
│   ├── userController.js   # User management
│   ├── leaveController.js  # Leave request management
<!-- │   └── visitorController.js # Visitor tracking -->
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── roomRoutes.js       # Room routes
│   ├── messRoutes.js       # Mess menu routes
│   ├── complaintRoutes.js  # Complaint routes
<!-- │   ├── paymentRoutes.js    # Payment routes -->
│   ├── userRoutes.js       # User routes
│   ├── leaveRoutes.js      # Leave routes
<!-- │   └── visitorRoutes.js    # Visitor routes -->
├── middlewares/
│   ├── authMiddleware.js   # Authentication & authorization
│   ├── catchAsyncErrors.js # Async error handling
│   ├── errorMiddleware.js # Global error handling
<!-- │   └── rateLimiter.js      # API rate-limiting -->
├── utils/
│   ├── sendEmail.js        # Email utility
│   ├── sendToken.js        # JWT token utility
│   ├── sendVerificationCode.js # OTP email utility
│   └── emailTemplates.js   # Email templates
├── services/
│   ├── notifyUsers.js      # Payment due reminders
│   ├── removeUnverifiedAccounts.js # Delete unverified accounts
│   └── notifyMessMenu.js   # Weekly menu notifications
├── app.js                  # Express app setup
├── server.js               # Server entry point
└── package.json            # Project metadata and scripts
```

## Environment Variables
The `config.env` file must include:
- **PORT**: Server port (e.g., 5000).
- **FRONTEND_URL**: Frontend URL for CORS and email links.
- **MONGODB_URI**: MongoDB connection string.
- **JWT_SECRET_KEY**: Secret for JWT tokens.
- **JWT_EXPIRE**: Token expiration (e.g., `7d`).
- **COOKIE_EXPIRE**: Cookie expiration in days.
- **SMTP_***: Email configuration for Nodemailer (Gmail).
- **CLOUDINARY_***: Cloudinary credentials for media uploads.
<!-- - **STRIPE_SECRET_KEY**: Stripe API key for payments. -->

## API Endpoints
### Authentication
- **POST /api/v1/auth/register**: Register a new user (student/warden).
  - Body: `{ name, email, password, hostel, roomNumber, contactNumber, guardianContact, department, semester, gender }`
- **POST /api/v1/auth/verify-otp**: Verify email with OTP.
  - Body: `{ email, verificationCode }`
- **POST /api/v1/auth/login**: Login user.
  - Body: `{ email, password }`
- **POST /api/v1/auth/logout**: Logout user (requires token).
- **PUT /api/v1/auth/password/reset/:token**: Reset password.
  - Body: `{ password }`
- **PUT /api/v1/auth/password/update**: Update password.
  - Body: `{ oldPassword, newPassword }`
- **GET /api/v1/auth/me**: Get authenticated user details.

### Hostel and Room Management
- **POST /api/v1/rooms**: Add a new room (warden/admin only).
  - Body: `{ roomNumber, hostel, capacity }`
- **GET /api/v1/rooms**: Get all rooms.
- **DELETE /api/v1/rooms/:id**: Delete a room (warden/admin only).

### Mess Menu Management
- **POST /api/v1/mess**: Create a hostel-specific weekly menu (warden/admin only).
  - Body:
    ```json
    {
      "hostel": "60d5f3d8b5e4b1234567890a",
      "weekStartDate": "2025-06-09",
      "menu": [
        { "day": "Monday", "breakfast": "Poha, Tea", "lunch": "Rice, Dal", "dinner": "Roti, Chicken Curry" },
        { "day": "Tuesday", "breakfast": "Paratha, Curd", "lunch": "Rice, Rajma", "dinner": "Pulao, Paneer Curry" },
        { "day": "Wednesday", "breakfast": "Idli, Sambar", "lunch": "Biryani, Raita", "dinner": "Naan, Dal Makhani" },
        { "day": "Thursday", "breakfast": "Upma, Coffee", "lunch": "Roti, Aloo Gobi", "dinner": "Fried Rice, Manchurian" },
        { "day": "Friday", "breakfast": "Dosa, Chutney", "lunch": "Rice, Fish Curry", "dinner": "Chapati, Palak Paneer" },
        { "day": "Saturday", "breakfast": "Puri, Chole", "lunch": "Khichdi, Papad", "dinner": "Pizza, Salad" },
        { "day": "Sunday", "breakfast": "Aloo Paratha, Curd", "lunch": "Pulao, Chicken Curry", "dinner": "Roti, Butter Chicken" }
      ]
    }
    ```
- **GET /api/v1/mess**: Get mess menu (students: own hostel; wardens/admins: specify `hostelId`).
  - Query: `?hostelId=<id>&weekStartDate=2025-06-09`
- **PUT /api/v1/mess/:id**: Update a mess menu (warden/admin only).
- **DELETE /api/v1/mess/:id**: Delete a mess menu (warden/admin only).

### Complaint Management
- **POST /api/v1/complaints**: Submit a complaint (students).
  - Body: `{ description, hostel, media }`
- **GET /api/v1/complaints**: Get all complaints (warden/admin only).
- **PUT /api/v1/complaints/:id/resolve**: Resolve a complaint (warden/admin only).

<!-- ### Fee Management
- **POST /api/v1/payments**: Create a payment session (students).
  - Body: `{ amount, dueDate, hostel }`
- **GET /api/v1/payments**: Get user’s payment history.
- **GET /api/v1/payments/:id/receipt**: Download payment receipt as PDF. -->

### Leave Request Management
- **POST /api/v1/leaves**: Submit a leave request (students).
  - Body: `{ startDate, endDate, reason, hostel }`
- **GET /api/v1/leaves**: Get leave requests (warden/admin only).
- **PUT /api/v1/leaves/:id**: Approve/reject a leave request (warden/admin only).

<!-- ### Visitor Management
- **POST /api/v1/visitors**: Log a visitor entry (students).
  - Body: `{ visitorName, purpose, contactNumber, hostel }`
- **GET /api/v1/visitors**: Get visitor logs (warden/admin only).
- **PUT /api/v1/visitors/:id/exit**: Log visitor exit (warden/admin only). -->

### User Management
- **GET /api/v1/users**: Get all users (admin only).
- **POST /api/v1/users/warden**: Register a new warden (admin only).
  - Body: `{ name, email, password, hostel, contactNumber, avatar }`

## Testing
Use **Postman** to test all endpoints:
1. **Authentication**:
   - Register a user with an `@nitm.ac.in` email.
   - Verify OTP, login, and check protected routes.
2. **Mess Menu**:
   - Create distinct menus for Hostel A, B, and C.
   - Verify students only see their hostel’s menu.
   - Test menu update and deletion (warden/admin only).
3. **Other Features**:
   - Test room creation, complaint submission, payment processing, leave requests, and visitor logging.
   - Verify role-based access (e.g., only admins can register wardens).
4. **Notifications**:
   - Check email delivery for OTPs, menu updates, payment reminders, and leave requests.
   - Confirm cron jobs (menu notifications, unverified account deletion).

## Deployment
1. Deploy to a platform like **Heroku**, **Render**, or **AWS**.
2. Set environment variables in the deployment platform.
3. Ensure MongoDB is accessible (use MongoDB Atlas for cloud hosting).
4. Test all endpoints post-deployment.

<!-- ## Future Enhancements
- **Dietary Preferences**: Add a `dietaryPreference` field to `userSchema` for filtering menus (e.g., vegetarian, non-vegetarian).
- **Mess Feedback**: Allow students to submit feedback on mess menus.
- **Room Swap Requests**: Enable students to request room swaps with warden approval.
- **Announcements**: Add a system for hostel-specific announcements.
- **Mobile App**: Develop APIs for a mobile app with push notifications. -->

## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Create a pull request.

---