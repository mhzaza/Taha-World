# Admin Dashboard - Arabic Sports Training Platform

## Overview

This admin dashboard provides comprehensive management capabilities for the Arabic sports training platform, including role-based access control (RBAC), course management, user administration, order tracking, and analytics.

## Features

### 🔐 Access Control & Security
- **Role-Based Access Control (RBAC)**: Email-based admin allowlist
- **Route Protection**: Server-side and client-side guards for `/admin/*` routes
- **Audit Logging**: Complete tracking of all admin actions
- **Session Management**: NextAuth.js integration with admin verification

### 📊 Dashboard Overview
- **Key Metrics**: Total Sales, Orders, New Students, Top Course
- **Real-time Statistics**: Revenue tracking, user growth, course performance
- **Quick Actions**: Direct access to main admin functions

### 📚 Course Management (CRUD)
- **Full CRUD Operations**: Create, Read, Update, Delete courses
- **Search & Filtering**: Advanced search with multiple filters
- **Pagination**: Efficient handling of large course catalogs
- **Validation**: Comprehensive form validation for all course fields
- **Publishing Control**: Toggle publish/unpublish status
- **Lesson Management**: Dynamic lesson creation and editing

### 📦 Order Management
- **Order Tracking**: View all orders with detailed information
- **Status Management**: Update order status (pending, completed, failed, refunded, cancelled)
- **Filtering**: Filter by status, date range, user, course
- **Export**: CSV export functionality for reporting
- **Manual Orders**: Create manual orders for admin purposes

### 👥 User Management
- **User Overview**: Complete user profiles with enrollment history
- **Status Control**: Activate, suspend, or deactivate user accounts
- **Course Enrollment**: Manually enroll/unenroll users in courses
- **Progress Tracking**: Mark courses as completed/incomplete
- **Notes System**: Add administrative notes to user profiles
- **Email Verification**: Manage email verification status

### 📈 Analytics & Reporting
- **Sales Analytics**: Weekly sales trends with interactive charts
- **Course Performance**: Top courses by revenue and enrollment
- **Growth Metrics**: Monthly growth trends and completion rates
- **Device Analytics**: User device and platform statistics
- **Revenue Tracking**: Comprehensive financial reporting

### 🔍 Audit & Compliance
- **Action Logging**: All admin actions are logged with timestamps
- **Security Monitoring**: Track unauthorized access attempts
- **Data Integrity**: Maintain complete audit trails
- **Compliance**: GDPR-ready data handling and user privacy

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Admin Configuration
ADMIN_EMAILS=admin@example.com,manager@example.com,supervisor@example.com

# NextAuth Configuration (required for admin authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Database Configuration (when using real database)
DATABASE_URL=your-database-connection-string

# Firebase Configuration (optional, for production)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### 2. Admin Access Setup

1. **Add Admin Emails**: Update the `ADMIN_EMAILS` environment variable with comma-separated email addresses
2. **Authentication**: Ensure users are authenticated via NextAuth.js
3. **First Access**: Admin users must first log in through the main application
4. **Access Dashboard**: Navigate to `/admin` after authentication

### 3. Development Setup

```bash
# Install dependencies
npm install

# Install additional chart library (if not already installed)
npm install recharts

# Start development server
npm run dev

# Access admin dashboard
open http://localhost:3000/admin
```

### 4. Testing Admin Features

1. **Login**: Use an email address listed in `ADMIN_EMAILS`
2. **Dashboard**: Verify access to `/admin` dashboard
3. **CRUD Operations**: Test course creation, editing, and deletion
4. **User Management**: Test user enrollment and status changes
5. **Order Management**: Test order status updates and filtering
6. **Analytics**: Verify chart rendering and data display

## API Endpoints

### Admin Authentication
- `GET /api/admin/auth/check` - Verify admin status
- `POST /api/admin/auth/login` - Admin login (if separate auth needed)

### Course Management
- `GET /api/admin/courses` - List all courses with filters
- `POST /api/admin/courses` - Create new course
- `GET /api/admin/courses/[id]` - Get specific course
- `PUT /api/admin/courses/[id]` - Update course
- `DELETE /api/admin/courses/[id]` - Delete course

### Order Management
- `GET /api/admin/orders` - List all orders with filters
- `POST /api/admin/orders` - Create manual order
- `GET /api/admin/orders/[id]` - Get specific order
- `PUT /api/admin/orders/[id]` - Update order status
- `DELETE /api/admin/orders/[id]` - Delete order (restricted)

