const basicAuth = require('express-basic-auth');
require('dotenv').config();

// Basic Auth middleware
const authMiddleware = basicAuth({
    users: { [process.env.BASIC_USER]: process.env.BASIC_PASS },
    challenge: true, // Show login dialog when not authenticated
    unauthorizedResponse: (req) => {
        return req.auth
            ? 'Invalid credentials' // When credentials are provided but invalid
            : 'Authentication required'; // When no credentials are provided
    }
});

module.exports = authMiddleware;