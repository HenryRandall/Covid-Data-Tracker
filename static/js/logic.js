// Creating our initial map object
// We set the longitude, latitude, and the starting zoom level
// This gets inserted into the div with an id of 'map'
var myMap = L.map("map", {

    center: [45.8283, -108.5795],
    zoom: 3
});

L.tileLayer(

    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {

        tileSize: 512,
        maxZoom: 19,
        zoomOffset: -1,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    }
).addTo(myMap);


// Reference Data
var statelink = "static/data/stateborders.json";
var countylink = "static/data/countyborders.json";

// consolelog data
console.log(state_heatmap);
console.log(usa_heatmap);
console.log(county_heatmap);

// Hover over State
function hoverOverState(stateName) {
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
            break;
        }
    }
    return `${state_heatmap[index].state}\n
    Total Cases: ${state_heatmap[index].total_cases}
    Total Deaths: ${state_heatmap[index].total_deaths}
    Last Week's Cases: ${state_heatmap[index].lastweek_cases}
    This Week's Cases: ${state_heatmap[index].thisweek_cases}
    Cases per 100K people ${state_heatmap[index].per100k}
    Testing Positivity Rate ${state_heatmap[index].positive_rate}
    `;
}

// Hover over County
function hoverOverCounty(statefip, countyfip) {
    var fip = statefip + countyfip;
    for (var county in county_heatmap) {
        if (county_heatmap[county].fips == fip) {
            index = county;
            break;
        }
    }
    return `Total Cases: ${county_heatmap[index].total_cases}`;
}

// Choose County Colors
function chooseColorCounty(statefip, countyfip) {
    var maxcases = 0;
    var fip = statefip + countyfip;
    for (var county in county_heatmap) {
        if (county_heatmap[county].fips == fip) {
            index = county;
        }
        if (county_heatmap[county].per100k > maxcases) {
            maxcases = county_heatmap[county].per100k;
        }
    }
    var perc = (county_heatmap[index].per100k / maxcases) * 100;
    var r, g, b = 0;
    if (perc < 50) {
        g = 255;
        r = Math.round(5.1 * perc);
    }
    else {
        r = 255;
        g = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

// Choose State Colors
function chooseColorState(stateName) {
    var maxcases = 0;
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
        }
        if (state_heatmap[state].per100k > maxcases) {
            maxcases = state_heatmap[state].per100k;
        }
    }
    var perc = (state_heatmap[index].per100k / maxcases) * 100;
    var r, g, b = 0;
    if (perc < 50) {

        g = 255;
        r = Math.round(5.1 * perc);
    }
    else {
        r = 255;
        g = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

// Choose County Colors
function chooseColorCounty(statefip, countyfip) {
    var maxcases = 0;
    var fip = statefip + countyfip;
    for (var county in county_heatmap) {
        if (county_heatmap[county].fips == fip) {
            index = county;
        }
        if (county_heatmap[county].per100k > maxcases) {
            maxcases = county_heatmap[county].per100k;
        }
    }
    var perc = (county_heatmap[index].per100k / maxcases) * 100;
    var r, g, b = 0;
    if (perc < 50) {
        g = 255;
        r = Math.round(5.1 * perc);
    }
    else {
        r = 255;
        g = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

// Pulling in the State GeoJSON
var xhReq = new XMLHttpRequest();
xhReq.open("GET", statelink, false);
xhReq.send(null);
var stateborders = JSON.parse(xhReq.responseText);

// Pulling in the County GeoJSON
var xhReq = new XMLHttpRequest();
xhReq.open("GET", countylink, false);
xhReq.send(null);
var countyborders = JSON.parse(xhReq.responseText);

// County Map
var countymap = L.geoJson(countyborders, {
    style: function (feature) {
        return {
            color: "white",
            fillOpacity: 0.5,
            fillColor: chooseColorCounty(feature.properties.STATE, feature.properties.COUNTY),
            weight: 1.5
        };
    },

    onEachFeature: function (feature, layer) {
        layer.on({
            click: function (event) {
                myMap.fitBounds(event.target.getBounds());
            },
            mouseover: function (event) {
                event.target.setStyle({
                    fillOpacity: 0.9,
                });
            },
            mouseout: function (event) {
                event.target.setStyle({
                    fillOpacity: 0.5,
                });
            },
        });
        layer.bindPopup(`
            <h1>${hoverOverCounty(feature.properties.STATE, feature.properties.COUNTY)}</h1>
        `);
    },
});

// State Map
var statemap = L.geoJson(stateborders, {
    style: function (feature) {
        return {
            color: "white",
            fillOpacity: 0.5,
            fillColor: chooseColorState(feature.properties.NAME),
            weight: 1.5,
        };
    },
    onEachFeature: function (feature, layer) {
        layer.on({
            click: function (event) {
                myMap.fitBounds(event.target.getBounds());
            },
            mouseover: function (event) {
                event.target.setStyle({
                    fillOpacity: 0.9,
                });
            },
            mouseout: function (event) {
                event.target.setStyle({
                    fillOpacity: 0.5,
                });
            },
        });
        layer.bindPopup(`
            <h1>${hoverOverState(feature.properties.NAME)}</h1>
        `);
    },
});

// State Borders for the County Outlines
var stateoutlinemap = L.geoJson(stateborders, {
    style: function (feature) {
        return {

            color: '#000000',
            fill: false,
            weight: 10,
            opacity: 1,
        };
    },
});

// Zoom control to trasition between map
myMap.on('zoomend', function () {
    if (myMap.getZoom() >= 5) {
        myMap.removeLayer(statemap);
        stateoutlinemap.addTo(myMap);
        countymap.addTo(myMap);
    }
});

myMap.on('zoomend', function () {
    if (myMap.getZoom() < 5) {
        myMap.removeLayer(countymap);
        myMap.removeLayer(stateoutlinemap);
        statemap.addTo(myMap);
    }
});

statemap.addTo(myMap);