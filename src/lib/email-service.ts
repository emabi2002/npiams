// Email Service for TVET Academic Management System
// Supports multiple email providers and notification types
/* eslint-disable @typescript-eslint/no-explicit-any */

interface EmailConfig {
  provider: 'supabase' | 'sendgrid' | 'resend' | 'smtp';
  apiKey?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailNotification {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  type: NotificationType;
}

export type NotificationType =
  | 'application_received'
  | 'application_approved'
  | 'application_rejected'
  | 'grade_released'
  | 'fee_reminder'
  | 'enrollment_complete'
  | 'assessment_scheduled'
  | 'transcript_ready';

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Email Templates
  private getTemplate(type: NotificationType, data: Record<string, string>): EmailTemplate {
    const templates: Record<NotificationType, (data: Record<string, string>) => EmailTemplate> = {
      application_received: (data) => ({
        subject: `Application Received - ${data.programName}`,
        html: this.generateApplicationReceivedHTML(data),
        text: `Dear ${data.studentName},\n\nThank you for your application to ${data.programName} at NPI. We have received your application and will review it shortly.\n\nApplication ID: ${data.applicationId}\nProgram: ${data.programName}\nDate Submitted: ${data.dateSubmitted}\n\nYou will receive updates on your application status via email.\n\nBest regards,\nNational Polytechnic Institute`
      }),

      application_approved: (data) => ({
        subject: `🎉 Application Approved - Welcome to ${data.programName}`,
        html: this.generateApplicationApprovedHTML(data),
        text: `Dear ${data.studentName},\n\nCongratulations! Your application to ${data.programName} has been approved.\n\nNext Steps:\n1. Pay enrollment fees\n2. Register for courses\n3. Attend orientation\n\nEnrollment deadline: ${data.enrollmentDeadline}\n\nWelcome to NPI!\n\nBest regards,\nAdmissions Office`
      }),

      application_rejected: (data) => ({
        subject: `Application Update - ${data.programName}`,
        html: this.generateApplicationRejectedHTML(data),
        text: `Dear ${data.studentName},\n\nThank you for your interest in ${data.programName} at NPI. After careful review, we are unable to offer you admission at this time.\n\nReason: ${data.reason}\n\nYou may reapply for the next intake period. For questions, please contact our admissions office.\n\nBest regards,\nAdmissions Office`
      }),

      grade_released: (data) => ({
        subject: `Grades Released - ${data.courseName}`,
        html: this.generateGradeReleasedHTML(data),
        text: `Dear ${data.studentName},\n\nYour grades for ${data.courseName} have been released.\n\nGrade: ${data.grade}\nMarks: ${data.marks}\nSemester: ${data.semester}\n\nYou can view your complete transcript in the student portal.\n\nBest regards,\nAcademic Office`
      }),

      fee_reminder: (data) => ({
        subject: `Fee Payment Reminder - ${data.semester}`,
        html: this.generateFeeReminderHTML(data),
        text: `Dear ${data.studentName},\n\nThis is a reminder that your fees for ${data.semester} are due.\n\nAmount Due: K${data.amountDue}\nDue Date: ${data.dueDate}\nPayment Methods: ${data.paymentMethods}\n\nPlease make payment to avoid any disruption to your studies.\n\nFee Office`
      }),

      enrollment_complete: (data) => ({
        subject: `Enrollment Complete - Welcome to NPI`,
        html: this.generateEnrollmentCompleteHTML(data),
        text: `Dear ${data.studentName},\n\nWelcome to the National Polytechnic Institute! Your enrollment in ${data.programName} is now complete.\n\nStudent ID: ${data.studentId}\nProgram: ${data.programName}\nSemester Start: ${data.semesterStart}\n\nPlease attend the orientation session on ${data.orientationDate}.\n\nWelcome to the NPI family!\n\nStudent Services`
      }),

      assessment_scheduled: (data) => ({
        subject: `Assessment Scheduled - ${data.courseName}`,
        html: this.generateAssessmentScheduledHTML(data),
        text: `Dear ${data.studentName},\n\nAn assessment has been scheduled for ${data.courseName}.\n\nAssessment: ${data.assessmentTitle}\nType: ${data.assessmentType}\nDate: ${data.assessmentDate}\nTime: ${data.assessmentTime}\nDuration: ${data.duration}\n\nPlease prepare accordingly.\n\nInstructor: ${data.instructorName}`
      }),

      transcript_ready: (data) => ({
        subject: `Official Transcript Ready for Download`,
        html: this.generateTranscriptReadyHTML(data),
        text: `Dear ${data.studentName},\n\nYour official transcript is ready for download.\n\nProgram: ${data.programName}\nGraduation Date: ${data.graduationDate}\nCGPA: ${data.cgpa}\n\nPlease log in to the student portal to download your transcript.\n\nCongratulations on your achievement!\n\nRegistrar Office`
      })
    };

    return templates[type](data);
  }

