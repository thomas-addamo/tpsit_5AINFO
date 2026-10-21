const express = require('express');

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(3000, () => console.log('Listening on 3000'));

const { Server } = require('ws');

const ws_server = new Server({ server });

ws_server.on('connection', (ws) => {
  console.log('New client connected!');
  ws.on('close', () => console.log('Client has disconnected!'));
});

// il server decide la posizione del riquadro:
// x avanza di "passo" pixel e quando arriva a un bordo cambia direzione
const X_MIN = 0;
const X_MAX = 500;
let x1 = X_MIN;
let y1 = 100;
let passo = 10;

setInterval(() => {

  x1 = x1 + passo;

  // arrivato al bordo destro o sinistro: inverto la direzione
  if (x1 >= X_MAX || x1 <= X_MIN) {
    passo = -passo;
  }

  let position = {
    x: x1,
    y: y1
  }
  const data = JSON.stringify({'position': position});

  ws_server.clients.forEach((client) => {
    client.send(data);
  });
}, 50);
