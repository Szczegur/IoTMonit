const rooms = {
    'sala-101': {
        name: 'Sala 101',
        sensors: ['Czujnik temperatury TH-01', 'Czujnik wilgotności TH-01', 'Czujnik CO₂ C-01', 'Czujnik VOC V-01', 'Czujnik światła L-01']
    },
    'sala-102': {
        name: 'Sala 102',
        sensors: ['Czujnik temperatury TH-02', 'Czujnik wilgotności TH-02', 'Czujnik CO₂ C-02', 'Czujnik VOC V-02', 'Czujnik światła L-02']
    },
    'sala-103': {
        name: 'Sala 103',
        sensors: ['Czujnik temperatury TH-03', 'Czujnik wilgotności TH-03', 'Czujnik CO₂ C-03', 'Czujnik VOC V-03', 'Czujnik światła L-03']
    }
};

let currentRoom = 'sala-101';
let historicalData = {};
let charts = {};
let alerts = [];

let thresholds = {
    'sala-101': {
        tempMin: 20,
        tempMax: 24,
        humidityMin: 40,
        humidityMax: 60,
        co2Max: 1000,
        vocMax: 500,
        luxMin: 300
    },
    'sala-102': {
        tempMin: 20,
        tempMax: 24,
        humidityMin: 40,
        humidityMax: 60,
        co2Max: 1000,
        vocMax: 500,
        luxMin: 300
    },
    'sala-103': {
        tempMin: 20,
        tempMax: 24,
        humidityMin: 40,
        humidityMax: 60,
        co2Max: 1000,
        vocMax: 500,
        luxMin: 300
    }
};

function generateMockData(room) {
    const baseTemp = room === 'sala-101' ? 22 : room === 'sala-102' ? 23 : 21;
    const baseHumidity = room === 'sala-101' ? 50 : room === 'sala-102' ? 55 : 45;
    const baseCO2 = room === 'sala-101' ? 800 : room === 'sala-102' ? 950 : 700;
    
    return {
        temp: baseTemp + (Math.random() - 0.5) * 4,
        humidity: baseHumidity + (Math.random() - 0.5) * 20,
        co2: baseCO2 + (Math.random() - 0.5) * 400,
        voc: 200 + Math.random() * 300,
        lux: 350 + Math.random() * 200
    };
}

function initHistoricalData(room) {
    const data = [];
    const now = new Date();
    
    for (let i = 168; i >= 0; i--) {
        const timestamp = new Date(now - i * 3600000);
        const mockData = generateMockData(room);
        
        data.push({
            time: timestamp.toLocaleString('pl-PL', { 
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }),
            ...mockData
        });
    }
    
    historicalData[room] = data;
}

function updateRoomInfo() {
    const room = rooms[currentRoom];
    const sensorsList = document.getElementById('sensorsList');
    sensorsList.innerHTML = room.sensors.map(s => 
        `<div class="sensor-badge">${s}</div>`
    ).join('');
}

function loadThresholdsToForm() {
    const roomThresholds = thresholds[currentRoom];
    document.getElementById('tempMin').value = roomThresholds.tempMin;
    document.getElementById('tempMax').value = roomThresholds.tempMax;
    document.getElementById('humidityMin').value = roomThresholds.humidityMin;
    document.getElementById('humidityMax').value = roomThresholds.humidityMax;
    document.getElementById('co2Max').value = roomThresholds.co2Max;
    document.getElementById('vocMax').value = roomThresholds.vocMax;
    document.getElementById('luxMin').value = roomThresholds.luxMin;
}

function checkValue(value, min, max) {
    if (max === undefined) {
        return value >= min;
    }
    return value >= min && value <= max;
}

