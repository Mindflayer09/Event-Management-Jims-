const Club = require('../models/Club');

// GET /api/clubs
exports.getAllClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().sort({ name: 1 });
    res.json({ success: true, data: { clubs } });
  } catch (error) {
    next(error);
  }
};

// GET /api/clubs/:id
exports.getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }
    res.json({ success: true, data: { club } });
  } catch (error) {
    next(error);
  }
};
