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
		// 	window.alert.error('You don\'t have rights for this action!') ;
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