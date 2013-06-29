dojo.provide('AuthView');

var AuthView = Backbone.View.extend({
  el: 'body',

  events: {
    "click .loginButton": "showLogin",
    "click .registerButton": "showRegister",
    "click .lostpasswordButton": "showLostpassword",
    "submit form#login": "login",
    "submit form#register": "register",
    "submit form#lostpassword": "lostpassword",
    "submit form#resetpassword": "resetpassword",
    "click .accountButton": "toggleAccountOptions"
  },

  initialize: function(){
    $('#auth-wrapper').hide();
    $('.userInGroup').hide();

    this.setCurrentUser();
  },

  setAccountButton: function(){
    if(window.currentUser){
      $('#accountButton').find('.loginButton').hide() ;
      $('#accountButton').find('.accountButton').html(window.currentUser.username + ' &#9662;').show() ;

      window.backend = new Backend();

      if(window.currentUser.inGroup != null){
        $('.userInGroup').show();
        $('.addUserdataButton').removeClass('disabled') ;
      }
    }
    else{
      $('#accountButton').find('.accountButton').hide() ;
    }
  },

  setCurrentUser: function(){
    var setAccountButton = this.setAccountButton ;

    $.ajax({
      url: 'users/login',
      dataType: 'json',
      success: function(r){
        if(r){
          window.currentUser = r.User ;
        }
        else{
          window.currentUser = undefined ;
        }
        setAccountButton() ;

      }
    }) ;
  },

  hide: function(){
    $('#auth-wrapper').hide();
  },

  login: function(){
    var setAccountButton = this.setAccountButton ;
    $.ajax({
      url: 'users/login',
      data: $('#login').serialize(),
      type: 'post',
      dataType: 'json',
      success: function(r){
        if(r){
          window.alert.info('Welcome back '+r.User.username+'!') ;
          window.currentUser = r.User ;

          setAccountButton() ;

          $('#auth-wrapper').fadeOut('slow', function(){
            $('#auth').hide();

            window.backend.show();
          }) ;
        }
        else{
          window.alert.error('Sorry, this username/password combination wasn\'t found') ;
        }
      }
    }) ;

    return false ;
  },

  register: function(){
    var user = new User() ;

    var data = {
      username: $('#register #username').val(),
      email: $('#register #email').val(),
      organization: $('#register #organization').val(),
      password: $('#register #password').val(),
      password2: $('#register #password2').val()
    }

    showLogin = this.showLogin ;

    if(user.set(data)) {
      user.save(data ,{
        complete: function(r){
          if(r.responseText == 'duplicate username'){
            window.alert.error('Sorry, this username is already taken.') ;
          }
          else{
            window.alert.info('Thanks for registering! Now please log in.') ;
            showLogin();
          }
        }
      });
    }
    else{
      window.alert.error('Username, email and password must be filled out and both passwords must match.') ;
      $('button').effect('shake', {times:2, distance:5}, 50) ;
    }

    return false ;

  },

  lostpassword: function(){
    $.ajax({
      url: 'users/lostpassword',
      type: 'post',
      data: 'email='+$('#lostpassword').find('input[type=email]').val(),
      success: function(d){
        window.alert.info('We send you an email with the instructions!') ;
      }
    }) ;

    return false;
  },

  resetpassword: function(){
    $.ajax({
      url: 'users/resetpassword',
      type: 'post',
      data: $('#resetpassword').serializeArray(),
      success: function(d){
        if(d == 'passwords dont match'){
          window.alert.error('The passwords don\'t match.') ;
        }

        if(d == 'invalid request'){
          window.alert.error('This request is invalid.') ;
          window.auth.showLostpassword();
        }

        if(d == 'expired'){
          window.alert.error('This request is expired.');
          window.auth.showLostpassword();
        }

        if(d == 'success'){
          window.alert.info('You reset your password! Now login using your new password.') ;
          window.auth.showLogin();
        }
      }
    }) ;

    return false;
  },

  showLogin: function(){
    window.map.hide();
    $('#auth-wrapper').fadeIn();

    $('#auth').fadeOut('fast', function(){
      $('#auth .title h2').html('Login') ;

      $('#auth form').hide();
      $('#auth #login').show();

      $('#auth').fadeIn();
    });
  },

  showRegister: function(){
    window.map.hide();
    $('#auth-wrapper').fadeIn();

    $('#auth').fadeOut('fast', function(){
      $('#auth .title h2').html('Register') ;

      $('#auth form').hide();
      $('#auth #register').show();

      $('#auth').fadeIn(function(){
        console.log('scrollb4r.') ;
        $('#auth-wrapper').scrollbar({isAlwaysVisible:true});
      });
    });
  },

  showLostpassword: function(){
    $('#auth').fadeOut('fast', function(){
      $('#auth .title h2').html('Lost your password?') ;

      $('#auth form').hide();
      $('#auth #lostpassword').show();

      $('#auth').fadeIn();
    });
  },

  showResetpassword: function(){
    window.map.hide();
    $('#auth-wrapper').fadeIn();

    $('#auth').fadeOut('fast', function(){
      $('#auth .title h2').html('Reset password') ;

      $('#auth form').hide();
      $('#auth #resetpassword').show();

      $('#auth').fadeIn();
    });
  },

  toggleAccountOptions: function(){
    $('#accountOptions').slideToggle() ;
  }
});
/*==-==*/
dojo.provide('Alert');

var Alert = Backbone.View.extend({
  el: '#alert',

  initialize: function(){
    this.timers = [] ;
    this.hide();
  },

  hide: function(){
    $(this.el).fadeOut('fast', this.reset());
  },

  reset: function(){
    $(this.el).find('.ui-icon').hide();
    $(this.el).find('p.msg').html() ;

    $.each(this.timers, function(k, v){
      clearTimeout(v) ;
    });
  },

  setMsg: function(msg){
    $(this.el).find('p.msg').html(msg) ;

    var total_height = $(this.el).find('p.msg').height() ;
    if(total_height == 0) total_height = 17 ; //but don't tell the others.
    $(this.el).find('.icon').height(total_height) ;

    var icon_height = $(this.el).find('.ui-icon').height() ;
    $(this.el).find('.ui-icon').animate({
      marginTop: (total_height-icon_height)/2
    }) ;
  },

  load: function(){
    this.reset();

    $(this.el).find('.loader').show();
    this.setMsg('Loading') ;

    this.show();

    var msgs = {
      '5000': 'Still loading',
      '10000': 'Patience is a fruit of the spirit',
      '15000': 'Taking longer than expected',
      '20000': 'Sorry for the inconvenience',
      '45000': 'We\'re actually trying to have it loaded before Jesus comes back.',
      '60000': 'Try to refresh the page or keep on waiting for the world to change.<br><div style="overflow:none;height:30px;"><iframe width="210" height="30" src="http://www.youtube.com/embed/3Wn8L4rItpk?rel=0&autoplay=1#t=5" frameborder="0" allowfullscreen></iframe></div>',
      '264000': 'Fun eh? <br>Seriously though, refresh this page. It\'s not happening anymore.'
    }

    var timers = [] ;
    var timer ;
    $.each(msgs, function(time, msg){
      timer = setTimeout(function(){
        window.alert.setMsg(msg) ;
      }, time) ;
      timers.push(timer) ;
    });
    this.timers = timers ;
  },

  info: function(msg){
    this.reset();

    $(this.el).find('.ui-icon-info').show();
    this.setMsg(msg) ;

    this.show();

    var timer = setTimeout(function(){
      window.alert.hide();
    }, 5000) ;
    this.timers.push(timer) ;
  },

  error: function(msg){
    this.reset();

    $(this.el).find('.ui-icon-alert').show();
    this.setMsg(msg) ;

    this.show();

    var timer = setTimeout(function(){
      window.alert.hide();
    }, 5000) ;
    this.timers.push(timer) ;
  },

  show: function(){
    $(this.el).fadeIn();
  }
});

/*==-==*/
dojo.provide('Backend');
dojo.provide('BackendApp');

var Backend = Backbone.View.extend({
  el: 'body',

  events: {
    "click .backendButton": "show",
    "click .mapButton": 'hide'
  },

  initialize: function(){

    $('div ul').click(function(e){
      $(this).parent().find('li a').removeClass('selected') ;
      $(e.target).addClass('selected') ;
    }) ;

    if(window.currentUser.inGroup != null && window.currentUser.level != "0"){
      this.userList = new UserCollection ;
      this.userController = new UserView() ;

      this.groupsUsersList = new GroupsUsersCollection;
      this.groupList = new GroupCollection;
      this.groupController = new GroupView();
    }

    this.userdataList = new UserdataCollection ;
    this.userdataController = new UserdataView() ;

    this.fieldList = new FieldCollection ;
    this.fieldController = new FieldView() ;

    this.myStuffController = new MyStuffView() ;
  },

  show: function(){
    if(window.currentUser) {

      $('.adminRights').hide() ;
      $('.groupAdminRights').hide();

      if(window.currentUser.level == 1){
        $('.adminRights').show() ;
      }
      if(window.currentUser.isGroupAdmin == 1){
        $('.groupAdminRights').show();
      }
      if(window.currentUser.inGroup == null){
        $('.inGroupRights').hide();
      }

      $('#accountOptions').slideUp() ;

      $('.mapButton').parent().show();
      $('.backendButton').parent().hide();

      window.map.hide();

      $('#backend-wrapper').fadeIn();
    }
  },

  hide: function(){
    this.hideAll() ;

    $('#backend-wrapper').fadeOut();
  },

  hideThird: function(){
    $('.third-view').animate({
      left: -400
    }) ;
  },

  hideSecond: function(){
    this.hideThird() ;

    $('.second-view').animate({
      left:-400
    }) ;
  },

  hideAll: function(){
    this.hideSecond() ;

    $('.first-view').animate({
      left: -400
    }) ;
  }
});
/*==-==*/
dojo.provide('GroupsUsers');
dojo.provide('GroupsUsersCollection');

