$('.launchConfirm').on('click', function (e) { //launchConfird is the class of the html element that triggers the event
   $('#add-user-to-group')
       .modal({ backdrop: 'static', keyboard: false })
       .one('click', '[data-value]', function (e) {
           if($(this).data('value')) {
               //add user to group and send a notification to him
           } else {
               //notify user that he has not been allowed to join the group
           }
       });
});
