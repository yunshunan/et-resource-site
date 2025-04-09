const express = require('express');
const router = express.Router();

// 健康检查端点
router.get('/health-check', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'running'
    }
  });
});

module.exports = router; 