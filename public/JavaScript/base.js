window.addEventListener('pageshow', (event) => {
    // ถ้าหน้าเว็บถูกโหลดมาจาก Cache (กด Back กลับมา) ให้รีโหลดใหม่
    if (event.persisted) {
        window.location.reload();
    }
});