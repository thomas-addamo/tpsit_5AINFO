const express = require('express');

const server = express()
  .use((req, res) => res.sendFile('/index.html', { root: __dirname }))
  .listen(3000, () => console.log('Listening on 3000'));
  
const { Server } = require('ws');

let tc = 0;
let quale = 0;
let cquale = 0;
clients=[];
colori=['black','green','blue','red'];

const ws_server = new Server({ server });

ws_server.on('connection', (ws) => { 
   console.log('New client connected!');
   
   //ws.id = ws_server.getUniqueID();
   //clients.push(ws.id);
   quale++;
   ws.id=quale;
    
   ws.on('close', () => console.log('Client has disconnected!'));
   
   ws.on('message', function() { tc++;  
      console.log(tc+" "+ws.id);
      cquale=ws.id; 
   });
});

/*
ws_server.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};
*/

setInterval(() => {
    let position = {
       x: Math.floor(Math.random() * 200), 
       y: Math.floor(Math.random() * 150), 
       t: tc,
       colore: colori[cquale]
    }
    const data = JSON.stringify({'position': position});

  ws_server.clients.forEach((client) => {
    client.send(data);
  });
}, 1000);


