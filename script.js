const { DateTime } = luxon;

function formatDate(date) {
    return date.toFormat("yyyy-MM-dd HH:mm:ss");
}

function padDateTime(datetimeStr) {
    const parts = datetimeStr.split(/[- :]/);
    const year = parts[0] || '1970';
    const month = parts[1] || '01';
    const day = parts[2] || '01';
    const hour = parts[3] || '00';
    const minute = parts[4] || '00';
    const second = parts[5] || '00';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}

function updateCurrentTime() {
    const now = DateTime.local();
    document.getElementById('current-time').value = formatDate(now);
    document.getElementById('current-timestamp').value = Math.floor(now.toSeconds());
    document.getElementById('current-timezone').value = now.zoneName;
}

function convertToTimestamp() {
    let datetimeStr = document.getElementById('datetime-input').value.trim();
    if (datetimeStr === '') {
        datetimeStr = '1970-01-01 00:00:00';
    }

    const paddedDatetimeStr = padDateTime(datetimeStr);
    const timezone = document.getElementById('timezone-select').value;
    const datetime = DateTime.fromISO(paddedDatetimeStr, { zone: timezone });
    if (datetime.isValid) {
        document.getElementById('timestamp-input').value = Math.floor(datetime.toSeconds());
    } else {
        document.getElementById('timestamp-input').value = '无效的日期时间';
    }
}

function convertToDatetime() {
    let timestampStr = document.getElementById('timestamp-input').value.trim();
    if (timestampStr === '') {
        timestampStr = '0';
        document.getElementById('timestamp-input').value = timestampStr;
    }

    const timestamp = parseInt(timestampStr, 10);
    const timezone = document.getElementById('timezone-select').value;
    if (!isNaN(timestamp)) {
        const datetime = DateTime.fromSeconds(timestamp, { zone: timezone });
        document.getElementById('datetime-input').value = formatDate(datetime);
    } else {
        document.getElementById('datetime-input').value = '无效的时间戳';
    }
}

function loadTimezones() {
    fetch('timezones.json')
        .then(response => response.json())
        .then(timezones => {
            const select = document.getElementById('timezone-select');
            timezones.forEach(timezone => {
                const option = document.createElement('option');
                option.value = timezone;
                option.textContent = timezone;
                select.appendChild(option);
            });
            select.value = 'UTC'; // 设置默认时区为 UTC
        })
        .catch(error => console.error('无法加载时区列表:', error));
}

function populateYearSelect() {
    const yearSelect = document.getElementById('year-select');
    const currentYear = 1992;
    for (let year = currentYear - 100; year <= currentYear + 100; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
}

function populateMonthSelect() {
    const monthSelect = document.getElementById('month-select');
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    monthSelect.value = 4; // 固定为 4 月
}

function populateDaySelect() {
    const daySelect = document.getElementById('day-select');
    daySelect.innerHTML = ''; // 清空选择框

    const year = 1992;
    const month = 4;

    const daysInMonth = luxon.DateTime.utc(year, month).daysInMonth;

    for (let i = 1; i <= daysInMonth; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        daySelect.appendChild(option);
    }

    // 将指定日期设为默认选项
    const selectedDate = luxon.DateTime.utc(year, month, 6).startOf('day');
    daySelect.value = 6; // 将 day-select 设置为指定日期
    calculateDaysDifference(); // 设置默认日期后重新计算天数差异
}



function calculateDaysDifference() {
    const year = parseInt(document.getElementById('year-select').value, 10);
    const month = parseInt(document.getElementById('month-select').value, 10);
    const day = parseInt(document.getElementById('day-select').value, 10);

    const selectedDate = DateTime.fromObject({ year, month, day });
    const today = DateTime.local().startOf('day');
    const diff = selectedDate.diff(today, 'days').days;

    document.getElementById('days-count').innerText = `${diff}`;
}

function calculateDaysPercentage() {
    const today = DateTime.local();
    const yearStart = DateTime.local(today.year, 1, 1);
    const daysElapsed = today.diff(yearStart, 'days').days;
    const daysInYear = yearStart.plus({ years: 1 }).diff(yearStart, 'days').days;

    const percentage = Math.floor((daysElapsed / daysInYear) * 100);
    document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
    document.getElementById('progress-bar-text').textContent = `${percentage}%`;
}

document.getElementById('datetime-input').addEventListener('input', convertToTimestamp);
document.getElementById('timestamp-input').addEventListener('input', convertToDatetime);
document.getElementById('timezone-select').addEventListener('change', () => {
    convertToDatetime();
});

document.getElementById('year-select').addEventListener('change', calculateDaysDifference);
document.getElementById('month-select').addEventListener('change', calculateDaysDifference);
document.getElementById('day-select').addEventListener('change', calculateDaysDifference);

loadTimezones(); // 加载时区列表
populateYearSelect(); // 填充年份选择框
populateMonthSelect(); // 填充月份选择框
populateDaySelect(); // 填充日期选择框
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
calculateDaysDifference(); // 初始计算天数差异
calculateDaysPercentage(); // 初始化时调用一次
