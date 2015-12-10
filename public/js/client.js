/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var last10messages = []; //to be populated later
var height = 0;
var groupinfo = {};

function isEmpty(id)
{
  if($(id).val() == "")
  {
    return true;
  }
  return false;
}

function addli()
{
     $('.ul-your-groups').append('<li class="li-your-group"> new aaa<ul class="ul-your-group-settings"><li>Leave group</li><li>Settings</li><li>View group users</li><li class="red">Delete group</li></ul></li>');
     $('.ul-your-private-chats').append('<li class="li-your-private-chats"> new aaa</li>');
     $('.ul-system-groups').append('<li class="li-system-groups"> new aaa<ul class="ul-system-groups-settings"><li>Join group</li><li>View group users</li></ul></li>');
     $('.ul-system-users').append('<li class="li-system-users">new aaa</li>');
}

var reg = /^[0-9a-zA-Z]+$/;
//Jquerry
$(document).ready(function(){
    var groupInformation = {};

    var socket = io.connect('http://localhost:8000');
    //Modal that represents the group form
     $("#permission-type").change(function() {
      var p = $("#permission-type").val();
      if(p == "Join with password"){
        $("#password-div").show();
      }
      else if($("#password-div").is(":visible")){
         $("#password-div").hide();
         $("#group-password").val('');
       }
    });
    $('#group-settings').click(function(){
    });
     // The action taken when the create group button is clicked
     // Puts information into javascript object
    $('#btn-create-group').click(function()
    {
        var bool = true;

        console.log('hinine')
        if(isEmpty('#group-name') || isEmpty('#threshold-time'))
       {
            console.log("nothing");
            bool= false;
       }
       else
       {
                var x = $('#group-name').val();
                var y = $('#threshold-time').val()
                var permissionType = $('#permission-type').val();

                var validgropuname  = reg.test(x); //validUsername is a boolean
                var validthreshold  = reg.test(y);
           if(validgropuname && validthreshold)
            {
                groupInformation.groupname = $('#group-name').val();
                groupInformation.thresholdtime = $('#threshold-time').val();

                  switch(permissionType) {
                  case "free":
                      break;
                  case "password":
                    if(!isEmpty('#group-password'))
                    {
                        var password = $('#group-password').val()
                        if(reg.test(password))
                        {
                             groupInformation.grouppassword  = $('#group-password').val();
                        }
                        else
                        {
                            bool=false;
                        }
                    }
                    else
                    {
                        bool = false;
                    }
                      break;
                  case "permission":
                      break;
                  default:
                    bool=false;
                    break;
                    }
                }
        }
        if(bool)
        {
            socket.emit("create-group", groupInformation);
            var x = $('#btn-create-group');
            x.attr("data-dismiss", "modal");
            console.log(groupinfo);
            $('#group-password').val("");
            $('#group-name').val("");
            $('#threshold-time').val("");
            $('#error-create-group').text("");
        }
        else
        {
            $('#error-create-group').text("Fill the required fields or Only letters and numbers allowed");
        }
    });
    // When enter is pressed message is represented
    // The scroll is sent to the max height(end)

    $('#message').keypress(function(e)
    {

        if (e.which ==13)
        {
             var x = $('#message').val();

             if(x !== "")
             {
              console.log("got till here " + x);
                socket.emit("send", x);
            }
             $('.ul-messages').each(function(i, value)
             {

                 height += parseInt($(this).height());
              });
              height += '';

            $('.message').animate({scrollTop: height});
            $('#message').val("").focus();
            return false;
        }
        /*
        if (e.which !== 13) {
      if (typing === false && myRoomID !== null && $("#msg").is(":focus")) {
        typing = true;
        socket.emit("typing", true);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 5000);
      }
    }*/
    });

    //Added login screen
       $("#username").keypress(function(e){
        if (e.which ==13)
        {
            var username = $("#username").val();
            var reg = /^[0-9a-zA-Z]+$/;
            var validUsername = username.match(reg); //validUsername is a boolean

            if(username==""){
                $("#error").text("Username must be entered!");
                   $("#wrong-username").fadeIn();
                setTimeout(function(){
                    $("#wrong-username").fadeOut();
                }, 2500);
            }
            else if(!(validUsername))
            {
                $("#error").text("Only letters and numbers are allowed!");
                    $("#wrong-username").fadeIn("slow");
                setTimeout(function(){
                    $("#wrong-username").fadeOut("slow");
                }, 2500);
              }
            else{
                socket.emit('join-server', username);
                $('#user-login').fadeOut("slow");
                $('#content').fadeIn("slow");
            }
        }
    });

  socket.on("chat", function (name, message)
  {
      //$("#ul-messages").append("<li><strong><span class='text-success'>" + name + "</span></strong> says: " + message + "</li>");
    $('.ul-messages').append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');
    //Update the chat based on the client_id and message
  });

  socket.on("update", function (message)
  {
    console.log(message);

        $("#update-notification").text(message);
           $("#update-user").fadeIn();
        setTimeout(function(){
            $("#update-user").fadeOut();
        }, 5000);
    // Post this message in chat
  });

  $("#btn-create-group").click(function()
  {
      var groupName = $('#group-name').val();
      var permissiontype = $('permission-type').val();
      $('#threshold-time').val()
  });

  socket.on("update-people", function(data){
    //var peopleOnline = [];
    console.log("the data is" + data);
  });

  socket.on("groups-update", function(data){
    //var peopleOnline = [];
    console.log("the data is" + data);
  });

  $("form").submit(function(event) {
    event.preventDefault();
  });

  $("#conversation").bind("DOMSubtreeModified",function() {
    $("#conversation").animate({
        scrollTop: $("#conversation")[0].scrollHeight
      });
  });

  //enter screen
  $("#nameForm").submit(function() {
    var name = $("#name").val();
    var device = "desktop";
    if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
      device = "mobile";
    }
    if (name === "" || name.length < 2) {
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      socket.emit("joinserver", name, device);
      toggleNameForm();
      toggleChatWindow();
      $("#msg").focus();
    }
  });

  //'is typing' message
  var typing = false;
  var timeout = undefined;

  function timeoutFunction() {
    typing = false;
    socket.emit("typing", false);
  }

  socket.on("isTyping", function(data) {
    if (data.isTyping) {
      if ($("#"+data.person+"").length === 0) {
        $("#updates").append("<li id='"+ data.person +"'><span class='text-muted'><small><i class='fa fa-keyboard-o'></i> " + data.person + " is typing.</small></li>");
        timeout = setTimeout(timeoutFunction, 5000);
      }
    } else {
      $("#"+data.person+"").remove();
    }
  });
//socket-y stuff
//
/*
socket.on("exists", function(data) {
  $("#errors").empty();
  $("#errors").show();
  $("#errors").append(data.msg + " Try <strong>" + data.proposedName + "</strong>");
    toggleNameForm();
    toggleChatWindow();
});

  socket.on("update-people", function(data){
    //var peopleOnline = [];
    $("#people").empty();
    $('#people').append("<li class=\"list-group-item active\">People online <span class=\"badge\">"+data.count+"</span></li>");

   $.each(data.people, function(a, obj) {
      if (!("country" in obj)) {
        html = "";
      } else {
        html = "<img class=\"flag flag-"+obj.country+"\"/>";
      }
      $('#people').append("<li class=\"list-group-item\"><span>" + obj.name + "</span> <i class=\"fa fa-"+obj.device+"\"></i> " + html + " <a href=\"#\" class=\"whisper btn btn-xs\">whisper</a></li>");
      //peopleOnline.push(obj.name);
    });

  });
*/
});
