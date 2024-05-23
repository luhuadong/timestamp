function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
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
    document.getElementById('datetime-input').value = paddedDatetimeStr;
    const datetime = new Date(paddedDatetimeStr);
    if (!isNaN(datetime.getTime())) {
        document.getElementById('timestamp-input').value = Math.floor(datetime.getTime() / 1000);
    } else {
        document.getElementById('timestamp-input').value = '无效的日期时间';
    }
}

function convertToDatetime() {
    const timestamp = parseInt(document.getElementById('timestamp-input').value, 10);
    if (!isNaN(timestamp)) {
        const datetime = new Date(timestamp * 1000);
        document.getElementById('datetime-input').value = formatDate(datetime);
    } else {
        document.getElementById('datetime-input').value = '无效的时间戳';
    }
}

document.getElementById('datetime-input').addEventListener('input', convertToTimestamp);
document.getElementById('timestamp-input').addEventListener('input', convertToDatetime);

updateCurrentTime();
setInterval(updateCurrentTime, 1000);