var GroupsUsers = Backbone.Model.extend({
  url: function(){
    var url = 'GroupsUsers/' ;
    if(this.isNew()) url += 'add/' ;

    return url ;
  }
}) ;

var GroupsUsersCollection = Backbone.Collection.extend({
  url: 'GroupsUsers/',
  model: GroupsUsers,

  initialize: function(){
    this.fetch() ;
  },

  getUsersByGroupID: function(id, callback){
    var users = [] ;
    $.each(this.models, function(){
      if(this.attributes.Group.id == id){
        users.push(this.attributes) ;
      }
    });

    return users ;
  },

  getGroupsByUserID: function(id){
    var groups = [] ;
    $.each(this.models, function(){
      if(this.attributes.User.id == id){
        groups.push(this.attributes.Group) ;
      }
    });
    return groups ;
  }
}) ;

/*==-==*/
//Needs prettifying
var firstViewOffset = 240 ;
var secondViewOffset = 540 ;
var thirdViewOffset = 841 ;

dojo.provide('Group');
dojo.provide('GroupCollection');
dojo.provide('GroupView');

var Group = Backbone.Model.extend({
  url: 'groups/'
}) ;

var GroupCollection = Backbone.Collection.extend({
  model: Group,
  url: 'groups/',

  initialize: function(){
    this.fetch({
      success:function(){
        console.log('done') ;
      }
    }) ;
  },

  getById: function(id){
    var group ;
    $.each(this.models, function(){
      if(this.attributes.Group.id == id){
        group = this.attributes.Group ;
      }
    }) ;
    return group ;
  }
}) ;

var GroupView = Backbone.View.extend({
  el: 'body',

  events: {
    'click .groupsButton': 'showList',
    'click .addGroupButton': 'showAddGroup',
    'click .viewGroupButton': 'showGroup',
    'submit #groupAddForm': 'addGroup',
    'click button.groupAdd': 'addGroup',
    'click button.groupUserAdd': 'showAddGroupUser',
    'keypress #searchGroupUser': 'searchUserAdd',
    'click .addUserGroupButton': 'addGroupUser',
    'click .changeUserGroupButton': 'showChangeUserGroup',
    'click .changeUserGroup': 'changeUserGroup',
    'click .deleteUserGroup': 'deleteUserGroup',
    'click .deleteGroupButton': 'deleteGroup'
  },

  initialize: function(){
  },

  showList: function(e){
    window.backend.hideAll() ;

    window.backend.groupList.fetch({
      success: function(r){
        $('#groups .content ul').html('') ;

        if(r.models.length > 0){
          $('#groups').find('.notice').html('') ;
          $('#groups').find('li').remove();

          listTemplate = _.template($('#template-group-list-item').html()) ;
          $.each(r.models, function(index){
            $('#groups').find('ul').append(listTemplate({
              name:  this.attributes.Group.name,
              id: this.attributes.Group.id,
              index: index
            })) ;
          }) ;
        }
        else{
          $('#groups').find('.notice').html('Sorry, no groups yet.') ;
        }

        $('#groups').animate({
          left: firstViewOffset
        }, function(){
          $('#groups .content ul').scrollbar({arrows:false}) ;
        }) ;
      }
    }) ;
  },

  showGroup: function(index){
    window.backend.hideSecond() ;

    if(index.target != undefined) index = index.target.id ; window.backend.hideSecond() ;

    var group = window.backend.groupList.at(index) ;

    window.backend.groupsUsersList.fetch({
      success: function(){
        var users = window.backend.groupsUsersList.getUsersByGroupID(group.attributes.Group.id) ;
        var userTemplate = _.template($('#template-group-user-list-item').html()) ;
        $('#group .content ul').html('') ;

        $.each(users, function(i){
          $('#group').find('ul').append(userTemplate({
            name:  this.User.username,
            id: i,
            level: this.GroupsUser.level
          })) ;
        }) ;

        $('#group').attr('group-index', index) ;
        $('#group').find('h2').html(group.attributes.Group.name) ;
        $('#group').animate({
          left:secondViewOffset
        }, function(){
            $('#group .content ul').scrollbar({arrows:false}) ;
        }) ;
      }
    }) ;
  },

  showAddGroup: function(){
    window.backend.hideSecond() ;

    $('#groupIconFile').html('') ;
    var uploader = new qq.FileUploader({
            element: document.getElementById('groupIconFile'),
            action: 'groups/upload',
            debug: true,
      onComplete: function(id, fileName, responseJSON){
        var filename = $('#groupIconFile').find('.qq-upload-file').html();
        $('#groupIconFile').find('.qq-upload-file').html('Uploaded '+filename) ;
        $('#groupIconFile').find('.qq-upload-size').hide() ;

        $('#groupAddForm').find('#fileName').val(responseJSON.filename) ;
        $('#groupAddForm').find('#fileExt').val(responseJSON.fileextention) ;
      }
        });

    $('#groupAdd').animate({
      left: secondViewOffset
    }) ;
    $('#groupAdd').find('input:first').focus();
  },

  addGroup: function(){
    var group = new Group() ;

    var data = {
      name: $('#groupAddForm #groupName').val(),
      icon_name: $('#groupAddForm').find('#fileName').val(),
      icon_ext: $('#groupAddForm').find('#fileExt').val()
    }

    var showList = this.showList ;
    group.save(data, {
      success: function(r){
        window.alert.info('Created group \''+ r.attributes.Group.name + '\'') ;

        $('#groupAdd').find('input').val('');

        $('#groupAdd').animate({
          left: secondHiddenOffset
        }) ;
        showList();
      }
    });

    return false ;
  },

  //Not working for some mysterious reason. Saving for later.
  showEditGroup: function(){
    window.backend.hideThird() ;

    var group = window.backend.groupList.at($('#group').attr('group-index')) ;
    console.log(group) ;
    $('#groupEdit').find('h2').html(group.attributes.Group.name) ;

    $('#groupEditForm').find('#id').val(group.attributes.Group.id) ;
    $('#groupEditForm').find('#groupName').val(group.attributes.Group.name) ;

    $('#newGroupIconFile').html('') ;
    var uploader = new qq.FileUploader({
            element: document.getElementById('newGroupIconFile'),
            action: 'groups/upload',
            debug: true,
      onComplete: function(id, fileName, responseJSON){
        var filename = $('#newGroupIconFile').find('.qq-upload-file').html();
        $('#newGroupIconFile').find('.qq-upload-file').html('Uploaded '+filename) ;
        $('#newGroupIconFile').find('.qq-upload-size').hide() ;

        $('#groupEditForm').find('#fileName').val(responseJSON.filename) ;
        $('#groupEditForm').find('#fileExt').val(responseJSON.fileextention) ;
      }
        });

    $('#groupEdit').animate({
      left: thirdViewOffset
    }) ;
    $('#groupEdit').find('input:first').focus();

  },

  editGroup: function(){
    console.log('editing group') ;
    var group_old = window.backend.groupList.at($('#group').attr('group-index')) ;

    var data = {
      id: group_old.attributes.Group.id,
      name: $('#groupAddForm #groupName').val(),
      icon_name: $('#groupAddForm').find('#fileName').val(),
      icon_ext: $('#groupAddForm').find('#fileExt').val()
    }
    var showList = this.showList ;

    var group = new Group() ;
    group.save(data, {
      success: function(r){
        window.alert.info('Saved group \''+ r.attributes.Group.name + '\'') ;

        window.backend.hideSecond();
        showList();
      }
    });
  },

  deleteGroup: function(){
    console.log('deleting group. WAIT?! IS HE SURE?!') ;

    if(confirm('Are you sure you want to delete this group?')){
      console.log('hes sure.') ;
      showList = this.showList;

      var group = window.backend.groupList.at($('#group').attr('group-index')) ;

      $.ajax({
        url: 'groups/delete/'+group.attributes.Group.id,
        success: function(r){
          window.backend.hideSecond();
          showList();
        }
      }) ;
    }
  },

  showAddGroupUser: function(){
    window.backend.hideThird() ;

    var group = window.backend.groupList.at($('#group').attr('group-index')) ;

    $('#groupUserAdd').find('h2').html("Add user to '"+group.attributes.Group.name+"'") ;

    $('#groupUserAdd').animate({
      left: thirdViewOffset
    }) ;
    $('#groupUserAdd').find('input:first').focus();
  },

  searchUserAdd: function(e){
    if (e.keyCode != 13) return;

    var allUsers = new UserCollection ;
    allUsers.fetch({
      success: function(r){
        $('#groupUserAdd ul').find('li').remove() ;

        var q = $('#searchGroupUser').val();

        var userTemplate = _.template($('#template-user-add-list-item').html()) ;
        var query = new RegExp('.*(' + q.toLowerCase() + ').*') ;

        $.each(r.models, function(){
          if(query.test(this.attributes.User.username.toLowerCase())){
            $('#groupUserAdd').find('ul').append(userTemplate({
              name:  this.attributes.User.username,
              id: this.attributes.User.id
            })) ;
          }
        }) ;
      }
    }) ;

    return false ;
  },

  addGroupUser: function(e){
    var group = window.backend.groupList.at($('#group').attr('group-index')) ;

    var d = {
      group_id: group.attributes.Group.id,
      user_id: e.target.id
    }

    var rel = new GroupsUsers()

    var showGroup = this.showGroup;
    rel.save(d, {
      success:function(r){
        window.alert.info('Added user to the group') ;

        window.backend.hideThird() ;

        showGroup($('#group').attr('group-index')) ;
      }
    }) ;
  },

  showChangeUserGroup: function(e){
    window.backend.hideThird() ;

    var group = window.backend.groupList.at($('#group').attr('group-index')) ;
    var groupUsers = window.backend.groupsUsersList.getUsersByGroupID(group.attributes.Group.id) ;
    var groupUser = groupUsers[e.target.id] ;

    console.log(groupUsers) ;
    console.log(groupUser) ;
    console.log(e.target) ;

    $('#changeUserGroup').find('h2').html('Change rights for '+ groupUser.User.username) ;
    $('#changeUserGroup').find('#userId').val(groupUser.User.id) ;
    $('#changeUserGroup').find('#groupUserId').val(groupUser.GroupsUser.id);
    $('#changeUserGroup').find('#userLevel').find('option[value='+groupUser.GroupsUser.level+']').attr('selected', 'selected');

    $('#changeUserGroup').animate({
      left: thirdViewOffset
    }) ;
  },

  changeUserGroup: function(){
    console.log('changing until to world to wait.') ;
    ///CHANGE IS WHAT WE BELIEVE IN!
    var d = {
      id: parseInt($('#changeUserGroupForm #groupUserId').val()),
      level: parseInt($('#changeUserGroupForm #userLevel').val())
    } ;

    var showGroup = this.showGroup ;

    //Quick jquery ajax request. CakePHP seems to have REST problems...
    $.ajax({
      url: 'GroupsUsers/edit',
      type: 'post',
      data: d,
      dataType: 'json',
      success: function(){
        window.alert.info('Changed user rights') ;
        window.backend.hideThird() ;

        showGroup($('#group').attr('group-index')) ;
      }
    }) ;
  },

  deleteUserGroup: function(){
    //TOO MANY USERS IN THE GROUP! [TOO MANY USERS!]
    var showGroup = this.showGroup ;

    $.ajax({
      url: 'GroupsUsers/delete',
      type: 'post',
      data: 'id='+$('#changeUserGroupForm #groupUserId').val(),
      success: function(){
        window.alert.info('Removed from group') ;
        window.backend.hideThird() ;

        showGroup($('#group').attr('group-index')) ;
      }
    }) ;
  }


});
/*==-==*/
//Needs prettifying
var firstViewOffset = 240 ;
var secondViewOffset = 540 ;
var thirdViewOffset = 841 ;

