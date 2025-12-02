# Quick Start Testing Guide

This guide helps you quickly test all three authentication methods.

## Prerequisites

- Server running: `npm run dev` (should be on http://localhost:5000)
- Postman or similar API client installed
- `.env` file configured with `JWT_SECRET`

## Test Scenario 1: Register → Login → Protected Route

### Step 1: Register a New User

**Open Postman:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Tab: Body → raw → JSON
- Paste:

```json
{
  "username": "Test User",
  "email": "testuser@example.com",
  "password": "SecurePass123",
  "contactNumber": "1234567890"
}
```

**Click Send**

**Expected Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "Test User",
  "email": "testuser@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTczMzE0NzIwMCwiZXhwIjoxNzM1NzM5MjAwfQ.abc123..."
}
```

**✅ Copy the token value for next step**

---

### Step 2: Login with Email & Password

**Open New Postman Tab:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Tab: Body → raw → JSON
- Paste:

```json
{
  "email": "testuser@example.com",
  "password": "SecurePass123"
}
```

**Click Send**

**Expected Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "Test User",
  "email": "testuser@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**✅ Same token as registration (or new one with same payload)**

---

### Step 3: Test Protected Route (CV List)

**Open New Postman Tab:**
- Method: `GET`
- URL: `http://localhost:5000/api/cvs`
- Tab: Headers → Add header:
  - Key: `Authorization`
  - Value: `Bearer <paste_your_token_here>`

**Example:**
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTczMzE0NzIwMCwiZXhwIjoxNzM1NzM5MjAwfQ.abc123...
```

**Click Send**

**Expected Response (200 OK):**
```json
[]  // Empty array (no CVs yet)
```

**✅ Route is protected and working!**

---

### Step 4: Test Invalid Token

**Still in CV route tab, modify header:**
- Value: `Bearer invalid_token_here`

**Click Send**

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Not authorized, token failed"
}
```

**✅ Token validation is working!**

---

## Test Scenario 2: Validation Errors

### Test 1: Register with Short Password

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "username": "Test",
  "email": "test2@example.com",
  "password": "short"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### Test 2: Register with Invalid Email

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "username": "Test",
  "email": "not-an-email",
  "password": "SecurePass123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### Test 3: Register with Duplicate Email

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "username": "Another User",
  "email": "testuser@example.com",
  "password": "SecurePass123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "User already exists"
}
```

---

## Test Scenario 3: Google OAuth

### Prerequisites
- Google Client ID in `.env`: `GOOGLE_CLIENT_ID=your_id.apps.googleusercontent.com`
- Valid Google ID token from your frontend

### Step 1: Get Google Token (from Frontend)

In your frontend app using `@react-oauth/google` or similar:

```javascript
import { GoogleLogin } from '@react-oauth/google';

function LoginComponent() {
  const handleSuccess = (credentialResponse) => {
    console.log('Google Token:', credentialResponse.credential);
    // Use this token to send to backend
  };

  return <GoogleLogin onSuccess={handleSuccess} />;
}
```

### Step 2: Send Token to Backend

**POST** `http://localhost:5000/api/auth/google`
```json
{
  "tokenId": "<paste_google_id_token_here>"
}
```

**Expected Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**New account created if first-time login!**

---

## Error Test Cases

### Test: Missing Required Fields

**POST** `http://localhost:5000/api/auth/register`
```json
{
  "username": "Test"
  // Missing email and password
}
```

**Expected (400):**
```json
{
  "message": "Validation error",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

### Test: Wrong Password

**POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "testuser@example.com",
  "password": "WrongPassword123"
}
```

**Expected (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Test: Non-existent User

**POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "nonexistent@example.com",
  "password": "SomePassword123"
}
```

**Expected (401):**
```json
{
  "message": "Invalid email or password"
}
```

---

### Test: Missing Token on Protected Route

**GET** `http://localhost:5000/api/cvs`
(No Authorization header)

**Expected (401):**
```json
{
  "message": "Not authorized, no token"
}
```

---

## Bash Script for Quick Testing

Save this as `test-auth.sh` and run with `bash test-auth.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="SecurePass123"
USERNAME="Test User"

echo "=== Testing CV Builder Auth ==="
echo ""

# Test 1: Register
echo "1️⃣ Register a new user..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"contactNumber\":\"1234567890\"}")

echo "$REGISTER_RESPONSE" | jq .

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Registration failed!"
  exit 1
fi

echo "✅ Registration successful!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test 2: Login
echo "2️⃣ Login with email and password..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq .
echo "✅ Login successful!"
echo ""

# Test 3: Protected Route
echo "3️⃣ Testing protected route with token..."
CV_RESPONSE=$(curl -s -X GET $BASE_URL/api/cvs \
  -H "Authorization: Bearer $TOKEN")

echo "$CV_RESPONSE" | jq .
echo "✅ Protected route accessible!"
echo ""

# Test 4: Invalid Token
echo "4️⃣ Testing invalid token..."
INVALID_RESPONSE=$(curl -s -X GET $BASE_URL/api/cvs \
  -H "Authorization: Bearer invalid_token")

echo "$INVALID_RESPONSE" | jq .
echo "✅ Invalid token rejected as expected!"
```

---

## Summary Checklist

- ✅ Register a new user with email/password
- ✅ Login with email/password (get token)
- ✅ Access protected routes with token
- ✅ Invalid tokens are rejected
- ✅ Password validation works
- ✅ Email validation works
- ✅ Duplicate emails rejected
- ✅ Error messages are clear

**All tests passing? Your auth is ready for production! 🎉**

---

**Last Updated:** December 2, 2025
