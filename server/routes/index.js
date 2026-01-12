/**
 * Routes exports
 */

const authRoutes = require('./auth');
const documentRoutes = require('./documents');
const searchRoutes = require('./search');

module.exports = {
    authRoutes,
    documentRoutes,
    searchRoutes
};