dojo.provide('User');
dojo.provide('UserCollection') ;
dojo.provide('UserView');

var User = Backbone.Model.extend({
    url : 'users/',

  validate: function(a){
    console.log(a) ;
    if(a.username == '' || a.password == '' || a.password == '' || a.email == ''){
      return 'Fields cannot be empty' ;
    }

    if(a.password != a.password2){
      return 'Passwords must match' ;
    }
  }
}) ;

var UserCollection = Backbone.Collection.extend({
  model:User,
  url: 'users/',

  initialize: function(){
    this.fetch() ;
  },

  getById: function(id){
    var user ;
    $.each(this.models, function(){
      if(this.attributes.User.id == id){
        user = this.attributes.User ;
      }
    }) ;

    return user ;
  }

}) ;

var UserView = Backbone.View.extend({
  el: 'body',

  events: {
    'click .usersButton': 'showList',
    'click .viewUserButton': 'showUser',
    'click .userEdit': 'editUser',
    'click .userDelete': 'deleteUser'
  },

  currentUserIndex: undefined,

  showList: function(e){
    window.backend.hideAll() ;

    window.backend.userList.fetch({
      success:function(r){

        $('#users').find('li').remove();
        listTemplate = _.template($('#template-user-list-item').html()) ;

        $('#users .content ul').html('') ;
        $.each(r.models, function(index){
          $('#users').find('ul').append(listTemplate({
            name:  this.attributes.User.username,
            index: index,
            level: this.attributes.User.level
          })) ;
        }) ;

        $('#users').animate({left:firstViewOffset}, function(){$('#users .content ul').scrollbar()}) ;
      }
    })
  },

  showUser: function(e){
    var user = window.backend.userList.at(e.target.id) ;
    $('#user').find('h2').html(user.attributes.User.username) ;
    $('#user').find('#username').val(user.attributes.User.username) ;

    var inGroup = 'Not in a group' ;
    if(user.attributes.Group[0]) inGroup = user.attributes.Group[0].name ;

    $('#user .info').find('#UserViewUsername').html(user.attributes.User.username) ;
    $('#user .info').find('#UserViewOrganization').html(user.attributes.User.organization) ;
    $('#user .info').find('#UserViewEmail').html(user.attributes.User.email).attr('href', 'mailto:'+user.attributes.User.email) ;
    $('#user .info').find('#UserViewInGroup').html(inGroup) ;
    $('#user .info').find('#UserViewLevel').html(user.attributes.User.level) ;
    $('#user .info').find('#UserViewCreated').html(user.attributes.User.created) ;

    $('#user').find('#userLevel').find('option[value='+user.attributes.User.level+']').attr('selected', 'selected');

    this.currentUserIndex = e.target.id ;

    $('#user').animate({left:secondViewOffset}) ;
    $('#user .info').scrollbar();
  },

  editUser: function(){
    var user = window.backend.userList.at(this.currentUserIndex) ;

    var d = {
      id: user.attributes.User.id,
      level: $('#user #userLevel').val()
    }

    var showList = this.showList ;

    $.ajax({
      url: 'users/edit/'+user.attributes.User.id,
      data: d,
      type: 'POST',
      success: function(r){
        window.alert.info('Changed user rights') ;
        window.backend.hideSecond() ;

        showList() ;
      }
    }) ;

  },

  deleteUser: function(){
    if(confirm('Are you sure you want to delete this poor user? What has he done to you?!')){
      var user = window.backend.userList.at(this.currentUserIndex) ;

      var showList = this.showList ;

      $.ajax({
        url: 'users/delete/'+user.attributes.User.id,
        success: function(r){
          window.backend.hideSecond();
          showList();
        }
      }) ;

    }
  }
});
/*==-==*/
dojo.provide('UserdataView');

var UserdataView = Backbone.View.extend({
  el: 'body',

  events: {
    'click #nav .userdataButton': 'showList',
    'click .editUserdataButton': 'showEditUserdatum',
    'click .editUserdatum': 'editUserdatum',
    'click .deleteUserdatum': 'deleteUserdatum'
  },

  currentUserdatumIndex: undefined,

  showList: function(e){
    window.backend.hideAll() ;

    $('#userdata-wrapper #userdata ul').html('') ;
    groupTemplate = _.template($('#template-userdata-list-group').html()) ;
    listTemplate = _.template($('#template-userdata-list-item').html()) ;

    window.backend.userdataList.fetchInGroups(function(r){
      var currentGroup = {id:null} ;
      $(r).each(function(index){

        if(currentGroup.id != this.Group.id){
          currentGroup = this.Group ;
          $('#userdata-wrapper #userdata ul').append(groupTemplate({
            name:  currentGroup.name,
            id: currentGroup.id
          })) ;
        }

        var world_ids = this.Userdatum.world_id.split('-') ;
        var world_id = world_ids[0] ;
        if(world_ids[1]) world_id = world_ids[0]+'-'+world_ids[1] ;

        $('#userdata-wrapper #userdata ul').append(listTemplate({
          name:  this.Userdatum.name,
          world_id: world_id,
          index: index,
          group_id: currentGroup.id
        })) ;
      });
    }) ;

    $('#userdata-wrapper #userdata').animate({
      left:firstViewOffset
    }, function(){
      $('#userdata .content ul').scrollbar() ;

      $('.group').click(function(){
        $('.'+$(this).attr('id')).slideToggle(function(){
          $('#userdata .content ul').scrollbar('repaint') ;
        }) ;
        $(this).find('.arrow').toggle() ;
      }) ;

    }) ;
  },

  showEditUserdatum: function(e){
    window.backend.hideSecond() ;

    this.currentUserdatumIndex = e.target.id ;
    var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

    $('#userdata-wrapper #editUserdatum').find('h2').html(userdatum.Userdatum.name) ;

    $('#editUserdatum .info').find('#UserdatumName').html(userdatum.Userdatum.name) ;
    $('#editUserdatum .info').find('#UserdatumCategory').html(userdatum.Userdatum.category) ;
    var security = '' ;if(userdatum.Userdatum.public == 0) {security='public';} if(userdatum.Userdatum.public == 1) {security='private'} if(userdatum.Userdatum.public == 2){security='group'}
    $('#editUserdatum .info').find('#UserdatumSecurity').html(security) ;
    $('#editUserdatum .info').find('#UserdatumWorldID').html(userdatum.Userdatum.world_id) ;
    $('#editUserdatum .info').find('#UserdatumUser').html(userdatum.User.username) ;
    $('#editUserdatum .info').find('#UserdatumGroup').html(userdatum.Group.name) ;
    $('#editUserdatum .info').find('#UserdatumCreated').html(userdatum.Userdatum.created) ;
    $('#editUserdatum .info').find('#UserdatumType').html(userdatum.Userdatum.type) ;
    $('#editUserdatum .info').find('#UserdatumFileName').html(userdatum.Userdatum.filename) ;
    $('#editUserdatum .info').find('#UserdatumURL').html(userdatum.Userdatum.url) ;

    $('#userdata-wrapper #editUserdatum').find('#security').val(security) ;

    $('#userdata-wrapper #editUserdatum').animate({left:secondViewOffset}) ;

    $('.content').scrollbar();
  },

  editUserdatum: function(){
    var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

    var d = {
      id: userdatum.Userdatum.id,
      security: $('#editUserdatum #security option:selected').val()
    } ;

    var showList = this.showList ;

    userdatum.save(d, {
      success: function(){
        window.alert.info('Changed data') ;
        window.backend.hideSecond() ;

        showList() ;
      }
    }) ;
  },

  deleteUserdatum: function(){
    if(confirm('Are you sure you want to delete this data?')){
      var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

      //cakephp stupidness
      userdatum.set({id: userdatum.attributes.Userdatum.id}) ;
      var showList = this.showList ;

      userdatum.destroy({
        success: function(){
          window.alert.info('Data deleted') ;
          window.backend.hideSecond() ;

          showList() ;
        }
      }) ;
    }
  }

});
/*==-==*/
//Needs prettifying
var firstViewOffset = 240 ;
var secondViewOffset = 540 ;
var thirdViewOffset = 841 ;

