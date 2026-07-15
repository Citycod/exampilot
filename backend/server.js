const express = require('express');
const cors = require('cors');
const env = require('./src/config/env');
const { errorHandler } = require('./src/middleware/error.middleware');
const authRoutes = require('./src/routes/auth.routes');
const chatRoutes = require('./src/routes/chat.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = env.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
