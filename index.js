const express = require('express');
const socket = require('socket.io');
const config = require('./config');
const util = require('./util');
const app = express();

let connections = [];
let pattern = null;

app.get('/generate', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    let filled = new Array(config.strings.length);
    res.status(200).json({
        data: util.generate(filled)
      });
});

app.use(express.static('public'));

const server = app.listen(config.port, () => {
    console.log(`REST API on http://localhost:${config.port}`)
});

const io = socket(server);

io.on('connection', function(socket){
    if(connections.length == 0){
        pattern = util.setpattern();
    }
    socket.emit('pattern', pattern);
    connections.push(socket);
    console.log('connected: %s\n%s sockets connected', socket.id, connections.length);
    socket.on('bindhandle', function(data){
        console.log(data);
        // sends to all
        io.sockets.emit('join', connections.length);
        socket.emit('bindhandle', data);
    });

    // disconnect
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log('disconnected: %s\n%s sockets connected', socket.id, connections.length);
    })
    
});


// socket.broadcast.emit('announce', data);