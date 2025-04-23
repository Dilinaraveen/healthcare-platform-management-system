import { formatSlotDate } from "./emailService.js";


// Template for appointment confirmation email
const getAppointmentConfirmationTemplate = (userData, docData, slotDate, slotTime) => {
  const formattedDate = formatSlotDate(slotDate);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a4a4a;">Appointment Confirmed</h2>
      <p>Dear ${userData.name},</p>
      <p>Your appointment has been successfully booked with the following details:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Doctor:</strong> ${docData.name}</p>
        <p><strong>Specialization:</strong> ${docData.speciality}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${slotTime}</p>
        <p><strong>Fee:</strong> $${docData.fees}</p>
      </div>
      <p>Please arrive 15 minutes before your scheduled appointment time.</p>
      <p>If you need to reschedule or cancel your appointment, please contact us at least 24 hours in advance.</p>
      <p>Thank you for choosing our services!</p>
      <p>Best regards,<br>Medical Appointment Team</p>
    </div>
  `;
};

// Template for payment confirmation email
const getPaymentConfirmationTemplate = (userData, docData, appointmentData) => {
  const formattedDate = formatSlotDate(appointmentData.slotDate);
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a4a4a;">Payment Confirmed</h2>
      <p>Dear ${userData.name},</p>
      <p>We're pleased to confirm that we've received your payment for the following appointment:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Doctor:</strong> ${docData.name}</p>
        <p><strong>Specialization:</strong> ${docData.speciality}</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${appointmentData.slotTime}</p>
        <p><strong>Amount Paid:</strong> $${appointmentData.amount}</p>
        <p><strong>Payment Status:</strong> <span style="color: green; font-weight: bold;">Completed</span></p>
      </div>
      <p>Your appointment is now fully confirmed. Please arrive 15 minutes before your scheduled time.</p>
      <p>If you need to reschedule or have any questions, please contact our support team.</p>
      <p>Thank you for choosing our services!</p>
      <p>Best regards,<br>Medical Appointment Team</p>
    </div>
  `;
};

const getAppointmentReminderTemplate = (userData, docData, appointmentData) => {
    const formattedDate = formatSlotDate(appointmentData.slotDate);
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a;">Appointment Reminder</h2>
        <p>Dear ${userData.name},</p>
        <p>This is a friendly reminder that you have an appointment scheduled:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Doctor:</strong> ${docData.name}</p>
          <p><strong>Specialization:</strong> ${docData.speciality}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${appointmentData.slotTime}</p>
          <p><strong>Fee:</strong> $${docData.fees}</p>
        </div>
        <p>Please arrive 15 minutes early.</p>
        <p>Thank you,<br/>Medical Appointment Team</p>
      </div>
    `;
  };
  
  

export { getAppointmentConfirmationTemplate, getPaymentConfirmationTemplate,getAppointmentReminderTemplate};