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
								odd: 	(index%2),
								name: 	this
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
									odd: 	(index%2),
									group_id: this.group_id,
									category: category,
									name: 	this.name,
									type: 	this.type,
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
								// 	this.select();
								// }) ;
							}) ;
						});

						$('.category').click(function(){
							$('.'+$(this).attr('id')).slideToggle() ;
							$(this).find('.arrow').toggle() ;
						}) ;
						
						// if(userdataID){
						// 	var id = '#userdata-'+userdataID ;
						// 	$('#userDataList').append($(id).parent()) ;
						// 	$(id).click();
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
