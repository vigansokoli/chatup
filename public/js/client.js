
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
var groupsStr = "-groups";
var groupStr = "-group";
var yourStr = "-your";
var privateChat = "private";
var groupChat = "group";
var istyping="";
var inputStr = "-input";
var istyping="";
timeoutId = "";
var thresholds ={};

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
    var members = groupInfo.people;

    groupInfo.isMember = function(personId) {
    for(var i = 0; i < this.people.length; i++){
      if(this.people[i]=== personId){
        return true;
      }
    }
      return false;
    };

    $('.ul' + systemStr + '' + groupsStr + '').append('<li class="li' + systemStr + '' + groupsStr + '" id="'+ id +'' + systemStr + '">'+ name + '<ul class="ul' + systemStr + '' + groupsStr + '-settings"></ul></li>');
    $('#' + id +'' + systemStr + ' ul').append('<li class="view' + userStr + '">View Users</li>');


    if(clientId === owner)
    {
      $('.ul' + yourStr + '' + groupsStr + '').append('<li class="li' + yourStr + '' + groupStr + '" id="'+ id +'' + yourStr + '"> '+ name + '<ul class="ul' + yourStr + '' + groupStr + '-settings"></ul></li>');

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
        $('.ul' + yourStr + '' + groupsStr + '').append('<li class="li' + yourStr + '' + groupStr + '" id="'+ id +'' + yourStr + '"> '+ name + '<ul class="ul' + yourStr + '-group-settings"></ul></li>');
        $('#' + id +'' + systemStr + ' ul').append('<li "class="conversate">Conversate</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="conversate">Conversate</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="view' + userStr + '">View Users</li>');
        $('#' + id +'' + systemStr + ' ul').append('<li class="delete-group">Leave Group</li>');
        $('#' + id +'' + yourStr + ' ul').append('<li class="delete-group">Leave Group</li>');
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

    if(clientId != id)
    {
      $('.ul' + systemStr + '' + userStr + '').append('<li class="li' + systemStr + '' + userStr + '" id="'+ id +'' + systemStr + '"> '+ name + '<ul class="ul' + systemStr + '' + userStr + '-settings"></ul></li>');
    }
}

var reg = /^[0-9a-zA-Z]+$/;