function updateMetrics() {
    const data = generateMockData(currentRoom);
    const metricsGrid = document.getElementById('metricsGrid');
    const roomThresholds = thresholds[currentRoom];
    
    const tempOk = checkValue(data.temp, roomThresholds.tempMin, roomThresholds.tempMax);
    const humidityOk = checkValue(data.humidity, roomThresholds.humidityMin, roomThresholds.humidityMax);
    const co2Ok = data.co2 <= roomThresholds.co2Max;
    const vocOk = data.voc <= roomThresholds.vocMax;
    const luxOk = data.lux >= roomThresholds.luxMin;

    metricsGrid.innerHTML = `
        <div class="metric-card ${tempOk ? 'normal' : 'warning'}">
            <div class="metric-header">
                <div class="metric-icon temp">🌡️</div>
                <div class="metric-title">Temperatura</div>
            </div>
            <div class="metric-value">
                ${data.temp.toFixed(1)}<span class="metric-unit">°C</span>
            </div>
            <div class="metric-status ${tempOk ? 'ok' : 'alert'}">
                ${tempOk ? '✓ W normie' : '⚠ Poza normą'}
            </div>
            <div class="metric-range">Norma: ${roomThresholds.tempMin}–${roomThresholds.tempMax}°C</div>
        </div>

        <div class="metric-card ${humidityOk ? 'normal' : 'warning'}">
            <div class="metric-header">
                <div class="metric-icon humidity">💧</div>
                <div class="metric-title">Wilgotność</div>
            </div>
            <div class="metric-value">
                ${data.humidity.toFixed(1)}<span class="metric-unit">%</span>
            </div>
            <div class="metric-status ${humidityOk ? 'ok' : 'alert'}">
                ${humidityOk ? '✓ W normie' : '⚠ Poza normą'}
            </div>
            <div class="metric-range">Norma: ${roomThresholds.humidityMin}–${roomThresholds.humidityMax}%</div>
        </div>

        <div class="metric-card ${co2Ok ? 'normal' : 'warning'}">
            <div class="metric-header">
                <div class="metric-icon co2">🌫️</div>
                <div class="metric-title">CO₂</div>
            </div>
            <div class="metric-value">
                ${Math.round(data.co2)}<span class="metric-unit">ppm</span>
            </div>
            <div class="metric-status ${co2Ok ? 'ok' : 'alert'}">
                ${co2Ok ? '✓ W normie' : '⚠ Poza normą'}
            </div>
            <div class="metric-range">Norma: poniżej ${roomThresholds.co2Max} ppm</div>
        </div>

        <div class="metric-card ${vocOk ? 'normal' : 'warning'}">
            <div class="metric-header">
                <div class="metric-icon voc">☁️</div>
                <div class="metric-title">VOC</div>
            </div>
            <div class="metric-value">
                ${Math.round(data.voc)}<span class="metric-unit">ppb</span>
            </div>
            <div class="metric-status ${vocOk ? 'ok' : 'alert'}">
                ${vocOk ? '✓ W normie' : '⚠ Poza normą'}
            </div>
            <div class="metric-range">Norma: poniżej ${roomThresholds.vocMax} ppb</div>
        </div>

        <div class="metric-card ${luxOk ? 'normal' : 'warning'}">
            <div class="metric-header">
                <div class="metric-icon lux">💡</div>
                <div class="metric-title">Oświetlenie</div>
            </div>
            <div class="metric-value">
                ${Math.round(data.lux)}<span class="metric-unit">lx</span>
            </div>
            <div class="metric-status ${luxOk ? 'ok' : 'alert'}">
                ${luxOk ? '✓ W normie' : '⚠ Za ciemno'}
            </div>
            <div class="metric-range">Norma: powyżej ${roomThresholds.luxMin} lx</div>
        </div>
    `;

    checkAndAddAlerts(data, currentRoom);
    updateAlerts();
    
    const now = new Date();
    historicalData[currentRoom].push({
        time: now.toLocaleString('pl-PL', { 
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }),
        ...data
    });
    
    if (historicalData[currentRoom].length > 168) {
        historicalData[currentRoom].shift();
    }
    
    updateCharts();
    updateLastRefreshTime();
}

