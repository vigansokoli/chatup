var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var Group = require('./routes/group.js');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8000);

dl = require('delivery');
fs = require('fs');

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
var groups = [];
//var sockets = [];
var chatHistory = {};


io.sockets.on("connection", function (client) {

  client.on("join-server", function(name) {
    console.log("joined server " + name);
    people[client.id] = name;

    //client.emit("update","You have joined the room");

    io.sockets.emit("update", name + " has joined the room");

    // update the Arraays on the other fields

    io.sockets.emit("update-people", people);
  });

  client.on("send", function(message){
    io.sockets.emit("chat", people[client.id], message);
  });

  client.on("disconnect", function()
  {
    io.emit("update", people[client.id] + "has left the group");

    delete people[client.id];

    io.sockets.emit("update-people", people);
  });

  client.on("update-people", function (peopleArr)
  {

    console.log("UUUUUUUUUUUUUUUUUUUUUUUUU");
    this.people = peopleArr;
  // Update the table where the people online are shown

  });

  client.on("create-group", function(groupName, permission)
  {

    console.log("lagkas suck it");

    //people[client.id].groups;

    var id = uuid.v4();

    var group = new Group(groupName, id, client.id, permission);
    groups[id] = group;

    groups.push();

    //io.sockets.emit("update-group-table", group);

    io.sockets.emit("update-groups", groups);

  });

  client.on("update-groups", function(data){
      console.log("Groups updated");
      groups = data;
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

  //handle file sending

      var delivery = dl.listen(client);

      delivery.on('receive.success', function(file){
          fs.writeFile(file.name, file.buffer, function(err){
              if(err){
                console.log('File not saved!');
              }
              else{
                console.log("File saved");
                return;
              //     delivery.send({
              //       name: 'sample-image.jpg',
              //       path: './sample-image.jpg'
              //     });

              // delivery.on('send.success', function(file){
              //     console.log("File sent to the client");
              // });
              }
          });
      });
});



module.exports = app;
