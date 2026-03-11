const mongoose = require('mongoose');

let initPromise = null;

const initializeDatabases = async () => {
  if (!initPromise) {
    initPromise = (async () => {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('[OK] MongoDB Connected');
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }

  return initPromise;
};

module.exports = { initializeDatabases };
