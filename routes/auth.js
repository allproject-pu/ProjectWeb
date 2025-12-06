const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ดึง db มาใช้

router.post('/register', (req, res) => {
    const { email, username, lastname, password } = req.body;
    const sql = 'INSERT INTO users (email, username, lastname, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [email, username, lastname, password], (err, result) => {
        if (err) return res.json({ success: false, message: 'สมัคสมาชิกไม่สำเร็จ' });
        res.json({ success: true, message: 'สมัครสมาชิกเรียบร้อย!' });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.json({ success: false, message: 'อีเมลหรือรหัสผ่านผิด' });
    });
});

module.exports = router;