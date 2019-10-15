
// Layer Styles =======================================================
//1.well site style
var wellPointsStyle = {
    radius: 3,
    fillColor: '#ffeda0',
    color: "#f03b20",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
};
//2.county style
// var countyStyle = {
//     fillColor: 'balck',
//     color: '#cf1216',
//     weight: 4.5
// };
//3.tracts style
function getTractsColor(d) {
    return d > .5 ? '#810f7c' :
        d > .2  ? '#8856a7' :
            d > .1  ? '#8c96c6' :
                d > .05  ? '#b3cde3' :
                    '#edf8fb';
}
function tractsStyle(feature) {
    return {
        fillColor: getTractsColor(feature.properties.canrate),
        weight: 1,
        opacity: 1,
        color: 'rgba(211, 205, 205, 0.3)',
        fillOpacity: 0.65
    };
};
//4.interpolated nitrate surface style
function getIDWColor(d) {
    return d > 10 ? '#993404' :
        d > 5  ? '#d95f0e' :
            d > 3  ? '#fe9929' :
                d > 1   ? '#fec44f' :
                    d > 0  ? '#fee391' :
                        '#ffffd4';
}
function nitrateLevelStyle(feature) {
    return {
        fillColor: getIDWColor(feature.properties.nitr_ran),
        weight: 0.01,
        opacity: 1,
        fillOpacity: 0.8
    };
};
//5.error layer style
function getErrorColor(d){
    return d > .2 ? '#d7191c' :
        d > .15  ? '#fdae61' :
            d > .1  ? '#f7f7f7' :
                d > .05  ? '#b8e186' :
                    '#4dac26';
}

function errorLayerStyle(feature){
    return {
        fillColor: getErrorColor(feature.properties.regError),
        weight: 1,
        opacity: .5,
        color: 'rgba(211, 205, 205, 0.3)',
        fillOpacity: 0.85
    };
};
//end of layer style =======================================================

//add layer to map =======================================================
//1.create basemap layers
var darkGray = L.esri.basemapLayer('DarkGray'),
    streets = L.esri.basemapLayer('Streets');

//add data layers
// var countyLayer = L.esri.featureLayer({
//     url:'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/cancer_county/FeatureServer/0',
//     style:countyStyle
// });
// countyLayer.on('loading', function(e){
//     console.log("loading counties layer......")
// });
// countyLayer.on('load', function(e){
//     console.log("counties layer loaded.")
// });

//2.create census tracts layer which contains the cancer rate data
var censusTractsLayer = L.esri.featureLayer({
    url:'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/cancer_tracts_zl/FeatureServer/0',
    style:tractsStyle
});
censusTractsLayer.on('loading', function(e){
    console.log("loading census tracts layer......")
});
censusTractsLayer.on('load', function(e){
    console.log("census tracts layer loaded.")
})

//2.create well points layer which contains the nitrate data
var wellPointsLayer = L.esri.featureLayer({
    url:'https://services.arcgis.com/HRPe58bUyBqyyiCt/arcgis/rest/services/well_nitrate_zl/FeatureServer/0',
    pointToLayer: function(feature, latlng){
        return L.circleMarker(latlng, wellPointsStyle);
    }
});
wellPointsLayer.on('loading', function(e){
    console.log("loading well points layer......")
});
wellPointsLayer.on('load', function(e){
    console.log("well points layer loaded.")
})

