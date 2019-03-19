var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {}; 
const port = process.env.PORT || 3000
app.get('/', function(req, res){
     // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', '*');



     // Request methods you wish to allow
     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 
     // Request headers you wish to allow
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 
     // Set to true if you need the website to include cookies in the requests sent
     // to the API (e.g. in case you use sessions)
     res.setHeader('Access-Control-Allow-Credentials', true);
    res.send('Todas as informações pessoais coletadas de nossos membros são confidenciais. Isto inclui os dados pessoais fornecidos durante os processos do registro e informações financeiras dos clientes.');
});

io.on("connection", function (client) {  
    client.on("join", function(name){
    	console.log("Joined: " + name);
        clients[client.id] = name;
        client.emit("update", "You have connected to the server.");
        client.broadcast.emit("update", name + " has joined the server.")
    });

    client.on("send", function(msg){
    	console.log("Message: " + msg);
        client.broadcast.emit("chat", clients[client.id], msg);
    });

    client.on("disconnect", function(){
    	console.log("Disconnect");
        io.emit("update", clients[client.id] + " has left the server.");
        delete clients[client.id];
    });
});


http.listen(port, function(){
  console.log('listening on port 3000');
});
