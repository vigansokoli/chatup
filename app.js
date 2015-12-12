var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var Group = require('./routes/group.js');
var Person = require('./routes/person.js');

var app = express();

var io = require('socket.io')();

app.io = io;

//server.listen(8000);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
  app.engine('html', require('ejs').renderFile);

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  console.log("this at least should work please");
  res.render("index.html");
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

var people = {};
var groups = {};
var sockets = [];

//var sockets = [];
var chatHistory = {};

io.sockets.on("connection", function (client) {

    sockets[client.id] = client;

    client.emit("client-id", client.id);

  client.on("join-server", function(name) {

    var id = client.id;

    console.log("the id is " + id);

    console.log("joined server " + name);

    var person = new Person(id, name);

    people[id] = person;

    //client.emit("update","You have joined the room");

    // update the Arraays on the other fields
    //
    console.log(groups);
    console.log(JSON.stringify(groups));

    io.sockets.emit("update-peoples-table", people);

    io.sockets.emit("update-groups-table", groups);

  });

  client.on("send", function(message){
    io.sockets.emit("chat", people[client.id].name, message);
  });

  client.on("send-private", function(sendeeId,message){
    sendeeClient = sockets[sendeeId];

   sendeeClient.emit("chat-private", people[client.id], message);
 });

  client.on("send-group-chat", function(groupId,message){

    var group = groups[groupId];
    var groupMember;
    var socketToSend;
    var sendee;
    console.log("im loooking for these fucking guys" + group.people);
    sender = people[client.id];
    senderId = sender.id;

    for(var i =0; i < group.people.length; i++)
    {
      groupMember = group.people[i];
      socketToSend =  sockets[groupMember];
      sendee = people[groupMember];

      if(senderId != sendee.id)
        socketToSend.emit("chat-group", group, sender, message);
    }

      groupMember = group.owner;
      socketToSend =  sockets[groupMember];
      sendee = people[groupMember];

      if(senderId != sendee.id)
      socketToSend.emit("chat-group", group, sender, message);
 });
  /*
  socket.on("typing",function(message, sendeeId)
  {
      sendeeClient = sockets[sendeeId];

      client.send("send-typing", people[client.id],message);
  })
*/

  client.on("disconnect", function()
  {

    //update and inform all the groups where he is member
    //delete and update all the groups where he is owner
    //update and inform the private chats
    //update and inform the chat
  /*  var clientId = client.id;
    var person =people[clientId];
    var personGroups = person.getGroups();
    var groupsOwner = [];

    for(var i in groups)
    {
      if(groups[i].owner = clientId)
      {
        groupsOwner.push(groups[i]);
      }
    }

    for(var j=0; j<personGroups.length; j++)
    {

    }

    for(var k=0; k<groupsOwner.length; k++)
    {

    }




    io.emit("update-people-table", people[client.id]);

    delete people[client.id];

    io.sockets.emit("update-people", people);

    */
  });

  client.on("close-group", function(groupId)
  {
      if(groupId.owner === client.id)
      {
        io.sockets.emit("remove-group", groupId);

        delete groups[groupId];
      }
  });

  client.on("update-people", function (updatedPeople)
  {
    this.people = updatedPeople;
  // Update the table where the people online are shown

  });

  client.on("get-group", function(groupId)
  {

    console.log('get-group');

    var group = groups[groupId];
    //console.log('Le grupa poeop is' + group.people);
    var groupMembers = [];

      for(var i=0; i<group.people.length; i++)
      {
        console.log("im in here");
        for(var j in people)
        {
          console.log("eafl;esjkfae;slfjka " + people[j].id);

          if(group.people[i] === people[j].id)
          {
              groupMembers.push(people[j]);
              console.log("name is " +people[j].name);
          }
        }
      }

      client.emit("send-group", groupMembers);
  });

  client.on("create-group", function(groupInfo)
  {
    //people[client.id].groups;

    var id = uuid.v4();
    console.log(id);
    clientId = client.id;
    var group = new Group(groupInfo.name, id, people[clientId].id, groupInfo.permission);

    groups[id] = group;
    console.log("the groups id is " + groups[id].id);
    console.log("permission" + groups[id].permission);

    if(groupInfo.password != "undefined")
    {
      group.setPassword(groupInfo.password);
    }
    console.log("the client id is in create groups " + clientId);
    people[clientId].addGroup(id);

    io.sockets.emit("update-groups-table", groups);

  });


  client.on("update-groups", function(updatedGroups){
      console.log("Groups updated");
      groups = updatedGroups;
  });


  client.on("change-owner", function(updatedGroups){
  });

  client.on("get-group-info", function(id){

  });

  client.on("join-group", function(id)
  {
    var group = groups[id];
    var clientId = client.id;

    console.log("well im here and the permiision is " + group.permission);
    var permission = group.permission;


    switch(permission) {
        case "permission":
            break;
        case "free":
        people[clientId].addGroup(group.id);
        group.addPerson(clientId);
        console.log("teh group people are " + group.people);
        client.emit("update-groups-table", groups);
            break;
        case "password":
            break;
    }
  });
});

module.exports = app;