//3.create a layer for interpolating nitrate level surface
var nitrateSurfaceLayer = L.geoJSON(null, {style:nitrateLevelStyle, onEachFeature:onEachFeatureN});
console.log("interploate layer created.")
//mouseover event for showing popup and unit properties
function onEachFeatureN(feature, layer){
    layer.on({
        mouseover: highlightFeatureN,
        mouseout: resetHighlightN
    });
}
function highlightFeatureN(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    //show nitrate value in popup for current mouseover hex
    var popup = L.popup({closeButton:false})
    .setLatLng(e.latlng) 
    .setContent('Nitrate level: ' + layer.feature.properties.nitr_ran.toFixed(3).toString())
    .openOn(map);
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
function resetHighlightN(e) {
    nitrateSurfaceLayer.resetStyle(e.target);
}
//4.create a layer for mapping the regression error
var errorLayer = L.geoJSON(null, {style: errorLayerStyle, onEachFeature:onEachFeatureE});
console.log("regression error layer created.")
//mouseover event for showing popup and unit properties
function onEachFeatureE(feature, layer){
    layer.on({
        mouseover: highlightFeatureE,
        mouseout: resetHighlightE
    });
}
function highlightFeatureE(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    //show nitrate value in popup for current mouseover hex
    var popup = L.popup({closeButton:false})
        .setLatLng(e.latlng) 
        .setContent('Nitrate Level: ' + layer.feature.properties.nitrateMean.toFixed(3).toString() + '<br>\
                    Cancer Rate: ' + layer.feature.properties.canrate.toFixed(3).toString() + '<br>\
                    Estimation Error: ' + layer.feature.properties.regError.toFixed(3).toString())
        .openOn(map);
    // console.log(layer.feature.properties.nitr_ran)
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
function resetHighlightE(e) {
    errorLayer.resetStyle(e.target);
}

//consolidate all layers
var baseMaps = {
    "DarkGray": darkGray,
    "Streets": streets
};
var overlayMaps = {
    // "County": countyLayer,
    "CancerTracts": censusTractsLayer,
    "NitrateWell": wellPointsLayer,
    "NitrateLevelSurface": nitrateSurfaceLayer,
    "RegressionError": errorLayer
}
//set the map center at Wisconsin
var map = L.map('map', {
    center: [44.8391, -90.89264],
    zoom: 6.5,
    layers: [darkGray, censusTractsLayer, nitrateSurfaceLayer, errorLayer]
});
//add all layers to the map
console.log("adding layers to map|||")
var layers = L.control.layers(baseMaps, overlayMaps).addTo(map);

//end of add layer to map =======================================================

//add legend to map =======================================================
var currentLegend;
var cancerTractsLegend = L.control({position: 'bottomright'});
function addLegend(){
    cancerTractsLegend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, .05, .1, .15, .2],
            labels = [];

        div.innerHTML = '<strong>Cancer Rate:</strong>' + '<br>';
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += 
                '<i style="background:' + getTractsColor(grades[i] + .05) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    //initialize legend with tracts data
    cancerTractsLegend.addTo(map);
    //get current legend content
    currentLegend = $(".legend")[0];
}
addLegend();

//update legend when interpolate layer calculated
function updateNitrateLevelLegend() {
	currentLegend.innerHTML = '';
	var grades = [0, 1, 3, 5, 10],
		labels = [];

    currentLegend.innerHTML = '<strong>Nitrate Level:</strong>: ' + '<br>';
	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
        currentLegend.innerHTML += 
			'<i style="background:' + getIDWColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}
};
//update legend when regression calculated
function updateRegressionErrorLegend() {
    currentLegend.innerHTML = '';
    var grades = [0, .05, .1, .15, .2],
		labels = [];

    currentLegend.innerHTML = '<strong>Estimation Error:</strong>' + '<br>';
	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
        currentLegend.innerHTML += 
			'<i style="background:' + getErrorColor(grades[i] + .05) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}
};
//end of legend =======================================================

//analysis =======================================================
var weightVal, cellSize;
var nitrateSurface;
//1.interpolation =====================
$('#interpolateBtn').click(async function (){
    $.blockUI({message:'<h1><img src="https://media.giphy.com/media/17mNCcKU1mJlrbXodo/giphy.gif" width="30" height="30"/> Interpolating... </h1>',
    css: { 
        border: 'none', 
        padding: '15px', 
        backgroundColor: '#000', 
        '-webkit-border-radius': '10px', 
        '-moz-border-radius': '10px', 
        opacity: .8, 
        color: '#fff'} 
    });

    await interploate();
    $.unblockUI();
    $(this).prop("disabled", true);
});

