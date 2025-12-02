# CV Builder Backend

A robust Express.js backend for a CV/Resume builder application with user authentication, CV management, and payment integration support.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Development Tips](#development-tips)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: JWT-based authentication with Google OAuth support
- **CV Management**: Create, read, update, and delete CV records
- **Public Sharing**: Share CVs publicly via unique URLs
- **Password Security**: Bcrypt hashing for secure password storage
- **OAuth Integration**: Google and Facebook authentication support
- **Email Service**: Nodemailer integration for email notifications
- **PDF Generation**: Convert CVs to PDF format
- **Cloud Storage**: Cloudinary integration for image uploads
- **Input Validation**: Express-validator for request validation
- **CORS Support**: Cross-Origin Resource Sharing enabled
- **In-Memory Database**: MongoDB Memory Server for development/testing

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MongoDB (with in-memory server for dev)
- **ODM**: Mongoose 9.x
- **Authentication**: 
  - JWT (jsonwebtoken)
  - Passport.js with Google & Facebook strategies
- **Utilities**:
  - bcryptjs - password hashing
  - nodemailer - email service
  - multer - file uploads
  - cloudinary - cloud storage
  - dotenv - environment configuration

## 📦 Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- A GitHub account (for the repository)
- Google OAuth credentials (optional, for Google login)
- Facebook OAuth credentials (optional, for Facebook login)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prafullahire/Neosoft_CV_Builder_Backend.git
   cd Neosoft_CV_Builder_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the project root
   ```bash
   cp .env.example .env
   ```
   (See [Configuration](#configuration) section below)

4. **Verify installation**
   ```bash
   npm run dev
   ```
   The server should start on `http://localhost:5000`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here

# Email Service (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Cloudinary
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Important Notes

- **JWT_SECRET**: Use a strong, random string in production
- **Database**: Uses `mongodb-memory-server` for local development (data not persisted)
- **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- **Email Service**: Use Gmail with [app-specific passwords](https://myaccount.google.com/apppasswords)

## ▶️ Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The API will be available at `http://localhost:5000`

## 📁 Project Structure

```
cv-builder-backend/
├── config/
│   ├── db.js                 # MongoDB connection setup
│   └── passport.js           # Passport.js configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── cvController.js       # CV CRUD operations
│   └── paymentController.js  # Payment handling
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   └── validation.js         # Request validation middleware
├── models/
│   ├── User.js               # User schema
│   └── CV.js                 # CV schema
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   ├── cvRoutes.js           # CV management endpoints
│   └── paymentRoutes.js      # Payment endpoints
├── utils/
│   ├── emailService.js       # Email sending utility
│   └── pdfService.js         # PDF generation utility
├── data/
│   └── db/                   # Database seeds/fixtures
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── server.js                 # Application entry point
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login with email and password | ❌ |
| POST | `/google` | Google OAuth authentication | ❌ |

**Example: Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Example: Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### CV Routes (`/api/cvs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| GET | `/` | Get all CVs for logged-in user | ✅ |
| POST | `/` | Create a new CV | ✅ |
| GET | `/:id` | Get a specific CV by ID | ✅ |
| PUT | `/:id` | Update a CV | ✅ |
| DELETE | `/:id` | Delete a CV | ✅ |
| GET | `/public/:id` | Get a CV publicly (sharable link) | ❌ |

**Example: Create CV (Authenticated)**
```bash
curl -X POST http://localhost:5000/api/cvs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Professional CV",
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "experience": [],
    "education": []
  }'
```

**Example: Get Public CV (No Auth)**
```bash
curl http://localhost:5000/api/cvs/public/60f7b3c4e8f2a1b9c3d4e5f6
```

## 🔐 Authentication

### JWT Workflow

1. **Register/Login**: User receives a JWT token
2. **Store Token**: Client stores token (localStorage, cookies, etc.)
3. **Protected Requests**: Include token in `Authorization` header
4. **Token Format**:
   ```
   Authorization: Bearer <JWT_TOKEN>
   ```

### Middleware

The `protect` middleware in `middleware/auth.js` verifies the JWT token on protected routes. If token is invalid or missing, the request is rejected with a 401 status.

## 💡 Development Tips

### Testing API Endpoints

Use [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) for testing:

1. Set `Authorization` header to `Bearer <your_jwt_token>`
2. Test protected endpoints after login/register
3. Use the `/public/:id` endpoint to test public sharing

### Database Reset

Since the app uses an in-memory MongoDB:
- Data persists only during a server session
- Restart the server to reset the database: `npm run dev`

### Debugging

Enable detailed logging by checking `console.log` statements:
- `config/db.js` - MongoDB connection
- `controllers/authController.js` - Auth flow
- `controllers/cvController.js` - CV operations

### Email Testing

For development, consider using:
- [Ethereal Email](https://ethereal.email/) - free test email account
- Update `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

## 🐛 Common Issues

### Issue: "JWT_SECRET is undefined"
**Solution**: Add `JWT_SECRET=your_secret` to `.env`

### Issue: "MongoDB Connection Error"
**Solution**: Ensure `mongodb-memory-server` is installed via `npm install`

### Issue: "CORS errors"
**Solution**: Ensure frontend is on allowed origin (configure in `server.js` if needed)

### Issue: "Google OAuth fails"
**Solution**: Verify `GOOGLE_CLIENT_ID` in `.env` and ensure redirect URI matches

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request