dojo.provide('Field');
dojo.provide('FieldCollection') ;
dojo.provide('FieldView');

var FieldCollection = Backbone.Collection.extend({
  url: 'fields/'
}) ;

var Field = Backbone.Model.extend({
    url : 'fields/',

  initialize: function(){
    this.bind('error', function(m, error){
      if(!error) error = 'Something went wrong, please try again!'
      window.alert.error(error) ;

      return false ;
    });
  }
}) ;

var FieldView = Backbone.View.extend({
  el: 'body',

  events: {
    'click .fieldsButton': 'showList',
    'click .addFieldButton': 'showEditField',
    'click .editFieldButton': 'showEditField',
    'click .editField': 'editField'
  },

  currentFieldIndex: undefined,

  showList: function(e){
    window.backend.hideAll() ;

    window.backend.fieldList.fetch({
      success:function(r){
        $('#fields').find('li').remove();
        listTemplate = _.template($('#template-field-list-item').html()) ;

        $.each(r.models, function(index){
          $('#fields').find('ul').append(listTemplate({
            name:  this.attributes.Field.name,
            index: index
          })) ;
        }) ;

        $('#fields').animate({left:firstViewOffset}, function(){$('#fields .content ul').scrollbar();}) ;
      }
    })
  },

  showEditField: function(e){
    window.backend.hideSecond() ;

    $('#editField').find('#type').change(function(){
      if($(this).val() == 'rate'){
        $('#editField').find('#rate, label[for=rate]').fadeIn();
      }
      else{
        $('#editField').find('#rate, label[for=rate]').fadeOut();
      }
    }) ;

    $('#editField').find('#rate, label[for=rate]').hide().val('') ;

    this.currentFieldIndex = undefined ;
    if($(e.target).hasClass('editFieldButton')) {
      this.currentFieldIndex = e.target.id ;

      var field = window.backend.fieldList.at(this.currentFieldIndex) ;

      $('#editField').find('h2').html('Edit '+field.attributes.Field.name) ;
      $('#editField').find('#name').val(field.attributes.Field.name) ;
      $('#editField').find('#fieldName').val(field.attributes.Field.field_name) ;
      $('#editField').find('#description').val(field.attributes.Field.description) ;

      $('#editField').find('#type').find('option[value='+field.attributes.Field.type+']').attr('selected', 'selected');
      if(field.attributes.Field.type == 'rate'){
        $('#editField').find('#rate, label[for=rate]').show().val(field.attributes.Field.rate) ;
      }
    }
    else{
      $('#editField').find('h2').html('Add new field') ;

      $('#editField').find('#name').val('') ;
      $('#editField').find('#fieldName').val('') ;
      $('#editField').find('#description').val('') ;

      $('#editField').find('#type').find('option[value=number]').attr('selected', 'selected');

    }

    $('#editField').animate({left:secondViewOffset}) ;
  },

  editField: function(){
    var field = new Field() ;

    var d = {
      name: $('#editField').find('#name').val(),
      field_name: $('#editField').find('#fieldName').val(),
      description: $('#editField').find('#description').val(),
      type: $('#editField').find('#type').val(),
      rate: $('#editField').find('#rate').val()
    } ;

    if(this.currentFieldIndex) {
      var field = window.backend.fieldList.at(this.currentFieldIndex) ;
      d.id = field.attributes.Field.id ;
    }

    var showList = this.showList ;

    field.save(d, {
      success: function(){
        window.alert.info('Saved field') ;
        window.backend.hideSecond() ;

        showList() ;
      }
    }) ;
  }

});
/*==-==*/
var firstViewOffset = 240 ;
var secondViewOffset = 540 ;
var thirdViewOffset = 841 ;

dojo.provide('MyStuffView');

