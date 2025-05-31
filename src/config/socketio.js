/**
 * Socket.IO Singleton Module
 * 
 * This module provides a singleton instance of Socket.IO that can be used
 * throughout the application to avoid circular dependencies.
 */

// Socket.IO instance to be set by app.js
let io = null;

/**
 * Set the Socket.IO instance
 * @param {Object} ioInstance - Socket.IO instance
 */
function setIO(ioInstance) {
    io = ioInstance;
    console.log('Socket.IO instance has been set in the singleton module');
}

/**
 * Get the Socket.IO instance
 * @returns {Object|null} Socket.IO instance or null if not set
 */
function getIO() {
    return io;
}

module.exports = {
    setIO,
    getIO
};
