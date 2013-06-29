dojo.provide('Notification');

var Notification = Backbone.View.extend({
	el: '#notification',
	
	initialize: function(){
		this.timers = [] ;
		this.hide();
	},
	
	hide: function(){
		$(this.el).fadeOut('fast', this.reset());
	},
	
	reset: function(){
		$(this.el).find('.ui-icon').hide();
		$(this.el).find('p.msg').html() ;
		
		$.each(this.timers, function(k, v){
			clearTimeout(v) ;
		});
	},
		
	setMsg: function(msg){
		$(this.el).find('p.msg').html(msg) ;
		
		var total_height = $(this.el).find('p.msg').height() ;
		if(total_height == 0) total_height = 17 ; //but don't tell the others.
		$(this.el).find('.icon').height(total_height) ;
		
		var icon_height = $(this.el).find('.ui-icon').height() ;
		$(this.el).find('.ui-icon').animate({
			marginTop: (total_height-icon_height)/2
		}) ;
	},
	
	load: function(){
		this.reset();
		
		$(this.el).find('.loader').show();
		this.setMsg('Loading') ;
		
		this.show();
		
		var msgs = {
			'5000': 'Still loading',
			'10000': 'Patience is a fruit of the spirit',
			'15000': 'Taking longer than expected',
			'20000': 'Sorry for the inconvenience', 
			'45000': 'We\'re actually trying to have it loaded before Jesus comes back.',
			'60000': 'Try to refresh the page or keep on waiting for the world to change.<br><div style="overflow:none;height:30px;"><iframe width="210" height="30" src="http://www.youtube.com/embed/3Wn8L4rItpk?rel=0&autoplay=1#t=5" frameborder="0" allowfullscreen></iframe></div>',
			'264000': 'Fun eh? <br>Seriously though, refresh this page. It\'s not happening anymore.'
		} 
		
		var timers = [] ;
		var timer ;
		$.each(msgs, function(time, msg){
			timer = setTimeout(function(){
				window.notifications.setMsg(msg) ;
			}, time) ;
			timers.push(timer) ;
		});
		this.timers = timers ;
	},
	
	info: function(msg){
		this.reset();
		
		$(this.el).find('.ui-icon-info').show();
		this.setMsg(msg) ;
		
		this.show();
		
		var timer = setTimeout(function(){
			window.notifications.hide();
		}, 5000) ;
		this.timers.push(timer) ; 
	},
	
	error: function(msg){
		this.reset();
		
		$(this.el).find('.ui-icon-alert').show();
		this.setMsg(msg) ;
		
		this.show();
		
		var timer = setTimeout(function(){
			window.notifications.hide();
		}, 5000) ;
		this.timers.push(timer) ; 
	},
	
	show: function(){
		$(this.el).fadeIn();
	}
});