var MyStuffView = Backbone.View.extend({
  el: 'body',

  events: {
    'click .myGroupButton': 'showMyGroup',
    'click .myGroupUserAdd': 'showAddMyGroupUser',
    'click .addUserMyGroupButton': 'addMyGroupUser',
    'keypress #myGroupAddUserForm' : 'searchUserAddMyGroup',
    'click .addUserMyGroupButton': 'addMyGroupUser',
    'click .changeUserMyGroupButton': 'showChangeUserMyGroup',
    'click .changeUserMyGroup': 'changeUserMyGroup',
    'click .deleteUserMyGroup': 'deleteUserMyGroup',
    'click .myProfileButton': 'showProfile',
    'click .myGroupFilesButton': 'showMyGroupFiles',
    'click .editMyUserdataButton': 'showEditUserdata',
    'click .myFilesButton': 'showMyFiles',
    'click .editMyUserdatum': 'editMyUserdata',
    'click .deleteMyUserdatum': 'deleteMyUserdata'
  },

  showMyGroup: function(){
    window.backend.hideAll() ;

    var group = window.backend.groupList.getById(window.currentUser.inGroup) ;
    window.backend.groupsUsersList.fetch({
      success: function(){
        var users = window.backend.groupsUsersList.getUsersByGroupID(group.id) ;
        var userTemplate = _.template($('#template-mygroup-user-list-item').html()) ;
        $('#myGroup .content ul').html('') ;

        $.each(users, function(i){
          $('#myGroup').find('ul').append(userTemplate({
            name:  this.User.username,
            id: i,
            level: this.GroupsUser.level
          })) ;
        }) ;

        $('#myGroup').attr('group-id', group.id) ;
        $('#myGroup').find('h2').html(group.name) ;
        $('#myGroup').animate({
          left:firstViewOffset
        }, function(){
            $('#myGroup .content ul').scrollbar({arrows:false}) ;
        }) ;
      }
    }) ;
  },

  showAddMyGroupUser: function(){
    window.backend.hideSecond() ;

    var group = window.backend.groupList.getById($('#myGroup').attr('group-id')) ;

    $('#myGroupUserAdd').find('h2').html("Add user to '"+group.name+"'") ;

    $('#myGroupUserAdd').animate({
      left: secondViewOffset
    }) ;
    $('#myGroupUserAdd').find('input:first').focus();
  },

  searchUserAddMyGroup: function(e){
    if (e.keyCode != 13) return;

    var allUsers = new UserCollection ;
    allUsers.fetch({
      success: function(r){
        $('#myGroupUserAdd ul').find('li').remove() ;

        var q = $('#searchMyGroupUser').val();

        var userTemplate = _.template($('#template-user-add-mygroup-list-item').html()) ;
        var query = new RegExp('.*(' + q.toLowerCase() + ').*') ;

        $.each(r.models, function(){
          if(query.test(this.attributes.User.username.toLowerCase())){
            $('#myGroupUserAdd').find('ul').append(userTemplate({
              name:  this.attributes.User.username,
              id: this.attributes.User.id
            })) ;
          }
        }) ;
      }
    }) ;

    return false ;
  },

  addMyGroupUser: function(e){
    var group = window.backend.groupList.getById($('#myGroup').attr('group-id')) ;
    console.log(group) ;


    var d = {
      group_id: group.id,
      user_id: e.target.id
    }

    var rel = new GroupsUsers()

    var showMyGroup = this.showMyGroup;
    rel.save(d, {
      success:function(r){
        window.alert.info('Added user to the group') ;

        window.backend.hideSecond() ;

        showMyGroup();
      }
    }) ;
  },

  showChangeUserMyGroup: function(e){
    console.log('mygroup') ;
    window.backend.hideSecond() ;

    var group = window.backend.groupList.getById($('#myGroup').attr('group-id')) ;
    var groupUsers = window.backend.groupsUsersList.getUsersByGroupID(group.id) ;
    var groupUser = groupUsers[e.target.id] ;

    $('#changeUserMyGroup').find('h2').html('Change rights for '+ groupUser.User.username) ;
    $('#changeUserMyGroup').find('#userId').val(groupUser.User.id) ;
    $('#changeUserMyGroup').find('#groupUserId').val(groupUser.GroupsUser.id);
    $('#changeUserMyGroup').find('#userLevel').find('option[value='+groupUser.GroupsUser.level+']').attr('selected', 'selected');

    $('#changeUserMyGroup').animate({
      left: secondViewOffset
    }) ;
  },

  changeUserMyGroup: function(){
    ///CHANGE IS WHAT WE BELIEVE IN!
    var d = {
      id: parseInt($('#changeUserMyGroupForm #groupUserId').val()),
      level: parseInt($('#changeUserMyGroupForm #userLevel').val())
    } ;

    var showMyGroup = this.showMyGroup ;

    //Quick jquery ajax request. CakePHP seems to have REST problems...
    $.ajax({
      url: 'GroupsUsers/edit',
      type: 'post',
      data: d,
      dataType: 'json',
      success: function(){
        window.alert.info('Changed user rights') ;
        window.backend.hideThird() ;

        showMyGroup() ;
      }
    }) ;
  },

  deleteUserMyGroup: function(){
    //TOO MANY USERS IN THE GROUP! [TOO MANY USERS!]
    var showMyGroup = this.showMyGroup ;

    $.ajax({
      url: 'GroupsUsers/delete',
      type: 'post',
      data: 'id='+$('#changeUserMyGroupForm #groupUserId').val(),
      success: function(){
        window.alert.info('Removed from group') ;
        window.backend.hideThird() ;

        showMyGroup() ;
      }
    }) ;
  },

  showProfile: function(e){
    window.backend.hideAll();

    $('#profile').find('h2').html(window.currentUser.username) ;
    $('#profile').find('#username').val(window.currentUser.username) ;

    var inGroup = 'Not in a group' ;
    if(window.currentUser.inGroup) inGroup = window.currentUser.inGroup ;

    $('#profile .info').find('#UserViewUsername').html(window.currentUser.username) ;
    $('#profile .info').find('#UserViewOrganization').html(window.currentUser.organization) ;
    $('#profile .info').find('#UserViewEmail').html(window.currentUser.email).attr('href', 'mailto:'+window.currentUser.email) ;
    $('#profile .info').find('#UserViewInGroup').html(inGroup) ;
    $('#profile .info').find('#UserViewLevel').html(window.currentUser.level) ;
    $('#profile .info').find('#UserViewCreated').html(window.currentUser.created) ;

    $('#profile').animate({left:firstViewOffset}) ;
  },

  showMyGroupFiles: function(e){
    window.backend.hideAll() ;

    $('#mystuff-wrapper #myGroupUserdata ul').html('') ;
    groupTemplate = _.template($('#template-userdata-list-group').html()) ;
    listTemplate = _.template($('#template-userdata-list-item').html()) ;

    window.backend.userdataList.fetchByGroupID(window.currentUser.inGroup, function(r){
      if(r.length > 0){
        var currentGroup = {category:null} ;
        $(r).each(function(index){

          if(this.Userdatum.category != currentGroup.category){
            currentGroup = this.Userdatum ;
            $('#mystuff-wrapper #myGroupUserdata ul').append(groupTemplate({
              name:  currentGroup.category,
              id: currentGroup.id
            })) ;
          }

          var world_ids = this.Userdatum.world_id.split('-') ;
          $('#mystuff-wrapper #myGroupUserdata ul').append(listTemplate({
            name:  this.Userdatum.name,
            world_id: world_ids[0]+'-'+world_ids[1],
            index: index,
            group_id: currentGroup.id
          })) ;
        });
      }
      else{
        $('#myUserdata .content').prepend('<p class="notice">No data found! Start uploading data on the map.</p>') ;
        $('#myUserdata .content .notice').show();
      }
    }) ;

    $('#mystuff-wrapper #myGroupUserdata').animate({
      left:firstViewOffset
    }, function(){
      $('#myGroupUserdata .content ul').scrollbar() ;

      $('.group').click(function(){
        $('.'+$(this).attr('id')).slideToggle(function(){
          $('#myGroupUserdata .content ul').scrollbar('repaint') ;
        }) ;
        $(this).find('.arrow').toggle() ;
      }) ;

    }) ;
  },

  showMyFiles: function(e){
    window.backend.hideAll() ;

    $('#mystuff-wrapper #myUserdata ul').html('') ;
    groupTemplate = _.template($('#template-userdata-list-group').html()) ;
    listTemplate = _.template($('#template-userdata-list-item').html()) ;

    window.backend.userdataList.fetchByUserID(window.currentUser.id, function(r){
      if(r.length > 0){
        var currentGroup = {category:null} ;
        $(r).each(function(index){

          if(this.Userdatum.category != currentGroup.category){
            currentGroup = this.Userdatum ;
            $('#mystuff-wrapper #myUserdata ul').append(groupTemplate({
              name:  currentGroup.category,
              id: currentGroup.id
            })) ;
          }

          var world_ids = this.Userdatum.world_id.split('-') ;
          $('#mystuff-wrapper #myUserdata ul').append(listTemplate({
            name:  this.Userdatum.name,
            world_id: world_ids[0]+'-'+world_ids[1],
            index: index,
            group_id: currentGroup.id
          })) ;
        });
      }
      else{
        $('#myUserdata .content ul').html('<p class="notice">No data found!<br>(Start uploading data on the map).</p>') ;
        $('#myUserdata .content .notice').show();
      }
    }) ;

    $('#mystuff-wrapper #myUserdata').animate({
      left:firstViewOffset
    }, function(){
      $('#myUserdata .content ul').scrollbar() ;

      $('.group').click(function(){
        $('.'+$(this).attr('id')).slideToggle(function(){
          $('#myUserdata .content ul').scrollbar('repaint') ;
        }) ;
        $(this).find('.arrow').toggle() ;
      }) ;

    }) ;
  },

  showEditUserdata: function(e){
    window.backend.hideSecond() ;

    this.currentUserdatumIndex = e.target.id ;
    var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

    $('#editUserdatum .groupAdminRights').hide();
    if(userdatum.Userdatum.user_id == window.currentUser.id){
      $('#editMyUserdatum').find('.groupAdminRights').show();
    }

    $('#editMyUserdatum').find('h2').html(userdatum.Userdatum.name) ;

    $('#editMyUserdatum .info').find('#UserdatumName').html(userdatum.Userdatum.name) ;
    $('#editMyUserdatum .info').find('#UserdatumCategory').html(userdatum.Userdatum.category) ;
    var security = '' ;if(userdatum.Userdatum.public == 0) {security='public';} if(userdatum.Userdatum.public == 1) {security='private'} if(userdatum.Userdatum.public == 2){security='group'}
    $('#editMyUserdatum .info').find('#UserdatumSecurity').html(security) ;
    $('#editMyUserdatum .info').find('#UserdatumWorldID').html(userdatum.Userdatum.world_id) ;
    $('#editMyUserdatum .info').find('#UserdatumUser').html(userdatum.User.username) ;
    $('#editMyUserdatum .info').find('#UserdatumCreated').html(userdatum.Userdatum.created) ;
    $('#editMyUserdatum .info').find('#UserdatumType').html(userdatum.Userdatum.type) ;
    $('#editMyUserdatum .info').find('#UserdatumFileName').html(userdatum.Userdatum.filename) ;
    $('#editMyUserdatum .info').find('#UserdatumURL').html(userdatum.Userdatum.url) ;

    $('#editMyUserdatum').find('#security').val(security) ;

    $('#editMyUserdatum').animate({left:secondViewOffset}) ;

    $('.content').scrollbar();

  },

  editUserdatum: function(){
    var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

    var d = {
      id: userdatum.attributes.Userdatum.id,
      security: $('#userdata-wrapper #editUserdatum').find('#security').val()
    } ;

    var showList = this.showList ;

    userdatum.save(d, {
      success: function(){
        window.alert.info('Changed data') ;
        window.backend.hideSecond() ;

        showList() ;
      }
    }) ;
  },

  deleteUserdatum: function(){
    if(confirm('Are you sure you want to delete this data?')){
      var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

      //cakephp stupidness
      userdatum.set({id: userdatum.attributes.Userdatum.id}) ;
      var showList = this.showList ;

      console.log(userdatum);
      userdatum.destroy({
        success: function(){
          window.alert.info('Data deleted') ;
          window.backend.hideSecond() ;

          showList() ;
        }
      }) ;
    }
  },

  editMyUserdata: function(){
    var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

    var d = {
      id: userdatum.Userdatum.id,
      security: $('#editMyUserdatum #security option:selected').val()
    } ;

    $.ajax({
      url: 'userdata/edit/'+d.id,
      data: d,
      type: 'post',
      success: function(r){
        window.alert.info('Changed data') ;
        window.backend.hideAll() ;
      }
    }) ;
  },

  deleteMyUserdata: function(){
    if(confirm('Are you sure you want to delete this data?')){
      var userdatum = window.backend.userdataList.at(this.currentUserdatumIndex) ;

      $.ajax({
        url: 'userdata/delete/'+userdatum.Userdatum.id,
        success: function(r){
          window.alert.info('Data deleted') ;
          window.backend.hideAll() ;
        }
      }) ;
    }
  }


});

/*==-==*/
dojo.provide('Userdata');
dojo.provide('UserdataCollection') ;
dojo.provide('UserdataView');

