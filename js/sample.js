var neighborhood = {
    locations: [{
            location: {
                lat: 50.7374,
                lng: 7.0982
            },
            title: 'Bonn',
            formatted_address: "Bonn, Germany",
            place_id: "ChIJSdrLfJ_hvkcRF5ZcaMb424Y",
        },
        {
            location: {
                lat: 52.5200,
                lng: 13.4050
            },
            title: 'Berlin',
            formatted_address: "Berlin, Germany",
            place_id: "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
        },
        {
            location: {
                lat: 50.1109,
                lng: 8.6821
            },
            title: 'Frankfurt',
            formatted_address: "Frankfurt, Germany",
            place_id: "ChIJxZZwR28JvUcRAMawKVBDIgQ",
        },
        {
            location: {
                lat: 50.9375,
                lng: 6.9603
            },
            title: 'Cologne',
            formatted_address: "Cologne, Germany",
            place_id: "ChIJ5S-raZElv0cR8HcqSvxgJwQ",
        },
        {
            location: {
                lat: 51.0504,
                lng: 13.7373
            },
            title: 'Dresden',
            formatted_address: "Dresden, Germany",
            place_id: "ChIJqdYaECnPCUcRsP6IQsuxIQQ",
        },
        {
            location: {
                lat: 51.3397,
                lng: 12.3731
            },
            title: 'Leipzig',
            formatted_address: "Leipzig, Germany",
            place_id: "ChIJcywPIBj4pkcRUvW0udKA35M",
        },
        {
            location: {
                lat: 49.3988,
                lng: 8.6724
            },
            title: 'Heidelberg',
            formatted_address: "Heidelberg, Germany",
            place_id: "ChIJzdzMDgXBl0cR1zokRADq5u8",
        },
        {
            location: {
                lat: 50.9795,
                lng: 11.3235
            },
            title: 'Weimar',
            formatted_address: "Weimar, Germany",
            place_id: "ChIJqVvtMcYapEcRQDYzdMGOIAQ",
        },
        {
            location: {
                lat: 51.2277,
                lng: 6.7735
            },
            title: 'Dusseldorf',
            formatted_address: "Düsseldorf, Germany",
            place_id: "ChIJB1lG8XvJuEcRsHMqSvxgJwQ",

        },
        {
            location: {
                lat: 52.3906,
                lng: 13.0645
            },
            title: 'Potsdam',
            formatted_address: "Potsdam, Germany",
            place_id: "ChIJt9Y6hM31qEcRm-yqC5j4ZcU",
        },
        {
            location: {
                lat: 51.4556432,
                lng: 7.0115552
            },
            title: 'Essen',
            formatted_address: "Essen, Germany",
            place_id: "ChIJOfarlrfCuEcRnSytpBHhAGo",
        }
    ]
};

// location model to hold data for each location
var locationModel = function(loc) {
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
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
    });
};

// viewModel provides data binding using knockout
var map;
var viewModel = function() {
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
        self.locations.push(new locationModel(location));
    });
    this.currentLocation = ko.observable(this.locations()[0]);

    this.infoWindow = new google.maps.InfoWindow();
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

    map.fitBounds(bounds);

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
        }, 750);
    }
    // attach marker to infoWindow and setting content and click event from infowindow
    function populateInfoWindow(marker) {
        self.infoWindow.marker = marker;
        self.infoWindow.setContent(marker.infoWindowContent);
        self.infoWindow.open(map, marker);
        ko.cleanNode($('.btn-modal-image')[0]);
        ko.applyBindings(model, $('.btn-modal-image')[0]);
    }
    // handle button click event inside infowindow
    this.showModal = function() {
        var marker = self.currentLocation().marker;
        self.modalVisible(true);
    };
};

var model;
var initApp = function() {
    model = new viewModel();
    ko.applyBindings(model);
};