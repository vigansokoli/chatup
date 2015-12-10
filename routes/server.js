var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
var npid = require("npid");
var uuid = require('node-uuid');
var Group = require('./room.js');
var Person = require('./person.js');
var _ = require('underscore')._;

app.configure(function() {
	app.set('port', 3000); //process.env.OPENSHIFT_NODEJS_PORT ||
  	app.set('ipaddr', "192.168.2.7"); //process.env.OPENSHIFT_NODEJS_IP
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(__dirname + '/public'));
	app.use('/components', express.static(__dirname + '/components'));
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/icons', express.static(__dirname + '/icons'));
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
	app.engine('html', require('ejs').renderFile);
	/* Store process-id (as priviledged user)
	try {
	    npid.create('/var/run/advanced-chat.pid', true);
	} catch (err) {
	    console.log(err);
	    //process.exit(1);
	}
*/
});

server.listen(3000, "192.168.2.7", function(){
	console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
});

app.get('/', function(req, res) {
	console.log("this at least should work please");
	res.render("index.html");
});

io.set("log level", 1);
var people = {};
var groups = {};
//var sockets = [];
var chatHistory = {};


io.sockets.on("connection", function (client) {

	console.log("well hello hello");

	client.on("join-server", function(name) {
		console.log("joined server " + name);
		people[client.id] = name;

		client.emit("update","You have joined the room");

		socket.sockets.emit("update",name + " has joined the room");

		// update the arrays on the other fields

		sockets.socket.emit("update-people", people);
	});

	client.on("send", function(message){
		socket.sockets.emit("chat", people[client.id], message);
	});

	client.on("disconnect", function()
	{
		socket.sockets.emit("update", people[client.id] + "has left the group");

		delete people[client.id];

		sockets.socket.emit("update-people", people);
	});

	client.on("update-people", function (peopleArr)
	{
		this.people = peopleArr;
	// Update the table where the people online are shown

	});

	client.on("create-group", function(groupName, permission)
	{
		people[client.id].rooms;

		var id = uuid.v4();

		var group = new Group(groupName, id, socket.id, permission);
		groups[id] = group;

		io.sockets.emit("groupList", rooms);

		groups.push()
	});

	client.on("join-group", function(name, permission)
	{
		switch(permission) {
		    case "alert":
		        break;
		    case "free":
		        break;
		    case "password":
		        break;
		}
	});

});
