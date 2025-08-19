# SUPER_ADMIN Registration System

This document explains how to register a SUPER_ADMIN user in the hotel management system.

## Overview

The SUPER_ADMIN registration system provides a secure way to create the first super administrator account for the hotel management system. It includes:

- **API Endpoint**: `/api/auth/register-super-admin`
- **Frontend Page**: `/register-super-admin`
- **Security Features**: Secret key validation, password hashing, email validation
- **Validation**: Comprehensive input validation and error handling

## Features

### 🔐 Security Features
- **Secret Key Protection**: Requires a secret key to register SUPER_ADMIN
- **Password Hashing**: Passwords are automatically hashed using bcrypt
- **Email Validation**: Validates email format
- **Password Strength**: Enforces minimum password requirements
- **Single SUPER_ADMIN**: By default, only one SUPER_ADMIN is allowed

### 📝 Validation Rules
- **Name**: Required, trimmed
- **Email**: Required, valid format, unique, converted to lowercase
- **Password**: Minimum 8 characters
- **Secret Key**: Must match environment variable or default value

## API Endpoints

### 1. Register SUPER_ADMIN
**POST** `/api/auth/register-super-admin`

**Request Body:**
```json
{
  "name": "Super Admin Name",
  "email": "superadmin@example.com",
  "password": "SecurePassword123",
  "secretKey": "super-admin-secret-2024"
}
```

**Success Response (201):**
```json
{
  "message": "SUPER_ADMIN registered successfully",
  "user": {
    "id": "user_id_here",
    "name": "Super Admin Name",
    "email": "superadmin@example.com",
    "role": "SUPER_ADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing fields or validation errors
- `401` - Invalid secret key
- `409` - User already exists or SUPER_ADMIN already exists
- `500` - Server error

### 2. Check SUPER_ADMIN Existence
**GET** `/api/auth/check-super-admin`

**Success Response (200):**
```json
{
  "exists": true,
  "count": 1,
  "message": "SUPER_ADMIN exists"
}
```

## Frontend Usage

### Registration Page
Visit `/register-super-admin` to access the registration form.

**Features:**
- Real-time validation
- Password confirmation
- Success/error messages
- Automatic redirect to login after successful registration

### Using the Utility Functions
```typescript
import { registerSuperAdmin, checkSuperAdminExists } from '../utils/superAdminUtils';

// Check if SUPER_ADMIN exists
const exists = await checkSuperAdminExists();
if (!exists) {
  // Register new SUPER_ADMIN
  const result = await registerSuperAdmin({
    name: 'Super Admin',
    email: 'admin@example.com',
    password: 'SecurePassword123',
    secretKey: 'super-admin-secret-2024'
  });
  
  if (result.success) {
    console.log('Registration successful:', result.user);
  } else {
    console.error('Registration failed:', result.message);
  }
}
```

## Environment Variables

Set these environment variables for production:

```env
SUPER_ADMIN_SECRET_KEY=your-secure-secret-key-here
SUPER_ADMIN_EMAIL=default-admin@example.com
SUPER_ADMIN_PASSWORD=default-password
SUPER_ADMIN_NAME=Default Super Admin
```

## Default Values

If environment variables are not set, the system uses these defaults:
- **Secret Key**: `super-admin-secret-2024`
- **Email**: `super@admin.com`
- **Password**: `password`
- **Name**: `Super Admin`

## Testing

### Using the Test Script
```bash
# Run the test script
node scripts/test-super-admin-registration.js
```

### Manual Testing with cURL
```bash
# Check if SUPER_ADMIN exists
curl -X GET http://localhost:3000/api/auth/check-super-admin

# Register new SUPER_ADMIN
curl -X POST http://localhost:3000/api/auth/register-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Super Admin",
    "email": "test@example.com",
    "password": "SecurePassword123",
    "secretKey": "super-admin-secret-2024"
  }'
```

## Security Considerations

### 🔒 Production Security
1. **Change Default Secret Key**: Always set a custom `SUPER_ADMIN_SECRET_KEY`
2. **Strong Passwords**: Enforce strong password policies
3. **HTTPS**: Use HTTPS in production
4. **Rate Limiting**: Implement rate limiting on registration endpoints
5. **Logging**: Monitor registration attempts

### 🛡️ Access Control
- Only allow SUPER_ADMIN registration when no SUPER_ADMIN exists
- Consider IP whitelisting for registration endpoint
- Implement CAPTCHA for additional protection

## Troubleshooting

### Common Issues

1. **"SUPER_ADMIN already exists"**
   - Solution: Use existing SUPER_ADMIN account or modify the code to allow multiple

2. **"Invalid secret key"**
   - Solution: Check environment variable or use default key

3. **"Invalid email format"**
   - Solution: Ensure email follows standard format (user@domain.com)

4. **"Password too short"**
   - Solution: Use password with at least 8 characters

### Database Issues
If you need to reset the SUPER_ADMIN:
```javascript
// Connect to MongoDB and remove existing SUPER_ADMIN
db.users.deleteMany({ role: "SUPER_ADMIN" })
```

## Integration with Existing System

The SUPER_ADMIN registration integrates seamlessly with the existing authentication system:

1. **Login**: Registered SUPER_ADMIN can login using `/login`
2. **Role-based Access**: SUPER_ADMIN gets access to `/super-admin` dashboard
3. **JWT Tokens**: Standard JWT authentication flow
4. **Session Management**: Uses existing session management

## Next Steps

After registering a SUPER_ADMIN:

1. **Login**: Use the registered credentials to login
2. **Dashboard**: Access the super admin dashboard at `/super-admin`
3. **User Management**: Create additional admin users
4. **System Setup**: Configure tables, menu items, and other system settings

---

**Note**: This registration system is designed for initial setup. For ongoing user management, use the super admin dashboard to create additional users with different roles.
