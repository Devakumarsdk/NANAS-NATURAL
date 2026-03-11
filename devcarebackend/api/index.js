require('dotenv').config({ override: true });
const app = require('../src/app');
const { initializeDatabases } = require('../src/bootstrap');

module.exports = async (req, res) => {
  try {
    await initializeDatabases();
    return app(req, res);
  } catch (err) {
    console.error('[ERROR] API bootstrap failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
    });
  }
};
