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
