const chatMessageRepository = require('../repositories/chatMessageRepository');
const AppError = require('../utils/appError');

/**
 * Chat Message Service
 * Handles business logic for chat messages
 */
class ChatMessageService {
    /**
     * Create a new chat message
     * @param {Object} messageData - Message data
     * @param {string} messageData.username - Username of the sender
     * @param {string} messageData.message - The message content
     * @returns {Promise<Object>} Created message
     */
    async createMessage({ username, message }) {
        try {
            if (!username || !message) {
                throw new AppError('Username and message are required', 400, 'VALIDATION_ERROR');
            }

            if (message.length > 1000) {
                throw new AppError('Message is too long', 400, 'VALIDATION_ERROR');
            }

            return await chatMessageRepository.create({ username, message });
        } catch (error) {
            if (error.isOperational) throw error;
            console.error('Error in createMessage service:', error);
            throw new AppError('Failed to create message', 500, 'MESSAGE_CREATION_ERROR');
        }
    }

    /**
     * Get all messages with pagination
     * @param {Object} options - Query options
     * @param {number} [options.limit=50] - Number of messages to return
     * @param {number} [options.offset=0] - Offset for pagination
     * @returns {Promise<Array>} List of messages
     */
    async getMessages({ limit = 50, offset = 0 } = {}) {
        try {
            // Ensure limit is reasonable
            const safeLimit = Math.min(parseInt(limit) || 50, 100);
            const safeOffset = Math.max(parseInt(offset) || 0, 0);

            return await chatMessageRepository.findAll(safeLimit, safeOffset);
        } catch (error) {
            console.error('Error in getMessages service:', error);
            throw new AppError('Failed to fetch messages', 500, 'MESSAGES_FETCH_ERROR');
        }
    }

    /**
     * Get a single message by ID
     * @param {number} id - Message ID
     * @returns {Promise<Object>} Message
     */
    async getMessageById(id) {
        try {
            const message = await chatMessageRepository.findById(id);
            
            if (!message) {
                throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
            }

            return message;
        } catch (error) {
            if (error.isOperational) throw error;
            console.error(`Error in getMessageById service for ID ${id}:`, error);
            throw new AppError('Failed to fetch message', 500, 'MESSAGE_FETCH_ERROR');
        }
    }

    /**
     * Delete a message by ID
     * @param {number} id - Message ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async deleteMessage(id) {
        try {
            // Check if message exists
            const message = await this.getMessageById(id);
            if (!message) {
                return false;
            }

            return await chatMessageRepository.deleteById(id);
        } catch (error) {
            if (error.isOperational && error.code === 'MESSAGE_NOT_FOUND') {
                return false;
            }
            console.error(`Error in deleteMessage service for ID ${id}:`, error);
            throw new AppError('Failed to delete message', 500, 'MESSAGE_DELETION_ERROR');
        }
    }
}

module.exports = new ChatMessageService();
