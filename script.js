const { DateTime } = luxon;

// 常用时区列表
const COMMON_TIMEZONES = [
    { name: 'UTC', label: 'UTC' },
    { name: 'Asia/Shanghai', label: '上海 (UTC+8)' },
    { name: 'Asia/Tokyo', label: '东京 (UTC+9)' },
    { name: 'America/New_York', label: '纽约 (UTC-5/-4)' },
    { name: 'America/Los_Angeles', label: '洛杉矶 (UTC-8/-7)' },
    { name: 'Europe/London', label: '伦敦 (UTC+0/+1)' },
    { name: 'Europe/Paris', label: '巴黎 (UTC+1/+2)' },
    { name: 'Europe/Berlin', label: '柏林 (UTC+1/+2)' },
    { name: 'Australia/Sydney', label: '悉尼 (UTC+10/+11)' },
    { name: 'Asia/Dubai', label: '迪拜 (UTC+4)' },
    { name: 'Asia/Singapore', label: '新加坡 (UTC+8)' },
    { name: 'Asia/Hong_Kong', label: '香港 (UTC+8)' }
];

function formatDate(date) {
    return date.toFormat("yyyy-MM-dd HH:mm:ss");
}

function padDateTime(datetimeStr) {
    // 支持多种格式：1970-01-01 00:00:00, 1970-01-01, 1970/01/01 00:00:00 等
    const normalized = datetimeStr.replace(/\//g, '-').trim();
    const parts = normalized.split(/[- :T]/);
    
    const year = parts[0] || '1970';
    const month = (parts[1] || '01').padStart(2, '0');
    const day = (parts[2] || '01').padStart(2, '0');
    const hour = (parts[3] || '00').padStart(2, '0');
    const minute = (parts[4] || '00').padStart(2, '0');
    const second = (parts[5] || '00').padStart(2, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

// 更新当前时间
function updateCurrentTime() {
    const now = DateTime.local();
    document.getElementById('current-time').textContent = formatDate(now);
    document.getElementById('current-timestamp').textContent = Math.floor(now.toSeconds());
    document.getElementById('current-timezone').textContent = now.zoneName;
    
    // 更新多时区显示
    updateMultiTimezoneDisplay();
}

// 判断是白天还是黑夜
function isDaytime(dateTime) {
    const hour = dateTime.hour;
    // 早上 6 点到晚上 18 点算白天
    return hour >= 6 && hour < 18;
}

// 更新多时区显示
function updateMultiTimezoneDisplay() {
    const container = document.getElementById('multi-timezone-display');
    container.innerHTML = '';
    
    COMMON_TIMEZONES.forEach(tz => {
        const now = DateTime.now().setZone(tz.name);
        const item = document.createElement('div');
        
        // 根据时间判断白天/黑夜，添加相应的类
        const isDay = isDaytime(now);
        item.className = `timezone-item ${isDay ? 'daytime' : 'nighttime'}`;
        
        item.innerHTML = `
            <label>${tz.label}</label>
            <div class="time-value">${formatDate(now)}</div>
        `;
        container.appendChild(item);
    });
}

// 防止循环调用的标志
let isUpdatingFromDatetime = false;
let isUpdatingFromTimestamp = false;

// 时间戳转换
// 默认采用 UTC，datetime-input 中的日期时间始终被当作 UTC 时间
function convertToTimestamp() {
    // 如果正在从时间戳更新日期时间，跳过
    if (isUpdatingFromTimestamp) return;
    
    let datetimeStr = document.getElementById('datetime-input').value.trim();
    if (datetimeStr === '') {
        document.getElementById('timestamp-input').value = '';
        return;
    }
    
    try {
        const paddedDatetimeStr = padDateTime(datetimeStr);
        // 始终将输入的日期时间当作 UTC 时间处理
        const datetime = DateTime.fromISO(paddedDatetimeStr, { zone: 'UTC' });
        
        if (datetime.isValid) {
            isUpdatingFromDatetime = true;
            document.getElementById('timestamp-input').value = Math.floor(datetime.toSeconds());
            isUpdatingFromDatetime = false;
        } else {
            document.getElementById('timestamp-input').value = '';
            console.error('无效的日期时间:', datetime.invalidExplanation);
        }
    } catch (error) {
        console.error('转换错误:', error);
        document.getElementById('timestamp-input').value = '';
    }
}

function convertToDatetime() {
    // 如果正在从日期时间更新时间戳，跳过
    if (isUpdatingFromDatetime) return;
    
    let timestampStr = document.getElementById('timestamp-input').value.trim();
    if (timestampStr === '') {
        document.getElementById('datetime-input').value = '';
        return;
    }
    
    try {
        const timestamp = parseInt(timestampStr, 10);
        
        if (isNaN(timestamp)) {
            document.getElementById('datetime-input').value = '';
            return;
        }
        
        // 始终将时间戳转换为 UTC 时间显示
        const datetime = DateTime.fromSeconds(timestamp, { zone: 'UTC' });
        
        if (datetime.isValid) {
            isUpdatingFromTimestamp = true;
            document.getElementById('datetime-input').value = formatDate(datetime);
            isUpdatingFromTimestamp = false;
        } else {
            document.getElementById('datetime-input').value = '';
            console.error('无效的时间戳:', datetime.invalidExplanation);
        }
    } catch (error) {
        console.error('转换错误:', error);
        document.getElementById('datetime-input').value = '';
    }
}

// 常用时间快捷按钮
function handleQuickButton(action) {
    const now = DateTime.local();
    let targetDate;
    
    switch(action) {
        case 'now':
            targetDate = now;
            break;
        case 'today':
            targetDate = now.startOf('day');
            break;
        case 'tomorrow':
            targetDate = now.plus({ days: 1 }).startOf('day');
            break;
        case 'week-later':
            targetDate = now.plus({ days: 7 });
            break;
        default:
            return;
    }
    
    // 将本地时间转换为 UTC 时间显示
    const utcDate = targetDate.toUTC();
    document.getElementById('datetime-input').value = formatDate(utcDate);
    convertToTimestamp();
}

// 加载时区列表
function loadTimezones() {
    const select = document.getElementById('timezone-select');
    
    // 先设置一个默认选项，确保即使加载失败也能工作
    const defaultOption = document.createElement('option');
    defaultOption.value = 'UTC';
    defaultOption.textContent = 'UTC';
    select.appendChild(defaultOption);
    
    fetch('timezones.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载时区列表');
            }
            return response.json();
        })
        .then(timezones => {
            // 清空现有选项（保留默认选项）
            select.innerHTML = '';
            
            timezones.forEach(timezone => {
                const option = document.createElement('option');
                option.value = timezone;
                option.textContent = timezone;
                select.appendChild(option);
            });
            
            // 设置默认值
            if (select.options.length > 0) {
                select.value = 'UTC';
            }
        })
        .catch(error => {
            console.error('无法加载时区列表:', error);
            // 即使加载失败，也使用默认的 UTC 选项
        });
}

