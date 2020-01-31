// Detector de Pivô Central de irrigação
//
// Princípio: Encontrar círculos na imagem de raio conhecido.

// Gradiente de cores NDVI.

var palette = [
  'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718',
  '74A901', '66A000', '529400', '3E8601', '207401', '056201',
  '004C00', '023B01', '012E01', '011D01', '011301'];

// ID das imagens referente aos anos em estudo.
// image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20130519');
// var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20140522');
// var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20150509');
// var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20160511');
// var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20170530');
var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20180602');
// var image = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_220068_20190520');

// Selecionando as bandas B5 e B4 da imagem carregada.
var ndvi = image.normalizedDifference(['B5','B4']);

// Traçando a geometria da coleção a partir de um shape file do estado da Bahia.
var bahia = ee.FeatureCollection('users/mpaulloalves/29MUE250GC_SIR');

// Filtrando metadados por vetores (Selecionando shape file do município)
var luisEduardo = bahia.filterMetadata('NM_MUNICIP', 'equals', 'LUÍS EDUARDO MAGALHÃES');

// Recorte da imagem de interesse
var ndvi = ndvi.clipToCollection(luisEduardo);

// Adicionando a camada para visualização gráfica na plataforma.
Map.addLayer(ndvi, {min: 0, max: 1, palette: palette}, 'Landsat NDVI');

// Operador Canny Edge Detector //
// Princípio: Detecta as bordas na imagem, discartando bordas de baixa intensidade.
// Parâmetros: limiar inferior: 0.25, limiar superior: 0.45, sigma: 0.53

var canny = ee.Algorithms.CannyEdgeDetector({image:ndvi, threshold:0.45, sigma:0.53});
canny = canny.gt(0.25);


// Transformada de Hough //
// Definindo o Raio médio dos pivôs centrais em metros (540m)
var farmSize = 540;
var circleKernel = ee.Kernel.circle(farmSize, 'meters');

// Criando um circulo de convolução de Raio 500-580 metros
var inner = ee.Kernel.circle(farmSize - 40, 'meters', false, -1);
var outer = ee.Kernel.circle(farmSize + 40, 'meters', false, 1);
var ring = outer.add(inner, true);

// Destacando os locais onde as bordas do recurso correspondem melhor ao kernel do círculo.
// Parâmetros: Raio: 500-580, Limiar: 0.45
var centers = canny.convolve(ring).gt(0.45).focal_max({kernel: circleKernel});
Map.addLayer(centers.updateMask(centers), {palette: '4285FF'}, 'Ring centers');

// Criando uma imagem binária para cálculo de área.
var binary_image = ee.Image(1).mask(centers.gte(1))
Map.addLayer(binary_image, {}, 'Binary Image', 0)
Map.centerObject(luisEduardo, 11)

// Calculando as áreas dos círculos detectados.
var area_pxa = binary_image.multiply(ee.Image.pixelArea()) 
                    .reduceRegion(ee.Reducer.sum(),certos_2017,30,null,null,false,1e13)
                    .get('constant')
                    
print ('Área usando o ee.Image.pixelArea (ha)', ee.Number(area_pxa).divide(10000))