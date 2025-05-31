const chatMessageRepository = require('../repositories/chatMessageRepository');
const socketIOModule = require('../config/socketio');

/**
 * Socket Service
 * Handles all Socket.IO related functionality
 */
class SocketService {
    /**
     * Initialize Socket.IO connection handlers
     * @param {Object} io - Socket.IO server instance
     */
    initialize(io) {
        // Store the io instance in the socketIOModule for use in other parts of the application
        socketIOModule.setIO(io);

        // Socket.IO connection handler
        io.on('connection', this.handleConnection.bind(this));

        console.log('Socket.IO service initialized');
    }

    /**
     * Handle new Socket.IO connections
     * @param {Object} socket - Socket.IO socket instance
     */
    async handleConnection(socket) {
        console.log('User connected:', socket.id);

        try {
            // Send last 20 messages to the newly connected client
            const messages = await chatMessageRepository.findAll(20, 0);
            console.log(`Sending chat history to ${socket.id}:`, messages.length, 'messages');

            // Ensure we're sending an array even if the database query fails
            socket.emit('chat-history', Array.isArray(messages) ? messages : []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            socket.emit('error', { message: 'Failed to load chat history' });
            socket.emit('chat-history', []); // Send empty array as fallback
        }

        // Set up event listeners
        socket.on('chat-message', (data) => this.handleChatMessage(socket, data));
        socket.on('ping', () => socket.emit('pong'));
        socket.on('disconnect', (reason) => this.handleDisconnect(socket, reason));
    }

    /**
     * Handle incoming chat messages
     * @param {Object} socket - Socket.IO socket instance
     * @param {Object} data - Message data
     */
    async handleChatMessage(socket, data) {
        console.log(`Received message from ${socket.id}:`, data);

        try {
            // Validate input
            if (!data || !data.username || !data.message) {
                console.error('Invalid message data');
                socket.emit('error', { message: 'Invalid message format' });
                return;
            }

            // Save message to database
            const savedMessage = await chatMessageRepository.create({
                username: data.username,
                message: data.message
            });

            console.log('Message saved to database:', savedMessage);

            // Broadcast the new message to all connected clients
            this.broadcastMessage(savedMessage);
        } catch (error) {
            console.error('Error handling chat message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    /**
     * Handle socket disconnections
     * @param {Object} socket - Socket.IO socket instance
     * @param {string} reason - Reason for disconnection
     */
    handleDisconnect(socket, reason) {
        console.log('User disconnected:', socket.id, 'Reason:', reason);
    }

    /**
     * Broadcast a message to all connected clients
     * @param {Object} message - The message to broadcast
     * @returns {boolean} - Whether the broadcast was successful
     */
    broadcastMessage(message) {
        try {
            const io = socketIOModule.getIO();
            if (!io) {
                console.warn('Socket.IO instance not available for broadcasting');
                return false;
            }

            console.log('Broadcasting message from service to all clients');
            io.emit('chat-message', message);
            return true;
        } catch (error) {
            console.error('Error broadcasting message:', error);
            return false;
        }
    }
}

module.exports = new SocketService();
