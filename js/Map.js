firstRun = true;
	var Map = Backbone.View.extend({
		el: 'body',

		events: {
			"keypress #search": "searchSubmit",
			'click .mapButton': 'show',
			'click .showAvailableLayersButton': 'showAvailableLayers',
			'click .addLayerButton': 'addLayer',
			'click .removeLayer': 'removeLayer',
			'click .switchBasemap': 'switchBasemap',
			'click .reportButton': 'toggleReport',
			'submit #report': 'report'
		},

		toggleReport: function(){
			if($('#report').css('bottom') != '0px'){
				$('#reportButton').animate({
					bottom: '-23px'
				}, 'normal', function(){
					$('#report').animate({
						bottom: '0px'
					}) ;
				});
			}
			else{
				$('#report').animate({
					bottom: '-300px'
				}, 'normal', function(){
					$('#reportButton').animate({
						bottom: '0px'
					}) ;
				});
			}
		},

		report: function(){
			$.ajax({
				url: 'userdata/report',
				type: 'post',
				data: $('#report').serializeArray(),
				success: function(d){
					if(d == 'success'){
						window.alert.info('Report send! Thanks!') ;
						window.map.toggleReport();
					}
				}
			}) ;

			return false ;
		},

		initialize: function(){
			window.alert.load() ;

			dojo.addOnLoad(function(){
				esriConfig.defaults.map.slider = { left:"30px", top:"30px", width:null, height:"200px" };
				esriConfig.defaults.map.sliderLabel = null;

				var initExtent = new esri.geometry.Extent({"xmin":-11584184.510671832,"ymin":-6594375.304216977,"xmax":11818999.06156405,"ymax":12132085.129419927,"spatialReference":{"wkid":102100}});
				window.map.esriMap = new esri.Map("map", {
					extent: initExtent,
					wrapAround180:true,
					width:'100%',
					height:'100%',
					logo:false
				});

				//Customizable basemap. Choices between imagary, terrain, open street map
			    var Imagery = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/");
		        window.map.esriMap.addLayer(Imagery);

				var Terrain = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/");
				Terrain.visible = false ;
				window.map.esriMap.addLayer(Terrain);

				var Street = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/");
				Street.visible = false ;
				window.map.esriMap.addLayer(Street);

				//Adding omegazone lines
				var omegaZones = new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap1a/MapServer");
				window.map.esriMap.addLayer(omegaZones);
				window.map.topLayer = omegaZones = omegaZones.id ;

				dojo.connect(window.map.esriMap, 'onLoad', function(){
					window.map.searchAlternative = null ;
			        window.map.locator = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/ESRI_Places_World/GeocodeServer");
			        dojo.connect(window.map.locator, "onAddressToLocationsComplete", window.map.searchDone);

					$(window).resize(function(){window.map.esriMap.resize();});
					dojo.connect(window.map.esriMap, 'onZoomEnd', function(e, zF, a, l){$('#slider').slider('value', l)}) ;
					dojo.connect(window.map.esriMap, 'onClick', window.map.loadPanel) ;
          dojo.connect(window.map.esriMap,"onUpdateStart",function(){window.alert.load();});
	        dojo.connect(window.map.esriMap,"onUpdateEnd",function(){window.alert.hide();});


				}) ;

			}) ;
		},

		loadPanel: function(e){
			window.frontendRouter.loadPanel(e.mapPoint) ;
		},

		searchSubmit: function(e){
			if (e.keyCode != 13) return;
			this.search($('#search').val());
			window.panel.hide();

			return false ;
		},

		search: function(q, a){
			window.alert.load() ;

			if(a) this.searchAlternative = a ;

			dojo.addOnLoad(function(){
				var place = {PlaceName: q}
				window.map.locator.addressToLocations(place);
			});
		},

		searchDone: function(candidates) {
			dojo.addOnLoad(function(){
				if(candidates[0]){
		            geom = esri.geometry.geographicToWebMercator(candidates[0].location);
			        window.map.esriMap.centerAndZoom(geom,6);
					window.map.searchAlternative = null ;
				}
				else{
					if(window.map.searchAlternative){
						window.map.search(window.map.searchAlternative) ;
						window.map.searchAlternative = null ;
					}
					else{
						window.map.alert.error('Place not found') ;
					}
				}
			});
		},

		showAvailableLayers: function(){


			if(firstRun) {

				var layers = [] ;
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap2a/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap2b/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3a/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3b/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3c/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3d/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap3e/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4a/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4b/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4c/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4d/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4e/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap4f/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5a/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5b/MapServer"));
					layers.push(new esri.layers.ArcGISDynamicMapServiceLayer("http://maps.mapfactory.org/ArcGIS/rest/services/YWAM/4kWorldMap5c/MapServer"));

					$.each(layers, function(index){
						var layer = window.map.esriMap.addLayer(this) ;

						dojo.connect(this, 'onLoad', function(){
							layer.setVisibleLayers([-1]);

							$.each(layer.layerInfos, function(index){
								var tmpl = _.template($('#layers-available-layer-template').html());
								$('#availableLayers').append(tmpl({
									layer_id: layer.id,
									name: this.name,
									sublayer_id: index
								})) ;
							}) ;
						}) ;
					}) ;

			}
			firstRun = false;

			$('#layers .showAvailableLayersButton').animate({
				marginLeft:-100
			}) ;

			$('#availableLayers').animate({
				left: 0
			}) ;
		},

		hideAvailableLayers: function(){
			$('#layers .showAvailableLayersButton').animate({
				marginLeft:0
			}) ;

			$('#availableLayers').animate({
				left: -260
			}) ;

		},

		addLayer: function(e){
			var hideAvailableLayers = this.hideAvailableLayers ;

			var layer_el = $(e.target).parent();
			var ids = $(layer_el).attr('id').split('-') ;

			var layer_id = ids[0] ;
			var sublayer_id = ids[1] ;
			var name = $(layer_el).find('p').html();

			var tmpl = _.template($('#layers-visible-layer-template').html());
			$('#visibleLayers').prepend(tmpl({
				layer_id: ids[0],
				name: $(layer_el).find('p').html(),
				sublayer_id: ids[1]
			})) ;

			$(layer_el).animate({
				marginLeft:-240
			}, function(){
				$(layer_el).remove()

				//Let's make the actual layer visible...
				window.alert.load();
				dojo.connect(window.map.esriMap._layers[layer_id], 'onUpdate', function(){window.alert.hide();}) ;

				window.map.esriMap._layers[layer_id].setVisibleLayers([sublayer_id]) ;
				window.map.esriMap._layers[layer_id].setOpacity(0.30);
				window.map.esriMap.reorderLayer(window.map.topLayer, 100) ;

				$('#'+ids[0]+'-'+ids[1]).animate({
					marginLeft:0
				}, function(){
					hideAvailableLayers();
				}) ;
			}) ;
		},

		removeLayer: function(e){
			var hideAvailableLayers = this.hideAvailableLayers ;

			var layer_el = $(e.target).parent();
			var ids = $(layer_el).attr('id').split('-') ;

			var layer_id = ids[0] ;
			var sublayer_id = ids[1] ;
			var name = $(layer_el).find('p').html();

			var tmpl = _.template($('#layers-available-layer-template').html());
			$('#availableLayers').append(tmpl({
				layer_id: ids[0],
				name: $(layer_el).find('p').html(),
				sublayer_id: ids[1]
			})) ;

			$(layer_el).animate({
				marginLeft:-240
			}, function(){
				$(layer_el).remove()

				//Let's make the actual layer invisible...
				window.alert.load();
				dojo.connect(window.map.esriMap._layers[layer_id], 'onUpdate', function(){window.alert.hide();}) ;

				window.map.esriMap._layers[layer_id].setVisibleLayers([-1]) ;
				window.map.esriMap.reorderLayer(window.map.topLayer, 100) ;

				$('#'+ids[0]+'-'+ids[1]).animate({
					marginLeft:0
				}, function(){
					hideAvailableLayers();
				}) ;
			}) ;
		},

		switchBasemap: function(e){
			window.alert.load();
			dojo.connect(window.map.esriMap._layers[e.target.id], 'onUpdate', function(){window.alert.hide();});
			$.each(['layer0', 'layer1', 'layer2'], function(){
				if(this == e.target.id){
					window.map.esriMap._layers[e.target.id].setVisibility(true) ;
				}
				else{
					window.map.esriMap._layers[this].setVisibility(false) ;
				}
			}) ;
		},

		hide: function(){
			window.panel.hide();

			$('#map-wrapper').animate({
				right: $('#map-wrapper').width(),
				left:$('#map-wrapper').width()*-1
			}, 'slow', function(){
				$('#auth-wrapper .mapButton').animate({
					left:0
				}) ;
			}) ;
		},

		show: function(speed){
			$('#accountOptions').slideUp() ;

			$('.mapButton').parent().hide();
			$('.backendButton').parent().show();

			$('#map-wrapper').animate({
				right: 0,
				left:0
			}, 'slow') ;
		}

	});
