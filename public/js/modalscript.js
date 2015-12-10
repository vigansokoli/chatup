var socket = io();
function addli()
{
     $('.ul-your-groups').append('<li> new aaa</li>');
     $('.ul-your-private-chats').append('<li> new aaa</li>');
     $('.ul-system-groups').append('<li> new aaa</li>');
     $('.ul-system-users').append('<li> new aaa</li>');
}
var height = 0;
var groupinfo = {};

//Jquerry
$(document).ready(function(){
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
     // The action taken when the create group button is clicked
     // Puts information into javascript object
    $('#btn-create-group').click(function()
    {
        var bool = true;
        console.log('hinine')
        if($('#group-name').val() == "" || $('#threshold-time').val() == "" )
       {
            console.log("nothing");
            bool= false;
       }
       else
       {
            groupinfo.groupname = $('#group-name').val();
            groupinfo.thresholdtime = $('#threshold-time').val();
                    if($('#permission-type').val()=="Join with password")
                    {

                                    if($('#group-password').val()!== "")
                                    {
                                         console.log("in password");
                                        var password = $('#group-password').val()
                                        console.log("passowrdi i marun" + password);
                                        var checkiqi = password.match(/[a-z]/);
                                        console.log("checkiqi : " + checkiqi);
                                        if(!password.match(/[^a-zA-Z0-9]/))
                                        {
                                            console.log("check password");
                                             groupinfo.grouppassword  = $('#group-password').val();
                                        }
                                        else
                                        {
                                            bool=false;
                                            console.log("MATCH IS BAD");
                                        }
                                    }
                                    else
                                    {
                                        bool = false;
                                        console.log("NO password");
                                    }
                    }
                     else
                    {
                        if($('#permission-type').val() == "Ask for permission")
                        {
                            //send info to the owner
                        }
                        else
                        {
                            groupinfo.permissiontype = $('#permission-type').val();
                        }
                    }
        }
        if(bool)
        {
            var x = $('#btn-create-group');
            x.attr("data-dismiss", "modal");
            console.log(groupinfo);
            $('#group-password').val("");
            $('#group-name').val("");
            $('#threshold-time').val("");
        }
        else
        {
            $('#error-create-group').text("Fill the required fields")
        }
    });
    // When enter is pressed message is represented
    // The scroll is sent to the max height(end)
    $('create-user').onclick(function(username)
    {
        var socket = io.connect("1.2.3.4:1223");

        var person = new Person(username);

        socket.emit("joinserver", person);
    });

    $('#message').keypress(function(e){
        if (e.which ==13)
        {
            //console.log("here malakies");
             var x = $('#message').val();
             if(x !== "")
             {
                //$('.ul-messages').append('<li class="text-message"><b>Andi:</b>'+ x +'</li>');
                socket.emit("send",  ,x);
             }

             $('.ul-messages').each(function(i, value){

                 height += parseInt($(this).height());
            });
            height += '';

            $('.message').animate({scrollTop: height});
            $('#message').val("").focus();
            return false;
        }
    });
});
