# Security Recommendations for Production

## 🔴 Critical Issues (Must Fix Before Production)

### 1. Authentication & Authorization
**Current State**: No authentication - all endpoints are public
**Risk**: Anyone can create, modify, or delete tournaments and aliases

**Recommended Solutions**:
- **Option A: API Key Authentication** (Simplest for browser extension)
  - Generate API keys for trusted users
  - Store keys in environment variables or a secure key management system
  - Validate API key on write operations (POST, PUT, DELETE)

- **Option B: JWT Token Authentication** (More secure)
  - Implement user login/registration
  - Issue JWT tokens for authenticated users
  - Protect write endpoints with authentication middleware

- **Option C: IP Whitelist** (If you control the network)
  - Only allow requests from known IP addresses
  - Good for internal/private deployments

### 2. CORS Configuration
**Current State**: Too permissive - allows all chrome-extension origins
**Risk**: Any browser extension can access your API

**Fix**: Restrict CORS to specific origins:
```javascript
// Only allow your specific extension ID
if (origin.startsWith('chrome-extension://')) {
  const extensionId = origin.replace('chrome-extension://', '').split('/')[0];
  const allowedExtensionIds = process.env.ALLOWED_EXTENSION_IDS?.split(',') || [];
  if (!allowedExtensionIds.includes(extensionId)) {
    return callback(new Error('Extension not allowed'));
  }
}
```

### 3. Rate Limiting
**Current State**: No rate limiting
**Risk**: API can be overwhelmed or abused

**Fix**: Add `express-rate-limit`:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);

// Stricter limits for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 write operations per 15 minutes
});

app.use('/api/tournaments', writeLimiter);
app.use('/api/aliases', writeLimiter);
```

### 4. Input Validation & Sanitization
**Current State**: Basic validation exists
**Risk**: Malicious input could cause issues

**Fix**: Add `express-validator`:
```bash
npm install express-validator
```

### 5. Request Logging & Auditing
**Current State**: No logging of who did what
**Risk**: Can't track malicious activity or debug issues

**Fix**: Add structured logging:
```bash
npm install winston morgan
```

### 6. Environment-Specific CORS
**Current State**: Development settings might leak to production
**Risk**: Production API might be too permissive

**Fix**: Ensure `NODE_ENV=production` in production and remove development-only CORS rules

## 🟡 Important Improvements

### 7. HTTPS Enforcement
- Use a reverse proxy (nginx) with SSL certificates
- Enforce HTTPS in production
- Use Let's Encrypt for free SSL certificates

### 8. Database Security
- Use strong, unique passwords
- Restrict database access to backend server only
- Use connection pooling
- Regular backups

### 9. Error Handling
- Don't expose stack traces in production
- Log errors securely
- Return generic error messages to clients

### 10. Security Headers
- Helmet is already installed (good!)
- Ensure all security headers are enabled in production

## 🟢 Best Practices

### 11. API Versioning
- Consider versioning your API (`/api/v1/...`)
- Allows breaking changes without affecting existing clients

### 12. Request Size Limits
- Current 10mb limit is quite large
- Consider reducing to 1-2mb for tournament data

### 13. Database Query Optimization
- Add indexes for frequently queried fields
- Monitor slow queries
- Use Prisma query optimization

### 14. Monitoring & Alerts
- Set up monitoring (e.g., Sentry, DataDog)
- Alert on unusual activity
- Monitor API response times

## Quick Start: Minimum Security for Production

If you need to deploy quickly, at minimum implement:

1. **API Key Authentication** for write operations
2. **Rate Limiting** on all endpoints
3. **Restricted CORS** (remove chrome-extension wildcard)
4. **Environment-specific configuration** (ensure production settings)

See `SECURITY_IMPLEMENTATION.md` for step-by-step implementation guide.

