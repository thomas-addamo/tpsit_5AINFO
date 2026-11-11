const express = require('express');

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(3000, () => console.log('Listening on 3000'));
  
const { Server } = require('ws');

// ------------

let quale = 0;
clients=[];
colori=['','black','green','blue','red'];

const ws_server = new Server({ server });

ws_server.on('connection', (ws) => { 
   console.log('New client connected!');
   
   quale++;
   ws.id=quale;
    
   ws.on('close', () => console.log('Client has disconnected!'));
   
   ws.on('message', function(message) {   
       
      const arriva = JSON.parse(message);
      i=arriva.manda.pos;

      console.log(ws.id+" "+i);

      let position = {
         ti: i,
         colore: colori[ws.id],
         chi: ws.id
      }
      const data = JSON.stringify({'position': position});
      ws_server.clients.forEach((client) => {
         client.send(data);
      });
   });
});



