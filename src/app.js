/**
 * Main application file for the Call Logs API
 * This file sets up the Express server, middleware, routes, and error handling
 */

// Import required modules
const express = require('express');
const http = require('http');
const cors = require('cors');
const setupSwagger = require('./swagger');
const socketio = require('socket.io');
const pool = require('./config/db');
const setupDatabase = require('./config/setupDatabase');
const socketService = require('./services/socketService');

// Import route handlers
const chatMessageRoutes = require('./routes/chatMessageRoutes');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketio(server, {
    cors: {
        origin: '*', // In production, replace with your frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    },
    // Serve client library
    serveClient: true,
    // Use WebSocket with polling fallback
    transports: ['websocket', 'polling']
});

// Initialize Socket.IO service
socketService.initialize(io);

// Middleware for Socket.IO to handle errors
io.engine.on("connection_error", (err) => {
    console.log(err.req);      // the request object
    console.log(err.code);     // the error code, for example 1
    console.log(err.message);  // the error message, for example "Session ID unknown"
    console.log(err.context);  // some additional error context
});

// Serve static files from public directory
app.use(express.static('public'));

// Set the port from environment variable or default to 3000
const port = process.env.PORT || 3000;

/**
 * CORS Configuration
 * 
 * Configure CORS with appropriate options
 * - origin: Allow requests from any origin (restrict in production)
 * - methods: Allow common HTTP methods
 * - allowedHeaders: Allow necessary headers
 */
const corsOptions = {
    origin: '*', // In production, replace with specific origins (e.g., ['https://yourdomain.com'])
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

/**
 * Middleware Configuration
 * 
 * 1. CORS: Enable Cross-Origin Resource Sharing
 * 2. express.json(): Parse incoming requests with JSON payloads
 * 3. express.static(): Serve static files from the 'public' directory
 */
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

/**
 * API Routes
 * 
 * Mounts the route handlers for different resources
 * - /call_logs: Endpoints for call log operations
 * - /tokens: Endpoints for token management
 */
app.use('/api/chat/messages', chatMessageRoutes);

/**
 * Health Check Endpoint
 * 
 * Used for monitoring and container orchestration
 * Returns a 200 status with { status: 'ok' } if the service is running
 */
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

/**
 * Root Route
 * 
 * Redirects the root URL to the chat interface
 */
app.get('/', (req, res) => {
    res.redirect('/chat.html');
});

// Initialize Swagger documentation
setupSwagger(app);

/**
 * Error Handling Middleware
 * 
 * Handles all errors in a centralized way
 * - Logs the error for debugging
 * - Sends appropriate HTTP status and error message to client
 */
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Default to 500 Internal Server Error if status not set
    const statusCode = err.statusCode || 500;

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong!'
        : err.message;

    // Send error response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 404 Handler - Must be after all other routes but before error handlers
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Resource not found',
        path: req.path
    });
});

// Global error handler - Must be after all other middleware and routes
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'Invalid token',
            error: 'UNAUTHORIZED'
        });
    }

    // Handle validation errors (e.g., from express-validator)
    if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation Error',
            errors: err.errors || err.message
        });
    }

    // Handle database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            status: 'error',
            statusCode: 409,
            message: 'Duplicate entry',
            error: 'CONFLICT'
        });
    }

    // Default error handler
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV !== 'production' && {
            stack: err.stack,
            ...(err.errors && { errors: err.errors })
        })
    });
});

const chatMessageRepository = require('./repositories/chatMessageRepository');

// Start the server
server.listen(port, async () => {
    try {
        // Setup database tables
        await setupDatabase();

        console.log(`Server is running on port ${port}`);
        console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
        console.log(`API Base URL: http://localhost:${port}`);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error('Error:', err.name, err.message);

    // Gracefully close the server
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error('Error:', err.name, err.message);

    // Gracefully close the server
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM (for container orchestration)
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

// Export the Express app for testing purposes
module.exports = { app, server };
