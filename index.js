const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://sasiyamd3_db_user:gJLM5AVLnE8qoa20@cluster0.q0olms4.mongodb.net/watools?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('📦 MongoDB Connected Successfully!');
}).catch(err => {
  console.log('❌ MongoDB Connection Error:', err.message);
});

// Database Schema for Live Bot & Group Activity
const activitySchema = new mongoose.Schema({
  botId: { type: String, required: true, unique: true },
  name: String,
  status: { type: String, default: 'Online' },
  activeGroups: { type: Number, default: 45 },
  totalMessagesUsed: { type: Number, default: 1250 },
  rss: { type: String, default: '610.2M' },
  heap: { type: String, default: '240M/320M' },
  uptime: { type: String, default: '1h 20m' }
});

const ActivityModel = mongoose.model('LiveBotActivity', activitySchema);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API Endpoint to fetch live JSON data for auto-update every 30 seconds
app.get('/api/stats', async (req, res) => {
  try {
    let bots = await ActivityModel.find();
    if (bots.length === 0) {
      const initialBots = [
        { botId: 'Bot #1', name: 'Bot #1', status: 'Online', activeGroups: 52, totalMessagesUsed: 3410, rss: '609.6M', heap: '242.8M/321.8M', uptime: '36m' },
        { botId: 'Bot #2', name: 'Bot #2', status: 'Online', activeGroups: 38, totalMessagesUsed: 2150, rss: '700.7M', heap: '255.6M/359.9M', uptime: '21m' },
        { botId: 'Bot #3', name: 'Bot #3', status: 'Online', activeGroups: 64, totalMessagesUsed: 4820, rss: '677.3M', heap: '201.6M/299.2M', uptime: '58m' },
        { botId: 'Bot #4', name: 'Bot #4', status: 'Online', activeGroups: 41, totalMessagesUsed: 1980, rss: '876.5M', heap: '347.0M/526.9M', uptime: '13m' },
        { botId: 'Bot #5', name: 'Bot #5', status: 'Online', activeGroups: 55, totalMessagesUsed: 3900, rss: '911.2M', heap: '430.8M/561.4M', uptime: '21m' }
      ];
      await ActivityModel.insertMany(initialBots);
      bots = await ActivityModel.find();
    }

    const totalBots = bots.length * 300; // Simulate total scalable bot count
    const totalGroups = bots.reduce((acc, curr) => acc + curr.activeGroups, 0);
    const totalUsage = bots.reduce((acc, curr) => acc + curr.totalMessagesUsed, 0);

    res.json({
      totalBots,
      totalGroups,
      totalUsage,
      bots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Main Web Dashboard Route
app.get('/', async (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WA TOOLS PANEL | Live Stats</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { background-color: #f8fafc; color: #1e293b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 12px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 18px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            h2 { text-align: center; color: #2563eb; font-size: 22px; margin-bottom: 5px; font-weight: 800; }
            .update-indicator { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 15px; }
            
            .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 15px; }
            .metric-card { background: #eff6ff; border: 1px solid #dbeafe; padding: 10px; border-radius: 10px; text-align: center; }
            .metric-card span { display: block; font-size: 16px; font-weight: bold; color: #1d4ed8; margin-top: 2px; }
            .metric-card label { font-size: 11px; color: #475569; font-weight: 600; }

            .chart-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 15px; }
            .status-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: bold; margin-bottom: 10px; color: #334155; }
            .online-badge { background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
            
            .grid-bots { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .bot-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; position: relative; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
            .bot-card::after { content: ''; position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }
            .bot-title { font-weight: bold; font-size: 13px; margin-bottom: 6px; color: #1e293b; }
            .bot-row { display: flex; justify-content: space-between; font-size: 11px; color: #64748b; margin-bottom: 3px; }
            .bot-val { font-weight: 600; color: #0f172a; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>WA TOOLS PANEL</h2>
            <div class="update-indicator">🔄 තත්පර 30කට වරක් ස්වයංක්‍රීයව අලුත් වේ (Auto-Refreshing Live)</div>
            
            <!-- Metrics Banner -->
            <div class="metrics-grid">
                <div class="metric-card">
                    <label>Total Bots</label>
                    <span id="lbl-bots">Loading...</span>
                </div>
                <div class="metric-card">
                    <label>Active Groups</label>
                    <span id="lbl-groups">Loading...</span>
                </div>
                <div class="metric-card">
                    <label>Total Usage</label>
                    <span id="lbl-usage">Loading...</span>
                </div>
            </div>

            <!-- Chart Box -->
            <div class="chart-box">
                <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #334155;">Bot Active Trend & Usage Analytics</div>
                <canvas id="trendChart" height="110"></canvas>
            </div>

            <div class="status-header">
                <span>RAM & Group Usage Status</span>
                <span class="online-badge">Live DB</span>
            </div>

            <!-- Bot Cards Container -->
            <div id="bots-container" class="grid-bots">
                <!-- Data will be loaded via JavaScript -->
            </div>
        </div>

        <script>
            let trendChart;

            function initChart() {
                const ctx = document.getElementById('trendChart').getContext('2d');
                trendChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['11:17 PM', '04:17 AM', '09:17 AM', '02:17 PM', '07:38 AM'],
                        datasets: [{
                            label: 'Bot Activity Trend',
                            data: [1420, 1410, 1440, 1460, 1500],
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.3,
                            pointRadius: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { grid: { color: '#f1f5f9' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }

            async function fetchLiveData() {
                try {
                    const response = await fetch('/api/stats');
                    const data = await response.json();

                    // Update Top Counters
                    document.getElementById('lbl-bots').innerText = data.totalBots + ' 🚀';
                    document.getElementById('lbl-groups').innerText = data.totalGroups + ' 👥';
                    document.getElementById('lbl-usage').innerText = data.totalUsage + ' 💬';

                    // Update Bot Cards Dynamically
                    let botsHTML = '';
                    data.bots.forEach((b, index) => {
                        botsHTML += \`
                            <div class="bot-card">
                                <div class="bot-title">\${b.name || 'Bot #' + (index + 1)}</div>
                                <div class="bot-row"><span>Groups:</span> <span class="bot-val" style="color: #2563eb;">\${b.activeGroups}</span></div>
                                <div class="bot-row"><span>Usage:</span> <span class="bot-val">\${b.totalMessagesUsed} msgs</span></div>
                                <div class="bot-row"><span>RSS:</span> <span class="bot-val">\${b.rss}</span></div>
                                <div class="bot-row"><span>Heap:</span> <span class="bot-val">\${b.heap}</span></div>
                            </div>
                        \`;
                    });
                    document.getElementById('bots-container').innerHTML = botsHTML;

                } catch (e) {
                    console.error('Error fetching stats:', e);
                }
            }

            // Initialize on load
            window.onload = () => {
                initChart();
                fetchLiveData();
                // Auto-refresh every 30 seconds
                setInterval(fetchLiveData, 30000);
            };
        </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 WA Tools Panel is running on port ${PORT}`);
});
