const { validationResult } = require('express-validator');
const chatMessageService = require('../services/chatMessageService');
const AppError = require('../utils/appError');
const socketService = require('../services/socketService');

/**
 * Chat Message Controller
 * Handles HTTP requests for chat messages
 */
class ChatMessageController {
    /**
     * Create a new chat message
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    async createMessage(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new AppError('Validation failed', 400, {
                    errors: errors.array()
                });
            }

            const { username, message } = req.body;
            const newMessage = await chatMessageService.createMessage({ username, message });

            // Broadcast the new message to all connected Socket.IO clients
            const broadcastSuccess = socketService.broadcastMessage(newMessage);
            if (!broadcastSuccess) {
                console.warn('Failed to broadcast message via Socket.IO');
            }

            res.status(201).json({
                status: 'success',
                data: {
                    message: newMessage
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all messages
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    async getMessages(req, res, next) {
        try {
            const { limit = 50, offset = 0 } = req.query;
            const messages = await chatMessageService.getMessages({
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.status(200).json({
                status: 'success',
                results: messages.length,
                data: {
                    messages
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get a single message by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    async getMessageById(req, res, next) {
        try {
            const { id } = req.params;
            const message = await chatMessageService.getMessageById(parseInt(id));

            res.status(200).json({
                status: 'success',
                data: {
                    message
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete a message by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Next middleware function
     */
    async deleteMessage(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await chatMessageService.deleteMessage(parseInt(id));

            if (!deleted) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Message not found'
                });
            }

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatMessageController();
