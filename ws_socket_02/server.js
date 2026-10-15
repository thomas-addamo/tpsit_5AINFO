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

let x1 = 10;
let y1 = 10;
setInterval(() => {

  x1=x1+10;
  y1=y1+5;

  ws_server.clients.forEach((client) => {
	  
	let position = {
		x: x1, 
		y: y1
	}
    const data = JSON.stringify({'position': position});
    client.send(data);
       
  });
}, 1000);
