const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const chatMessageController = require('../controllers/chatMessageController');

/**
 * @swagger
 * tags:
 *   name: Chat Messages
 *   description: Chat message management
 */

/**
 * @swagger
 * /api/chat/messages:
 *   post:
 *     summary: Create a new chat message
 *     tags: [Chat Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - message
 *             properties:
 *               username:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
    '/',
    [
        body('username')
            .trim()
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ max: 255 })
            .withMessage('Username is too long'),
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
            .isLength({ max: 1000 })
            .withMessage('Message is too long')
    ],
    chatMessageController.createMessage
);

/**
 * @swagger
 * /api/chat/messages:
 *   get:
 *     summary: Get all chat messages
 *     tags: [Chat Messages]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    [
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),
        query('offset')
            .optional()
            .isInt({ min: 0 })
            .withMessage('Offset must be a positive number')
    ],
    chatMessageController.getMessages
);

/**
 * @swagger
 * /api/chat/messages/{id}:
 *   get:
 *     summary: Get a message by ID
 *     tags: [Chat Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message found
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID must be a positive integer')
    ],
    chatMessageController.getMessageById
);

/**
 * @swagger
 * /api/chat/messages/{id}:
 *   delete:
 *     summary: Delete a message by ID
 *     tags: [Chat Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       204:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID must be a positive integer')
    ],
    chatMessageController.deleteMessage
);

module.exports = router;
