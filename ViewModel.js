var map;

// initialize a map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 42.396573, lng: -71.123591},
	  zoom: 13
	});

	var bounds = new google.maps.LatLngBounds();

	// Activates knockout.js
	ko.applyBindings(new AppViewModel());

}

// create the viewmodel object and bind to the DOM
function AppViewModel() {
	var self = this;

	// create an array of location objects
    self.locations = [
      {title: 'Somerville Theatre', wikilink: 'Somerville_Theatre', location: {lat: 42.396849, lng: -71.123055}},
      {title: 'Harvard University', wikilink: 'Harvard_University', location: {lat: 42.377304, lng: -71.116692}},
      {title: 'Tufts University', wikilink: 'Tufts_University', location: {lat: 42.407952, lng: -71.119114}},
      {title: 'Porter Square', wikilink: 'Porter_Square', location: {lat: 42.389838, lng :-71.119355}},
      {title: 'Mount Auburn Cemetery', wikilink: 'Mount_Auburn_Cemetery', location: {lat: 42.378379, lng: -71.144705}},
      {title: 'Anna\'s Taqueria', wikilink: 'Anna%27s_Taqueria', location: {lat: 42.396235, lng: -71.122025}}
    ];

    self.locations_ko = ko.observableArray();
    self.keyword = ko.observable('');
    self.infobox = ko.observable('');
    self.markers = [];
    self.wikitext = ko.observable('');
    self.wikilink = ko.observable('');

    // this will hide all markers and text and then add anything that matches the query
    self.search = function() {
    	self.locations_ko.removeAll();
    	for (var i = 0; i < self.locations.length; i++) {
    		self.markers[i].setVisible(false);
    		self.infowindow.close();
    	}
    	for (var x in self.locations){
    		if(self.locations[x].title.toLowerCase().indexOf(self.keyword().toLowerCase()) >= 0){
    			self.locations_ko.push(self.locations[x]);
    			self.markers[x].setVisible(true);
    		}
    	}
    };

    // create a marker for each location object
	self.makeMarkers = function() {
		//alert("inner function"); 
	    for (var i = 0; i < self.locations.length; i++) {
    	self.marker = new google.maps.Marker({
          position: self.locations[i].location,
          map: map,
          title: self.locations[i].title,
          animation: google.maps.Animation.DROP,
          id: i
          });
          self.markers.push(self.marker);
          self.marker.addListener('click', function() {
              self.toggleBounce(this);
			  self.markerClicked(this);
  		  });

  		  
      };

      self.toggleBounce = function(m){
      	  m.setAnimation(google.maps.Animation.BOUNCE);
      	  setTimeout(function ()
          {
            m.setAnimation(null);
          }, 750); 
      }

    self.infowindow = new google.maps.InfoWindow({
    			content: "title"
  			});

    }

    // if the text on the lefthand side is clicked, pass the string to the markerClicked function
    self.clicked = function(value) {
    	for (var i = 0; i < self.markers.length; i++) {
    		if (value.title == self.markers[i].title){
    			self.markerClicked(self.markers[i]);
    		}
    	}
    };


    // populate the infowindow with the title of the marker
    // then query Wikipedia's API for info and display it
    self.markerClicked = function(marker){
    	self.infowindow.open(map, marker);
        self.infowindow.setContent(marker.title);

        self.infobox('loading...');
        
        var t = setTimeout(function(){
        	self.infobox('Failed to reach Wikipedia');
        }, 8000);

        var url = "http://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=" + marker.title;

        $.ajax({
		  dataType: "jsonp",
		  url: url,
		  data: "",
		  success: function(result){
		  	    clearTimeout(t);
		  	    var r = result.query.pages;
		  	    for (i in r){
		  	    	    if (r[i].extract){
		  	    	    	self.infobox(r[i].extract.substring(0, 800) + "...");
		  	    	        self.wikilink('https://en.wikipedia.org/wiki/' + marker.title);
		  	    	        self.wikitext('more');
		  	    	    }
		  	        }
		  		}
			})
    };

    self.makeMarkers();
    self.search();

}

// called if the request to the maps api fails
function googleError(){
	document.getElementById('map').innerHTML = "Error loading map and locations!";
}

