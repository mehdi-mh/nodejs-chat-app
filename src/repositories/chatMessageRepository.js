const knex = require('knex')(require('../../knexfile').development);
const pool = require('../config/db');

/**
 * Chat Message Repository
 * Handles all database operations for chat messages
 */
class ChatMessageRepository {
    /**
     * Create a new chat message
     * @param {Object} messageData - Message data
     * @param {string} messageData.username - Username of the sender
     * @param {string} messageData.message - The message content
     * @returns {Promise<Object>} Created message
     */
    async create({ username, message }) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO messages (username, message) VALUES (?, ?)',
                [username, message]
            );

            // Get the inserted message
            const [rows] = await pool.execute(
                'SELECT * FROM messages WHERE id = ?',
                [result.insertId]
            );

            return rows[0] || null;
        } catch (error) {
            console.error('Error creating chat message:', error);
            throw error;
        }
    }

    /**
     * Find all messages with pagination
     * @param {number} [limit=100] - Number of messages to return
     * @param {number} [offset=0] - Offset for pagination
     * @returns {Promise<Array>} List of messages
     */
    async findAll(limit = 100, offset = 0) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM messages ORDER BY timestamp DESC LIMIT ? OFFSET ?',
                [parseInt(limit), parseInt(offset)]
            );
            return rows;
        } catch (error) {
            console.error('Error finding chat messages:', error);
            throw error;
        }
    }

    /**
     * Find a message by ID
     * @param {number} id - Message ID
     * @returns {Promise<Object|null>} Found message or null
     */
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM messages WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error(`Error finding chat message with ID ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete a message by ID
     * @param {number} id - Message ID
     * @returns {Promise<boolean>} True if deleted, false otherwise
     */
    async deleteById(id) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM messages WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error(`Error deleting chat message with ID ${id}:`, error);
            throw error;
        }
    }
}

module.exports = new ChatMessageRepository();
