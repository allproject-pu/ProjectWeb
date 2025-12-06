require('dotenv').config(); // บรรทัดบนสุด
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// เสิร์ฟไฟล์ Frontend (HTML/CSS/JS) ของคุณ
app.use(express.static(path.join(__dirname, 'public')));

// 1. Config เชื่อมต่อ Database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// --- API Routes (จุดเชื่อมต่อ) ---

// API: สมัครสมาชิก (รับค่าจาก register-page.html)
app.post('/api/register', (req, res) => {
    const { email, username, lastname, password } = req.body;
    
    // SQL สำหรับบันทึกข้อมูล
    const sql = 'INSERT INTO users (email, username, lastname, password) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [email, username, lastname, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'สมัคสมาชิกไม่สำเร็จ หรืออีเมลซ้ำ' });
        }
        res.json({ success: true, message: 'สมัครสมาชิกเรียบร้อย!' });
    });
});

// API: เข้าสู่ระบบ (รับค่าจาก login-page.html)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        
        if (results.length > 0) {
            // เจอ user
            res.json({ success: true, user: results[0] });
        } else {
            // ไม่เจอ
            res.json({ success: false, message: 'อีเมลหรือรหัสผ่านผิด' });
        }
    });
});

// API: สร้างห้องกิจกรรม (รับค่าจาก add-room-page.html)
app.post('/api/create-room', (req, res) => {
    // รับค่า field ให้ตรงกับ name="..." ใน HTML
    const { 
        'room-name': roomName, 
        'address-activity': location,
        'start_time': startTime,
        'end-time': endTime,
        'date-activity': activityDate,
        'room-detail': detail,
        'tags_list': tags
    } = req.body;

    const sql = `INSERT INTO rooms (room_name, location, start_time, end_time, activity_date, detail, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [roomName, location, startTime, endTime, activityDate, detail, tags], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'สร้างห้องไม่สำเร็จ' });
        }
        res.json({ success: true, message: 'สร้างห้องสำเร็จ!' });
    });
});

// API: ดึงข้อมูลห้องทั้งหมดไปโชว์หน้า Home
app.get('/api/rooms', (req, res) => {
    const sql = 'SELECT * FROM rooms ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// เริ่มต้น Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});