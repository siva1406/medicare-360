import cron from 'node-cron';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';

export const startReminderJob = () => {
  // Runs every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[Cron] Checking for 24-hour upcoming appointment reminders...');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const upcomingAppointments = await Appointment.find({
        date: tomorrowStr,
        status: { $in: ['confirmed', 'pending'] }
      }).populate('patientId', 'name email phone').populate('doctorId', 'name');

      for (const apt of upcomingAppointments) {
        if (!apt.patientId) continue;

        // Check if reminder already sent
        const existingReminder = await Notification.findOne({
          userId: apt.patientId._id,
          type: 'reminder',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingReminder) {
          const message = `Reminder: You have an appointment tomorrow (${apt.date}) at ${apt.slotTime} with Dr. ${apt.doctorId?.name || 'Doctor'}.`;

          await Notification.create({
            userId: apt.patientId._id,
            message,
            type: 'reminder'
          });

          // Mock SMS & Email transmission logs
          console.log(`[Notification Dispatch - SMS] To: ${apt.patientId.phone || '+91 98765 43210'} | Message: "${message}"`);
          console.log(`[Notification Dispatch - Email] To: ${apt.patientId.email} | Subject: "Appointment Reminder - MediCare 360"`);
        }
      }
    } catch (err) {
      console.error('[Cron Error] Failed to process appointment reminders:', err.message);
    }
  });

  console.log('[Cron] Automated appointment reminder service initialized (24h window).');
};
