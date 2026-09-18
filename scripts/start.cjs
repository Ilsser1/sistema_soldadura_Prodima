const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
process.env.NODE_ENV = 'production';
require('../dist/backend/server.cjs');

