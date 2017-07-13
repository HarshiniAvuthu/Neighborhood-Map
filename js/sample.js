// location model to hold data for each location
var LocationModel = function(loc) {
    var self = this;
    this.location = loc.location;
    this.title = loc.title;
    this.formatted_address = loc.formatted_address;
    this.place_id = loc.place_id;

    this.visible = ko.observable(true);

    var infoWindowContent = '<div class="infowindow-scroll">' +
        '<h3>' + this.title + '</h3>' +
        '<p>' + this.formatted_address + '</p>' +
        "Place ID: " + this.place_id + '</div>';

    // marker for the location
    this.marker = new google.maps.Marker({
        map: map,
        position: self.location,
        title: self.title,
        animation: google.maps.Animation.DROP,
        location: self.location,
        infoWindowContent: infoWindowContent
    });
    // if a location is visible, show the corresponding marker on map otherwise hide the marker
    this.showMarker = ko.computed(function() {
        if (self.visible() === true) {
            self.marker.setVisible(true);
        } else {
            self.marker.setVisible(false);
        }
    });
};

// viewModel provides data binding using knockout
var map;
var ViewModel = function() {
    var self = this;
    var bounds = new google.maps.LatLngBounds();
    // new google map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: {
            lat: 51.1657,
            lng: 10.4515
        }
    });
    // read locations and push into observableArray
    this.locations = ko.observableArray();
    neighborhood.locations.forEach(function(location) {
        self.locations.push(new LocationModel(location));
    });
    this.currentLocation = ko.observable(this.locations()[0]);
    
    this.infoWindow = new google.maps.InfoWindow(); // creating multiple 

    this.locations().forEach(function(location) {
        var marker = location.marker;
        if (self.infoWindow.marker != marker) {
            self.infoWindow.marker = marker;
            marker.addListener('click', function() {
                self.currentLocation(location);
                toggleBounce(this);
                populateInfoWindow(this);
            });
        }
        bounds.extend(marker.position);
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });

    // filteredLocations is locatins without filtering
    this.filteredLocations = this.locations;
    this.Query = ko.observable('');
    this.filteredLocations = ko.computed(function() {
        var q = self.Query().toLowerCase();
        map.fitBounds(bounds);
        return self.locations().filter(function(loc) {
            var result = loc.title.toLowerCase().indexOf(q) >= 0;
            loc.visible(result);
            return result;
        });
    });

    // whether search-list is visible through menu clickings
    this.menuVisible = ko.observable(true);
    this.toggleSearchList = function() {
        self.menuVisible(!self.menuVisible());
    };

    // function to handle when a list item is clicked
    this.listClick = function(clickedItem) {
        // update currentLocation when list item is clicked
        self.currentLocation(clickedItem);
        var marker = clickedItem.marker;
        map.setCenter(marker.getPosition());
        toggleBounce(marker);
        populateInfoWindow(marker);
    };
    // hide modal when close-button is clicked
    this.modalVisible = ko.observable(false);
    this.exitModal = function() {
        self.modalVisible(false);
    };
    // animation for marker when clicked, bounce only once (750ms)
    function toggleBounce(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
    // attach marker to infoWindow and setting content and click event from infowindow
    function populateInfoWindow(marker) {
        self.infoWindow.marker = marker;
        self.infoWindow.setContent(marker.infoWindowContent);
        self.infoWindow.open(map, marker);
    }
    // handle button click event inside infowindow
    this.showModal = function() {
        var marker = self.currentLocation().marker;
        self.modalVisible(true);
    };
};

var model;
var initApp = function() {
    model = new ViewModel();
    ko.applyBindings(model);
};

$(".hamburger").hide();
$(".cross").show();

$(".cross").click(function() {
    $(".list").slideToggle("slow", function() {
        $(".hamburger").show();
        $(".cross").hide();
    });
});

$(".hamburger").click(function() {
    $(".list").slideToggle("slow", function() {
        $(".cross").show();
        $(".hamburger").hide();
    });
});


var mapError = function() {
    document.getElementById('map-error').style.display = 'block';
    document.getElementById('map-error').innerHTML = 'Sorry, something went wrong. Please try again later.';
};