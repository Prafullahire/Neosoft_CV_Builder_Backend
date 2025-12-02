# Authentication Implementation Guide

This guide explains how the three authentication methods are implemented in the CV Builder Backend and how to use them.

## Table of Contents
1. [Overview](#overview)
2. [Setup Required](#setup-required)
3. [Implementation Details](#implementation-details)
4. [API Usage](#api-usage)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The backend supports three authentication methods:

### 1. **Register a New User** (Email/Password)
- Creates a new user account with email and password
- Password is hashed using bcryptjs
- Returns a JWT token for immediate login

### 2. **Login with Email and Password**
- Authenticates existing users with email and password
- Verifies password against stored hash
- Returns a JWT token if credentials are valid

### 3. **Google OAuth Authentication**
- Single sign-on using Google account
- Verifies Google ID token
- Auto-creates user if first-time login
- No password required

---

## Setup Required

### Environment Variables (.env)

```env
# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_use_something_strong

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional: Google Client Secret (if using backend OAuth)
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Port
PORT=5000
```

### 1. Get Google OAuth Credentials

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → Create OAuth 2.0 Client ID (Web Application)
5. Add Authorized Redirect URIs:
   - `http://localhost:3000` (frontend dev)
   - `http://localhost:5000/api/auth/callback` (backend)
   - Your production frontend URL
6. Copy Client ID and paste in `.env`

---

## Implementation Details

### File Structure

```
controllers/authController.js   # Auth logic
models/User.js                  # User schema with password hashing
middleware/auth.js              # JWT verification middleware
routes/authRoutes.js            # Auth endpoints
```

### 1. User Model (models/User.js)

**Features:**
- Password hashing with bcryptjs (10 salt rounds)
- Support for social login (googleId, facebookId)
- Password required only if not using social auth
- `matchPassword()` method to verify passwords

**Schema:**
```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (required if not social login),
  contactNumber: String,
  googleId: String,
  facebookId: String,
  avatar: String (profile picture URL),
  timestamps: true
}
```

### 2. JWT Token Generation

**Location:** `controllers/authController.js`

```javascript
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
```

**Token Details:**
- Contains user ID
- Expires in 30 days
- Signed with JWT_SECRET

### 3. Authentication Middleware

**Location:** `middleware/auth.js`

**Usage:** Protect routes that require authentication

```javascript
const protect = async (req, res, next) => {
    // Extracts token from "Authorization: Bearer <token>"
    // Verifies token validity
    // Attaches user to req.user
    // Blocks request if token is invalid/missing
};
```

---

## API Usage

### 1. Register a New User

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "contactNumber": "+1234567890"
  }'
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Scenario | Response |
|--------|----------|----------|
| 400 | User already exists | `{ "message": "User already exists" }` |
| 400 | Missing required fields | `{ "message": "Invalid user data" }` |
| 500 | Server error | `{ "message": "Error details..." }` |

---

### 2. Login with Email and Password

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

| Status | Scenario | Response |
|--------|----------|----------|
| 401 | Invalid email or password | `{ "message": "Invalid email or password" }` |
| 500 | Server error | `{ "message": "Error details..." }` |

---

### 3. Google OAuth Authentication

**Endpoint:** `POST /api/auth/google`

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
  }'
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- `tokenId` is obtained from Google Sign-In on frontend
- If user doesn't exist, creates new account automatically
- Uses Google ID as temporary password for existing users
- User avatar is saved if provided by Google

**Error Responses:**

| Status | Scenario | Response |
|--------|----------|----------|
| 401 | Invalid Google token | `{ "message": "Google authentication failed" }` |
| 401 | Token verification failed | `{ "message": "Google authentication failed" }` |

---

## Frontend Integration

### Example 1: Register with Vanilla JavaScript

```javascript
async function register() {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
      contactNumber: '+1234567890'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    console.log('Registered:', data);
  } else {
    console.error('Registration failed:', data.message);
  }
}
```

### Example 2: Login with Vanilla JavaScript

```javascript
async function login() {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'SecurePassword123!'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    console.log('Logged in:', data);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } else {
    alert('Login failed: ' + data.message);
  }
}
```

### Example 3: Google OAuth with React

```javascript
import { GoogleLogin } from '@react-oauth/google';

function GoogleAuthButton() {
  const handleGoogleSuccess = async (credentialResponse) => {
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tokenId: credentialResponse.credential
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      console.log('Google login successful:', data);
      // Redirect or update state
    } else {
      console.error('Google auth failed:', data.message);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login failed')}
    />
  );
}
```

### Example 4: Using Protected Routes (with Token)

```javascript
async function fetchUserCVs() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/cvs', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Include token
    }
  });

  const data = await response.json();
  return data;
}
```

### Example 5: React Hook for Auth

```javascript
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token and fetch user details if needed
      localStorage.setItem('token', token);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (response.ok) {
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const register = async (username, email, password, contactNumber) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, contactNumber })
    });
    const data = await response.json();
    if (response.ok) {
      setToken(data.token);
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return { user, token, login, register, logout };
}

export default useAuth;
```

---

## Testing

### Using Postman

**1. Register a New User:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body (raw JSON):
```json
{
  "username": "Test User",
  "email": "test@example.com",
  "password": "Test123!@#",
  "contactNumber": "1234567890"
}
```

**2. Login:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**3. Test Protected Route (using token from login):**
- Method: `GET`
- URL: `http://localhost:5000/api/cvs`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer <your_token_here>`

**4. Google OAuth (requires Google Client ID):**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/google`
- Body (raw JSON):
```json
{
  "tokenId": "<google_id_token_from_frontend>"
}
```

### Using cURL Commands

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test","email":"test@example.com","password":"Test123","contactNumber":"1234567890"}'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' | jq -r '.token')

# 3. Use token in protected route
curl -X GET http://localhost:5000/api/cvs \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Issue: "JWT_SECRET is undefined"
**Solution:**
- Add `JWT_SECRET=your_secret_key` to `.env`
- Restart server: `npm run dev`

### Issue: "User already exists"
**Solution:**
- Try registering with a different email address
- Or delete the user from database if testing

### Issue: "Invalid email or password" on login
**Solution:**
- Verify email and password are correct
- Check that user exists (register first if needed)
- Ensure password wasn't changed

### Issue: "Not authorized, token failed"
**Solution:**
- Verify token is included in `Authorization` header
- Check token format: `Bearer <token>` (space required)
- Regenerate token by logging in again
- Verify `JWT_SECRET` matches what was used to sign token

### Issue: "Google authentication failed"
**Solution:**
- Verify `GOOGLE_CLIENT_ID` is correct in `.env`
- Ensure Google credentials are valid
- Check that ID token is being sent (not access token)
- Verify token hasn't expired

### Issue: Password not being hashed
**Solution:**
- Ensure bcryptjs is installed: `npm install bcryptjs`
- Check that `User.js` pre-save hook is present
- Verify password field is modified before save

### Issue: CORS errors when calling from frontend
**Solution:**
- Ensure `cors()` is used in `server.js`
- Check frontend URL is allowed
- If needed, update CORS configuration in server.js:
```javascript
const corsOptions = {
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true
};
app.use(cors(corsOptions));
```

---

## Security Best Practices

### 1. JWT Secret
- Use a strong, random string (min 32 characters)
- Never commit to git
- Rotate regularly in production

### 2. Password Requirements
- Minimum 8 characters (enforce on frontend)
- Include uppercase, lowercase, numbers, symbols
- Use HTTPS in production

### 3. Token Storage
- **Secure (backend):** Use HTTP-only cookies
- **Current (frontend):** localStorage is easier but less secure
- Never expose token in URLs

### 4. Password Reset
- Implement password reset flow (not yet in codebase)
- Use time-limited reset tokens
- Verify email ownership

### 5. Rate Limiting
- Prevent brute force attacks on login/register
- Implement after X failed attempts: 5-minute lockout

### 6. OAuth Security
- Validate Google tokens on backend (✓ done)
- Never trust tokens from frontend alone
- Store only necessary user data

---

## Next Steps

1. **Implement input validation** in `middleware/validation.js`
2. **Add password reset** endpoint
3. **Add 2FA (Two-Factor Authentication)**
4. **Implement rate limiting** on auth endpoints
5. **Add email verification** for new accounts
6. **Test with production Google Client ID**

---

**Last Updated:** December 2, 2025
