const callLogRepository = require('../repositories/callLogRepository');
const { formatDate } = require('../utils/dateUtils');
const AppError = require('../utils/appError');

/**
 * @module services/callLogService
 * @description Contains business logic for call log operations.
 * Handles data transformation, business rules, and coordinates between controllers and models.
 */

/**
 * Retrieves all call logs with any necessary business logic applied
 * @returns {Promise<Array<Object>>} Processed array of call logs
 */
const getAllCallLogs = async () => {
    try {
        const callLogs = await callLogRepository.findAll();
        
        return callLogs.map(log => ({
            ...log,
            // Format dates for display
            created_at: formatDate(log.created_at)
            // Add any other business-specific transformations here
        }));
    } catch (error) {
        console.error('Error in getAllCallLogs service:', error);
        throw new AppError('Failed to fetch call logs', 500, 'CALL_LOGS_FETCH_ERROR');
    }
};

/**
 * Retrieves a single call log by ID with business logic applied
 * @param {number} id - The ID of the call log to retrieve
 * @returns {Promise<Object>} Processed call log record or null if not found
 */
const getCallLogById = async (id) => {
    try {
        const callLog = await callLogRepository.findById(id);
        
        if (!callLog) {
            throw new AppError('Call log not found', 404, 'CALL_LOG_NOT_FOUND');
        }
        
        return {
            ...callLog,
            // Format dates for display
            created_at: formatDate(callLog.created_at)
            // Add any other business-specific transformations here
        };
    } catch (error) {
        // If it's our custom error, rethrow it
        if (error.isOperational) throw error;
        
        console.error(`Error in getCallLogById service for ID ${id}:`, error);
        throw new AppError('Failed to fetch call log', 500, 'CALL_LOG_FETCH_ERROR');
    }
};

module.exports = {
    getAllCallLogs,
    getCallLogById
};