var UserdataCollection = Backbone.Collection.extend({
  url: 'userdata/',

  getCategories: function(){
    var categories = [] ;
    $.each(this.models, function(){
      var category = this.Userdatum.category ;

      if($.inArray(category, categories) == -1){
        categories.push(category) ;
      }
    }) ;
    return categories ;
  },

  getByCategory: function(cat){
    var models = [] ;
    $.each(this.models, function(){
      if(this.Userdatum.category == cat){
        models.push(this.Userdatum) ;
      }
    }) ;
    return models ;
  },

  fetchByWorldID: function(worldid, callback){
    var coll = this ;
    $.getJSON('userdata/index/worldId/'+worldid, function(r){
      coll.models = r ;
      callback(r)
    }) ;
  },

  getGroups: function(callback){
    $.getJSON('userdata/index/groups', function(r){
      callback(r)
    }) ;
  },

  fetchInGroups: function(callback){
    var coll = this ;
    $.getJSON('userdata/index/inGroups/', function(r){
      coll.models = r ;
      callback(r)
    }) ;
  },

  fetchByGroupID: function(groupid, callback){
    var coll = this ;
    coll.models = [] ;
    $.getJSON('userdata/index/byGroup/'+groupid, function(r){
      coll.models = $.merge(coll.models, r) ;
      callback(r)
    }) ;
  },

  fetchByUserID: function(userid, callback){
    var coll = this ;
    coll.models = [] ;
    $.getJSON('userdata/index/byUser/'+userid, function(r){
      coll.models = $.merge(coll.models, r) ;
      callback(r)
    }) ;
  }

}) ;

