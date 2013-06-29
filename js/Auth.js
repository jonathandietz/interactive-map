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