// Weekly json
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
// Hourly json
// var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

// GET request to the query URL
d3.json(queryUrl, function(data) {
    // send data.features object to createFeatures function
    createFeatures(data.features);
});
// function to change marker size depending on the magnitude
function markerSize(magnitude) {
    return magnitude * 40000;
};
// function to assign different colors depending on magnitude value
function getColor(mag) {
    return mag > 5 ? '#ff0000':
        mag > 4 ? '#ff8000':
        mag > 3 ? '#ffbf00':
        mag > 2 ? '#ffff00':
        mag > 1 ? '#bfff00':
        '#00ff40';   
}
function createFeatures(earthquakeData) {
    // Define a function we want to run once for each feature in the features array
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>" + "Magnitude: " + feature.properties.mag + "</h3><hr><h4>" + feature.properties.place + "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
    // create markers dependant on magnitudes
    pointToLayer: function(feature, latlng) {
        return new L.circle(latlng, {
            radius: markerSize(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: 0.5,
            color: 'black',
            weight: 0.5 
        })
    }

  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};


function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });
  
    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.dark",
      accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.outdoors",
      accessToken: API_KEY
    });
  
    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Dark Map": darkmap,
      'Terrain Map': outdoors
    };
  
    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 3,
      layers: [outdoors, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
    var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
      var div = L.DomUtil.create('div','info legend'),
        grades = [0,1,2,3,4,5],
        labels = [];
    //loop through the getColor function to generate labels
    for (var i=0; i<grades.length; i++){
        div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  }
  legend.addTo(myMap)
};

  