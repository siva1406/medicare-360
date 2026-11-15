import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async (req, action, resource, details = {}) => {
  try {
    const userId = req.user ? req.user._id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await AuditLog.create({
      userId,
      action,
      resource,
      details,
      ipAddress: String(ipAddress)
    });
  } catch (err) {
    console.error('[AuditLog] Error recording audit log:', err.message);
  }
};
