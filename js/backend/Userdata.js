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