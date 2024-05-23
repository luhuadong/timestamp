function formatDate(date, useUTC = false) {
    const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
    const month = String(useUTC ? date.getUTCMonth() + 1 : date.getMonth() + 1).padStart(2, '0');
    const day = String(useUTC ? date.getUTCDate() : date.getDate()).padStart(2, '0');
    const hours = String(useUTC ? date.getUTCHours() : date.getHours()).padStart(2, '0');
    const minutes = String(useUTC ? date.getUTCMinutes() : date.getMinutes()).padStart(2, '0');
    const seconds = String(useUTC ? date.getUTCSeconds() : date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function padDateTime(datetimeStr) {
    const parts = datetimeStr.split(/[- :]/);
    const year = parts[0] || '1970';
    const month = parts[1] || '01';
    const day = parts[2] || '01';
    const hour = parts[3] || '00';
    const minute = parts[4] || '00';
    const second = parts[5] || '00';
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
}

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-time').value = formatDate(now);
    document.getElementById('current-timestamp').value = Math.floor(now.getTime() / 1000);
    document.getElementById('current-timezone').value = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function convertToTimestamp() {
    const datetimeStr = document.getElementById('datetime-input').value;
    const paddedDatetimeStr = padDateTime(datetimeStr);
    const timezone = document.getElementById('timezone-select').value;
    const datetime = new Date(`${paddedDatetimeStr} ${timezone}`);
    if (!isNaN(datetime.getTime())) {
        document.getElementById('timestamp-input').value = Math.floor(datetime.getTime() / 1000);
    } else {
        document.getElementById('timestamp-input').value = '无效的日期时间';
    }
}

function convertToDatetime() {
    const timestamp = parseInt(document.getElementById('timestamp-input').value, 10);
    const timezone = document.getElementById('timezone-select').value;
    if (!isNaN(timestamp)) {
        const datetime = new Date(timestamp * 1000);
        const offsetDatetime = new Date(datetime.toLocaleString('en-US', { timeZone: timezone }));
        document.getElementById('datetime-input').value = formatDate(offsetDatetime);
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

document.getElementById('datetime-input').addEventListener('input', convertToTimestamp);
document.getElementById('timestamp-input').addEventListener('input', convertToDatetime);
document.getElementById('timezone-select').addEventListener('change', () => {
    convertToTimestamp();
    convertToDatetime();
});

loadTimezones(); // 加载时区列表
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