//Jquerry
$(document).ready(function(){


    function kickUser()
    {
        socket.emit("delete-group", groupId);
    }

    function resetThreshold(groupId)
    {
        thresholds[groupId].threshold.clearTimeout();
        var thresholdTime = thresholds[groupId].threshold;

        var threshold =  setTimeout(kickUser(groupId), thresholdTime);

        thresholds[groupId].timeLeft = threshold;
        thresholds[groupId].threshold = thresholdTime;
    }

    var socket = io.connect('http://localhost:3000');

        socket.on("client-id",  function(cId){
        clientId = cId;
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
    $('#btn-create' + groupStr + '').click(function()
    {
        var groupInformation = {};
        var bool = true;

        if(isEmpty('#group-name') || isEmpty('#threshold-time'))
       {
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
            var x = $('#btn-create' + groupStr + '');
            x.attr("data-dismiss", "modal");
            $('#group-password').val("");
            $('#group-name').val("");
            $('#threshold-time').val("");
            $('#error-create' + groupStr + '').text("");
        }
        else
            $('#error-create' + groupStr + '').text("Fill the required fields or Only letters and numbers allowed");
    });

    $('ul').on("click", ".join-group", function(event)
    {
        var id = $(event.target).parent().parent().attr('id');
        id = id.split(systemStr, 1)[0];
        id = id.split(yourStr, 1)[0];

        socket.emit("join-group",id);
    });


    $('ul').on("click", ".conversate", function(event)
    {
        var id = $(event.target).parent().parent().attr('id');

        var name = $(event.target).text();
        id = id.split(systemStr, 1)[0];
        id = id.split(yourStr, 1)[0];
        id = id.split(yourStr, 1)[0];

        openChat(id,groupChat);
    });
    $('ul').on("click", ".delete" + groupStr,function(event)
    {
      //$('#view' + userStr + '').('show');
      var str = $(event.target).parent().parent()[0].id;
      var id = str.split(yourStr, 1)[0];
      id = id.split(systemStr, 1)[0];

      socket.emit("delete-group", id);
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
      var inputDiv = divid + inputStr;

      $('#'+ newDiv).show();
    }

    function createChat(divid)
    {

      var newDiv = divid + privateStr +chatStr;
      var inputDiv = divid + inputStr;

      $('.message').prepend('<ul id="' + newDiv + '"class="ul-messages" style="display:none;"><span class="glyphicon glyphicon-remove"  aria-label="true" id="iks" style="float:right;position:fixed;left:82.5%;top:2%; "></span><input type="text" class="message-input" id="' + inputDiv +'" autocomplete="off" palceholder="Your message here"></input> <span id="istyping"style="display:none;"></span></ul>');

    }

    function openChat(divid, messageType)
    {
         var newDiv = divid + privateStr +chatStr;

         if(currentId !== "")
         {
               $('#' + currentId + privateStr + chatStr).hide();
         }

         //if id does not exist on the list then preprend if it does the show method shows
         if(chatIsCreated(divid))
         {
            showChat(divid);
            $('#istyping').hide();
         }
         else
         {
            createChat(divid);
            $('#'+ divid).show();
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
      });


    /*when you click on the private messages, the reaction to open that chat*/
    $('ul').on("click", ".div" + yourStr + privateStr + chatStr,function(event)
    {
        var id = $(event.target).attr('id');
        id = id.split(privateStr, 1)[0];

          openChat(id, privateChat);
    });

        $("#sendboxmessage").on("keypress",'.message-input',function(e)
        {
           if (e.which ==13)
           {
                var x = $('#' + currentId + inputStr).val();

                if(x !== "")
                {
                  if(currentId !== "")
                  {
                    if(currentMessageFrom === "group")
                    {

                      socket.emit("send-group-chat", currentId, x);
                    }
                    else if(currentMessageFrom === "private")
                    {
                      socket.emit("send-private", currentId, x);
                      socket.emit("istyping",currentId,"");
                     istyping="";
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
               $('.message-input').val("").focus();
               return false;
           }
           else if(e.which !=13)
             {
               socket.emit("istyping",currentId,$('.message-input').val());
              }
            else
            {
              var y = $('.message-input').val();
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
           $('#add-user-to' + groupStr + '')
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


  $(".message-input").keypress(function(e){

      if(istyping !== $('#message').val())
      {
            socket.emit("istyping",currentId,$('#message').val());
            istyping=$('#message').val();
      }
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
     var divid = client.id;
     var newDiv = divid + privateStr + chatStr;

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

    socket.on("show-password-input",function(password){
             $('#input-password').focus();
             $('#join-password')
                 .modal({ backdrop: 'static'})
                 .one('click', '[data-value]', function (e) {
                     if($(this).data('value')) {
                         //add user to group and send a notification to him
                     } else {
                         //notify user that he has not been allowed to join the group
                     }
                 });
          $('#input-password').keypress(function(e)
           {
             if (e.which ==13)
             {
                     if($('#input-password').val()==password)
                     {
                        socket.emit('approved');
                        $('#join-password').modal('hide');
                     }
                     else
                     {
                      $("#error-password").text("Incorent password");
                     }
             }
           });
          $('#join-button').click(function(){
               if($('#input-password').val()==password)
                     {
                        socket.emit('approved');
                        $('#join-password').modal('hide');
                     }
                     else
                     {
                      $("#error-password").text("Incorent password")
                     }
            });
    });

    socket.on("notificate-user",function(password){
        $('#update-user').show();
        $('#update-notification').text("The request to join group is sent. The owner will respond")
        $('#update-user').fadeOut(3000);

    });

    socket.on("aproval-notification",function(type,gname){
      console.log("ddaddasas");
       $('#update-user').show();
       if(type=="ok")
         $('#update-notification').text("Group "+ gname + " owner approved your request");
      else
         $('#update-notification').text("Your request to joing group: "+gname+" was declined!");

       $('#update-user').fadeOut(6000);
    });

      socket.on("istypingnotification",function(fromwhom,message)
      {
        if(currentId===fromwhom.id)
         {
          $('#istyping').show();
          $('#istyping').text("Keystrokes of "+fromwhom.name+":"+message);
        }
        else
         {
          $('#istyping').text("");
          $('#istyping').hide();
        }
      });

        $('#message').keypress(function(e)
        {

           if (e.which ==13)
           {

                var x = $('#message').val();

                if(x !== "")
                {
                  if(currentId !== "")
                  {
                    if(currentMessageFrom === "group")
                    {
                      socket.emit("send-group-chat", currentId, x);
                    }
                    else if(currentMessageFrom === "private")
                    {
                      socket.emit("send-private", currentId, x);
                      istyping="";
                      socket.emit("istyping",currentId,"");
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

            else if(e.which !=13)
              {
                socket.emit("istyping",currentId,$('#message').val());
               }
            else
            {
              var y = $('#message').val();
                socket.emit("typing", currentId, y);
            }
       });

    socket.on("approve-user",function(name){
        $("#add-user-to-group").show();
        $("#user-to-join").text(name);

        $('#approve').click(function(){
          var x ="ok";
          socket.emit("approval-type",x);
          $("#add-user-to-group").fadeOut(3000);
        });

         $('#decline').click(function(){
          var y ="notok";
          socket.emit("approval-type",y);
          $("#add-user-to-group").fadeOut(3000);
        });
       });

  socket.on("send-typing", function (client, message)
 {
     var name = client.name;
     var divid = client.id;
     var newDiv = divid + "-typing";


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

    $('ul').on("click", ".change-owner", function(event)
    {
        var id = $(event.target).parent().parent().attr('id');
        id = id.split(systemStr, 1)[0];

        $('#change-owner').modal('show');

        socket.emit("get-group", id);

        socket.on('send-group', function(group, members, owner){

        $('#change-owner-list').empty(); //removes the data of previous group

          for (var key in members){

              if(clientId != members[key].id)
              {
                $('#change-owner-list').append('<li id="' + members[key].id + '">'+members[key].name + '<input type="radio" name="change-owner" value="' + members[key].id + '"></li>');
              }
            }
          });

          $('#btn-change-owner').click(function(e){
            var newOwner = $("input:radio[name=change-owner]:checked").val();
            socket.emit('change-owner', id, newOwner);
            //socket.emit('change-owner', groupId, newOwner);

            e.preventDefault();
          });

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

    for (var key in membersInfo)
    {
      if($( "#" + membersInfo[key].id + privateStr).length === 0)
        appendPeopleLists(membersInfo[key]);
    }
  });

  socket.on("information", function(membersInfo)
  {
    $("#update-notification").text(message)
      $("#update-user").fadeIn();
      setTimeout(function(){
        $("#update-userr").fadeOut();
      }, 5000);
      });

  socket.on("set-threshold", function(groupInfo)
  {
      var thresholdTime = groupInfo.threshold * 1000 * 60;

      var threshold =  setTimeout(kickUser, thresholdTime);

   $('.message').on("click" , "#" + groupInfo + inputStr ,function(event)
    {
        timeoutId = groupInfoId;
        clearTimeout(threshold);
        setTimeout(kickUser, thresholdTime);
        timeoutId = "";
    });
  });

  socket.on("update-groups-table", function(objectifiedGroup)
  {
    $(".ul" + systemStr + groupsStr).empty();
    $(".ul" + yourStr + groupsStr).empty();

    for (var key in objectifiedGroup)
    {
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


  socket.on("delete-open-chat", function(deletedId)
  {
      if(deletedId === currentId)
      {
        $('#' + currentId + privateStr + chatStr).remove();
        highlightConv(currentId, "");
        currentId="";
        currentMessageFrom = "";
      }
  });

   $('ul').on("click", ".view" + userStr,function(event)
    {
      $('#view' + userStr + '').modal('show');
      var str = $(event.target).parent().parent()[0].id;
      var id = str.split(yourStr, 1)[0];
      id = id.split(systemStr, 1)[0];
      socket.emit("get-group", id);

      socket.on('send-group', function(group, members, owner){
        //$('#group-members-modal').append('<li class="view' + userStr + '">View Users</li>');

        $('#group-members-modal').empty(); //removes the data of previous group

        $('#view-users-group-name').text("Group: " + group.name);
        $('#view-users-group-id').text(id);
            $('#group-members-modal').append('<li>'+ owner + '</li>');
            for (var key in members){

              $('#group-members-modal').append('<li id="' + members[key].id + '">'+members[key].name + '</li>');

              if(group.owner == clientId){
                $('#'+members[key].id+'').append('<button class="btn-kick-user fa fa-times"></button>');
              }
            }

          $('.btn-kick-user').click(function(e){
            var memberId = $(e.target).parent().attr('id');
            var groupId = $('#view-users-group-id').text();

            socket.emit("kick-user", groupId, memberId);

            setTimeout(function(){
              $(e.target).parent().remove();
            }, 300);
            e.preventDefault();
          });

       });
    });
    socket.on("remove-group", function(groupId){
      //var peopleOnline = [];
      $("#" + groupId + yourStr).remove();
      $("#" + groupId + yourStr).remove();
    });
  });

