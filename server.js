const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/orders', (req, res) => {
  const order = { ...req.body, id: Date.now() };
  const file = path.join(__dirname, 'orders.json');
  let orders = [];
  if (fs.existsSync(file)) {
    orders = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  orders.push(order);
  fs.writeFileSync(file, JSON.stringify(orders, null, 2));
  console.log('New order received:', order);
  res.json({ success: true, orderId: order.id });
});

app.get('/admin', (req, res) => {
  const file = path.join(__dirname, 'orders.json');
  const orders = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  res.send(`<!DOCTYPE html>
<html>
<head><title>Admin - Orders</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
  h2 { color: #333; }
  table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
  th { background: #534AB7; color: white; padding: 12px; text-align: left; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  tr:hover td { background: #f9f9f9; }
  .badge { background: #E1F5EE; color: #0F6E56; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
</style>
</head>
<body>
<h2>Diamond Top-Up Orders (${orders.length} total)</h2>
<table>
  <tr>
    <th>Time</th><th>Game</th><th>Player ID</th><th>Zone</th>
    <th>Name</th><th>Contact</th><th>Package</th><th>Payment</th>
  </tr>
  ${orders.slice().reverse().map(o => `
  <tr>
    <td>${new Date(o.timestamp).toLocaleString()}</td>
    <td><b>${o.game}</b></td>
    <td style="font-family:monospace;color:#534AB7">${o.playerId}</td>
    <td>${o.zone || '-'}</td>
    <td>${o.playerName}</td>
    <td>${o.contact}</td>
    <td><span class="badge">${o.pack ? o.pack.diamonds : ''} 💎</span> Rs.${o.pack ? o.pack.price : ''}</td>
    <td>${o.paymentMethod}</td>
  </tr>`).join('')}
</table>
</body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
