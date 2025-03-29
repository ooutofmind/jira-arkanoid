const express = require('express')
const path = require('path')
const fs = require('fs');

const port = process.env.PORT || 5006

const app = express()

const leaderboardFile = path.join(__dirname, 'leaderboard.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  console.log(`Rendering 'pages/index' for route '/'`)
  res.render('index.html')
})

app.get('/api/leaderboard', (req, res) => {
  fs.readFile(leaderboardFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read leaderboard' });
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== 'number') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  // Read current leaderboard
  fs.readFile(leaderboardFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read leaderboard' });
    }

    const leaderboard = JSON.parse(data);
    leaderboard.push({ name, score });

    // Sort by highest score
    leaderboard.sort((a, b) => b.score - a.score);

    // Save updated leaderboard
    fs.writeFile(leaderboardFile, JSON.stringify(leaderboard, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save leaderboard' });
      }
      res.json({ success: true, leaderboard });
    });
  });
});

const server = app.listen(port, () => {
  console.log(`Listening on ${port}`)
})

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: gracefully shutting down')
  if (server) {
    server.close(() => {
      console.log('HTTP server closed')
    })
  }
})