function checkAndAddAlerts(data, room) {
    const now = new Date().toLocaleString('pl-PL');
    const roomThresholds = thresholds[room];
    const roomName = rooms[room].name;
    
    if (data.temp < roomThresholds.tempMin) {
        addAlert(`[${roomName}] Temperatura poniżej normy: ${data.temp.toFixed(1)}°C`, now);
    } else if (data.temp > roomThresholds.tempMax) {
        addAlert(`[${roomName}] Temperatura powyżej normy: ${data.temp.toFixed(1)}°C`, now);
    }
    
    if (data.humidity < roomThresholds.humidityMin) {
        addAlert(`[${roomName}] Wilgotność poniżej normy: ${data.humidity.toFixed(1)}%`, now);
    } else if (data.humidity > roomThresholds.humidityMax) {
        addAlert(`[${roomName}] Wilgotność powyżej normy: ${data.humidity.toFixed(1)}%`, now);
    }
    
    if (data.co2 > roomThresholds.co2Max) {
        addAlert(`[${roomName}] CO₂ powyżej normy: ${Math.round(data.co2)} ppm`, now);
    }
    
    if (data.voc > roomThresholds.vocMax) {
        addAlert(`[${roomName}] VOC powyżej normy: ${Math.round(data.voc)} ppb`, now);
    }
    
    if (data.lux < roomThresholds.luxMin) {
        addAlert(`[${roomName}] Oświetlenie poniżej normy: ${Math.round(data.lux)} lx`, now);
    }
}

function addAlert(message, time) {
    const isDuplicate = alerts.some(alert => 
        alert.message === message && 
        (new Date() - new Date(alert.timestamp)) < 300000
    );
    
    if (!isDuplicate) {
        alerts.unshift({ message, time, timestamp: new Date() });
        if (alerts.length > 20) {
            alerts.pop();
        }
    }
}

function updateAlerts() {
    const alertsList = document.getElementById('alertsList');
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<div class="no-alerts">✓ Brak aktywnych ostrzeżeń</div>';
    } else {
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${alert.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function createChart(canvasId, label, dataKey, data, color, yAxisLabel) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
        console.error('Canvas not found:', canvasId);
        return;
    }
    
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    charts[canvasId] = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.map(d => d.time),
            datasets: [{
                label: label,
                data: data.map(d => d[dataKey]),
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return label + ': ' + context.parsed.y.toFixed(1) + ' ' + yAxisLabel;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 24,
                        font: {
                            size: 10
                        }
                    },
                    grid: {
                        display: true
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yAxisLabel
                    },
                    grid: {
                        display: true
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    const data = historicalData[currentRoom];
    
    createChart('tempChart', 'Temperatura', 'temp', data, '#ff6b6b', '°C');
    createChart('humidityChart', 'Wilgotność', 'humidity', data, '#4dabf7', '%');
    createChart('co2Chart', 'CO₂', 'co2', data, '#51cf66', 'ppm');
    createChart('vocChart', 'VOC', 'voc', data, '#ffa94d', 'ppb');
    createChart('luxChart', 'Oświetlenie', 'lux', data, '#ffd43b', 'lx');
}

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        loadThresholdsToForm();
    } else {
        panel.style.display = 'none';
    }
}

function saveSettings() {
    thresholds[currentRoom].tempMin = parseFloat(document.getElementById('tempMin').value);
    thresholds[currentRoom].tempMax = parseFloat(document.getElementById('tempMax').value);
    thresholds[currentRoom].humidityMin = parseFloat(document.getElementById('humidityMin').value);
    thresholds[currentRoom].humidityMax = parseFloat(document.getElementById('humidityMax').value);
    thresholds[currentRoom].co2Max = parseFloat(document.getElementById('co2Max').value);
    thresholds[currentRoom].vocMax = parseFloat(document.getElementById('vocMax').value);
    thresholds[currentRoom].luxMin = parseFloat(document.getElementById('luxMin').value);
    
    alert(`✓ Ustawienia dla ${rooms[currentRoom].name} zostały zapisane!`);
    toggleSettings();
    
    updateMetrics();
}

function updateLastRefreshTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleString('pl-PL');
}

function manualRefresh() {
    updateMetrics();
}

document.getElementById('roomSelect').addEventListener('change', (e) => {
    currentRoom = e.target.value;
    if (!historicalData[currentRoom]) {
        initHistoricalData(currentRoom);
    }
    updateRoomInfo();
    updateMetrics();
    
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display !== 'none') {
        loadThresholdsToForm();
    }
});

Object.keys(rooms).forEach(room => initHistoricalData(room));
updateRoomInfo();
loadThresholdsToForm();
updateMetrics();

setInterval(() => {
    updateMetrics();
}, 10000);