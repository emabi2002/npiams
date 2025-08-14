# 🚀 NPI TVET Academic Management System - Complete Setup Guide

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Supabase Account**: Your project is `gomfaspdusmdqkfzhdfk`
- ✅ **Database Credentials**: Already configured in `.env.local`
- ✅ **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
- ✅ **Internet Connection**: For initial setup and database sync

## 🔧 Step 1: Database Setup (CRITICAL)

### Option A: Quick Setup via Dashboard
1. **Access Your System**: Visit https://same-lu5vy9sqhdz-latest.netlify.app
2. **Go to Database Admin**: Click "System Administration" → "Database Admin"
3. **Follow Setup Instructions**: The interface will guide you through the process

### Option B: Manual Supabase Setup
1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/gomfaspdusmdqkfzhdfk
2. **Navigate to SQL Editor**: Click "SQL Editor" in the left sidebar
3. **Create New Query**: Click the "New Query" button
4. **Copy Schema**: Copy the entire contents of `supabase-schema.sql`
5. **Execute Script**: Paste and run the SQL to create all tables
6. **Verify Setup**: Check that all tables are created successfully

### Database Schema Overview
The system creates these essential tables:
- **user_profiles**: User accounts and roles
- **academic_years**: Academic calendar management
- **departments**: Academic departments
- **programs**: TVET programs (Diplomas, Certificates)
- **courses**: Individual courses with prerequisites
- **students**: Enrolled student records
- **applications**: Student application workflow
- **assessments**: Exams, assignments, and projects
- **grades**: Student performance records
- **fee_structures**: Program-specific fees
- **student_payments**: Payment tracking

## 👤 Step 2: Create Admin User

### Method 1: Through Setup Page
1. Visit `/setup` page after database is configured
2. Click "Create Admin User"
3. Default credentials will be created

### Method 2: Custom Admin Creation
1. Go to Database Admin page
2. Use the admin creation tool
3. Customize email and password

### Default Admin Credentials
- **Email**: admin@npi.edu.pg
- **Password**: admin123456
- **Role**: Administrator

⚠️ **Security Note**: Change these credentials immediately after first login!

## 🎨 Step 3: Customize Your Branding

### Access Branding Settings
1. **Navigate**: System Administration → Branding & Customization
2. **Colors Tab**: Choose your institution's colors
3. **Logo Tab**: Upload your institutional logo
4. **Institution Tab**: Update contact information
5. **Preview Tab**: See your changes and export CSS

### Quick Branding Setup
1. **Primary Color**: Choose your main brand color
2. **Institution Name**: Update to your TVET institution
3. **Contact Details**: Add your address, phone, email
4. **Logo**: Upload your institutional logo (PNG/JPG)
5. **Save Settings**: Apply your branding across the system

## 📧 Step 4: Configure Email Notifications

### Email Provider Setup
1. **Navigate**: System Administration → Email Notifications
2. **Settings Tab**: Configure your email provider
3. **Choose Provider**:
   - Supabase Edge Functions (recommended)
   - SendGrid
   - Resend
   - SMTP Server

### Email Templates
- ✅ **Application Received**: Automated confirmation
- ✅ **Application Approved**: Acceptance notification
- ✅ **Grade Released**: Grade announcements
- ✅ **Fee Reminders**: Payment notifications
- ✅ **Enrollment Complete**: Welcome messages

### Test Email Setup
1. **Test Tab**: Send test emails
2. **Verify Delivery**: Check email functionality
3. **Template Preview**: Review email designs

## 📱 Step 5: Mobile PWA Installation

### For Students and Staff
1. **Visit System**: Access via mobile browser
2. **Install Prompt**: Tap "Install" when prompted
3. **Home Screen**: App icon will appear
4. **Offline Access**: Works without internet

### iOS Installation
1. **Safari Browser**: Open system in Safari
2. **Share Button**: Tap the share icon
3. **Add to Home Screen**: Select this option
4. **Confirm**: Tap "Add" to install

### Android Installation
1. **Chrome Browser**: Open system in Chrome
2. **Install Banner**: Tap "Install" when prompted
3. **Confirm**: App will be added to home screen

## 📊 Step 6: Import Your Data

### Data Import Options
1. **Navigate**: Database Admin → Data Import tab
2. **Supported Formats**: JSON arrays
3. **Import Types**:
   - Departments
   - Programs
   - Courses
   - Students

