import AuditLog from '../models/AuditLog.js';

/**
 * Write an entry to the audit log.
 * Call this after every INSERT, UPDATE, DELETE on core collections.
 *
 * @param {Object} actor  - req.user object
 * @param {string} action - dot-namespaced action string e.g. 'leave.applied'
 * @param {string} target - human-readable description of what changed
 * @param {*}      targetId    - optional Mongoose ObjectId of affected document
 * @param {string} targetModel - optional model name string
 * @param {Object} details     - optional extra data (diff, snapshot, etc.)
 */
export const writeAudit = async (actor, action, target, targetId = null, targetModel = null, details = null) => {
  try {
    await AuditLog.create({
      actor:       actor._id,
      actorName:   actor.name,
      action,
      target,
      targetId,
      targetModel,
      details,
      ip:          actor._reqIp || null
    });
  } catch (err) {
    // Audit failures should NOT crash the main operation — just log
    console.error('[AUDIT ERROR]', err.message);
  }
};
