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