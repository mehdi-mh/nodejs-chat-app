# Real-time Chat Application

A real-time chat application built with Node.js, Express, Socket.IO, and MySQL. This application allows users to send and receive messages in real-time with a clean and responsive interface.

## Features

- Real-time messaging using Socket.IO
- Persistent message history with MySQL database
- Responsive web interface
- User-friendly chat interface
- Message broadcasting to all connected clients
- Basic input validation
- Error handling and logging
- API documentation with Swagger

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nodejs-chat-app.git
   cd nodejs-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=chatapp
   ```

4. Create the database:
   ```bash
   npm run db:create
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000/chat.html
   ```

## API Documentation

API documentation is available at:
```
http://localhost:5000/api-docs
```

## Project Structure

```
chat-app/
├── public/                 # Static files
│   ├── chat.html           # Main chat interface
│   └── styles/             # CSS styles
├── src/
│   ├── config/            # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── repositories/       # Database operations
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── app.js              # Main application file
│   └── swagger.js          # API documentation
├── migrations/             # Database migrations
├── .gitignore
├── knexfile.js             # Knex configuration
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback the last migration
- `npm run db:create` - Create the database

## Technologies Used

- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Database**: MySQL with Knex.js
- **API Documentation**: Swagger/OpenAPI
- **Frontend**: HTML, CSS, JavaScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.