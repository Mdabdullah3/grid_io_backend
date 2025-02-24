# NanoTap Backend API Documentation 🌐

Welcome to the NanoTap Backend API documentation! This comprehensive guide will help frontend developers integrate with our user authentication and management system.

## Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Base URL](#-base-url)
- [Authentication](#-authentication)
- [API Endpoints](#-api-endpoints)
  - [User Registration](#1-user-registration-post-apiv1usersregister)
  - [User Login](#2-user-login-post-apiv1userslogin)
  - [User Logout](#3-user-logout-post-apiv1userslogout)
  - [Refresh Access Token](#4-refresh-access-token-post-apiv1usersrefresh-token)
  - [Verify Email](#5-verify-email-post-apiv1usersverify-email)
  - [Resend Verification Code](#6-resend-verification-code-post-apiv1usersresend-verification-code)
- [Email Verification Flow](#-email-verification-flow)
- [Error Handling](#-error-handling)
- [Security](#-security)
- [Examples](#-examples)
- [Support](#-support)

---

## 🚀 Features

- JWT-based authentication
- Email verification system
- Secure cookie-based token management
- Refresh token mechanism
- Profile management with avatar/cover image
- Comprehensive error handling

---

## 📋 Prerequisites

- Node.js v18+
- Modern browser with cookie support
- Environment variables setup:
  - `VITE_API_BASE_URL` (points to backend)
- Basic understanding of REST APIs

---

###### (Regular) Project Setup

1. Clone the repository:

```bash
   git clone https://github.com/Mdabdullah3/grid_io_backend
```

2. Navigate to the project directory

```bash
cd grid_io_backend
```

3. Install dependencies:

```bash
 npm install
```

4. Configure Environment Variables:

- Create a .env file in the root directory and add the following (modify values as needed):

```bash
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net
DB_NAME=yourDatabaseName

# JWT & Token Settings
ACCESS_TOKEN_SECRET=yourAccessTokenSecret
ACCESS_TOKEN_EXPIRY=3600s
REFRESH_TOKEN_SECRET=yourRefreshTokenSecret
REFRESH_TOKEN_EXPIRY=7d

# Email Verification
TEMP_TOKEN_SECRET=yourTemporaryTokenSecret
VERIFICATION_CODE_EXPIRY=600000   # 10 minutes in milliseconds

# SMTP / Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=http://your-frontend-domain.com

```

## Usage

5. Run the development server:

```bash
 npm run dev
```

- The API will be available on the specified PORT (default: 8000).

### Routes

- GET /register
- GET /login
- GET /verify-email
- GET /resend-verification-code
- GET /logout

---

## 🔐 Authentication

We use dual-token authentication with HTTP-only cookies:

```plaintext
Authentication Flow:
1. Login → Returns AccessToken & RefreshToken in cookies
2. AccessToken expires → Use RefreshToken to get new AccessToken
3. All subsequent requests include AccessToken automatically via cookies

##### For Local Register
` - POST 	`http://localhost:8000/api/v1/users/register'
`
```
const field = {
"fullName": "John Doe",
"email": "john@example.com",
"username": "johndoe",
"password": "SecurePass123!",
"avatar": "<binary file>",
"coverImage": "<binary file>" // Optional
} 
```

### Response (201 Created):

```
{
"success": true,
"message": "User registered successfully. Verification email sent.",
"data": {
"user": {
"\_id": "65a1b...",
"username": "johndoe",
"email": "john@example.com",
"avatar": "https://cloudinary.com/avatar.jpg"
},
"encodedEmail": "am9obkBleGFtcGxlLmNvbQ=="
}
}

```
` - POST 	`http://localhost:8000/api/v1/users/login'
`
-Authenticate user and get tokens
## Request:

```

{
"email": "john@example.com", // or "username": "johndoe"
"password": "SecurePass123!"
}

```
## Response (200 OK):

```

{
"success": true,
"message": "User logged in successfully",
"data": {
"user": {
"\_id": "65a1b...",
"username": "johndoe",
"email": "john@example.com"
},
"accessToken": "eyJ...",
"refreshToken": "eyJ..."
}
}
// Cookies set automatically:
// - accessToken
// - refreshToken

```
` - POST 	`http://localhost:8000/api/v1/users/logout'
`
-Invalidate current session
## Response (200 OK):

```

{
"success": true,
"message": "User logged out successfully"
}
// Cookies cleared: accessToken, refreshToken

```
` Refresh Access Token  POST - `http://localhost:8000/api/v1/users/refresh-token`
`
Get new access token using refresh token

## Response (200 OK):
```

{
"success": true,
"message": "Access token refreshed successfully",
"data": {
"accessToken": "eyJ...",
"refreshToken": "eyJ..."
}
}

```
` Refresh Access Token  POST - `http://localhost:8000/api/v1/users/verify-email`
`
- Confirm email address with verification code
## request 
```
{
  "email": "am9obkBleGFtcGxlLmNvbQ==", // Encoded email
  "code": "529713"
}
```
## Response (200 OK):

```
{
  "success": true,
  "message": "Email verified successfully"
}
```
`Resend Verification Code POST- `http://localhost:8000/api/v1/users/resend-verification-code`

- Request new verification code

## Request:
```
{
  "email": "am9obkBleGFtcGxlLmNvbQ=="
}
```
## Response Ok
```
{
  "success": true,
  "message": "Verification code resent successfully"
}
```
#📨 Email Verification Flow

```
sequenceDiagram
    Frontend->>Backend: POST /register
    Backend->>Email Service: Send verification code
    Email Service->>User: Email with code
    Frontend->>Backend: POST /verify-email {code}
    Backend->>Frontend: 200 OK (verified)

````

## Frontend Implementation Tips:

1. Store encodedEmail after registration

2. Redirect to verification page

3. Handle code input with 6-digit validation

4. Show resend countdown (10 minute expiry)

5. Limit resend attempts (3 max)

#🚨 Error Handling
- Common Error Responses:

```
{
  "success": false,
  "message": "Validation error",
  "errors": ["Email already exists"],
  "data": null
}
```
# Status Codes:

1. 400: Bad Request (validation errors)

2. 401: Unauthorized (invalid/missing token)

3. 403: Forbidden (unverified email)

4. 404: Not Found (resource not found)

5. 429: Too Many Requests (resend limits)

6. 500: Internal Server Error

#🔒 Security

1. HTTPS mandatory for all requests

2. HTTP-only cookies for token storage

3. Password hashing with bcrypt

4. JWT tokens signed with RSA256

5. Rate limiting on sensitive endpoints

6. CSRF protection implemented