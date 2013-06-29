//Needs prettifying
var firstViewOffset = 240 ;
var secondViewOffset = 540 ;
var thirdViewOffset = 841 ;

dojo.provide('Field');
dojo.provide('FieldCollection') ;
dojo.provide('FieldView');

var FieldCollection = Backbone.Collection.extend({
	url: 'fields/'
}) ;

var Field = Backbone.Model.extend({
    url : 'fields/',

	initialize: function(){
		this.bind('error', function(m, error){
			if(!error) error = 'Something went wrong, please try again!'
			window.alert.error(error) ;
			
			return false ;
		});
	}
}) ;

var FieldView = Backbone.View.extend({
	el: 'body',
	
	events: {
		'click .fieldsButton': 'showList',
		'click .addFieldButton': 'showEditField',
		'click .editFieldButton': 'showEditField',
		'click .editField': 'editField'
	},
	
	currentFieldIndex: undefined,
	
	showList: function(e){		
		window.backend.hideAll() ;
		
		window.backend.fieldList.fetch({
			success:function(r){
				$('#fields').find('li').remove();
				listTemplate = _.template($('#template-field-list-item').html()) ;
				
				$.each(r.models, function(index){
					$('#fields').find('ul').append(listTemplate({
						name:  this.attributes.Field.name,
						index: index
					})) ;
				}) ;
				
				$('#fields').animate({left:firstViewOffset}, function(){$('#fields .content ul').scrollbar();}) ;
			}
		})
	},
	
	showEditField: function(e){
		window.backend.hideSecond() ;
		
		$('#editField').find('#type').change(function(){
			if($(this).val() == 'rate'){
				$('#editField').find('#rate, label[for=rate]').fadeIn();
			}
			else{
				$('#editField').find('#rate, label[for=rate]').fadeOut();
			}
		}) ;
		
		$('#editField').find('#rate, label[for=rate]').hide().val('') ;
		
		this.currentFieldIndex = undefined ;
		if($(e.target).hasClass('editFieldButton')) { 
			this.currentFieldIndex = e.target.id ; 
			
			var field = window.backend.fieldList.at(this.currentFieldIndex) ;

			$('#editField').find('h2').html('Edit '+field.attributes.Field.name) ;
			$('#editField').find('#name').val(field.attributes.Field.name) ;
			$('#editField').find('#fieldName').val(field.attributes.Field.field_name) ;
			$('#editField').find('#description').val(field.attributes.Field.description) ;

			$('#editField').find('#type').find('option[value='+field.attributes.Field.type+']').attr('selected', 'selected');
			if(field.attributes.Field.type == 'rate'){
				$('#editField').find('#rate, label[for=rate]').show().val(field.attributes.Field.rate) ;
			}
		}
		else{
			$('#editField').find('h2').html('Add new field') ;
			
			$('#editField').find('#name').val('') ;
			$('#editField').find('#fieldName').val('') ;
			$('#editField').find('#description').val('') ;

			$('#editField').find('#type').find('option[value=number]').attr('selected', 'selected');
			
		}
		
		$('#editField').animate({left:secondViewOffset}) ;
	},
	
	editField: function(){
		var field = new Field() ;
		
		var d = {
			name: $('#editField').find('#name').val(),
			field_name: $('#editField').find('#fieldName').val(),
			description: $('#editField').find('#description').val(),
			type: $('#editField').find('#type').val(),
			rate: $('#editField').find('#rate').val()
		} ;
		
		if(this.currentFieldIndex) { 
			var field = window.backend.fieldList.at(this.currentFieldIndex) ;
			d.id = field.attributes.Field.id ; 
		}
		
		var showList = this.showList ;
		
		field.save(d, {
			success: function(){
				window.alert.info('Saved field') ;
				window.backend.hideSecond() ;
				
				showList() ;
			}
		}) ;
	}
	
});