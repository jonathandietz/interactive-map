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