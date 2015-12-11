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


var people = [];
var groups = [];
//var sockets = [];
var chatHistory = {};

io.sockets.on("connection", function (client) {
  client.on("join-server", function(name) {
    console.log("joined server " + name);

    var person = new Person(client.id, name);

    people[client.id] = person;

    //client.emit("update","You have joined the room");

    io.sockets.emit("update-people-table", person);

    // update the Arraays on the other fields

    io.sockets.emit("update-people", person);
  });

  client.on("send", function(message){
    io.sockets.emit("chat", people[client.id].name, message);
  });

  client.on("disconnect", function()
  {
    io.emit("update-people-table", people[client.id]);

    delete people[client.id];

    io.sockets.emit("update-people", people);
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
        console.log('Le grupa poeop is' + group.people);
    var groupMembers = [];

      for(var i=0; i<group.people.length; i++)
      {
        console.log("im in here");
        for(var j in people)
        {
          console.log("eafl;esjkfae;slfjka " + people[j].id);

          if(group.people[i] == people[j].id)
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

    var group = new Group(groupInfo.name, id, client.id, groupInfo.permission);
    groups[id] = group;
    console.log("the groups id is " + groups[id].id);

    if(typeof groupInfo.password != "undefined")
    {
      group.setPassword(groupInfo.password);
    }

    people[client.id].addGroup(id);

    group.addPerson(client.id);

    io.sockets.emit("update-people", people);
    io.sockets.emit("update-groups", groups);

    client.emit("update-created-group-table", group);

  });

  client.on("update-groups", function(updatedGroups){
      console.log("Groups updated");
      groups = updatedGroups;
  });

  client.on("change-owner", function(updatedGroups){
  });

  client.on("get-group-info", function(id){
  });

  client.on("join-group", function(name, permission)
  {
    switch(permission) {
        case "permission":
            break;
        case "free":
            break;
        case "password":
            break;
    }
  });
});

module.exports = app;
