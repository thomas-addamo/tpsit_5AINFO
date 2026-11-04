const express = require('express');

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(3000, () => console.log('Listening on 3000'));

const { Server } = require('ws');

const ws_server = new Server({ server });

let nextId = 1;
const counters = {
  red: 0,
  blue: 0,
};

function broadcast() {
  const data = JSON.stringify({ type: 'counters', counters });
  ws_server.clients.forEach((client) => {
    client.send(data);
  });
}

ws_server.on('connection', (ws) => {
  const id = nextId++;
  console.log('New client connected! id =', id);

  ws.send(JSON.stringify({ type: 'init', id, counters }));

  ws.on('close', () => console.log('Client has disconnected! id =', id));

  ws.on('message', (raw) => {
    let msg;

    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    if (msg.type !== 'click') {
      return;
    }

    if (msg.color !== 'red' && msg.color !== 'blue') {
      return;
    }

    const isOdd = id % 2 === 1;
    const allowed = (msg.color === 'red' && isOdd) || (msg.color === 'blue' && !isOdd);

    if (!allowed) {
      ws.send(JSON.stringify({ type: 'denied', color: msg.color }));
      return;
    }

    counters[msg.color]++;
    broadcast();
  });
});