// 填充倒计时选择器
function populateCountdownSelects() {
    const yearSelect = document.getElementById('countdown-year');
    const monthSelect = document.getElementById('countdown-month');
    const daySelect = document.getElementById('countdown-day');
    
    const now = DateTime.local();
    const currentYear = now.year;
    
    // 年份：当前年份前后50年
    for (let year = currentYear - 50; year <= currentYear + 50; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    yearSelect.value = currentYear;
    
    // 月份
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    monthSelect.value = now.month;
    
    // 日期（根据年月动态更新）
    function updateDaySelect() {
        const year = parseInt(yearSelect.value);
        const month = parseInt(monthSelect.value);
        const daysInMonth = DateTime.local(year, month).daysInMonth;
        
        daySelect.innerHTML = '';
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        }
        
        const currentDay = parseInt(daySelect.value) || now.day;
        daySelect.value = Math.min(currentDay, daysInMonth);
        calculateDaysDifference();
    }
    
    updateDaySelect();
    yearSelect.addEventListener('change', () => {
        updateDaySelect();
        calculateDaysDifference();
    });
    monthSelect.addEventListener('change', () => {
        updateDaySelect();
        calculateDaysDifference();
    });
    daySelect.addEventListener('change', calculateDaysDifference);
    
    // 默认设置为本年度最后一天（12月31日）
    yearSelect.value = currentYear;
    monthSelect.value = 12;
    updateDaySelect(); // 更新日期选项
    daySelect.value = 31; // 设置为31日
    calculateDaysDifference(); // 计算距离今天的天数
}

// 计算倒计时天数
function calculateDaysDifference() {
    const year = parseInt(document.getElementById('countdown-year').value, 10);
    const month = parseInt(document.getElementById('countdown-month').value, 10);
    const day = parseInt(document.getElementById('countdown-day').value, 10);
    
    const selectedDate = DateTime.local(year, month, day).startOf('day');
    const today = DateTime.local().startOf('day');
    const diff = Math.floor(selectedDate.diff(today, 'days').days);
    
    document.getElementById('days-count').textContent = diff >= 0 ? `${diff}` : `${diff}`;
}

// 计算年度进度
function calculateDaysPercentage() {
    const today = DateTime.local();
    const yearStart = DateTime.local(today.year, 1, 1);
    const yearEnd = DateTime.local(today.year + 1, 1, 1);
    const daysElapsed = Math.floor(today.diff(yearStart, 'days').days);
    const daysInYear = Math.floor(yearEnd.diff(yearStart, 'days').days);
    
    const percentage = Math.floor((daysElapsed / daysInYear) * 100);
    document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
    document.getElementById('progress-bar-text').textContent = `${percentage}%`;
}

// 事件监听
document.getElementById('datetime-input').addEventListener('input', convertToTimestamp);
document.getElementById('timestamp-input').addEventListener('input', convertToDatetime);
document.getElementById('timezone-select').addEventListener('change', () => {
    // 时区选择器改变时，由于默认采用 UTC，这里不需要做任何转换
    // datetime-input 始终显示 UTC 时间，不受时区选择器影响
    // 但为了保持一致性，如果时间戳有值，重新转换为 UTC 日期时间
    const timestampStr = document.getElementById('timestamp-input').value.trim();
    if (timestampStr) {
        convertToDatetime();
    }
});

// 快捷按钮
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        handleQuickButton(action);
    });
});

// 初始化
loadTimezones();
populateCountdownSelects();
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
calculateDaysDifference();
calculateDaysPercentage();
