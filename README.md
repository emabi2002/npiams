# NPI TVET Academic Management System

A comprehensive academic management platform designed specifically for Technical and Vocational Education & Training (TVET) institutions in Papua New Guinea.

## 🌐 Live Demo
**Production URL**: https://same-lu5vy9sqhdz-latest.netlify.app

## 🚀 Features

### 📚 Academic Management
- **Student Lifecycle**: Complete workflow from application to graduation
- **Program Management**: Diploma and Certificate programs with PNG context
- **Course Management**: Semester-based curriculum with prerequisites
- **Assessment System**: Create exams, assignments, projects, and quizzes
- **Grade Management**: Comprehensive grading with PDF transcript generation

### 👥 User Management
- **Role-based Access**: Admin, Staff, Instructor, and Student roles
- **Authentication**: Secure login with Supabase Auth
- **User Profiles**: Comprehensive profile management

### 💰 Financial Management
- **Fee Structure**: Program-specific fee management
- **Payment Tracking**: Monitor payments and outstanding balances
- **Invoice Generation**: Automated billing and receipts

### 📊 Analytics & Reporting
- **Dashboard Analytics**: Real-time KPIs and performance metrics
- **Interactive Charts**: Enrollment trends, GPA distribution, program performance
- **Export Capabilities**: PDF transcripts and data exports

### 🇵🇬 PNG-Specific Features
- **Local Context**: PNG provinces, departments, and cultural relevance
- **TVET Programs**: Industry-relevant technical programs
- **Kina Currency**: PNG financial formatting throughout
- **Local Names**: Authentic Papua New Guinea naming conventions

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (Auth + Database + Real-time)
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF + html2canvas
- **Deployment**: Netlify (Static Site Generation)

## 📋 Prerequisites

Before setting up the system, ensure you have:

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Database Access**: Your Supabase credentials (provided)
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🔧 Database Setup

### Step 1: Access Your Supabase Dashboard
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `gomfaspdusmdqkfzhdfk`

### Step 2: Run the Database Schema
1. Go to **SQL Editor** in the left sidebar
2. Create a new query
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and run the SQL script
5. Verify all tables are created successfully

### Step 3: Initialize the System
1. Visit the setup page: `/setup`
2. Test the database connection
3. Create your admin user account
4. Start using the system!

## 🔐 Authentication

### Default Demo Credentials
- **Email**: admin@npi.edu.pg
- **Password**: admin123456

### User Roles
- **Admin**: Full system access and management
- **Staff**: Academic and student management
- **Instructor**: Course and grade management
- **Student**: Personal profile and grade access

## 📖 System Usage

### For Administrators
1. **Dashboard Overview**: Monitor key metrics and recent activities
2. **Academic Setup**: Configure years, departments, programs, and courses
3. **Student Management**: Process applications and manage enrollments
4. **Fee Management**: Track payments and generate invoices
5. **Reports**: Generate analytics and export data

### For Staff
1. **Application Processing**: Review and approve student applications
2. **Student Records**: Manage student profiles and academic progress
3. **Course Management**: Oversee course enrollments and schedules

### For Instructors
1. **Assessment Creation**: Design exams, assignments, and projects
2. **Grade Management**: Enter grades and generate transcripts
3. **Student Progress**: Monitor student performance

### For Students
1. **Profile Management**: Update personal information
2. **Grade Viewing**: Access transcripts and academic records
3. **Fee Status**: Check payment status and outstanding balances

## 🗂️ Database Schema

### Core Tables
- **user_profiles**: User accounts and roles
- **academic_years**: Academic calendar management
- **departments**: Academic departments (Engineering, Business, etc.)
- **programs**: TVET programs (Diplomas, Certificates)
- **courses**: Individual courses with prerequisites
- **students**: Enrolled student records
- **applications**: Student application workflow
- **assessments**: Exams, assignments, and projects
- **grades**: Student performance records
- **fee_structures**: Program-specific fee management
- **student_payments**: Payment tracking and history

### Security Features
- **Row Level Security (RLS)**: Data access based on user roles
- **Authentication Policies**: Secure access to sensitive data
- **Audit Trails**: Track changes and system usage

## 🎯 Key Workflows

### Student Enrollment Process
1. **Application Submission**: Online application with documents
2. **Document Review**: Staff review submitted materials
3. **Interview/Assessment**: Conduct entrance evaluation
4. **Admission Decision**: Committee approval process
5. **Fee Payment**: Student pays enrollment fees
6. **Course Registration**: Register for semester courses
7. **Enrollment Complete**: Student officially enrolled

### Assessment Workflow
1. **Create Assessment**: Design exam or assignment
2. **Student Assignment**: Assign to enrolled students
3. **Grade Entry**: Instructors enter marks
4. **Grade Approval**: Academic review and approval
5. **Transcript Generation**: PDF transcript creation

## 📊 Analytics Features

### Dashboard Metrics
- Total students and enrollment trends
- Program performance and completion rates
- Financial overview and collection rates
- Recent activities and upcoming events

### Advanced Reports
- **Enrollment Analytics**: Trends by program and semester
- **Academic Performance**: GPA distribution and success rates
- **Financial Reports**: Fee collection and outstanding balances
- **Geographic Analysis**: Student distribution by province

## 🔄 Future Enhancements

### Planned Features
- **Mobile App**: React Native companion app
- **Document Management**: File upload and storage
- **Email Notifications**: Automated communications
- **Advanced Reporting**: Scheduled reports and exports
- **Integration APIs**: Connect with external systems

### Customization Options
- **Branding**: Institutional colors and logos
- **Localization**: Additional PNG languages
- **Workflow Customization**: Adapt to specific institutional needs

## 🆘 Support & Maintenance

### Technical Support
- **Documentation**: Comprehensive user guides
- **Training**: Staff and administrator training
- **System Updates**: Regular feature updates and security patches

### Contact Information
- **System Administrator**: admin@npi.edu.pg
- **Technical Support**: Contact Same support team
- **Institution**: Papua New Guinea National Polytechnic Institute

## 📄 License

This system is designed specifically for Papua New Guinea National Polytechnic Institute and educational institutions in PNG.

---

**Built with ❤️ for PNG TVET Education**

*Empowering Technical and Vocational Education & Training in Papua New Guinea*