  // HTML Templates
  private generateApplicationReceivedHTML(data: Record<string, string>): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .status-card { background: #eff6ff; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Received</h1>
          <p>National Polytechnic Institute</p>
        </div>
        <div class="content">
          <h2>Dear ${data.studentName},</h2>
          <p>Thank you for your application to <strong>${data.programName}</strong> at the National Polytechnic Institute.</p>

          <div class="status-card">
            <h3>Application Details</h3>
            <p><strong>Application ID:</strong> ${data.applicationId}</p>
            <p><strong>Program:</strong> ${data.programName}</p>
            <p><strong>Date Submitted:</strong> ${data.dateSubmitted}</p>
            <p><strong>Status:</strong> Under Review</p>
          </div>

          <p>Our admissions team will carefully review your application and supporting documents. You can expect to hear from us within 5-7 business days.</p>

          <a href="${data.portalUrl}" class="button">Check Application Status</a>

          <p>If you have any questions, please don't hesitate to contact our admissions office.</p>
        </div>
        <div class="footer">
          <p>National Polytechnic Institute<br>
          Port Moresby, Papua New Guinea<br>
          Email: admissions@npi.edu.pg | Phone: +675 XXX XXXX</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateApplicationApprovedHTML(data: Record<string, string>): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Application Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10B981); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .success-card { background: #ecfdf5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; }
        .next-steps { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Congratulations!</h1>
          <p>You've been accepted to NPI</p>
        </div>
        <div class="content">
          <h2>Dear ${data.studentName},</h2>
          <p>We are delighted to inform you that your application to <strong>${data.programName}</strong> has been <strong>approved</strong>!</p>

          <div class="success-card">
            <h3>Acceptance Details</h3>
            <p><strong>Program:</strong> ${data.programName}</p>
            <p><strong>Department:</strong> ${data.departmentName}</p>
            <p><strong>Duration:</strong> ${data.programDuration}</p>
            <p><strong>Start Date:</strong> ${data.programStartDate}</p>
          </div>

          <div class="next-steps">
            <h3>Next Steps</h3>
            <ol>
              <li>Pay enrollment fees by ${data.enrollmentDeadline}</li>
              <li>Register for your courses</li>
              <li>Attend orientation on ${data.orientationDate}</li>
              <li>Complete medical clearance</li>
            </ol>
          </div>

          <a href="${data.enrollmentUrl}" class="button">Complete Enrollment</a>

          <p>Welcome to the NPI family! We look forward to supporting your academic journey.</p>
        </div>
        <div class="footer">
          <p>National Polytechnic Institute<br>
          Technical and Vocational Education & Training<br>
          Port Moresby, Papua New Guinea</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateGradeReleasedHTML(data: Record<string, string>): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Grades Released</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8B5CF6, #3B82F6); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .grade-card { background: #f0f9ff; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }
        .grade-large { font-size: 2em; font-weight: bold; color: #3B82F6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Grades Released</h1>
          <p>Academic Results Available</p>
        </div>
        <div class="content">
          <h2>Dear ${data.studentName},</h2>
          <p>Your grades for <strong>${data.courseName}</strong> have been released and are now available in your student portal.</p>

          <div class="grade-card">
            <h3>Course Results</h3>
            <p><strong>Course:</strong> ${data.courseName} (${data.courseCode})</p>
            <p><strong>Instructor:</strong> ${data.instructorName}</p>
            <p><strong>Semester:</strong> ${data.semester}</p>
            <p><strong>Grade:</strong> <span class="grade-large">${data.grade}</span></p>
            <p><strong>Marks:</strong> ${data.marks}/${data.totalMarks}</p>
            <p><strong>GPA Points:</strong> ${data.gpaPoints}</p>
          </div>

          <a href="${data.transcriptUrl}" class="button">View Full Transcript</a>

          <p>Keep up the excellent work! Your complete academic record is available in the student portal.</p>
        </div>
        <div class="footer">
          <p>Academic Office - National Polytechnic Institute<br>
          For questions about your grades, contact: academic@npi.edu.pg</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  private generateFeeReminderHTML(data: Record<string, string>): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fee Payment Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B, #EAB308); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px 20px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .fee-card { background: #fef3c7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        .amount { font-size: 1.5em; font-weight: bold; color: #D97706; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Fee Payment Reminder</h1>
          <p>National Polytechnic Institute</p>
        </div>
        <div class="content">
          <h2>Dear ${data.studentName},</h2>
          <p>This is a friendly reminder that your fees for <strong>${data.semester}</strong> are due soon.</p>

          <div class="fee-card">
            <h3>Payment Details</h3>
            <p><strong>Student ID:</strong> ${data.studentId}</p>
            <p><strong>Program:</strong> ${data.programName}</p>
            <p><strong>Amount Due:</strong> <span class="amount">K${data.amountDue}</span></p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
            <p><strong>Payment Reference:</strong> ${data.paymentReference}</p>
          </div>

          <h3>Payment Methods</h3>
          <ul>
            <li>Bank Transfer: BSP Account ${data.bankAccount}</li>
            <li>In-person: Fee Office (Mon-Fri, 8AM-4PM)</li>
            <li>Online: Student Portal</li>
          </ul>

          <a href="${data.paymentUrl}" class="button">Pay Now</a>

          <p><strong>Important:</strong> Please ensure payment is made by the due date to avoid any disruption to your studies.</p>
        </div>
        <div class="footer">
          <p>Fee Office - National Polytechnic Institute<br>
          Email: fees@npi.edu.pg | Phone: +675 XXX XXXX</p>
        </div>
      </div>
    </body>
    </html>`;
  }

  // Additional HTML template methods for other notification types...
  private generateEnrollmentCompleteHTML(data: Record<string, string>): string { return ''; }
  private generateApplicationRejectedHTML(data: Record<string, string>): string { return ''; }
  private generateAssessmentScheduledHTML(data: Record<string, string>): string { return ''; }
  private generateTranscriptReadyHTML(data: Record<string, string>): string { return ''; }

  // Send email function
  async sendEmail(notification: EmailNotification): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'supabase':
          return await this.sendWithSupabase(notification);
        case 'sendgrid':
          return await this.sendWithSendGrid(notification);
        case 'resend':
          return await this.sendWithResend(notification);
        case 'smtp':
          return await this.sendWithSMTP(notification);
        default:
          console.log('Email would be sent:', notification);
          return true; // Demo mode
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private async sendWithSupabase(notification: EmailNotification): Promise<boolean> {
    // Supabase Edge Functions for email
    console.log('Sending via Supabase Edge Function:', notification);
    return true;
  }

  private async sendWithSendGrid(notification: EmailNotification): Promise<boolean> {
    // SendGrid implementation
    console.log('Sending via SendGrid:', notification);
    return true;
  }

  private async sendWithResend(notification: EmailNotification): Promise<boolean> {
    // Resend implementation
    console.log('Sending via Resend:', notification);
    return true;
  }

  private async sendWithSMTP(notification: EmailNotification): Promise<boolean> {
    // SMTP implementation
    console.log('Sending via SMTP:', notification);
    return true;
  }

  // Convenience methods for specific notifications
  async sendApplicationReceived(studentEmail: string, data: Record<string, string>): Promise<boolean> {
    const template = this.getTemplate('application_received', data);
    return this.sendEmail({
      to: studentEmail,
      from: 'admissions@npi.edu.pg',
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'application_received'
    });
  }

  async sendApplicationApproved(studentEmail: string, data: Record<string, string>): Promise<boolean> {
    const template = this.getTemplate('application_approved', data);
    return this.sendEmail({
      to: studentEmail,
      from: 'admissions@npi.edu.pg',
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'application_approved'
    });
  }

  async sendGradeReleased(studentEmail: string, data: Record<string, string>): Promise<boolean> {
    const template = this.getTemplate('grade_released', data);
    return this.sendEmail({
      to: studentEmail,
      from: 'academic@npi.edu.pg',
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'grade_released'
    });
  }

  async sendFeeReminder(studentEmail: string, data: Record<string, string>): Promise<boolean> {
    const template = this.getTemplate('fee_reminder', data);
    return this.sendEmail({
      to: studentEmail,
      from: 'fees@npi.edu.pg',
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'fee_reminder'
    });
  }
}

// Default email service instance
export const emailService = new EmailService({
  provider: 'supabase' // Change to your preferred provider
});
