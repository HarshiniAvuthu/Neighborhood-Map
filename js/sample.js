var map;
var infowindow;

// location model to hold data for each location
var LocationModel = function(loc, markers) {
    var self = this;
    this.location = loc.location;
    this.title = loc.title;
    this.formatted_address = loc.formatted_address;
    this.place_id = loc.place_id;
    this.id = loc.id;
    this.content = "";
    this.visible = ko.observable(true);

    // marker for the location
    this.marker = new google.maps.Marker({
        map: map,
        position: self.location,
        title: self.title,
        animation: google.maps.Animation.DROP,
        id: self.id,
    });

    this.setContent = function() {
        if (this.content) {
            return this.content;
        }
        var topTips = [];
        var venueUrl = 'https://api.foursquare.com/v2/venues/' + this.place_id + '/tips?sort=recent&limit=5&v=20150609&client_id=GJGKB305BEZUYLZXVUPBLWHE5UD4WRXH2SV54BDXX412QGHT&client_secret=MH0A5CAVN14LFE3NNXJ211S4UQRA2LNDVDQM4A2HMQCVDPMZ';
        var that = this;

        $.getJSON(venueUrl, function(data) {
            data.response.tips.items.forEach(function(item) {
                topTips.push('<li>' + item.text + '</li>');
            });
        }).done(function() {
            that.content = '<h3>' + that.title + '</h3> <h4> Top tips: </h4>' + '<ol class="tips">' + topTips.join('') + '</ol>';
        });
    };

    // if a location is visible, show the corresponding marker on map otherwise hide the marker
    this.showMarker = ko.computed(function() {
        if (self.visible() === true) {
            self.marker.setVisible(true);
        } else {
            self.marker.setVisible(false);
        }
    });

    // function that opens infowindow when clicked on that particular marker.
    google.maps.event.addListener( this.marker, 'click', function() {
        markers.forEach( function(marker) {
            if (marker.marker.getAnimation() !== null) {
                marker.marker.setAnimation(null);
            }
        });
        this.setAnimation(google.maps.Animation.BOUNCE);
        infowindow.setContent('<div>' + markers[this.id - 1].content + '</div>');
        infowindow.open(map, this);
    });
};

// viewModel provides data binding using knockout
var ViewModel = function() {
    var self = this;
    var bounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow();
    // new google map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {
            lat: 28.7041,
            lng: 77.1025
        }
    });

    // read locations and push into observableArray
    this.locations = ko.observableArray();
    neighborhood.locations.forEach(function(location) {
        var myMarker = new LocationModel(location, self.locations());
        myMarker.setContent();
        self.locations.push(myMarker);
         bounds.extend(myMarker.marker.position);
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
        var marker = clickedItem.marker;
        map.setCenter(marker.getPosition());
        toggleBounce(marker);
        populateInfoWindow(marker);
    };
    // hide modal when close-button is clicked
    this.modelVisible = ko.observable(false);
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
        infowindow.setContent('<div>' + self.locations()[marker.id - 1].content + '</div>');
        infowindow.open(map, marker);
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