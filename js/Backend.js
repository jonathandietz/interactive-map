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