async function interploate(){
    //get featureCollection from nitrate well layer
    wellPointsLayer.query().run(function(error, featureCollection){
        if (error) {
            console.log(error);
            return;
        }
        //print the first well point to console for debugging purpose
//        console.log(featureCollection.features[0]);

        weightVal = parseInt(document.getElementById("kvalue").value);
        cellSize = parseInt(document.getElementById("cellsize").value);

        //set interpolate options
        var optiopns = {gridType: 'hex', property: 'nitr_ran', units: 'miles', weight: weightVal};
        console.log("options set. start interpolating...")

        //interpolate nitrate level surface using IDW
        nitrateSurface = turf.interpolate(featureCollection, cellSize, optiopns);
        console.log("complete interpolating...")
        
        //print the first feature in the nitrate surface layer for debugging purpose
        // console.log(nitrateSurface.features[0])
        console.log("nitrate surface created.")

        //add data to surface layer
        nitrateSurfaceLayer.addData(nitrateSurface);
        console.log("nitrate surface data added to layer.")
    });
    updateNitrateLevelLegend();
}

$('#regressionBtn').click(async function(){
    $.blockUI({message:'<h1><img src="https://media.giphy.com/media/17mNCcKU1mJlrbXodo/giphy.gif" width="30" height="30"/> Calculating...</h1>',
    css: { 
        border: 'none', 
        padding: '15px', 
        backgroundColor: '#000', 
        '-webkit-border-radius': '10px', 
        '-moz-border-radius': '10px', 
        opacity: .8, 
        color: '#fff'}
    });
    await aggregateCal();
    $.unblockUI();
    $(this).prop("disabled", true);
});

//2.regression =====================
//2.1aggregate nitrate level values to census tracts
var nitrateCentroids = [];
var aggregatedUnit;
async function aggregateCal(){
    //check if nitrateSurface is null
    if(nitrateSurface == null){
        console.log(nitrateSurface)
        return;
    }

    console.log("calculating nitrate centroid...")
    turf.featureEach(nitrateSurface, function(currentFeature, featureIndex){
        var centroid = turf.centroid(currentFeature);
        centroid.properties = {nitr_ran:currentFeature.properties.nitr_ran};
        nitrateCentroids.push(centroid);
    });
    
    // console.log(nitrateCentroids)

    console.log("aggregating nitrate mean to census tracts...")
    censusTractsLayer.query().run(function(error, featureCollection){
        aggregatedUnit = turf.collect(featureCollection, turf.featureCollection(nitrateCentroids), 'nitr_ran', 'nitr_ran');
        console.log("aggregated units calculated.")
        mapError(aggregatedUnit);
    }); 
};
//2.2 calculate linear regression function on data
function regressionCal(units){
    if(units == null){
        console.log(units)
        return;
    }
    console.log("perform linear regression...")
    console.log(units)

    var validUnits = [];
    turf.featureEach(units, function(currentFeature, featureindex){
        if(currentFeature.properties.nitr_ran.length > 0){
            var sum = 0;
            var counts = currentFeature.properties.nitr_ran.length;
            for (var i = 0; i < currentFeature.properties.nitr_ran.length; i++){
                sum += currentFeature.properties.nitr_ran[i];
            }
            var nitrateMean = sum/counts;

            //add aggregated nitrate value to unit as property
            currentFeature.properties.nitrateMean = nitrateMean;

            //add nitrate and cancer rate value pair within each unit to validUnits array
            validUnits.push([nitrateMean, currentFeature.properties.canrate]);
        }
    });
    console.log("Ready for regression calculation.")
    // var result = regression.linear(validUnits);

    //calculate regression result from validUnits array using simple statistics library
    var result = ss.linearRegression(validUnits);
    console.log(result)

    //return the regression result for mapping errors
    return result;
}
//2.3 calculate and map regression error
function mapError(units){
    var regressionResult = regressionCal(units);

    var m = regressionResult.m,
        b = regressionResult.b;

    //show the slope and intercept value of regression line
    $('#slope').append(m.toFixed(4));
    $('#intercept').append(b.toFixed(4));

    turf.featureEach(units, function(currentFeature, featureindex){
        //calculate the estimation for cancer rate
        var estCancerRate = Number(m * currentFeature.properties.nitrateMean + b).toFixed(2);
        //calculate the error absolute value within each unit
        var regressionError = Math.abs(Number(currentFeature.properties.canrate) - estCancerRate);
        //add the error value to properties
        currentFeature.properties.regError = regressionError;
        // console.log(regressionError)
    })

    //add calculated error data to error layer in the map
    errorLayer.addData(units);
    console.log("regression error data added to layer.")
    updateRegressionErrorLegend();
};
//end of analysis =======================================================
