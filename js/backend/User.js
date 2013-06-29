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