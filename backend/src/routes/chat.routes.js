const express = require('express');
const { chat, getChatHistory, getTools } = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/chat', chat);
router.get('/chat/:sessionId', getChatHistory);
router.get('/tools', getTools);

module.exports = router;
