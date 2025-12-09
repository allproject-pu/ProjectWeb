const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET

// --- Helper Function สำหรับ Database Query (Async/Await) ---
function dbQuery(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

// --- Config Multer สำหรับอัปโหลดรูปปกห้อง ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/uploads/rooms');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'room-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API: สร้างห้องกิจกรรมใหม่
// URL: /api/create-room (เพราะ server.js ใช้ app.use('/api', roomRoutes))
router.post('/create-room', upload.single('room_image'), async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });

    try {
        // 1. แกะ Token หาตัวคนสร้าง (Leader)
        const decoded = jwt.verify(token, JWT_SECRET);
        const leaderId = decoded.id;
        // 2. รับค่าจากฟอร์ม
        const { roomTitle, roomEventStartTime, roomEventEndTime, roomEventDate, roomLocation, roomDescription, roomCapacity, tags } = req.body;
        // 3. จัดการรูปภาพ (ถ้ามี)
        let imagePath = '/Resource/img/bangmod.png'; // รูป Default
        if (req.file) {
            imagePath = '/uploads/rooms/' + req.file.filename;
        }
        // 4. บันทึกลงตาราง ROOMS
        const sql = `INSERT INTO ROOMS
                (ROOM_TITLE, ROOM_EVENT_START_TIME, ROOM_EVENT_END_TIME, ROOM_EVENT_DATE, ROOM_EVENT_LOCATION, ROOM_DESCRIPTION, ROOM_LEADER_ID, ROOM_CAPACITY, ROOM_IMG, ROOM_STATUS)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending');`;
        // (ในที่นี้เราใช้ location เป็นชื่อสถานที่ไปเลย ถ้าจะใช้ ID ต้องแก้ Logic เพิ่ม)
        // **หมายเหตุ:** ถ้า location เป็น ID จาก Dropdown ให้ส่งเป็น ID แต่ถ้าเป็น Text ให้แก้ตารางรองรับ
        // สมมติว่าส่งเป็น ID ของตาราง LOCATIONS
        let locationId = isNaN(roomLocation) ? null : roomLocation;
        const roomResult = await dbQuery(sql, [
            roomTitle, roomEventStartTime, roomEventEndTime, roomEventDate, locationId, roomDescription, leaderId, roomCapacity, imagePath
        ]);
        const newRoomId = roomResult.insertId;
        // 5. เอาคนสร้าง จับยัดเป็นสมาชิกคนแรก (Leader) ใน ROOMMEMBERS
        await dbQuery(`
            INSERT INTO ROOMMEMBERS (ROOM_ID, USER_ID, ROOMMEMBER_STATUS) 
            VALUES (?, ?, 'present')`, [newRoomId, leaderId]);

        // 6. จัดการ Tags
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim()).filter(t => t !== '');

            for (const tagName of tagList) {
                let tagId;
                // เช็คว่ามี Tag หรือยัง
                const existingTags = await dbQuery('SELECT TAG_ID FROM TAGS WHERE TAG_NAME = ?', [tagName]);
                if (existingTags.length > 0) {
                    tagId = existingTags[0].TAG_ID;
                } else {
                    const newTag = await dbQuery('INSERT INTO TAGS (TAG_NAME) VALUES (?)', [tagName]);
                    tagId = newTag.insertId;
                }
                // จับคู่ Room-Tag
                await dbQuery('INSERT INTO ROOMTAGS (ROOM_ID, TAG_ID) VALUES (?, ?)', [newRoomId, tagId]);
            }
        }
        res.json({ success: true, message: 'สร้างห้องกิจกรรมสำเร็จ!', roomId: newRoomId });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: 'เกิดข้อผิดพลาด: ' + err.message });
    }
});

router.get('/rooms', (req, res) => {
    // ... ก๊อปปี้โค้ด get rooms เดิมมาใส่ ...
    // เปลี่ยน app.get เป็น router.get
});

// API: ดึงรายชื่อสถานที่ (เพื่อเอา ID ไปใส่ใน Dropdown)
router.get('/locations', (req, res) => {
    db.query('SELECT * FROM LOCATIONS', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

module.exports = router;