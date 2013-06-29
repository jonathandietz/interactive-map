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
