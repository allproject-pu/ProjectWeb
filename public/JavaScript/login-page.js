document.querySelector('.login-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // หยุดการเปลี่ยนหน้าอัตโนมัติ

    // ดึงข้อมูลจากฟอร์ม
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    try {
        // ส่งไป Backend
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json(); // รอรับผลลัพธ์จาก Backend <success หรือไม่, ข้อความอะไร>

        if (result.success) {
            alert('เข้าสู่ระบบสำเร็จ!');
            window.location.href = '/home-page.html'; // เด้งไปหน้า home
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
});