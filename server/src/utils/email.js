const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'مرحباً بك في عالم طه',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">مرحباً ${userName}!</h2>
        <p>شكراً لانضمامك إلى عالم طه. نحن سعداء لوجودك معنا في رحلتك نحو اللياقة البدنية.</p>
        <p>يمكنك الآن الاستفادة من جميع الدورات والموارد المتاحة لك.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">زيارة لوحة التحكم</a>
      </div>
    `
  }),

  passwordReset: (userName, resetUrl) => ({
    subject: 'إعادة تعيين كلمة المرور',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">إعادة تعيين كلمة المرور</h2>
        <p>مرحباً ${userName},</p>
        <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك. يرجى النقر على الرابط أدناه لإعادة تعيين كلمة المرور:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">إعادة تعيين كلمة المرور</a>
        <p>هذا الرابط صالح لمدة 10 دقائق فقط.</p>
        <p>إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد.</p>
      </div>
    `
  }),

  emailVerification: (userName, verificationUrl) => ({
    subject: 'تأكيد البريد الإلكتروني',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">مرحباً ${userName}!</h2>
        <p>شكراً لانضمامك إلى عالم طه. يرجى النقر على الرابط أدناه لتأكيد بريدك الإلكتروني:</p>
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">تأكيد البريد الإلكتروني</a>
        <p>إذا لم تطلب هذا التأكيد، يمكنك تجاهل هذا البريد.</p>
      </div>
    `
  }),

  courseEnrollment: (userName, courseTitle) => ({
    subject: 'تم تسجيلك في الدورة بنجاح',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">تهانينا ${userName}!</h2>
        <p>تم تسجيلك بنجاح في دورة "${courseTitle}".</p>
        <p>يمكنك الآن البدء في التعلم والاستفادة من المحتوى المتاح.</p>
        <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">بدء التعلم</a>
      </div>
    `
  }),

  courseCompletion: (userName, courseTitle, certificateUrl) => ({
    subject: 'تهانينا! لقد أكملت الدورة',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">تهانينا ${userName}!</h2>
        <p>لقد أكملت بنجاح دورة "${courseTitle}". هذا إنجاز رائع!</p>
        <p>يمكنك الآن تحميل شهادتك من الرابط أدناه:</p>
        <a href="${certificateUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">تحميل الشهادة</a>
        <p>نتمنى لك التوفيق في رحلتك نحو اللياقة البدنية!</p>
      </div>
    `
  })
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const template = emailTemplates.welcome(user.displayName);
    await sendEmail({
      to: user.email,
      ...template
    });
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const template = emailTemplates.passwordReset(user.displayName, resetUrl);
    await sendEmail({
      to: user.email,
      ...template
    });
  } catch (error) {
    console.error('Password reset email error:', error);
    throw error;
  }
};

// Send email verification
const sendEmailVerification = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const template = emailTemplates.emailVerification(user.displayName, verificationUrl);
    await sendEmail({
      to: user.email,
      ...template
    });
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

// Send course enrollment email
const sendCourseEnrollmentEmail = async (user, course) => {
  try {
    const template = emailTemplates.courseEnrollment(user.displayName, course.title);
    await sendEmail({
      to: user.email,
      ...template
    });
  } catch (error) {
    console.error('Course enrollment email error:', error);
  }
};

// Send course completion email
const sendCourseCompletionEmail = async (user, course, certificateUrl) => {
  try {
    const template = emailTemplates.courseCompletion(user.displayName, course.title, certificateUrl);
    await sendEmail({
      to: user.email,
      ...template
    });
  } catch (error) {
    console.error('Course completion email error:', error);
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendCourseEnrollmentEmail,
  sendCourseCompletionEmail,
  emailTemplates
};
