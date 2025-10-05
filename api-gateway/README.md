# API Gateway - Coffee Shop Microservices

The API Gateway serves as the single entry point for all client requests to the Coffee Shop microservices architecture. It handles routing, authentication, rate limiting, and service health monitoring.

## Features

- **Request Routing**: Routes requests to appropriate microservices
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Rate Limiting**: Protects services from abuse with configurable rate limits
- **Health Monitoring**: Monitors and reports health status of all services
- **Security**: Helmet.js for security headers, CORS configuration
- **Logging**: Request logging with Morgan
- **Service Discovery**: Dynamic service registry for microservices

## Architecture

```
Client → API Gateway → Microservices
                    ├── User Service (Port 3001)
                    ├── Menu Service (Port 3002)
                    ├── Table Service (Port 3003)
                    └── Billing Service (Port 3004)
```

## Installation

1. Navigate to the api-gateway directory:
```bash
cd api-gateway
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Start the gateway:
```bash
npm start
# or for development
npm run dev
```

## Environment Configuration

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100

# JWT Configuration (must match user-service)
JWT_SECRET=your-super-secret-jwt-key

# Microservices URLs
USER_SERVICE_URL=http://localhost:3001
MENU_SERVICE_URL=http://localhost:3002
TABLE_SERVICE_URL=http://localhost:3003
BILLING_SERVICE_URL=http://localhost:3004
```

## API Routes

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health status |
| GET | `/health/services` | All services health status |
| GET | `/health/services/:serviceName` | Specific service health |
| GET | `/health/registry` | Service registry information |

### Authentication (User Service)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | List users | Admin/Manager |
| GET | `/api/users/:id` | Get user by ID | Admin/Manager |
| PUT | `/api/users/:id` | Update user | Admin/Manager |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PUT | `/api/users/:id/status` | Toggle user status | Admin/Manager |
| POST | `/api/users/:id/reset-password` | Reset user password | Admin |

### Menu Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List categories | No |
| POST | `/api/categories` | Create category | Staff+ |
| GET | `/api/categories/:id` | Get category | No |
| PUT | `/api/categories/:id` | Update category | Staff+ |
| DELETE | `/api/categories/:id` | Delete category | Manager+ |
| GET | `/api/menu` | List menu items | No |
| POST | `/api/menu` | Create menu item | Staff+ |
| GET | `/api/menu/featured` | Get featured items | No |
| GET | `/api/menu/:id` | Get menu item | No |
| PUT | `/api/menu/:id` | Update menu item | Staff+ |
| DELETE | `/api/menu/:id` | Delete menu item | Manager+ |

### Table Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tables` | List tables | No |
| POST | `/api/tables` | Create table | Staff+ |
| GET | `/api/tables/:id` | Get table | No |
| PUT | `/api/tables/:id` | Update table | Staff+ |
| DELETE | `/api/tables/:id` | Delete table | Manager+ |
| GET | `/api/tables/available` | Check availability | No |
| GET | `/api/reservations` | List reservations | Staff+ |
| POST | `/api/reservations` | Create reservation | No |
| GET | `/api/reservations/:id` | Get reservation | No |
| PUT | `/api/reservations/:id` | Update reservation | Staff+ |
| DELETE | `/api/reservations/:id` | Cancel reservation | Staff+ |

### Billing Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/billing` | List bills | Staff+ |
| POST | `/api/billing` | Create bill | Staff+ |
| GET | `/api/billing/:id` | Get bill | Staff+ |
| PUT | `/api/billing/:id` | Update bill | Staff+ |
| DELETE | `/api/billing/:id` | Delete bill | Manager+ |
| PUT | `/api/billing/:id/payment` | Update payment status | Staff+ |
| GET | `/api/billing/stats` | Billing statistics | Manager+ |

## Authentication & Authorization

The API Gateway implements JWT-based authentication with the following roles:

