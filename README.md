## Neighborhood-Map

# Overview
This single page application shows a map identifying top picks in Delhi. This app is built for a Neighbourhood map project which is a part of the Front End Web Development Nanodegree at Udacity.

# Getting started
- Clone the repo to your local machine: $ git clone https://github.com/HarshiniAvuthu/Neighborhood-Map.git
- Launch a local http server to test: $ python -m SimpleHTTPServer
- In the same directory, run the commend: ./ngrok http 8080 to access a secure public URL to the site.

# Libraries, frameworks and APIs used
- Knockout JS
- Google Maps
- Foursquare
- JQuery

# How To Use
- Click on any marker on the map for more information 
- Type in the searchbar if you only want to see a few of the places listed on the map to make it easier to spot.
- You can click on any city listed in the list view

# Features
- Displaying map markers identifying cities near Germany and these locations are displayed by default when the page is loaded.
- Implemented a list view of the set of locations along with a search bar.
- Animated map marker when either the list item associated with it or the map marker itself is selected.
- An infoWindow will be opened when either a location is selected from the list view or its map marker is selected directly.
- Google maps and Forsquare errors are handled gracefully.
