
/* HTML5 magic
- GeoLocation
- WebSpeech
*/

//WebSpeech API
var final_transcript = '';
var last10messages = []; //to be populated later
var height = 0;
var clientId; // the id of the specific client is stored here
var currentId ="";
var currentMessageFrom ="";
var privateStr = "-private";
var chatStr = "-chats";
var systemStr = "-system";
var userStr = "-users";
var groupStr = "-groups";
var yourStr = "-your";
var privateChat = "private";
var groupChat = "group";
var istyping="";



function isEmpty(id)
{
  if($(id).val() == "")
  {
    return true;
  }
  return false;
}

function appendGroupLists(groupInfo)
{
    var name = groupInfo.name;
    var id = groupInfo.id;
    var owner = groupInfo.owner;
    console.log("the owner is " + owner);
    console.log(id + " " + clientId);
    var members = groupInfo.people;
    groupInfo.isMember = function(personId) {
    for(var i = 0; i < this.people.length; i++){
      if(this.people[i]=== personId){
        return true;
      }
    }
      return false;
    };

    $('.ul' + systemStr + '' + groupStr + '').append('<li class="li' + systemStr + '' + groupStr + '" id="'+ id +'' + systemStr + '">'+ name + '<ul class="ul' + systemStr + '' + groupStr + '-settings"></ul></li>');
    $('#' + id +'' + systemStr + ' ul').append('<li class="view' + userStr + '">View Users</li>');

    console.log("the client id is " + clientId + " and the owner is " + owner);

    if(clientId === owner)
    {
      $('.ul' + yourStr + '' + groupStr + '').append('<li class="li' + yourStr + '-group" id="'+ id +'' + yourStr + '"> '+ name + '<ul class="ul' + yourStr + '-group-settings"></ul></li>');

      $('#' + id +'' + systemStr + ' ul').append('<li class="conversate">Conversate</li>');
      $('#' + id +'' + yourStr + ' ul').append('<li class="conversate">Conversate</li>');
      $('#' + id +'' + yourStr + ' ul').append('<li class="view' + userStr + '">View Users</li>');
      $('#' + id +'' + systemStr + ' ul').append('<li class="change-owner">Change Owner</li>');
      $('#' + id +'' + systemStr + ' ul').append('<li class="kick-user">Kick User</li>');
      $('#' + id +'' + systemStr + ' ul').append('<li class="delete-group">Delete Group</li>');

      $('#' + id +'' + yourStr + ' ul').append('<li class="change-owner">Change Owner</li>');
      $('#' + id +'' + yourStr + ' ul').append('<li class="kick-user">Kick User</li>');
      $('#' + id +'' + yourStr + ' ul').append('<li class="delete-group">Delete Group</li>');
    }
    else if(groupInfo.isMember(clientId))
    {
        $('.ul' + yourStr + '' + groupStr + '').append('<li class="li' + yourStr + '-group" id="'+ id +'' + yourStr + '"> '+ name + '<ul class="ul' + yourStr + '-group-settings"></ul></li>');
        $('#' + id +'' + systemStr + ' ul').append('<li "class="conversate">Conversate</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="conversate">Conversate</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="view' + userStr + '">View Users</li>');
        $('#' + id +'' + systemStr + ' ul').append('<li class="leave-group">Leave Group</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="leave-group">Leave Group</li>');
    }
    else
    {
        $('#' + id +'' + systemStr + ' ul').append('<li class="join-group">Join Group</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="join-group">Join Group</li>');
    }
}

function appendPeopleLists(userInfo)
{
    var name = userInfo.name;
    var id = userInfo.id;
    console.log("the id in append people is " + id);

    if(clientId != id)
    {
      $('.ul' + systemStr + '' + userStr + '').append('<li class="li' + systemStr + '' + userStr + '" id="'+ id +'' + systemStr + '"> '+ name + '<ul class="ul' + systemStr + '' + userStr + '-settings"></ul></li>');
    }
}

var reg = /^[0-9a-zA-Z]+$/;

