// ----------------- API Routes -----------------
// API: สมัครสมาชิก (รับค่าจาก register-page.html)
app.post('/register', (req, res) => {
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
app.post('/login', (req, res) => {
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
app.post('/create-room', (req, res) => {
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
app.get('/rooms', (req, res) => {
    const sql = 'SELECT * FROM rooms ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});