### Sample Data Format
```json
[
  {
    "name": "Engineering & Technology",
    "code": "ENG",
    "head_name": "Dr. John Smith",
    "description": "Technical and engineering programs"
  }
]
```

### Bulk Import Process
1. **Prepare Data**: Format as JSON arrays
2. **Select Type**: Choose data category
3. **Paste Data**: Copy JSON into text area
4. **Import**: Click import button
5. **Verify**: Check data appears correctly

## 🔐 Step 7: User Management & Roles

### User Roles
- **Admin**: Full system access
- **Staff**: Academic and student management
- **Instructor**: Course and grade management
- **Student**: Personal profile and grades

### Adding Users
1. **Navigate**: Student Management → User Management
2. **Add User**: Create new accounts
3. **Assign Roles**: Set appropriate permissions
4. **Send Credentials**: Email login information

## 📈 Step 8: System Configuration

### Academic Calendar
1. **Academic Years**: Set current academic year
2. **Semesters**: Configure semester periods
3. **Holidays**: Mark important dates

### Fee Structure
1. **Program Fees**: Set fees by program
2. **Payment Plans**: Configure payment options
3. **Currency**: Uses Papua New Guinea Kina (K)

### Assessment Setup
1. **Grade Scale**: Configure GPA system
2. **Assessment Types**: Exams, assignments, projects
3. **Grading Policies**: Set academic standards

## 🔍 Step 9: Testing & Verification

### System Testing Checklist
- [ ] Database connection working
- [ ] User login/logout functional
- [ ] All menu pages accessible
- [ ] Data entry and retrieval working
- [ ] Email notifications sending
- [ ] PDF transcript generation
- [ ] Mobile responsiveness
- [ ] PWA installation working

### Test User Accounts
Create test accounts for each role:
1. **Test Admin**: Full system testing
2. **Test Instructor**: Course management
3. **Test Student**: Student portal features

## 🚀 Step 10: Go Live!

### Pre-Launch Checklist
- [ ] All real data imported
- [ ] Staff trained on system usage
- [ ] Email notifications configured
- [ ] Branding customized
- [ ] Backup procedures established
- [ ] User accounts created

### Launch Day
1. **Announce Launch**: Inform all stakeholders
2. **Provide Training**: Quick training sessions
3. **Monitor Usage**: Watch for any issues
4. **Support Ready**: Have technical support available

## 📞 Support & Resources

### Documentation
- **User Guides**: Built-in help for each role
- **Video Tutorials**: Coming soon
- **FAQ Section**: Common questions answered

### Technical Support
- **System Issues**: Check browser console
- **Database Problems**: Verify Supabase connection
- **Email Issues**: Check provider settings
- **PWA Problems**: Clear browser cache

### Contact Information
- **Technical Support**: Contact Same support team
- **System Administrator**: admin@npi.edu.pg
- **Institution**: Your TVET Institution

## 🔄 Maintenance & Updates

### Regular Maintenance
- **Weekly**: Check system performance
- **Monthly**: Review user accounts
- **Quarterly**: Update academic data
- **Annually**: Academic year rollover

### Data Backup
- **Automatic**: Supabase handles backups
- **Manual**: Export important data regularly
- **Recovery**: Test restore procedures

### System Updates
- **Automatic**: Frontend updates via Netlify
- **Database**: Schema updates when needed
- **Features**: New functionality added regularly

## 🎯 Success Metrics

### Key Performance Indicators
- **User Adoption**: Staff and student usage
- **Data Accuracy**: Complete and correct records
- **System Uptime**: Availability and reliability
- **User Satisfaction**: Feedback and surveys

### Expected Benefits
- ✅ **Streamlined Administration**: Faster processing
- ✅ **Better Data Management**: Centralized records
- ✅ **Improved Communication**: Automated notifications
- ✅ **Enhanced Reporting**: Real-time analytics
- ✅ **Mobile Access**: Anywhere, anytime access

---

## 🎉 Congratulations!

Your NPI TVET Academic Management System is now fully operational and ready to transform your institution's academic management!

**Need Help?** Contact the Same support team or refer to the system documentation.

**Ready to Excel?** Your TVET institution now has a world-class academic management platform! 🚀