//Jquerry
$(document).ready(function(){

      var socket = io.connect('http://localhost:3000');

          socket.on("client-id",  function(cId){
          clientId = cId;
          console.log(clientId);
      });

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
                             groupInformation.password  = $('#group-password').val();
                        else
                            bool=false;
                    }
                    else
                        bool = false;
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
            $('#error-create-group').text("Fill the required fields or Only letters and numbers allowed");
    });

    $('ul').on("click", ".join-group", function(event)
    {
        var id = $(event.target).parent().parent().attr('id');
        id = id.split(systemStr, 1)[0];
        id = id.split(yourStr, 1)[0];
        console.log("the parent id is in join group " + id);

        socket.emit("join-group", id);
    });

    $('ul').on("click", ".conversate", function(event)
    {
        var id = $(event.target).parent().parent().attr('id');

        var name = $(event.target).text();
        id = id.split(systemStr, 1)[0];
        id = id.split(yourStr, 1)[0];
        id = id.split(yourStr, 1)[0];

        console.log("the parent id is in conversate " + id + " and the name is " + name);

        openChat(id,groupChat);
    });

    $('.btn-kick-user').click(function(e){
      setTimeout(function(){
        $(e.target).parent().remove();
      }, 300);
      e.preventDefault();
    });

    $('ul').on("click", ".view" + userStr,function(event)
    {
      console.log("diphshit");
      //$('#view' + userStr + '').('show');
      var str = $(event.target).parent().parent()[0].id;
      var id = str.split(yourStr, 1)[0];
      id = id.split(systemStr, 1)[0];
      socket.emit("get-group", id);
    });

    //To show the div that contains the messages
    $('ul').on("click", ".li" + yourStr + "-group",function(event)
    {
      var divid = $(event.target).attr('id');
      $('#sendboxmessage').attr('id',divid);
    });


    // opens the specific message in the message box / chat box
    //

    // Check if the chat List is created for the specific chat.
    function chatIsCreated(divid)
    {
      var newDiv = divid + privateStr +chatStr;

      if($('#'+newDiv).length)
        return true
      else
        return false;
    }

    function showChat(divid)
    {
      var newDiv = divid + privateStr +chatStr;

      $('#'+ newDiv).show();
    }

    function createChat(divid)
    {

      var newDiv = divid + privateStr +chatStr;

      $('.message').prepend('<ul id="' + newDiv + '"class="ul-messages" style="display:none;"><span class="glyphicon glyphicon-remove"  aria-label="true" id="iks" style="float:right"></span></ul>');
    }

    function openChat(divid, messageType)
    {
         var newDiv = divid + privateStr +chatStr;

         if(currentId !== "" && currentId !== divid)
         {
               $('#' + currentId + privateStr + chatStr).hide();
         }

         //if id does not exist on the list then preprend if it does the show method shows
         if(chatIsCreated(divid))
         {
            showChat(divid);
         }
         else
         {
          createChat(divid);
          $('#'+ divd).show();
         }

         highlightConv(divid, messageType);
         currentId= divid;
         //socket.emit("listening-to-types")
    }

      // moves the message from to the private area
      function moveMessage(divid, name)
      {
         var newDiv = divid + privateStr +chatStr;

       if($('#'+ divid + systemStr).is(":visible"))
       {
             $('.ul' + yourStr + '' + privateStr + '' + chatStr + '').prepend('<li id="'+divid+ privateStr +'-li" style="display: none;"><div class="div'+ yourStr + privateStr + chatStr +'"id="'+ divid +'' + privateStr + '">'+name+'</div><span id="'+divid +'-del" class="glyphicon glyphicon-trash"></span></li></ul>');
             $('#' + divid + privateStr +'-li').show('slow');
             $('#' + divid + systemStr).hide(500);

             $('#' + divid + '-del').click(function(){
                  var parentId = $('#'+ divid + '-del').parent().attr("id");
                  $('#' + newDiv).hide();
                  $('#' +parentId).hide('slow', function(){ $('#' +parentId).remove(); });

                  $('#' + divid + systemStr).show(500);
                  currentId = "";
             });
         }
      }

      function highlightConv(divid, currMsg)
      {
        if(currentId !== "")
        {
          if(currentMessageFrom === "group")
          {
            $('#' + currentId + yourStr).removeClass("red");
            $('#' + currentId + yourStr).removeClass("gray");
          }
          else if(currentMessageFrom === "private")
          {
            $('#' + currentId + privateStr).removeClass("red");
            $('#' + currentId + privateStr).removeClass("gray");
          }
        }

        currentMessageFrom = currMsg;

        if(currentMessageFrom === "group")
        {
          $('#' + divid + yourStr).removeClass("gray");
          $('#' + divid + yourStr).addClass("red");
        }
        else if(currentMessageFrom === "private")
        {
          $('#' + divid + privateStr).removeClass("gray");
          $('#' + divid + privateStr).addClass("red");
        }
      }

     $('body').on("click", "#iks", function(){
          console.log("iks is responding");

          if(currentId != "")
          {
            $('#' + currentId+ privateStr+chatStr).hide();
            highlightConv(currentId, "");
            currentId="";
            currentMessageFrom = "";
          }
     });

     function underlightConv(divid, currMsgType)
      {
            if(currMsgType === "group")
            {
              $('#' + divid + yourStr).addClass("gray");
            }
            else if(currMsgType === "private")
            {
              $('#' + divid + privateStr).addClass("gray");
            }
      }


     $('body').on("click", "#iks", function(){
          console.log("iks is responding");

          if(currentId != "")
          {
            $('#' + currentId+ privateStr+chatStr).hide();
            highlightConv(currentId, "");
            currentId="";
            currentMessageFrom = "";
          }
     });

    // When enter is pressed message is represented
    // The scroll is sent to the max height(end)


    // When you click on users of the system, it gets the id and calls the methods to move it to private
   $('ul').on("click", ".li" + systemStr + userStr,function(event)
      {
           var divid = $(event.target).attr('id');
           divid = divid.split(systemStr, 1)[0];
           divid = divid.split(privateStr, 1)[0];
           var name = $(event.target).text();

           moveMessage(divid, name);
           openChat(divid,privateChat);
      });


    /*when you click on the private messages, the reaction to open that chat*/
    $('ul').on("click", ".div" + yourStr + privateStr + chatStr,function(event)
    {
        var id = $(event.target).attr('id');
        id = id.split(privateStr, 1)[0];

          openChat(id, privateChat);
    });

        $('#message').keypress(function(e)
        {
           if (e.which ==13)
           {
                var x = $('#message').val();

                if(x !== "")
                {
                  console.log("got till here " + x)
                  if(currentId !== "")
                  {
                    console.log("the current ivfuckingd is" + currentId);
                    if(currentMessageFrom === "group")
                    {
                      socket.emit("send-group-chat", currentId, x);
                    }
                    else if(currentMessageFrom === "private")
                    {
                      socket.emit("send-private", currentId, x);
                    }

                      $('#' + currentId + privateStr + chatStr).append('<li class="text-message"><b> Me: </b>'+ x +'</li>');
                  }
                  else
                  {
                    alert("Please select a conversation or a group in order to send the text");
                  }
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
            else
            {
              var y = $('#message').val();
                socket.emit("typing", currentId, y);
            }
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

  socket.on("chat-private", function (client, message)
 {
     var name = client.name;
     console.log("THE NAME IS" + client.name);
     var divid = client.id;
     var newDiv = divid + privateStr + chatStr;

     console.log("divid" + divid + "newDiv" + newDiv);

      moveMessage(divid, name);
      if(currentId !== divid)
      {
        underlightConv(divid, privateChat);
      }

      if(!chatIsCreated(divid))
      {
        createChat(divid);
      }

        $('#' + newDiv).append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');
   });

  socket.on("send-typing", function (client, message)
 {
     var name = client.name;
     console.log("THE NAME IS" + client.name);
     var divid = client.id;
     var newDiv = divid + "-typing";

     console.log("divid" + divid + "newDiv" + newDiv);

      moveMessage(divid, name);
      if(currentId !== divid)
      {
        underlightConv(divid, privateChat);
      }

      if(!chatIsCreated(divid))
      {
        createChat(divid);
      }

        $('#' + newDiv).append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');
   });

     socket.on("chat-group", function (group, client, message)
    {
     var name = client.name;
     var divid = group.id;
     var newDiv = divid + privateStr + chatStr;

      console.log("divid" + divid + "newDiv" + newDiv);

      if(currentId !== divid)
      {
        underlightConv(divid, groupChat);
      }

      if(!chatIsCreated(divid))
      {
        createChat(divid);
      }

      $('#' + newDiv).append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');
      /*
        $('#' + newDiv).append('<li class="text-message"><b>'+ name +': </b>'+ message +'</li>');*/
    //Update the chat based on the client_id and message
  });

  /*
    Updates the lists of the new group  created or joined
   */

  socket.on("update-peoples-table", function(membersInfo)
  {
    $(".ul" + systemStr + userStr ).empty();
    console.log(JSON.stringify(membersInfo));

    for (var key in membersInfo)
    {
      console.log( " member info and key " +membersInfo[key].id);
      console.log("the following query is + " + $( "#" + membersInfo[key].id + privateStr).length);
      if($( "#" + membersInfo[key].id + privateStr).length === 0)
        appendPeopleLists(membersInfo[key]);
    }
  });

  socket.on("update-groups-table", function(objectifiedGroup)
  {
    $(".ul" + systemStr + groupStr).empty();
    $(".ul" + yourStr + groupStr).empty();

    for (var key in objectifiedGroup)
    {
      console.log(objectifiedGroup[key]);
      appendGroupLists(objectifiedGroup[key]);
    }
  });
  /*
    Update the table when a group is created.
   */

  socket.on("update-on-leave-group", function(groupInfo){
    var name = groupInfo.name;
    var id = groupInfo.id;

    $('#' + id +'' + systemStr + ' ul').remove();
    $('#' + id +'' + yourStr + ' ul').remove();

    appendGroupLists(id, name);

  });

  socket.on("send-group", function(group)
  {
      /*for(var i=0; i< group.length; i++)
      {
        console.log(group[i]);
      }*/

  });

  socket.on("remove-group", function(groupId){
    //var peopleOnline = [];
    $("#" + groupId + yourStr).remove();
    $("#" + groupId + yourStr).remove();
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
