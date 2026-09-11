# Instagram Clone

A full-stack Instagram-inspired social media application built with React, Node.js, Express, MongoDB, Clerk, and Socket.IO.

The application includes core social media functionality such as authentication, user profiles, posts, likes, comments, follows, notifications, and real-time chat messaging.

## Features

- Authentication and user management using Clerk
- User profiles
- Create and manage posts
- Like and unlike posts
- Comments on posts
- Follow and unfollow users
- Notifications
- Real-time chat messaging using Socket.IO
- Real-time communication between users
- MongoDB database integration
- Clerk webhook integration
- Responsive user interface
- REST API architecture

## Tech Stack

### Frontend

- React.js
- JavaScript
- CSS
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

### Authentication

- Clerk

### Development Tools

- Git
- GitHub
- ngrok
- Postman

## Project Structure

```text
Instagram-Clone/
│
├── client/                  # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                  # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   ├── config/
│   └── server.js
│
└── README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd Instagram-Clone
```

### 2. Install Dependencies

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

## Clerk Authentication Setup

This project uses Clerk for authentication and user management.

Create a Clerk application from the Clerk Dashboard and obtain the required keys.

Add the required Clerk environment variables to your frontend and backend `.env` files.

Frontend example:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_publishable_key
```

Backend example:

```env
CLERK_SECRET_KEY=your_secret_key
```

Do not commit your `.env` files or secret keys to GitHub.

## Clerk Webhook Setup

The project uses Clerk webhooks to synchronize user-related events between Clerk and the backend.

During local development, Clerk cannot directly access a backend running on `localhost`. Therefore, ngrok is used to create a public URL that forwards requests to the local backend.

### 1. Start the Backend

From the `server` directory:

```bash
npm run dev
```

For example:

```text
http://localhost:5000
```

### 2. Start ngrok

Run:

```bash
ngrok http 5000
```

ngrok will generate a public URL similar to:

```text
https://example.ngrok-free.app
```

Use this URL for the Clerk webhook endpoint.

For example:

```text
https://example.ngrok-free.app/api/webhooks/clerk
```

### 3. Configure the Clerk Webhook

In the Clerk Dashboard:

```text
Clerk Dashboard
    ↓
Webhooks
    ↓
Add Endpoint
    ↓
Add your ngrok webhook URL
```

Select the required user events used by the application.

This allows Clerk to send webhook events to the local Node.js backend during development.

Note: The ngrok URL can change when the ngrok session is restarted. When that happens, update the webhook endpoint in Clerk.

## MongoDB Setup

This project uses MongoDB for data storage.

You can use either MongoDB Atlas or a local MongoDB installation.

Add your MongoDB connection string to the backend `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
```

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/instagram
```

## Backend Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLERK_SECRET_KEY=your_clerk_secret_key

CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

CLIENT_URL=http://localhost:5173
```

Add any additional environment variables required by your application.

## Frontend Environment Variables

Create a `.env` file inside the `client` directory.

Example:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

VITE_API_URL=http://localhost:5000
```

Add any additional frontend environment variables required by your application.

## Real-Time Chat

The application uses Socket.IO for real-time chat messaging.

Socket.IO establishes a real-time connection between the frontend and backend, allowing messages to be delivered instantly without continuously refreshing or polling the server.

```text
User A
   │
   │ Message
   ▼
Socket.IO Server
   │
   │ Real-time Event
   ▼
User B
```

The frontend uses Socket.IO Client, while the backend manages socket connections and real-time events.

## Running the Project

The frontend and backend need to be started separately.

### Start the Backend

```bash
cd server
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

## Local Development Flow

### Application Architecture

```text
React Frontend
      │
      │ API Requests
      ▼
Node.js + Express
      │
      ├──────────────► MongoDB
      │
      ├──────────────► Clerk
      │
      └──────────────► Socket.IO
                             │
                             ▼
                      Real-Time Chat
```

### Clerk Webhook Flow

```text
Clerk
  │
  │ Webhook Request
  ▼
ngrok Public URL
  │
  ▼
Local Node.js Server
  │
  ▼
MongoDB
```

## Testing

Postman can be used to test REST APIs.

Real-time chat functionality can be tested by opening the application with multiple users and sending messages between them.

## Important Notes

- Do not upload `.env` files to GitHub.
- Do not expose Clerk secret keys or webhook secrets.
- Do not commit `node_modules`.
- Make sure MongoDB is running and accessible.
- Make sure the backend is running before testing frontend API requests.
- Start ngrok when testing Clerk webhooks locally.
- Update the Clerk webhook URL whenever the ngrok URL changes.

## License

This project was created for learning and portfolio purposes.
