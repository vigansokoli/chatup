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
var serverThreshold;

var chatHistory = {};
/*
function removeMembersFrom(groupId)
{
  for(var i in people)
  {
    membersfGroup = people[i].groups;
    for(var j = 0; j < membersfGroup.length; j++ )
    {
      if(membersfGroup[j] === groupId)
      {
        people[i].removeGroupIndex(j);
        break;
      }
    }
}


}
*/

//The code below handles the connection of clients
io.sockets.on("connection", function (client) {

    sockets[client.id] = client;

    client.emit("client-id", client.id);

  client.on("join-server", function(name) {

    var id = client.id;


    var person = new Person(id, name);

    people[id] = person;

    //client.emit("update","You have joined the room");

    // update the Arraays on the other fields
    //
    client.emit("update-peoples-table", groups);
    client.emit("update-peoples-table", people);

    io.sockets.emit("update-groups-table", groups);
    io.sockets.emit("update-peoples-table", people);

  });

  client.on("send", function(message){
    io.sockets.emit("chat", people[client.id].name, message);
  });

  client.on("send-private", function(sendeeId,message){
    sendeeClient = sockets[sendeeId];

   sendeeClient.emit("chat-private", people[client.id], message);
 });


  client.on("kick-user", function(groupId, userId){

    var userKicked = sockets[userId];

    groupKicking = groups[groupId];
    groupKicking.removePerson(userId);

    io.sockets.emit("update-groups-table", groups);
    userKicked.emit("information","You have been kicked out of group" + groupKicking.name );
 });

  client.on("send-group-chat", function(groupId,message){

    var group = groups[groupId];
    var groupMember;
    var socketToSend;
    var sendee;
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

  client.on('istyping',function(recieverId,message){
    var recId = sockets[recieverId];
    recId.emit("istypingnotification",people[client.id],message);
  });

  client.on("disconnect", function()
  {
    //update and inform all the groups where he is member
    //delete and update all the groups where he is owner
    //update and inform the private chats
    //update and inform the chat
    var clientId = client.id;
    //var person =people[clientId];
    //var personGroups = person.getGroups();
    var groupsOwner = [];
    var personIndex;
    var thresholds = [];

    for(var i in groups)
    {
      if(groups[i].owner === clientId)
      {
        io.sockets.emit("delete-open-chat", i);
        client.emit("delete-open-chat", i);
        io.sockets.emit("information", groups[i].name + " is now closed.");
        delete groups[i];
      }
      else if(personIndex = groups[i].isMember(clientId) !== false)
      {
        client.emit("delete-open-chat", i);
        groups[i].removePersonIndex(personIndex);
      }
    }

    var specificPeople = people[clientId];
    specificName = specificPeople.name;

    io.sockets.emit("delete-open-chat", clientId);
    client.emit("delete-open-chat", clientId);

    io.sockets.emit("information" , specificName + " has left the chat.");

    delete people[clientId];
    delete sockets[clientId];

    io.sockets.emit("update-groups-table", groups);
    io.sockets.emit("update-peoples-table", people);

  });

  client.on("close-group", function(groupId)
  {
      if(groupId.owner === clientId)
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

  client.on("delete-group", function(groupId){

    var clientId = client.id;
    var personIndex;

    if(groups[groupId].owner === clientId)
    {
      io.sockets.emit("information", groups[groupId].name + " is now closed.");
      io.sockets.emit("delete-open-chat", groupId);

      delete groups[groupId];
    }
    else if(personIndex = groups[personIndex].isMember(clientId) !== false)
    {
      io.sockets.emit("information", clientId + " has left group " + groups[groupId].name);
      groups[groupId].removePersonIndex(personIndex);
    }

    client.emit("delete-open-chat", groupId);

    client.emit("update-groups-table", groups);
    io.sockets.emit("update-groups-table", groups);

  });

  client.on("change-owner", function(groupId, newOwner){

    var group = groups[groupId];

    var groupMembers = [];

    var groupOwner = group.owner;

    var isMember = false;

    group.addPerson(groupOwner);
    group.owner = newOwner;

    group.removePersonIndex(newOwner);

    io.sockets.emit("update-groups-table", groups);

    });

  client.on("get-group", function(groupId){

    var group = groups[groupId];
    var groupMembers = [];
    var groupOwner = people[group.owner];

    for(var i=0; i<group.people.length;i++)
    {
        groupMembers.push(people[group.people[i]]);
    }

    client.emit("send-group", group,groupMembers, groupOwner.name);
  });

  client.on("create-group", function(groupInfo)
  {
    //people[client.id].groups;

    var id = uuid.v4();
    clientId = client.id;
    var group = new Group(groupInfo.name, id, people[clientId].id, groupInfo.permission, groupInfo.thresholdtime);

    groups[id] = group;

    if(groupInfo.password != "undefined")
    {
      group.setPassword(groupInfo.password);
    }
    //people[clientId].addGroup(id);

    io.sockets.emit("update-groups-table", groups);

  });


  client.on("update-groups", function(updatedGroups){
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


      var permission = group.permission;


      switch(permission) {
          case "permission":
          sockets[client.id].emit("notificate-user");
          sockets[group.owner].emit("approve-user",people[client.id].name);

          sockets[group.owner].on("approval-type",function(x)
          {
            if(x==="ok")
            {
                group.addPerson(clientId);
                client.emit("update-groups-table", groups);
                sockets[client.id].emit('aproval-notification',"ok",group.name);
            }
            else
            {
                sockets[client.id].emit('aproval-notification',"notok",group.name);
            }
          });

              break;
          case "free":
          group.addPerson(clientId);
          client.emit("update-groups-table", groups);
              break;
          case "password":
          sockets[client.id].emit("show-password-input", group.password);
          client.on("approved",function(){
                group.addPerson(clientId);
                client.emit("update-groups-table", groups);
              });
              break;
      }
    });
});

module.exports = app;
