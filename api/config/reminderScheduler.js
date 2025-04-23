import cron from 'node-cron';
import moment from 'moment-timezone';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import { sendEmail } from './emailService.js';
import { getAppointmentReminderTemplate } from './emailTemplate.js';

const scheduleReminders = () => {
  console.log("🔄 Appointment reminder scheduler initialized");

  cron.schedule('* * * * *', async () => {
    try {
      const now = moment().tz("Asia/Colombo");

      const currentDate = now.date();
      const currentMonth = now.month() + 1;
      const currentYear = now.year();
      const formattedToday = `${currentDate}_${currentMonth}_${currentYear}`;

      console.log("⏰ Cron running at:", now.format('YYYY-MM-DD HH:mm:ss'));
      console.log("📅 Looking for appointments on:", formattedToday);

      const allAppointments = await appointmentModel.find({
        slotDate: formattedToday,
        cancelled: false,
        reminderSent: false,
        isCompleted: false,
      });
      
      console.log("🔍 Appointments on today (no filters):", allAppointments.length);

      for (const appointment of allAppointments) {
        const [day, month, year] = appointment.slotDate.split('_');
        const [hour, minute] = appointment.slotTime.split(':');

        const appointmentTime = moment.tz(
          `${year}-${month}-${day} ${hour}:${minute}`,
          "YYYY-M-D HH:mm",
          "Asia/Colombo"
        );

        const timeDiff = appointmentTime.diff(now);

        // console.log(`📆 Appointment at: ${appointmentTime.format("YYYY-MM-DD HH:mm")}`);
        // console.log(`⏳ Time diff: ${timeDiff}ms for appointment ${appointment._id}`);

        if (timeDiff > 0 && timeDiff <= 35 * 60 * 1000) {
          const user = await userModel.findById(appointment.userId);
          const doctor = await doctorModel.findById(appointment.docId);

          const emailHTML = getAppointmentReminderTemplate(user, doctor, appointment);
          const emailSent = await sendEmail(user.email, 'Reminder: Upcoming Appointment', emailHTML);

          if (emailSent) {
            await appointmentModel.findByIdAndUpdate(appointment._id, { reminderSent: true });
            console.log(`✅ Reminder sent to ${user.email} for appointment ${appointment._id}`);
          } else {
            console.log(`❌ Failed to send reminder to ${user.email}`);
          }
        }
      }
    } catch (err) {
      console.error("🚨 Error in reminder cron job:", err.message);
    }
  });
};

export default scheduleReminders;