var Userdata = Backbone.Model.extend({
    url : 'userdata/',

  initialize: function(){
    this.bind('error', function(m, error){
      if(!error) error = 'Something went wrong, please try again!'
      window.alert.error(error) ;

      return false ;
    });
  }
});
/*==-==*/
  dojo.provide('Panel');

  var Panel = Backbone.View.extend({
    el: '#panel',

    events: {
      "click .userdataButton": "showUserdata",
      "click .statsButton": "showStats",
      "click #panel .addUserdataButton": "showAddUserdata",
      "click .userdataAdd": "addUserdata",
      "click #panelCloseButton": "hide",
      "click .stat": 'showDescription',
      "click #userDataAddTabs a": 'toggleUserdataAddTabs',
      "mouseout .stat": 'hideDescription',
      "click #Population": "makePenguinsJump",
      "click .more-button": "showMoreUserdata",
      "click .less-button": "hideMoreUserdata",
      "click #followButton": "toggleFollow",
      "mouseover #followButton": "overFollow",
      "mouseout #followButton": "outFollow"
    },

    overFollow: function(){
      if($('#panel').find('#followButton .buttonCenter').html() == 'Following'){
        $('#panel').find('#followButton .buttonCenter').html('Unfollow');
        $('#panel').find('#followButton').removeClass('highlighted');
      }
    },

    outFollow: function(){
      if($('#panel').find('#followButton .buttonCenter').html() == 'Unfollow'){
        $('#panel').find('#followButton').addClass('highlighted');
        $('#panel').find('#followButton .buttonCenter').html('Following');
      }
    },

    toggleFollow: function(){
      $.getJSON(
        'notificationsUsers/toggle/'+$('#panel').attr('world-id'),
        function(d){
          if(d.status == 'unfollow'){
            $('#panel').find('#followButton').removeClass('highlighted');
            $('#panel').find('#followButton .buttonCenter').html('Follow');
          }
          else{
            $('#panel').find('#followButton').addClass('highlighted');
            $('#panel').find('#followButton .buttonCenter').html('Following');
          }
        }
      ) ;
    },

    makePenguinsJump: function(){
      if($('#panel').attr('world-id') == 'FLK'){
        window.alert.info("Jumping penguins all over the place! Ahmahzing!") ;
        var i = 0 ;
        while(i < 40){
          setTimeout(this.penguinJump, Math.random()*4000) ;
          i++;
        }
      }
    },

    penguinJump: function(){
      var id = Math.floor(Math.random()*10000000) ; //Times 10 million. Very much unique id's.
      var dom = '<div class="penguin" id="'+id+'" style="width:233;height:243;background-image:url(img/penguin.png);z-index:100;position:absolute;top:0;right:-250px;"/>' ;
      $('body').prepend(dom) ;

      var bezier_params = {
          start: {
            x: screen.width,
            y: 600,
            angle: 90
          },
          end: {
            x:(Math.random()*1000),
            y:Math.random()*1000,
            angle: -90,
            length: 1
          }
      }

      $('#'+id).animate({path : new $.path.bezier(bezier_params)}, 800, function(){
        $(this).fadeOut('fast', function(){
          $(this).remove();
        }) ;
      }) ;
    },

    initialize: function(){
      this.currentPanel = 'stats' ;
      this.userdataList = new UserdataCollection ;

      $('.progress-bar').progressbar() ;
      $('.progress-bar').find('.ui-progressbar-value').css({display: 'block'}) ;

      $('.stat').tipsy({
        fade: true,
        gravity: 'e',
        html: false,
        fallback: 'No description available'
      }) ;

      $('#userDataAddTabsFile').tipsy({
        fade: true,
        gravity: 'e'
      });
    },

    showAddUserdata: function(){
      if(window.currentUser != null && window.currentUser.inGroups != false){
        //Reset
        $('#userdataAddForm #name').val('');
        $('#userdataAddForm #category').find('option[value=General]').attr('selected', 'selected') ;
        $('#userdataAddForm #public').attr('checked', 'checked') ;
        $('#userdataAddForm #link').val('');

        $('#userdataAddForm #userdataFile').remove();
        $('#userdataAddForm #userDataAddTabsFile').prepend('<div id="userdataFile"></div>') ;

        $('#userdataAddForm').find('#fileName').val(' ') ;
        $('#userdataAddForm').find('#fileExt').val(' ') ;
        $('#userdataAddForm').find('#fileSize').val(' ') ;

        var uploader = new qq.FileUploader({
                  element: document.getElementById('userdataFile'),
                  action: 'userdata/upload',
                  debug: false,
          allowedExtensions: ['doc', 'docx', 'kml', 'kmz', 'pdf'],
          onComplete: function(id, fileName, responseJSON){
            var filename = $('#userdataFile').find('.qq-upload-file').html();
            $('#userdataFile').find('.qq-upload-file').html('Uploaded '+filename) ;
            $('#userdataFile').find('.qq-upload-size').hide() ;

            $('#userdataAddForm').find('#fileName').val(responseJSON.filename) ;
            $('#userdataAddForm').find('#fileExt').val(responseJSON.fileextention) ;
            $('#userdataAddForm').find('#fileSize').val(responseJSON.filesize) ;
          }
              });

        //Just to be sure.
        $('#stats').hide();

        $('#userdata').slideUp(function(){
          $('#userdataAdd').slideDown();
        }) ;
      }
      else{
        window.alert.error('You need to be logged in and added to a group before you can upload files.') ;
      }
    },

    toggleUserdataAddTabs: function(e){
      $('#toggleUserdataAddTabs li a').removeClass('selected') ;
      $(e.target).addClass('selected') ;

      var id = $(e.target).attr('id').replace('Button', '') ;
      $('.userdataAddTab').hide() ;
      $('#'+id).fadeIn() ;
    },

    addUserdata: function() {
      $('#userdataAddForm label').css('color', '#dedede') ;

      //Simple validation...
      var isValid = true ; //Well, technically we'll have to see about that...
      var required_fields = ['name', 'category', 'security'] ;
      for(i in required_fields){
        var field = required_fields[i] ;
        if($('#userdataAddForm #'+field).val() == ''){
          $('#userdataAddForm [for='+field+']').css('color', '#c02b20') ;
          isValid = false ;
        }
      }

      if($('#userdataAddForm').find('#fileExt').val() == ' '
      && $('#userdataAddForm').find('#link').val() == ''){
        isValid = false ;
      }

      if(!isValid){
        window.alert.error('All fields must be filled out.') ;
        $('#userdataAddForm input[type=submit]').effect('shake', {times:2, distance:5}, 50) ;
        return false ;
      }

      var d = {
        name: $('#userdataAdd').find('#name').val(),
        category: $('#userdataAdd').find('#category').val(),
        security: $('#userdataAdd').find('#security').val(),
        world_id: $('#panel').attr('world-id'),
        omegazone_name: $('#panel #title h1').html()
      }

      if($('#userdataAdd').find('#fileSize').val().length > 1){
        d.filename = $('#userdataAdd').find('#fileName').val() + '.' + $('#userdataAdd').find('#fileExt').val() ;
        d.filetype = $('#userdataAdd').find('#fileExt').val() ;
        d.type = $('#userdataAdd').find('#fileExt').val();
        d.filesize = $('#userdataAdd').find('#fileSize').val();
      }
      else{
        var url = $('#userdataAdd').find('#link').val() ;
        if(!(/^http:\/\//.test(url))) {
            url = "http://" + url;
        }
        d.url = url
        d.type = 'url' ;
      }

      var loadUserdata = this.loadUserdata ;

      var userdata = new Userdata() ;
      userdata.save(d, {
        success: function(r){
          window.alert.info('Thanks for your information!') ;
          loadUserdata();

          $('#panel #userdataAdd').slideUp(function(){
            $('#panel #userdata').slideDown() ;
          }) ;
        }
      }) ;

      return false ;
    },

    loadUserdata: function(){
      $('#userDataList').fadeOut('fast', function(){
        $('#userDataList').html('') ;

        //Because of 'this' weirdness.
        var userdataList = window.panel.userdataList ;

        //refreshhh
        window.panel.userdataList.fetchByWorldID($('#panel').attr('world-id'), function(r){
          if(r.length > 0){
            var userdataListItem = _.template($('#panel-userdata-list-item').html());
            var userdataListCategory = _.template($('#panel-userdata-list-category').html());

            $.each(userdataList.getCategories(), function(index){
              var category = this ;
              $('#userdata #userDataList').append(userdataListCategory({
                odd:  (index%2),
                name:   this
              })) ;

              $.each(userdataList.getByCategory(category), function(index){
                var url ;
                if(!this.url){
                  url = 'userdata/download/'+this.id ;
                }
                else{
                  url = this.url ;
                }

                // var share_url = '4kworldmap.com/map/omegazone/'+data.Zone_Name.replace(' ', '_')+'/userdata/' ;

                var date_uploaded = new Date(this.created) ;
                var date_uploaded_year = date_uploaded.getFullYear();
                var date_uploaded_month = date_uploaded.getMonth()+1;
                var date_uploaded_day = date_uploaded.getDate();

                var security_descr ;
                if(this.public == 0){
                  security_descr = 'This file is public' ;
                }
                if(this.public == 1){
                  security_descr = 'This file is private' ;
                }
                if(this.public == 2){
                  security_descr = 'For my group only' ;
                }

                if(this.rating == null) this.rating = 0 ;

                $('#userdata #userDataList').append(userdataListItem({
                  odd:  (index%2),
                  group_id: this.group_id,
                  category: category,
                  name:   this.name,
                  type:   this.type,
                  downloaded: this.downloaded,
                  // rated: this.rated,
                  // date_uploaded: date_uploaded_month + '/' + date_uploaded_day + '/' + date_uploaded_year,
                  url: url,
                  // security_descr: security_descr,
                  id: this.id,
                  rating: Math.round(this.rating)
                  // share_url: share_url
                })) ;

                //But when I look at the stars
                $("#rating-"+this.id).stars({
                  disabled: (window.currentUser ? false : true),
                  cancelShow: false,
                  callback: function(ui, type, value){
                    var id = ui.element[0].id.split('-') ;

                    d = {
                      userdatum_id: id[1],
                      rating: value
                    }

                    $.ajax({
                      url: 'ratings/rate',
                      data: d,
                      type: 'post',
                      success: function(){
                        window.alert.info('Rating saved!') ;
                      }
                    }) ;
                  }
                });

                // $('.share input').click(function(){
                //  this.select();
                // }) ;
              }) ;
            });

            $('.category').click(function(){
              $('.'+$(this).attr('id')).slideToggle() ;
              $(this).find('.arrow').toggle() ;
            }) ;

            // if(userdataID){
            //  var id = '#userdata-'+userdataID ;
            //  $('#userDataList').append($(id).parent()) ;
            //  $(id).click();
            // }
          }
          else{
            $('#userDataList').html('<p class="notice">No data found.</p>') ;
            $('#userDataList p.notice').show();
          }

          $('#userDataList').fadeIn('normal', function(){
            $('#userDataList').scrollbar({arrows:false}) ;
          }) ;

        });
      }) ;
    },

    showMoreUserdata: function(e){
      var userdata = $(e.target).parent() ;

      userdata.find('.more-button').hide() ;
      userdata.addClass('expanded', 800) ;
      userdata.find('.less-button').fadeIn('fast') ;

      var share_url = userdata.find('#share_url').val();
      $('.facebookButton').socialbutton('facebook_share', {
          button: 'button',
          url: share_url,
          text: 'Share'
      });

      $('.twitterButton').socialbutton('twitter', {
          button: 'none',
          url: share_url,
          text: 'Look at the data I found on the #4kworldmap!',
          lang: 'en'
      });

      $('#userDataList').scrollbar('repaint') ;
    },

    hideMoreUserdata: function(e){
      var userdata = $(e.target).parent().parent() ;
      userdata.removeClass('expanded', 800, function(){
        userdata.find('.more-button').fadeIn('fast') ;
        userdata.find('.less-button').fadeOut() ;
      }) ;
    },

    showUserdata: function(){
      this.currentPanel = 'userdata' ;

      $('#panel #selector').animate({
        marginLeft:80
      }, 'slow', 'easeOutBack', function(){
        $('#tabs .statsButton').removeClass('selected', 1000) ;
        $('#tabs .userdataButton').addClass('selected', 1000) ;

        $('#userDataList').scrollbar({arrows:false}) ;
      }) ;

      $('#panel #userdataAdd').hide();
      $('#panel #stats').fadeOut(function(){
        $('#panel #userdata').fadeIn();
      }) ;
    },

    showStats: function(){
      this.currentPanel = 'stats' ;

      $('#panel #selector').animate({
        marginLeft:6
      }, 'slow', 'easeOutBack', function(){
        $('#tabs .userdataButton').removeClass('selected', 1000) ;
        $('#tabs .statsButton').addClass('selected', 1000) ;

        $('#stats').scrollbar({arrows:false}) ;
      }) ;

      $('#panel #userdataAdd').hide();
      $('#panel #userdata').fadeOut(function(){
        $('#panel #stats').fadeIn();
      }) ;
    },

    showDescription: function(e){
      $(e.target).tipsy('show') ;
      return false ;
    },

    hideDescription: function(e){
      $(e.target).tipsy('hide') ;
      return false ;
    },

    show: function(speed){
      if(!speed) var speed = 'slow' ;
      window.panel.hidden = false ;

      $('#panel').animate({
        right: 0
      }, speed) ;
    },

    hide: function(speed){
      if(!speed) var speed = 'fast' ;
      window.panel.hidden = true ;

      document.title = document.baseTitle ;
      window.frontendRouter.navigate('') ;

      $('#panel').animate({
        right: -360
      }) ;
    }
  });

/*==-==*/
firstRun = true;
  var Map = Backbone.View.extend({
    el: 'body',

    events: {
      "keypress #search": "searchSubmit",
      'click .mapButton': 'show',
      'click .showAvailableLayersButton': 'showAvailableLayers',
      'click .addLayerButton': 'addLayer',
      'click .removeLayer': 'removeLayer',
      'click .switchBasemap': 'switchBasemap',
      'click .reportButton': 'toggleReport',
      'submit #report': 'report'
    },

    toggleReport: function(){
      if($('#report').css('bottom') != '0px'){
        $('#reportButton').animate({
          bottom: '-23px'
        }, 'normal', function(){
          $('#report').animate({
            bottom: '0px'
          }) ;
        });
      }
      else{
        $('#report').animate({
          bottom: '-300px'
        }, 'normal', function(){
          $('#reportButton').animate({
            bottom: '0px'
          }) ;
        });
      }
    },

    report: function(){
      $.ajax({
        url: 'userdata/report',
        type: 'post',
        data: $('#report').serializeArray(),
        success: function(d){
          if(d == 'success'){
            window.alert.info('Report send! Thanks!') ;
            window.map.toggleReport();
          }
        }
      }) ;

      return false ;
    },

    initialize: function(){
      window.alert.load() ;

      dojo.addOnLoad(function(){
        esriConfig.defaults.map.slider = { left:"30px", top:"30px", width:null, height:"200px" };
        esriConfig.defaults.map.sliderLabel = null;

        var initExtent = new esri.geometry.Extent({"xmin":-11584184.510671832,"ymin":-6594375.304216977,"xmax":11818999.06156405,"ymax":12132085.129419927,"spatialReference":{"wkid":102100}});
        window.map.esriMap = new esri.Map("map", {
          extent: initExtent,
          wrapAround180:true,
          width:'100%',
          height:'100%',
          logo:false
        });

        //Customizable basemap. Choices between imagary, terrain, open street map
          var Imagery = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/");
            window.map.esriMap.addLayer(Imagery);

        var Terrain = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/");
        Terrain.visible = false ;
        window.map.esriMap.addLayer(Terrain);

        var Street = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/");
        Street.visible = false ;
        window.map.esriMap.addLayer(Street);

        //Adding omegazone lines
        var omegaZones = new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap1a/MapServer");
        window.map.esriMap.addLayer(omegaZones);
        window.map.topLayer = omegaZones = omegaZones.id ;

        dojo.connect(window.map.esriMap, 'onLoad', function(){
          window.map.searchAlternative = null ;
              window.map.locator = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Places_World/GeocodeServer");
              dojo.connect(window.map.locator, "onAddressToLocationsComplete", window.map.searchDone);

          $(window).resize(function(){window.map.esriMap.resize();});
          dojo.connect(window.map.esriMap, 'onZoomEnd', function(e, zF, a, l){$('#slider').slider('value', l)}) ;
          dojo.connect(window.map.esriMap, 'onClick', window.map.loadPanel) ;
          dojo.connect(window.map.esriMap,"onUpdateStart",function(){window.alert.load();});
          dojo.connect(window.map.esriMap,"onUpdateEnd",function(){window.alert.hide();});


        }) ;

      }) ;
    },

    loadPanel: function(e){
      window.frontendRouter.loadPanel(e.mapPoint) ;
    },

    searchSubmit: function(e){
      if (e.keyCode != 13) return;
      this.search($('#search').val());
      window.panel.hide();

      return false ;
    },

    search: function(q, a){
      window.alert.load() ;

      if(a) this.searchAlternative = a ;

      dojo.addOnLoad(function(){
        var place = {PlaceName: q}
        window.map.locator.addressToLocations(place);
      });
    },

    searchDone: function(candidates) {
      dojo.addOnLoad(function(){
        if(candidates[0]){
                geom = esri.geometry.geographicToWebMercator(candidates[0].location);
              window.map.esriMap.centerAndZoom(geom,6);
          window.map.searchAlternative = null ;
        }
        else{
          if(window.map.searchAlternative){
            window.map.search(window.map.searchAlternative) ;
            window.map.searchAlternative = null ;
          }
          else{
            window.map.alert.error('Place not found') ;
          }
        }
      });
    },

    showAvailableLayers: function(){


      if(firstRun) {

        var layers = [] ;
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap2a/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap2b/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3a/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3b/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3c/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3d/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3e/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4a/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4b/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4c/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4d/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4e/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4f/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5a/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5b/MapServer"));
          layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5c/MapServer"));

          $.each(layers, function(index){
            var layer = window.map.esriMap.addLayer(this) ;

            dojo.connect(this, 'onLoad', function(){
              layer.setVisibleLayers([-1]);

              $.each(layer.layerInfos, function(index){
                var tmpl = _.template($('#layers-available-layer-template').html());
                $('#availableLayers').append(tmpl({
                  layer_id: layer.id,
                  name: this.name,
                  sublayer_id: index
                })) ;
              }) ;
            }) ;
          }) ;

      }
      firstRun = false;

      $('#layers .showAvailableLayersButton').animate({
        marginLeft:-100
      }) ;

      $('#availableLayers').animate({
        left: 0
      }) ;
    },

    hideAvailableLayers: function(){
      $('#layers .showAvailableLayersButton').animate({
        marginLeft:0
      }) ;

      $('#availableLayers').animate({
        left: -260
      }) ;

    },

    addLayer: function(e){
      var hideAvailableLayers = this.hideAvailableLayers ;

      var layer_el = $(e.target).parent();
      var ids = $(layer_el).attr('id').split('-') ;

      var layer_id = ids[0] ;
      var sublayer_id = ids[1] ;
      var name = $(layer_el).find('p').html();

      var tmpl = _.template($('#layers-visible-layer-template').html());
      $('#visibleLayers').prepend(tmpl({
        layer_id: ids[0],
        name: $(layer_el).find('p').html(),
        sublayer_id: ids[1]
      })) ;

      $(layer_el).animate({
        marginLeft:-240
      }, function(){
        $(layer_el).remove()

        //Let's make the actual layer visible...
        window.alert.load();
        dojo.connect(window.map.esriMap._layers[layer_id], 'onUpdate', function(){window.alert.hide();}) ;

        window.map.esriMap._layers[layer_id].setVisibleLayers([sublayer_id]) ;
        window.map.esriMap._layers[layer_id].setOpacity(0.30);
        window.map.esriMap.reorderLayer(window.map.topLayer, 100) ;

        $('#'+ids[0]+'-'+ids[1]).animate({
          marginLeft:0
        }, function(){
          hideAvailableLayers();
        }) ;
      }) ;
    },

    removeLayer: function(e){
      var hideAvailableLayers = this.hideAvailableLayers ;

      var layer_el = $(e.target).parent();
      var ids = $(layer_el).attr('id').split('-') ;

      var layer_id = ids[0] ;
      var sublayer_id = ids[1] ;
      var name = $(layer_el).find('p').html();

      var tmpl = _.template($('#layers-available-layer-template').html());
      $('#availableLayers').append(tmpl({
        layer_id: ids[0],
        name: $(layer_el).find('p').html(),
        sublayer_id: ids[1]
      })) ;

      $(layer_el).animate({
        marginLeft:-240
      }, function(){
        $(layer_el).remove()

        //Let's make the actual layer invisible...
        window.alert.load();
        dojo.connect(window.map.esriMap._layers[layer_id], 'onUpdate', function(){window.alert.hide();}) ;

        window.map.esriMap._layers[layer_id].setVisibleLayers([-1]) ;
        window.map.esriMap.reorderLayer(window.map.topLayer, 100) ;

        $('#'+ids[0]+'-'+ids[1]).animate({
          marginLeft:0
        }, function(){
          hideAvailableLayers();
        }) ;
      }) ;
    },

    switchBasemap: function(e){
      window.alert.load();
      dojo.connect(window.map.esriMap._layers[e.target.id], 'onUpdate', function(){window.alert.hide();});
      $.each(['layer0', 'layer1', 'layer2'], function(){
        if(this == e.target.id){
          window.map.esriMap._layers[e.target.id].setVisibility(true) ;
        }
        else{
          window.map.esriMap._layers[this].setVisibility(false) ;
        }
      }) ;
    },

    hide: function(){
      window.panel.hide();

      $('#map-wrapper').animate({
        right: $('#map-wrapper').width(),
        left:$('#map-wrapper').width()*-1
      }, 'slow', function(){
        $('#auth-wrapper .mapButton').animate({
          left:0
        }) ;
      }) ;
    },

    show: function(speed){
      $('#accountOptions').slideUp() ;

      $('.mapButton').parent().hide();
      $('.backendButton').parent().show();

      $('#map-wrapper').animate({
        right: 0,
        left:0
      }, 'slow') ;
    }

  });

/*==-==*/
dojo.provide('FrontendApp');

var FrontendRouter = Backbone.Router.extend({
    routes: {
    "": "hidePanel",
      "omegazone/:name/:panel": "loadPanel",
    "login/": "login",
    "signup/": "register",
    "resetpassword/:username/:ttl/:otp/": "resetpassword"
    },

  login: function(){
    window.auth.showLogin();
  },

  register: function(){
    window.auth.showRegister();
  },

  resetpassword: function(username, ttl, otp){
    $('#resetpassword').find('#username').val(username) ;
    $('#resetpassword').find('#ttl').val(ttl) ;
    $('#resetpassword').find('#otp').val(otp) ;

    window.auth.showResetpassword();
  },

  initialize: function(){
    window.panel = new Panel();
    window.panel.hidden = true ;

    window.auth = new AuthView();

    window.alert = new Alert();
    // $(document).ajaxError(function() {
    //  window.alert.error('You don\'t have rights for this action!') ;
    // });

    window.map = new Map({el: $('body')});
    document.baseTitle = '4k | Interactive map' ;

    $(window).resize(function(){
      $('.scrollable').css('height', 'auto');
    }) ;
  },

  hidePanel: function(){
    if(!window.panel.hidden) {
      window.panel.hide();
    }
  },

  loadPanel: function(nameOrMappoint, panel, userdataID){
    dojo.addOnLoad(function(){
      window.statFields.push("Zone_Name") ;
      window.statFields.push("Cnty_Name") ;
      window.statFields.push("WorldID") ;
      window.statFields.push("City_Name") ;

          query = new esri.tasks.Query();
          query.outFields = window.statFields ;
      if(typeof nameOrMappoint == 'object'){
        query.geometry = nameOrMappoint ;
        var needsMappoint = false ;
      }
      else{
        var needsMappoint = true ;
        query.where = "Zone_Name = '"+nameOrMappoint.replace('_', ' ')+"'";
      }
      queryTask = new esri.tasks.QueryTask("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap1a/MapServer/2") ;
      queryTask.execute(query, function(d){
        if(d.features.length > 0){
          var data = d.features[0].attributes ;

          document.title = document.baseTitle + ' | ' + data.Zone_Name

          $('#panel').attr('world-id', data.WorldID) ;

          $('#panel').find('#title h1').html(data.Zone_Name) ;
          $('#panel').find('#title h2').html(data.Cnty_Name) ;

          $('#panel').find('.statsButton').attr('href', '#omegazone/'+data.Zone_Name.replace(' ', '_')+'/stats/') ;
          $('#panel').find('.userdataButton').attr('href', '#omegazone/'+data.Zone_Name.replace(' ', '_')+'/userdata/') ;

          if(window.currentUser != null){
            // $('#panel').find('#followButton').show();

            $.getJSON(
              'notificationsUsers/getByWorldId/'+data.WorldID,
              function(d){
                if(d == false){
                  $('#panel').find('#followButton').removeClass('highlighted');
                  $('#panel').find('#followButton .buttonCenter').html('Follow');
                }
                else{
                  $('#panel').find('#followButton').addClass('highlighted');
                  $('#panel').find('#followButton .buttonCenter').html('Following');
                }
              }) ;
          }

          $.each(window.statFields, function(i){
            if($('#'+this).hasClass('type-percentage')){
              var percent = Math.round(parseFloat(data[this] * 100)) ;
              $('#'+this).find('.number').html(percent + '%') ;
              $('#'+this).find('.ui-progressbar-value').animate({
                width: percent+'%'
              }, 'slow') ;
            }
            else{
              $('#'+this).find('.number').html(data[this]) ;
            }
          });

          window.panel.loadUserdata();

          if(panel == 'stats'){
            window.panel.showStats();
          }
          if(panel == 'userdata'){
            window.panel.showUserdata();
          }

          if(window.panel.hidden) {
            window.panel.show();
          }

          if(needsMappoint){
            window.map.search(data.Zone_Name, data.Cnty_Name) ;
          }
          else{
                if(window.map.esriMap.getLevel() < 3) {
              window.map.esriMap.centerAndZoom(nameOrMappoint,6);
            }
            else{
              window.map.esriMap.centerAndZoom(nameOrMappoint,window.map.esriMap.getLevel()) ;
            }
          }
          window.frontendRouter.navigate('omegazone/'+data.Zone_Name.replace(' ', '_')+'/'+window.panel.currentPanel) ;

          window.alert.hide();
        }
        else{
          window.panel.hide();
          window.alert.error('No data found');
        }
      }) ;
    });


    return false ;
  }
});
/*==-==*/
