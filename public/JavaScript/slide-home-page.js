document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dotsContainer = document.querySelector('.carousel-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
  
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;
  
    // Config
    const CARD_SPREAD = 105; // % ของความกว้างหน้าจอที่จะกระจายออกไป (ยิ่งเยอะยิ่งห่าง)
    const TIME_NEXT = 8000;
  
    // 1. สร้าง Dots อัตโนมัติตามจำนวนรูป
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.dataset.index = i;
      // คลิก Dot
      dot.addEventListener('click', () => {
        updateCarousel(i);
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    });
  
    const dots = Array.from(document.querySelectorAll('.dot'));
  
    // 2. ฟังก์ชันหลักในการจัดตำแหน่ง (Core Logic)
    function updateCarousel(newIndex) {
      // ทำให้ Index วนลูป (0 -> 3 -> 0)
      if (newIndex < 0) newIndex = totalSlides - 1;
      if (newIndex >= totalSlides) newIndex = 0;
  
      currentIndex = newIndex;
  
      slides.forEach((slide, i) => {
        // คำนวณระยะห่างจาก Index ปัจจุบัน (Circular Diff)
        // สูตรนี้จะบอกว่า slide นี้อยู่ห่างจากตัว Active กี่ช่อง (คิดแบบวงกลม)
        let diff = i - currentIndex;
        
        // Logic การวนลูป: ถ้าห่างเกินครึ่ง ให้มองว่าอยู่อีกฝั่ง
        if (diff > totalSlides / 2) diff -= totalSlides;
        if (diff < -totalSlides / 2) diff += totalSlides;
  
        // กำหนด Z-Index: ยิ่งใกล้ 0 (Active) ยิ่งอยู่บน
        // เราใช้ Math.abs(diff) เพื่อให้ทั้งซ้ายและขวามีค่าเท่ากัน
        const zIndex = 10 - Math.abs(diff);
        slide.style.zIndex = zIndex;
  
        // คำนวณตำแหน่ง X (หน่วยเป็น %)
        // ตรงกลางคือ 0%, ขวาคือ 55%, ซ้ายคือ -55% (ตาม CARD_SPREAD)
        // ถ้าห่างมาก (เช่น diff 2) ก็จะไปไกลขึ้น
        const translateX = diff * CARD_SPREAD; 
        
        // สั่งย้าย
        slide.style.transform = `translateX(${translateX}%) ${diff === 0 ? 'scale(1.1)' : 'scale(0.9)'}`;
  
        // ปรับ Class
        if (diff === 0) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
  
        // เทคนิคพิเศษ: ถ้า Slide มันวน (Wrap) ไปไกลมากๆ ให้ซ่อน opacity เพื่อไม่ให้เห็นตอนมันวิ่งตัดหลัง
        // เช่น มี 4 รูป รูปที่อยู่ตำแหน่งตรงข้าม active ควรจางหายไปเลย
        if (Math.abs(diff) > 1.5) {
            slide.style.opacity = '0';
        } else {
            // ปล่อยให้ CSS จัดการ (active=1, inactive=0.7)
            slide.style.opacity = ''; 
        }
      });
  
      // Update Dots
      dots.forEach(d => d.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }
  
    // 3. Event Listeners
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentIndex + 1);
      resetAutoSlide();
    });
  
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentIndex - 1);
      resetAutoSlide();
    });
  
    // คลิกที่รูปข้างๆ เพื่อเลื่อนไปหารูปนั้น
    slides.forEach((slide, i) => {
        slide.addEventListener('click', () => {
            if (currentIndex !== i) {
                updateCarousel(i);
                resetAutoSlide();
            }
        });
    });
  
    // Auto Slide
    function startAutoSlide() {
      autoSlideInterval = setInterval(() => {
        updateCarousel(currentIndex + 1);
      }, TIME_NEXT);
    }
  
    function resetAutoSlide() {
      clearInterval(autoSlideInterval);
      startAutoSlide();
    }
  
    // เริ่มทำงาน
    updateCarousel(0);
    startAutoSlide();
    
    // Pause เมื่อเอาเมาส์จ่อ
    track.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    track.addEventListener('mouseleave', startAutoSlide);
});