- **Customer**: Basic access to public endpoints
- **Staff**: Can manage orders, reservations, and basic operations
- **Manager**: Can manage users, view reports, and perform staff operations
- **Admin**: Full system access including user management and system configuration

### Authentication Flow

1. Client sends login request to `/api/auth/login`
2. Gateway forwards to User Service
3. User Service validates credentials and returns JWT
4. Client includes JWT in `Authorization: Bearer <token>` header
5. Gateway validates JWT and forwards user info to services

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP (configurable via `RATE_LIMIT_MAX`)
- **Scope**: Applied to all `/api/*` routes
- **Response**: 429 status with retry information

## Error Handling

The gateway provides consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

Common error codes:
- `400`: Bad Request
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests
- `503`: Service Unavailable
- `500`: Internal Server Error

## Service Health Monitoring

The gateway continuously monitors service health:

### Health Check Response
```json
{
  "overall_status": "healthy",
  "gateway": {
    "status": "healthy",
    "timestamp": "2023-12-07T10:30:00.000Z"
  },
  "services": {
    "userService": {
      "name": "User Service",
      "status": "healthy",
      "url": "http://localhost:3001",
      "responseTime": "45ms",
      "timestamp": "2023-12-07T10:30:00.000Z"
    }
  }
}
```

### Service States
- **healthy**: Service is responding normally
- **unhealthy**: Service is not responding or returning errors
- **error**: Unable to check service status

## Security Features

- **Helmet.js**: Security headers (XSS protection, content type sniffing, etc.)
- **CORS**: Configurable cross-origin resource sharing
- **JWT Validation**: Token verification and user context forwarding
- **Rate Limiting**: Protection against abuse and DDoS
- **Request Logging**: Audit trail of all requests

## Development

### Starting Services

1. Start all microservices first:
```bash
# Terminal 1 - User Service
cd services/user-service && npm run dev

# Terminal 2 - Menu Service  
cd services/menu-service && npm run dev

# Terminal 3 - Table Service
cd services/table-service && npm run dev

# Terminal 4 - Billing Service
cd services/billing-service && npm run dev
```

2. Start the API Gateway:
```bash
# Terminal 5 - API Gateway
cd api-gateway && npm run dev
```

### Testing

Test the gateway endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Service health
curl http://localhost:3000/health/services

# API documentation
curl http://localhost:3000/api

# Login (example)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coffee.com","password":"password"}'

# Protected endpoint (with token)
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Deployment Considerations

1. **Environment Variables**: Ensure all environment variables are properly configured
2. **Service URLs**: Update service URLs for production deployment
3. **JWT Secret**: Use a strong, unique JWT secret in production
4. **Rate Limiting**: Adjust rate limits based on expected traffic
5. **CORS Origins**: Configure allowed origins for your frontend domains
6. **Health Checks**: Set up monitoring for the health endpoints
7. **Load Balancing**: Consider load balancing for high availability

## Troubleshooting

### Common Issues

1. **Service Unavailable (503)**
   - Check if target microservice is running
   - Verify service URLs in environment configuration
   - Check network connectivity

2. **Authentication Errors (401)**
   - Verify JWT_SECRET matches across services
   - Check token expiration
   - Ensure user service is accessible

3. **Rate Limit Exceeded (429)**
   - Increase RATE_LIMIT_MAX if needed
   - Implement user-specific rate limiting
   - Check for potential abuse

4. **CORS Errors**
   - Add frontend domain to ALLOWED_ORIGINS
   - Verify CORS configuration
   - Check preflight request handling

### Logs

The gateway logs all requests using Morgan. Check console output for:
- Request details (method, URL, status, response time)
- Service proxy errors
- Authentication failures
- Rate limiting violations

## API Gateway Endpoints Summary

- **Base URL**: `http://localhost:3000`
- **Health**: `/health/*`
- **Documentation**: `/api`
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Menu**: `/api/menu/*`, `/api/categories/*`
- **Tables**: `/api/tables/*`, `/api/reservations/*`
- **Billing**: `/api/billing/*`
