//  Store our API endpoint inside queryUrl
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var faultLines = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url, function(data) {

    createFeatures(data.features);
  });

  function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>"+
        "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
          var color;
          var r = 250
          var g = Math.floor(250-30*feature.properties.mag);
          var b = Math.floor(250-10*feature.properties.mag);
          color= "rgb("+r+" ,"+g+","+b+")"
        
          var geojsonMarkerOptions = {
            radius: 4*feature.properties.mag,
            fillColor: color,
            color: "blue",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          };
          return L.circleMarker(latlng, geojsonMarkerOptions);
        }
      });
  
    createMap(earthquakes);
  }
  function createMap(earthquakes) {
    var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoiY2ZlcnJhcmVuIiwiYSI6ImNqaHhvcW9sNjBlMmwzcHBkYzk0YXRsZ2cifQ.lzNNrQqp-E85khEiWhgq4Q");
  
    var baseMaps = {
      "Satellite Map": satelliteMap
    };
  
    var faultLines =new  L.LayerGroup();
  
    var overlayMaps = {
      Earthquakes: earthquakes,
      Faultlines: faultLines
    };

    var myMap = L.map("map", {
      center: [41.881832, -87.62317],
      zoom: 2.5,
      layers: [satelliteMap]
    
    });

     d3.json(faultLines, function(earthquakeData) {
       L.geoJson(earthquakeData, {
         color: "blue",
         weight: 3
       })
       .addTo(faultLines);
     });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
    legend: true
  }).addTo(myMap);
  
  var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['Road Surface','Signage','Line Markings','Roadside Hazards','Other'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(myMap);
  }