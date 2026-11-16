import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { autoSeedIfEmpty } from './seed/seed.js';
import { startReminderJob } from './cron/reminders.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await autoSeedIfEmpty();
    startReminderJob();

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  MediCare 360 - Smart Healthcare Management Server`);
      console.log(`  Listening on: http://localhost:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start MediCare 360 server:', err);
    process.exit(1);
  }
}

startServer();
