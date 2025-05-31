const pool = require('./db');

/**
 * Setup the database tables if they don't exist
 */
async function setupDatabase() {
    try {
        console.log('Checking database tables...');

        // Check if messages table exists
        const [tables] = await pool.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'messages'",
            [process.env.DB_NAME]
        );

        if (tables.length === 0) {
            console.log('Creating messages table...');

            // Create messages table
            await pool.execute(`
                CREATE TABLE messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log('Messages table created successfully!');
        } else {
            console.log('Messages table already exists.');
        }
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

module.exports = setupDatabase;
