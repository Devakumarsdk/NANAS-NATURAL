require('dotenv').config({ override: true });
const app = require('./app');
const { initializeDatabases } = require('./bootstrap');

const PORT = process.env.PORT || 5000;

initializeDatabases()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[OK] DEVCARE Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[ERROR] Database initialization failed:', err);
    process.exit(1);
  });

module.exports = app;
