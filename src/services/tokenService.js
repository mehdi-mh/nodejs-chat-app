const tokenRepository = require('../repositories/tokenRepository');
const { formatDate } = require('../utils/dateUtils');
const AppError = require('../utils/appError');

/**
 * @module services/tokenService
 * @description Contains business logic for token operations.
 * Handles data transformation, business rules, and coordinates between controllers and repositories.
 */

/**
 * Retrieves all tokens with any necessary business logic applied
 * @returns {Promise<Array<Object>>} Processed array of tokens
 */
const getAllTokens = async () => {
    try {
        const tokens = await tokenRepository.findAll();
        
        return tokens.map(token => ({
            ...token,
            // Mask sensitive token data
            token: maskToken(token.token),
            // Format dates
            created_at: formatDate(token.created_at),
            expires_at: formatDate(token.expires_at)
        }));
    } catch (error) {
        console.error('Error in getAllTokens service:', error);
        throw new AppError('Failed to fetch tokens', 500, 'TOKENS_FETCH_ERROR');
    }
};

/**
 * Retrieves a single token by ID with business logic applied
 * @param {number} id - The ID of the token to retrieve
 * @returns {Promise<Object>} Processed token record or null if not found
 */
const getTokenById = async (id) => {
    try {
        const token = await tokenRepository.findById(id);
        
        if (!token) {
            throw new AppError('Token not found', 404, 'TOKEN_NOT_FOUND');
        }
        
        return {
            ...token,
            // Mask sensitive token data
            token: maskToken(token.token),
            // Format dates
            created_at: formatDate(token.created_at),
            expires_at: formatDate(token.expires_at)
        };
    } catch (error) {
        // If it's our custom error, rethrow it
        if (error.isOperational) throw error;
        
        console.error(`Error in getTokenById service for ID ${id}:`, error);
        throw new AppError('Failed to fetch token', 500, 'TOKEN_FETCH_ERROR');
    }
};

/**
 * Deletes a token by ID with business logic
 * @param {number} id - The ID of the token to delete
 * @returns {Promise<Object>} Result of the delete operation
 */
const deleteTokenById = async (id) => {
    try {
        // Check if token exists before attempting to delete
        const token = await tokenRepository.findById(id);
        if (!token) {
            throw new AppError('Token not found', 404, 'TOKEN_NOT_FOUND');
        }
        
        // Log the deletion (in production, use a proper logger)
        console.log(`[${new Date().toISOString()}] Deleting token ID: ${id}`);
        
        // Perform the deletion
        const result = await tokenRepository.deleteById(id);
        
        if (!result.affectedRows) {
            throw new AppError('Failed to delete token', 500, 'TOKEN_DELETE_ERROR');
        }
        
        return {
            success: true,
            message: 'Token deleted successfully',
            deleted: true,
            affectedRows: result.affectedRows
        };
    } catch (error) {
        // If it's our custom error, rethrow it
        if (error.isOperational) throw error;
        
        console.error(`Error in deleteTokenById service for ID ${id}:`, error);
        throw new AppError('Failed to delete token', 500, 'TOKEN_DELETE_ERROR');
    }
};

/**
 * Mask sensitive parts of a token
 * @private
 * @param {string} token - The token to mask
 * @returns {string} Masked token
 */
function maskToken(token) {
    if (!token || token.length < 10) return '***';
    const visibleChars = 4;
    return token.substring(0, visibleChars) + '***' + token.substring(token.length - visibleChars);
}

module.exports = {
    getAllTokens,
    getTokenById,
    deleteTokenById
};
