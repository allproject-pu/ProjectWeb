const notifiText = document.querySelector('#notifi-text');
const submitBtn = document.querySelector('#submitBtn');

const loadingScreen = document.getElementById('loading-screen');
const loadingSpinnerBox = document.getElementById('loading-spinner-box');
const successBox = document.getElementById('success-box');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.querySelector('.register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    notifiText.classList.remove('show');
    notifiText.textContent = '';

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());

    // --- Validation Zone (ตรวจสอบข้อมูล) ---
    // ตรวจสอบ Email KMUTT
    const kmuttEmailRegex = /^[a-zA-Z0-9._%+-]+@(mail\.)?kmutt\.ac\.th$/i;
    if (!kmuttEmailRegex.test(data.email)) {
        showError('กรุณาใช้อีเมลสถาบัน kmutt.ac.th หรือ mail.kmutt.ac.th');
        return;
    }

    // ตรวจสอบรหัสผ่าน
    if (data.password !== data.confirm_password) {
        showError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
        return;
    }

    // ตรวจสอบ Checkbox
    data.allow = document.getElementById('allow').checked;
    if (!data.allow) {
        showError('กรุณายินยอมให้เปิดเผยข้อมูล');
        return;
    }

    // --- Sending Zone (เริ่มส่ง) ---

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = 'กำลังบันทึก...';
        submitBtn.style.cursor = 'wait';
    }

    try {
        // 1. แค่เปิด Overlay ขึ้นมาทับ (ไม่ต้องซ่อนฟอร์มข้างหลัง)
        loadingScreen.style.display = 'flex';
        loadingSpinnerBox.style.display = 'flex'; // โชว์หมุนๆ
        successBox.style.display = 'none';        // ซ่อนติ๊กถูก

        delete data.confirm_password;
        delete data.allow;

        // ส่งไป Backend
        // เราสั่งให้ทำ 2 อย่างพร้อมกัน คือ 1.ส่งข้อมูล 2.จับเวลา 800ms
        // โค้ดจะรอจนกว่า "ทั้งคู่" จะเสร็จ (อย่างน้อยๆ ผู้ใช้จะเห็นปุ่ม Loading 0.8 วิ)
        const [response, _] = await Promise.all([
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }),
            delay(800)
        ]);

        const result = await response.json();

        if (result.success) {
            // 3. ถ้าสำเร็จ: สลับ Content ใน Overlay
            loadingSpinnerBox.style.display = 'none'; // ซ่อนหมุนๆ
            successBox.style.display = 'flex';        // โชว์ติ๊กถูก

            await delay(1000);
            window.location.href = '/login-page.html';
        } else {
            if (result.message === 'อีเมลนี้ถูกใช้งานไปแล้ว กรุณาใช้อีเมลอื่น') {
                showError(result.message);
                return;
            }
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.value = 'ลงทะเบียน';
            submitBtn.style.cursor = 'pointer';
        }
        loadingScreen.style.display = 'none';
    }
});

function showError(message) {
    notifiText.classList.remove('shake');

    void notifiText.offsetWidth;

    notifiText.classList.add('shake');
    notifiText.classList.add('show');

    notifiText.textContent = message;
}