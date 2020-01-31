var fc_1 = ee.FeatureCollection(pivo_1);
var fc_2 = ee.FeatureCollection(pivo_2);
var fc_3 = ee.FeatureCollection(pivo_3);

// set the map view and zoom, and add watershed to map
Map.centerObject(fc_2,14);
Map.addLayer(fc_2, {}, 'Pivo');


// load all Landsat 8 SR image within polygon boundary for last year

var pivo_2016 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
          .filterBounds(fc_3)
          .filterMetadata('CLOUD_COVER', 'less_than', 20)
          .filterDate('2016-04-01', '2016-07-31');

var pivo_2017 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
          .filterBounds(fc_3)
          .filterMetadata('CLOUD_COVER', 'less_than', 20)
          .filterDate('2017-04-01', '2017-07-31');

 
var pivo_2018 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
          .filterBounds(fc_3)
          .filterMetadata('CLOUD_COVER', 'less_than', 20)
          .filterDate('2018-04-01', '2018-07-31');

var pivo_2019 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
          .filterBounds(fc_3)
          .filterMetadata('CLOUD_COVER', 'less_than', 20)
          .filterDate('2019-04-01', '2019-07-31');
// -----------------------------------------------------------------
// Calculate NDVI as a New Band
// -----------------------------------------------------------------

// create function to add NDVI using NIR (B5) and the red band (B4)w
var getNDVI = function(image){
  return image.addBands(image.normalizedDifference(['B5','B4']).rename('NDVI'));
};


// map over image collection
var pivo_2016_ndvi = pivo_2016.map(getNDVI);
var pivo_2017_ndvi = pivo_2017.map(getNDVI);
var pivo_2018_ndvi = pivo_2018.map(getNDVI);
var pivo_2019_ndvi = pivo_2019.map(getNDVI);

// ---------------------------------------------------------------------
// Make a "Greenest Pixel" Composite for ROI
// ---------------------------------------------------------------------

// for each pixel, select the "best" set of bands from available images
// based on the maximum NDVI/greenness
var pivo_2016_composite = pivo_2016_ndvi.qualityMosaic('NDVI').clip(fc_3)
var pivo_2017_composite = pivo_2017_ndvi.qualityMosaic('NDVI').clip(fc_3);
var pivo_2018_composite = pivo_2018_ndvi.qualityMosaic('NDVI').clip(fc_3);
var pivo_2019_composite = pivo_2019_ndvi.qualityMosaic('NDVI').clip(fc_3);

// how many images?
// how many bands?

// Define a color palette for NDVI
var ndviPalette = ['FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
              '74A901', '66A000', '529400', '3E8601', '207401', '056201',
              '004C00', '023B01', '012E01', '011D01', '011301'];

// Visualize NDVI composite 
Map.addLayer(pivo_2016_composite.select('NDVI'),NDVI_2018_2, '2016');
Map.addLayer(pivo_2017_composite.select('NDVI'),NDVI_2018_2, '2017');
Map.addLayer(pivo_2018_composite.select('NDVI'),NDVI_2018_2, '2018');
Map.addLayer(pivo_2019_composite.select('NDVI'),NDVI_2018_2, '2019');

// Resultante


var resultante = (pivo_2016_composite.select('NDVI').add(pivo_2017_composite.select('NDVI'))
                .add(pivo_2018_composite.select('NDVI')).add(pivo_2019_composite.select('NDVI'))).divide(4)
                

                
Map.addLayer(resultante.select('NDVI'),NDVI_2018_2, 'Resultante');

// ---------------------------------------------------------------
// Visualize Data in a Chart
// ---------------------------------------------------------------


var minDictionary = pivo_2016_composite.select('NDVI').reduceRegion({
  reducer: ee.Reducer.min(),
  geometry: pivo_1,
  scale: 30,
  maxPixels: 1e9
});
print(minDictionary)

var maxDictionary = pivo_2016_composite.select('NDVI').reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: pivo_1,
  scale: 30,
  maxPixels: 1e9
});
print(maxDictionary)

var meanDictionary = pivo_2016_composite.select('NDVI').reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: pivo_1,
  scale: 30,
  maxPixels: 1e9
});
print(meanDictionary)

var varDictionary = pivo_2016_composite.select('NDVI').reduceRegion({
  reducer: ee.Reducer.variance(),
  geometry: pivo_1,
  scale: 30,
  maxPixels: 1e9
});
print(varDictionary)

var stdDictionary = pivo_2016_composite.select('NDVI').reduceRegion({
  reducer: ee.Reducer.stdDev(),
  geometry: pivo_1,
  scale: 30,
  maxPixels: 1e9
});
print(stdDictionary)

// Make the histogram, set the options.
//var histogram = ui.Chart.image.histogram(pivo_2016_composite.select('NDVI'), pivo_1, 30)
//    .setSeriesNames(['NDVI'])

// Display the histogram.
//print(histogram);