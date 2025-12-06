const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/create-room', (req, res) => {
    // ... ก๊อปปี้โค้ด create-room เดิมมาใส่ ...
    // เปลี่ยน app.post เป็น router.post
});

router.get('/rooms', (req, res) => {
    // ... ก๊อปปี้โค้ด get rooms เดิมมาใส่ ...
    // เปลี่ยน app.get เป็น router.get
});

module.exports = router;