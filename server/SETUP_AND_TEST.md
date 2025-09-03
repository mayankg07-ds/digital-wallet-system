# Digital Wallet System - Setup and Testing Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

## Environment Setup

### 1. Create Environment File
Create a `.env` file in the server directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
PORT=5000
```

**Important**: Replace `your-super-secret-jwt-key-here-make-it-long-and-random` with a strong, random string.

### 2. Install Dependencies
```bash
cd server
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service or run `mongod`
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### 4. Start the Server
```bash
npm run dev
# or
npm start
```

The server should start on `http://localhost:5000`

## Testing Registration Functionality

### Method 1: Using the Test Script
Run the automated test script:
```bash
node test-registration-simple.js
```

### Method 2: Manual Testing with cURL

#### Test 1: Server Health Check
```bash
curl -X GET http://localhost:5000/
```
Expected response:
```json
{"message": "Digital Wallet API is running"}
```

#### Test 2: Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser123\",
    \"email\": \"testuser123@example.com\",
    \"password\": \"password123\"
  }"
```

Expected response (201 Created):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2c1e4b0f2a1c8d9e0f1",
    "username": "testuser123",
    "email": "testuser123@example.com"
  }
}
```

#### Test 3: Duplicate Registration (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser123\",
    \"email\": \"testuser123@example.com\",
    \"password\": \"password456\"
  }"
```

Expected response (400 Bad Request):
```json
{"message": "User already exists"}
```

#### Test 4: Login with New User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"testuser123@example.com\",
    \"password\": \"password123\"
  }"
```

Expected response (200 OK):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8b2c1e4b0f2a1c8d9e0f1",
    "username": "testuser123",
    "email": "testuser123@example.com"
  }
}
```

### Method 3: Using Postman or Thunder Client

1. **GET** `http://localhost:5000/` - Health check
2. **POST** `http://localhost:5000/api/auth/register`
   - Headers: `Content-Type: application/json`
   - Body:
     ```json
     {
       "username": "testuser123",
       "email": "testuser123@example.com", 
       "password": "password123"
     }
     ```

## What Registration Does

When a user registers successfully, the system:

1. **Validates Input**: Checks required fields (username, email, password)
2. **Checks Duplicates**: Ensures username and email are unique
3. **Hashes Password**: Uses bcrypt with salt rounds of 12
4. **Creates User**: Saves user to MongoDB with default values
5. **Creates Wallet**: Automatically creates a wallet with $0 balance
6. **Generates JWT**: Returns authentication token valid for 24 hours
7. **Rate Limiting**: Limits to 5 registration attempts per 15 minutes

## Database Verification

To verify user and wallet creation in MongoDB:

```javascript
// Connect to MongoDB shell
use digital-wallet

// Check users collection
db.users.find().pretty()

// Check wallets collection  
db.wallets.find().pretty()
```

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if MongoDB is running
   - Verify `.env` file exists with correct values
   - Check if port 5000 is available

2. **Registration fails with 500 error**
   - Check MongoDB connection
   - Verify JWT_SECRET is set in `.env`
   - Check server logs for detailed error

3. **"User already exists" error**
   - Username or email already in database
   - Clear test data: `db.users.deleteMany({}); db.wallets.deleteMany({})`

4. **Rate limiting errors**
   - Wait 15 minutes or restart server
   - Reduce test frequency

### Logs and Debugging

Server logs will show:
- MongoDB connection status
- Request details (via Morgan middleware)
- Error messages
- Fraud detection alerts

## API Documentation

Access Swagger documentation at: `http://localhost:5000/api/docs`

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers
- Input validation
- Fraud detection patterns
