import OrganizationSetting from '../models/OrganizationSetting.js';
import { writeAudit } from '../utils/audit.js';

// @route GET /api/org/settings  (Admin)
export const getSettings = async (req, res, next) => {
  try {
    const settings = await OrganizationSetting.find().sort('group label');
    // Convert to key-value map for easy frontend consumption
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.status(200).json({ success: true, settings, map });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/org/settings  (Admin)
// Body: { settings: [{ key, value }] }
export const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'settings must be an array of { key, value }' });
    }

    const ops = settings.map(({ key, value }) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));

    await OrganizationSetting.bulkWrite(ops);
    await writeAudit(req.user, 'org.settingsUpdated', `Organization settings updated (${settings.length} keys)`);
    res.status(200).json({ success: true, message: 'Settings saved' });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/org/settings/seed  (Admin — one time)
// Seeds the default settings if none exist
export const seedDefaultSettings = async (req, res, next) => {
  try {
    const count = await OrganizationSetting.countDocuments();
    if (count > 0) return res.status(200).json({ success: true, message: 'Settings already exist' });

    const defaults = [
      { key: 'org.name', value: 'Obsidian Engine', label: 'Organization Name', group: 'company', type: 'string' },
      { key: 'org.address', value: '', label: 'Address', group: 'company', type: 'string' },
      { key: 'org.timezone', value: 'Asia/Kolkata', label: 'Timezone', group: 'company', type: 'string' },
      { key: 'leave.carryForwardEnabled', value: true, label: 'Enable Leave Carry Forward', group: 'leave_policy', type: 'boolean' },
      { key: 'leave.carryForwardMax', value: 5, label: 'Max Carry Forward Days', group: 'leave_policy', type: 'number' },
      { key: 'working.daysPerWeek', value: 5, label: 'Working Days Per Week', group: 'working_days', type: 'number' },
      { key: 'working.startTime', value: '09:00', label: 'Work Start Time', group: 'working_days', type: 'string' },
      { key: 'working.endTime', value: '18:00', label: 'Work End Time', group: 'working_days', type: 'string' },
    ];

    await OrganizationSetting.insertMany(defaults);
    res.status(201).json({ success: true, message: 'Default settings seeded', count: defaults.length });
  } catch (error) {
    next(error);
  }
};
