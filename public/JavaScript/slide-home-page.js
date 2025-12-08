document.addEventListener("DOMContentLoaded", () => {
  // Config
  const CARD_SPREAD = 105;

  // initial Setup
  const track = document.querySelector(".carousel-track");
  const slides = Array.from(document.querySelectorAll(".carousel-slide"));
  const dotsContainer = document.querySelector(".carousel-dot");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // State
  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoSlideInterval;

  // #region 1. สร้าง Dots อัตโนมัติตามจำนวนรูป
  slides.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.dataset.index = i;
    // คลิก Dot
    dot.addEventListener("click", () => {
      updateCarousel(i);
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(document.querySelectorAll(".dot"));
  // #endregion

  // #region 2. ฟังก์ชันหลักในการจัดตำแหน่ง (Core Logic) 
  function updateCarousel(newIndex) {
    // ทำให้ Index วนลูป (0 -> 3 -> 0)
    if (newIndex < 0) newIndex = totalSlides - 1;
    if (newIndex >= totalSlides) newIndex = 0;

    currentIndex = newIndex;

    // i คือ index ของ slide ปัจจุบัน
    slides.forEach((slide, i) => {
      let diff = i - currentIndex;

      // Logic การวนลูป: ถ้าห่างเกินครึ่ง ให้มองว่าอยู่อีกฝั่ง
      if (diff > totalSlides / 2) diff -= totalSlides; // เช่น มี 4 รูป ถ้า diff=3 ให้เป็น -1
      if (diff < -totalSlides / 2) diff += totalSlides; // เช่น มี 4 รูป ถ้า diff=-3 ให้เป็น +1

      // กำหนด Z-Index: ยิ่งใกล้ 0 (Active) ยิ่งอยู่บน
      const zIndex = 10 - Math.abs(diff);
      slide.style.zIndex = zIndex;

      // คำนวณตำแหน่ง X (หน่วยเป็น %)
      // ตรงกลางคือ 0%, ข้างๆ ซ้าย -105%, ข้างๆ ขวา +105% (ตาม CARD_SPREAD)
      // ยิ่งห่างจากกลาง ยิ่งคูณเพิ่ม เช่น รูปที่อยู่ถัดไปอีกข้าง จะเป็น -210% หรือ +210%
      const translateX = diff * CARD_SPREAD;
      slide.style.transform = `translateX(${translateX}%) ${diff === 0 ? "scale(1.1)" : "scale(0.9)"
        }`;

      // ปรับ Class
      if (diff === 0) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }

      // เทคนิคพิเศษ: ถ้า Slide มันวน (Wrap) ไปไกลมากๆ ให้ซ่อน opacity เพื่อไม่ให้เห็นตอนมันวิ่งตัดหลัง
      if (Math.abs(diff) > 1) {
        slide.style.opacity = "0";
      } else {
        slide.style.opacity = "";
      }
    });

    // Update Dots
    dots.forEach((d) => d.classList.remove("active"));
    dots[currentIndex].classList.add("active");
  }
  // #endregion

  // #region 3. Event Listeners
  nextBtn.addEventListener("click", () => {
    updateCarousel(currentIndex + 1);
    resetAutoSlide();
  });

  prevBtn.addEventListener("click", () => {
    updateCarousel(currentIndex - 1);
    resetAutoSlide();
  });

  // คลิกที่รูปข้างๆ เพื่อเลื่อนไปหารูปนั้น
  slides.forEach((slide, i) => {
    slide.addEventListener("click", () => {
      if (currentIndex !== i) {
        updateCarousel(i);
        resetAutoSlide();
      }
    });
  });
  // #endregion

  // #region Auto Slide 
  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      updateCarousel(currentIndex + 1);
    }, 8000);
  }
  // #endregion

  // #region รีเซ็ต Auto Slide ให้เริ่มนับใหม่ 
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }
  // #endregion

  // เริ่มทำงาน
  updateCarousel(0);
  startAutoSlide();

  // Pause เมื่อเอาเมาส์จ่อ
  track.addEventListener("mouseenter", () => clearInterval(autoSlideInterval));
  track.addEventListener("mouseleave", startAutoSlide);
});