### User Management
- `GET /api/admin/users` - List all users with filters
- `POST /api/admin/users` - Create new user
- `GET /api/admin/users/[id]` - Get specific user
- `PUT /api/admin/users/[id]` - Update user (enrollment, status, notes)
- `DELETE /api/admin/users/[id]` - Delete user (restricted)

### Audit & Logging
- `GET /api/admin/audit` - Get audit logs
- `POST /api/admin/audit` - Create audit log (internal)
- `DELETE /api/admin/audit` - Clean up old logs

## Database Schema

### Collections/Tables Structure

#### Users Collection
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  status: 'active' | 'suspended' | 'inactive';
  emailVerified: boolean;
  enrolledCourses: string[]; // Course IDs
  completedCourses: string[]; // Course IDs
  totalSpent: number;
  notes?: string;
  provider: 'email' | 'google' | 'facebook';
}
```

#### Courses Collection
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  instructor: string;
  thumbnail: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  enrollmentCount: number;
  rating: number;
  tags: string[];
}

interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  videoUrl?: string;
  content?: string;
  order: number;
}
```

#### Orders Collection
```typescript
interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: 'paypal' | 'stripe' | 'manual';
  paymentId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  cancelledAt?: string;
  refundReason?: string;
  cancellationReason?: string;
  failureReason?: string;
  notes?: string;
}
```

#### Audit Logs Collection
```typescript
interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  details: Record<string, any>;
  timestamp: string;
  ip: string;
  userAgent: string;
}
```

## Security Considerations

### Access Control
- **Email Allowlist**: Only emails in `ADMIN_EMAILS` can access admin features
- **Session Validation**: All admin routes verify active authentication
- **Route Protection**: Both server-side and client-side guards
- **API Security**: All admin API endpoints check admin permissions

### Audit Logging
- **Complete Tracking**: All admin actions are logged
- **Unauthorized Attempts**: Failed access attempts are recorded
- **Data Integrity**: Immutable audit logs for compliance
- **Retention Policy**: Configurable log retention periods

### Data Protection
- **Input Validation**: All forms include comprehensive validation
- **SQL Injection Prevention**: Parameterized queries (when using SQL)
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: NextAuth.js built-in CSRF protection

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Verify email is in `ADMIN_EMAILS` environment variable
   - Check NextAuth.js session is active
   - Ensure proper authentication flow

2. **Charts Not Rendering**
   - Verify `recharts` library is installed
   - Check browser console for JavaScript errors
   - Ensure data format matches chart requirements

3. **API Errors**
   - Check server logs for detailed error messages
   - Verify database connection (if using real database)
   - Ensure proper environment variables are set

4. **Performance Issues**
   - Implement pagination for large datasets
   - Add database indexes for frequently queried fields
   - Consider caching for dashboard statistics

### Debug Mode

Enable debug logging by setting:
```bash
NEXT_PUBLIC_DEBUG=true
NEXTAUTH_DEBUG=true
```

## Production Deployment

### Environment Setup
1. **Database**: Configure production database connection
2. **Authentication**: Set up production OAuth providers
3. **Security**: Use strong secrets and enable HTTPS
4. **Monitoring**: Set up error tracking and performance monitoring

### Performance Optimization
1. **Database Indexes**: Add indexes for frequently queried fields
2. **Caching**: Implement Redis or similar for session and data caching
3. **CDN**: Use CDN for static assets and images
4. **Monitoring**: Set up application performance monitoring

### Security Checklist
- [ ] Strong `NEXTAUTH_SECRET` in production
- [ ] HTTPS enabled for all admin routes
- [ ] Database connection secured with SSL
- [ ] Admin email allowlist properly configured
- [ ] Audit logging enabled and monitored
- [ ] Regular security updates applied
- [ ] Input validation on all forms
- [ ] Rate limiting on API endpoints

## Support

For technical support or questions about the admin dashboard:

1. **Documentation**: Check this README and inline code comments
2. **Logs**: Review application logs and audit trails
3. **Testing**: Use the provided test scenarios
4. **Development**: Follow the setup instructions carefully

## License

This admin dashboard is part of the Arabic Sports Training Platform and follows the same licensing terms as the main application.