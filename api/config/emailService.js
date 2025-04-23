import nodemailer from 'nodemailer';

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// General function to send any type of email
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Format date helper function
const formatSlotDate = (slotDate) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  try {
    const dateArray = slotDate.split("_");
    const day = dateArray[0].trim();
    const monthIndex = Number(dateArray[1].trim()) - 1;
    const year = dateArray[2].trim();

    if (monthIndex < 0 || monthIndex >= months.length) {
      return "Date not available";
    }

    return `${day} ${months[monthIndex]} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return slotDate;
  }
};

export {sendEmail, formatSlotDate};
