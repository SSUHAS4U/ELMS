import Holiday from '../models/Holiday.js';

// @route GET /api/holidays
export const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort('date');
    res.status(200).json({ success: true, count: holidays.length, holidays });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/holidays (Admin)
export const addHoliday = async (req, res, next) => {
  try {
    const { name, date, type } = req.body;
    const holiday = await Holiday.create({ name, date, type });
    res.status(201).json({ success: true, holiday });
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/holidays/:id (Admin)
export const deleteHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    res.status(200).json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    next(error);
  }
};
