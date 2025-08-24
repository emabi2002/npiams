# Student Registration System - NPI PNG

A comprehensive student registration system for the National Polytechnic Institute of Papua New Guinea, built with Next.js and Supabase.

## 🎯 Project Overview

This system enables students to apply and register for TVET Certificate and Diploma programs online. It features:

- **Student Application Portal**: Multi-step application form with real-time validation
- **Program Management**: Dynamic program listing from database
- **Admin Dashboard**: Application management and system oversight
- **Payment Processing**: Multiple payment options (online, bank deposit, campus)
- **Biometric Integration**: Photo and fingerprint capture
- **Document Management**: Secure file uploads and verification
- **Live Database**: No hardcoded data - everything from Supabase

## 🚀 Features Implemented

### Phase 1: Foundation ✅
- [x] Next.js 15 with TypeScript and Tailwind CSS
- [x] Supabase database integration
- [x] shadcn/ui component library
- [x] Responsive design system
- [x] Database schema with all required tables

### Phase 2: Core Features 🔄
- [x] Multi-step student application form
- [x] Real-time program fetching from database
- [x] Form validation and error handling
- [x] Loading states and error boundaries
- [ ] Biometric capture interface
- [ ] Payment processing system
- [ ] Document upload functionality

### Phase 3: Admin Features 🔄
- [x] Admin dashboard with statistics
- [x] Database setup instructions
- [ ] Application review interface
- [ ] Payment verification system
- [ ] Fee management console

## 📊 Database Schema

The system uses the following main tables:

- **students**: Student records with personal and academic information
- **programs**: Available certificate and diploma programs
- **fees**: Program-specific and general fees
- **payments**: Payment records and verification status
- **intake_periods**: Semester and enrollment periods
- **admin_users**: System administrators with role-based access

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Bun package manager
- Supabase account and project

### 1. Clone and Install
```bash
git clone <repository-url>
cd student-registration-system
bun install
```

### 2. Environment Configuration
Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Setup (CRITICAL)
The application requires database tables to be created manually in Supabase:

1. **Go to Supabase Dashboard**
   - Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Navigate to your project → SQL Editor

2. **Execute Schema**
   - Copy the SQL from `database/schema.sql`
   - Paste and run in SQL Editor
   - This creates all required tables

3. **Initialize Sample Data**
   - Run the application: `bun dev`
   - Go to `/admin` page
   - Click "Initialize Sample Data" button
   - This populates programs, fees, and other reference data

### 4. Run Development Server
```bash
bun dev
```

Visit `http://localhost:3000` to see the application.

## 📱 Application Flow

### Student Journey
1. **Home Page**: View available programs and statistics
2. **Application Form**: Multi-step process
   - Personal Information
   - Academic History
   - Program Selection
   - Biometric Data (coming soon)
   - Payment (coming soon)
   - Review & Submit
3. **Student Portal**: Track application status (coming soon)

### Admin Journey
1. **Dashboard**: Overview statistics and recent applications
2. **Application Review**: Verify student submissions (coming soon)
3. **Payment Management**: Process and verify payments (coming soon)
4. **System Settings**: Manage programs, fees, and users (coming soon)

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── apply/             # Student application
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── navigation.tsx    # Navigation component
├── lib/                   # Utilities and services
│   ├── database.ts       # Database operations
│   ├── supabase.ts       # Supabase configuration
│   └── utils.ts          # Helper functions
└── database/
    └── schema.sql        # Complete database schema
```

## 🔧 Current Status

### Working Features
- ✅ Responsive home page with live statistics
- ✅ Complete application form (steps 1-3)
- ✅ Real-time program loading from database
- ✅ Admin dashboard with setup instructions
- ✅ Form validation and error handling
- ✅ Database connection and operations

### Known Issues
- ⚠️ Database tables must be created manually
- ⚠️ Some TypeScript linting warnings (non-blocking)
- ⚠️ Application requires manual database initialization

### Next Steps
1. Complete biometric capture interface
2. Implement payment processing
3. Add document upload functionality
4. Build application review system
5. Create fee management console

## 🛟 Troubleshooting

### "Application error" on home page
- **Cause**: Database tables don't exist
- **Solution**: Follow database setup instructions above

### "Failed to load programs"
- **Cause**: Supabase connection or missing tables
- **Solution**: Check environment variables and run database schema

### Empty statistics/programs
- **Cause**: No sample data in database
- **Solution**: Go to `/admin` and click "Initialize Sample Data"

## 🎓 About NPI PNG

The National Polytechnic Institute of Papua New Guinea offers:
- Certificate programs (12-18 months)
- Diploma programs (24-36 months)
- Engineering, Business, Computing, and Technical disciplines
- Both day and boarding accommodation options

## 📞 Support

For technical issues:
1. Check the troubleshooting section above
2. Verify database setup is complete
3. Ensure all environment variables are correct
4. Contact development team if issues persist

---

**Built with**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase
**Status**: Active Development
**Last Updated**: August 2025
