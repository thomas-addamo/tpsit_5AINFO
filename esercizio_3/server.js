const express = require('express');

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(3000, () => console.log('Listening on 3000'));

const { Server } = require('ws');

const ws_server = new Server({ server });

// matrice 15 x 20 = 300 caselle (come in ws_socket_07)
const RIGHE = 15;
const COLONNE = 20;
const TOTALE = RIGHE * COLONNE;
const OBIETTIVO = 150;

let quale = 0;
let caselle;      // per ogni casella: '' (libera), 'red' o 'blue'
let contatori;    // caselle colorate da ciascuna squadra
let vincitore;    // null finché nessuno arriva a 150

function nuovaPartita() {
  caselle = new Array(TOTALE).fill('');
  contatori = { red: 0, blue: 0 };
  vincitore = null;
}

function broadcast(msg) {
  const data = JSON.stringify(msg);
  ws_server.clients.forEach((client) => {
    client.send(data);
  });
}

nuovaPartita();

ws_server.on('connection', (ws) => {
  quale++;
  ws.id = quale;
  // client dispari -> rosso, client pari -> blu
  ws.colore = ws.id % 2 === 1 ? 'red' : 'blue';
  console.log('New client connected! id = ' + ws.id + ' (' + ws.colore + ')');

  // il nuovo client riceve il suo id e lo stato completo della matrice
  ws.send(JSON.stringify({
    type: 'init',
    id: ws.id,
    colore: ws.colore,
    righe: RIGHE,
    colonne: COLONNE,
    obiettivo: OBIETTIVO,
    caselle,
    contatori,
    vincitore,
  }));

  ws.on('close', () => console.log('Client has disconnected! id = ' + ws.id));

  ws.on('message', function (message) {
    let arriva;
    try {
      arriva = JSON.parse(message);
    } catch {
      return;
    }

    if (arriva.type === 'reset') {
      nuovaPartita();
      console.log('Nuova partita richiesta dal client ' + ws.id);
      broadcast({ type: 'reset', caselle, contatori });
      return;
    }

    if (arriva.type !== 'click') return;

    const i = arriva.pos;
    if (!Number.isInteger(i) || i < 0 || i >= TOTALE) return;

    // partita finita o casella già colorata: il click viene ignorato
    if (vincitore !== null) return;
    if (caselle[i] !== '') return;

    caselle[i] = ws.colore;
    contatori[ws.colore]++;
    console.log(ws.id + ' ' + i + ' -> ' + ws.colore + ' (' + contatori[ws.colore] + ')');

    broadcast({
      type: 'position',
      ti: i,
      colore: ws.colore,
      chi: ws.id,
      contatori,
    });

    if (contatori[ws.colore] >= OBIETTIVO) {
      vincitore = ws.colore;
      console.log('Vince la squadra ' + vincitore + ' (ultimo click del client ' + ws.id + ')');
      broadcast({ type: 'vittoria', vincitore, chi: ws.id, contatori });
    }
  });
});
