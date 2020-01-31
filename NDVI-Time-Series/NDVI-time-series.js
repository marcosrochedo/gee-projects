var app = function (image)
{
//Vegetation Index (NDVI)
var ndvi = image.normalizedDifference(['B5', 'B4']);
image = image.addBands(ndvi.rename('NDVI'));
return image;
}
var area =
    ee.Geometry(area_1);


var ic = ee.ImageCollection("LANDSAT/LC08/C01/T1_RT_TOA")
    .filterDate('2013-04-11', '2019-07-10');
// A polygon representing the roi.

var c = ic.filterBounds(area_1);

var withCloudiness = c.map(function(image) {
  var cloud = ee.Algorithms.Landsat.simpleCloudScore(image).select('cloud');
  var cloudiness = cloud.reduceRegion({
    reducer: 'mean', 
    geometry: area_1, 
    scale: 30,
  });
  return image.set(cloudiness);
});

var OLI = withCloudiness.filter(ee.Filter.lt('cloud', 15))
    .map(app)

                     
// Create an image time series chart.
 var chart = ui.Chart.image.series(OLI.select('NDVI'), area, ee.Reducer.mean(), 200);
   
 
  chart.setOptions({
    title: 'Vegetatin Index Time',
    vAxis: {title: 'Value'},
    hAxis: {title: 'date', format: 'MM-yy', gridlines: {count: 7}},
  });

// Add the chart to the map.
chart.style().set({
  position: 'bottom-right',
  width: '500px',
  height: '300px'
});

// Rampa de Cor
var palette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
               '74A901', '66A000', '529400', '3E8601', '207401', '056201',
               '004C00', '023B01', '012E01', '011D01', '011301'];
               

// Outline and center on the map.
var areaLayer = ui.Map.Layer(area, {color: 'FF0000'}, 'Área');

// Create a label on the map.
var label = ui.Label('Click a point on the chart to show the image for that date.');
Map.add(label);

// When the chart is clicked, update the map and label.
chart.onClick(function(xValue, yValue, seriesName) {
  if (!xValue) return;  // Selection was cleared.

  // Show the image for the clicked date.
  var equalDate = ee.Filter.equals('system:time_start', xValue);
  var image2 = ee.Image(OLI.filter(equalDate).first());
  var l8Layer = ui.Map.Layer(image2, {
    // Para visualizar mapa CRU do satélite
    //gamma: 1.3
    min: 0,
   //max:0.3
    max: 1,
    //   bands: ['B4', 'B3', 'B2']
    bands: ['NDVI'],
    //apagar palette
    palette: palette,
  });
  Map.layers().reset([l8Layer, areaLayer]);

  // Show a label with the date on the map.
  label.setValue((new Date(xValue)).toUTCString());
});

//Layers

Map.setCenter(-45.77147, -11.66619, 15);
Map.add(chart);
Map.addLayer(OLI.median(), {bands: 'B6,B5,B4'}, 'OLI');
Map.addLayer(OLI.median(), {min: 0, max: 1, bands:['NDVI'], palette: palette}, 'NDVI');
Map.layers().add(areaLayer);
