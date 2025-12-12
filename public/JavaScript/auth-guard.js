// #region ตรวจสอบการล็อกอิน (Auth Guard)
(async function checkAlreadyLoggedIn() {
    try {
        // ยิงเช็ค Session ที่ Server
        const response = await fetch('/api/me');
        const result = await response.json();

        // ถ้าไม่ได้ล็อกอิน (loggedIn = false)
        if (!result.loggedIn) {
            alert('กรุณาเข้าสู่ระบบเพื่อใช้งานหน้านี้');
            window.location.href = '/home-page.html'; // ดีดกลับหน้า Home
        }
    } catch (error) {
        console.error('Auth Guard Error:', error);
        window.location.href = '/home-page.html'; // ถ้า Error ก็ดีดกลับกันเหนียว
    }
})();
// #endregion

