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

function appendGroupLists(id, name)
{
    $('.ul-your-groups').append('<li class="li-your-group" id="'+ id +'-your"> '+ name + '<ul class="ul-your-group-settings"></ul></li>');
    $('.ul-system-groups').append('<li class="li-system-groups" id="'+ id +'-system">'+ name + '<ul class="ul-system-groups-settings"></ul></li>');

    $('#' + id +'-system ul').append('<li class="view-users">View Users</li>');
    $('#' + id +'-your ul').append('<li class="view-users">View Users</li>');
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

    var socket = io.connect('http://localhost:3000');
    //Modal that represents the group form
     $("#permission-type").change(function() {
      var p = $("#permission-type").val();
      if(p == "password"){
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
        var groupInformation = {};
        var bool = true;

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

                console.log("the permission type is" + permissionType);

                var validgropuname  = reg.test(x); //validUsername is a boolean
                var validthreshold  = reg.test(y);
           if(validgropuname && validthreshold)
            {
                groupInformation.name = $('#group-name').val();
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
                             groupInformation.password  = $('#group-password').val();
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
            groupInformation.permission = permissionType;
            socket.emit("create-group", groupInformation);
            console.log(JSON.stringify(groupInformation));
            var x = $('#btn-create-group');
            x.attr("data-dismiss", "modal");
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


    $('ul').on("click", ".view-users",function(event)
    {
      var str = $(event.target).parent().parent()[0].id;
      var id = str.split("-your", 1);
      id = id[0].split("-system", 1)[0];
      socket.emit("get-group", id);

    });
    //To show the div that contains the messages
    $('ul').on("click", ".li-your-group",function(event)
    {
      var divid = $(event.target).attr('id');
      $('#sendboxmessage').attr('id',divid);
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

        $('.launchConfirm').on('click', function (e) { //launchConfird is the class of the html element that triggers the event
           $('#add-user-to-group')
               .modal({ backdrop: 'static', keyboard: false })
               .one('click', '[data-value]', function (e) {
                   if($(this).data('value')) {
                       //add user to group and send a notification to him
                       socket.emit("get-group-info");
                   } else {
                       //notify user that he has not been allowed to join the group
                   }
               });
        });
    });

  $("#btn-create-group").click(function()
  {
      var groupName = $('#group-name').val();
      var permissiontype = $('permission-type').val();
      $('#threshold-time').val()
  });

  socket.on("chat", function (name, message)
  {
    console.log("name is "+ name );
      //$("#ul-messages").append("<li><strong><span class='text-success'>" + name + "</span></strong> says: " + message + "</li>");
    $('.ul-messages').append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');
    //Update the chat based on the client_id and message
  });

  socket.on("update-people-table", function (person)
  {
    var message = person.name + " has just entered";

    $(".ul-system-users").append('<li class="li-system-users" id="'+ person.id +'-system">'+ person.name + '</li>');

        $("#update-notification").text(message);
           $("#update-user").fadeIn();
        setTimeout(function(){
            $("#update-user").fadeOut();
        }, 5000);
    // Post this message in chat
  });

  /*
    Updates the lists of the group just created
   */
  socket.on("update-created-group-table", function(groupInfo){
    var name = groupInfo.name;
    var id = groupInfo.id;

    appendGroupLists(id, name);

    $('#' + id +'-system ul').append('<li class="change-owner">Change Owner</li>');
    $('#' + id +'-system ul').append('<li class="kick-user">Kick User</li>');
    $('#' + id +'-system ul').append('<li class="delete-group">Delete Group</li>');

    $('#' + id +'-your ul').append('<li class="change-owner">Change Owner</li>');
    $('#' + id +'-your ul').append('<li class="kick-user">Kick User</li>');
    $('#' + id +'-your ul').append('<li class="delete-group">Delete Group</li>');
  });

  /*
    Update the table when a group is created.
   */
  socket.on("update-joined-group-table", function(groupInfo){
    var name = groupInfo.name;
    var id = groupInfo.id;

    appendGroupLists(id, name);

    $('#' + id +'-system ul').append('<li class="leave-group">Leave Group</li>');
     $('#' + id +'-your ul').append('<li class="leave-group">Leave Group</li>');

  });

  socket.on("update-on-leave-group", function(groupInfo){
    var name = groupInfo.name;
    var id = groupInfo.id;

    $('#' + id +'-system ul').remove();
    $('#' + id +'-your ul').remove();

    appendGroupLists(id, name);

  });

  socket.on("send-group", function(group)
  {
      for(var i=0; i< group.length; i++)
      {
        console.log(group[i]);
      }
  });

  socket.on("remove-group", function(groupId){
    //var peopleOnline = [];
    $("#" + groupId + "-your").remove();
    $("#" + groupId + "-your").remove();
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
