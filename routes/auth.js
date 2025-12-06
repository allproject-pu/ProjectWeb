const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ดึง db มาใช้

router.post('/register', (req, res) => {
    const { email, username, lastname, password } = req.body;
    const sql = 'INSERT INTO users (email, username, lastname, password) VALUES (?, ?, ?, ?)';
    db.query(sql, [email, username, lastname, password], (err, result) => {
        if (err) {
            console.error(err); // ดู Error เต็มๆ ใน Terminal

            // เช็ครหัส Error ของ MySQL ว่าใช่รหัส "ข้อมูลซ้ำ" หรือไม่
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ success: false, message: 'อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่น' });
            }

            // กรณี Error อื่นๆ ทั่วไป
            return res.json({ success: false, message: 'เกิดข้อผิดพลาดที่ระบบฐานข้อมูล' });
        }

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