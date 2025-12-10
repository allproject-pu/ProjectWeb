document.addEventListener('DOMContentLoaded', loadRooms);
export { loadRooms };
async function loadRooms(filterParams = {}) {
    try {
        const list = document.getElementById('rooms-list');
        list.innerHTML = '<li>กำลังค้นหากิจกรรม...</li>'; // แสดงสถานะ loading
        
        // สร้าง URL Query String จาก Object
        const queryString = new URLSearchParams(filterParams).toString();
        
        // ใช้ fetch เพื่อดึงข้อมูลพร้อม Query String
        const res = await fetch(`/api/rooms?${queryString}`);
        const data = await res.json();

        if (!data.success) {
            list.innerHTML = '<li>ไม่สามารถโหลดห้องกิจกรรมได้</li>';
            return;
        }

        list.innerHTML = '';
        if (data.rooms.length === 0) {
            list.innerHTML = '<li style="text-align:center; padding: 20px;">ไม่พบห้องกิจกรรมตามเงื่อนไขที่ระบุ</li>';
        } else {
            data.rooms.forEach(room => {
                list.appendChild(createRoomItem(room));
            });
        }
    } catch (err) {
        console.error(err);
        document.getElementById('rooms-list').innerHTML = '<li>เกิดข้อผิดพลาดในการเชื่อมต่อ</li>';
    }
}
    
function createRoomItem(room) {
    const li = document.createElement('li');
    li.className = 'room-item';
    const date = new Date(room.ROOM_EVENT_DATE);
    const day = date.getDate();
    const month = date.toLocaleString('th-TH', { month: 'short' });
    const tagsHTML = room.tags ? room.tags.split(',').map(tag => `<li>${tag}</li>`).join('') : '<li>-</li>';
    // เตรียม Path รูปภาพ (ถ้าไม่มีใน DB ให้ใช้รูป Default)

    li.innerHTML = `
        <article>
            <div class="header-item" style="background-image: url('${room.ROOM_IMG}');">
                <div class="group-date-month">
                    <span class="date-activity">${day}</span>
                    <span class="month-activity">${month}</span>
                </div>
            </div>

            <hr class="separator-line">

            <div class="body-item">

                <div class="first-row-item-body">
                    <h2>${room.ROOM_TITLE}</h2>
                    <span class="people-activity">
                        <span class="material-symbols-outlined">person</span>
                        ${room.member_count}/${room.ROOM_CAPACITY}
                    </span>
                </div>

                <div class="second-row-item-body">
                    <p>Tag:</p>
                    <ul class="tag-list-item">
                        ${tagsHTML}
                    </ul>
                </div>

                <div class="third-row-item-body">
                    <p>สถานที่: 
                        <span class="address-activity">
                            ${room.LOCATION_NAME || '-'}
                        </span>
                    </p>
                    <p class="time-activity">
                        <span class="material-symbols-outlined">pace</span>
                        <span>
                            ${room.formatted_start_time} - ${room.formatted_end_time}
                        </span>
                    </p>
                </div>

            </div>

            <a class="btn-room-item a-btn"
               href="./room-detail-page.html?id=${room.ROOM_ID}">
               ดูรายละเอียด
            </a>
        </article>
    `;
    return li;


}
