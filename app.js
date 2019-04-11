var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {}; 
var mensagens = [];
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
    res.send(JSON.stringify(mensagens));
});

io.on("connection", function (client) {  
    client.on("join", function(name){
    	console.log("Joined: " + name);
        clients[client.id] = name;
        client.emit("update", "You have connected to the server.");
        client.broadcast.emit("update", name + " has joined the server.")
    });

    client.on("send", function(conversa,msg){
        mensagens.push(msg);//Salva mensagem no array
    	console.log("Message: " + msg);
        client.broadcast.emit(conversa, clients[client.id], msg);
    });

    client.on("receive", function(conversa){
        mensagens = mensagens.filter(item => {  return item.destinatario == conversa;  });

        
        //let mensagensNaoRecebidas = mensagens.filter(item => {  return item.remetente == conversa;  });
        //console.log(`receive${conversa}: ` + mensagensNaoRecebidas);
        client.emit(`receive${conversa}`, mensagens);
    });

    client.on("receiveUpdate", function(conversa){
        mensagens = mensagens.filter(item => {  return item.destinatario != conversa;  });
        //console.log(`receive${conversa}: ` + mensagensNaoRecebidas);
        //io.emit("update", clients[client.id] + " array update.");
        //client.broadcast.emit(`receive${conversa}`, clients[client.id], JSON.stringify(mensagensNaoRecebidas));
    });

    client.on("online", function(contato,data){
    	console.log("online "+contato+" "+data);
        client.broadcast.emit(`status${contato}`, clients[client.id], data);
    });

    client.on("off", function(contato, data){
    	console.log("off");
        io.emit(`status${contato}`, clients[client.id], data);
        delete clients[client.id];
    });


    client.on("disconnect", function(){
    	console.log("Disconnect");
        io.emit("update", clients[client.id] + " has left the server.");
        delete clients[client.id];
    });
});


http.listen(3000, function(){
  console.log('listening on port 3000');
});
