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

// Design Popups
var popupOptions =
    {
      'maxWidth': '500',
      'maxHeight': '200',
    //   'className' : 'custom-popup', // classname for another popup
    }


// Reference Data
var statelink = "static/data/stateborders.json";
var countylink = "static/data/countyborders.json";

// USA data
document.getElementById("usa_cases").innerHTML=usa_heatmap[0].total_cases
document.getElementById("usa_deaths").innerHTML=usa_heatmap[0].total_deaths
document.getElementById("usa_thisweek").innerHTML=usa_heatmap[0].thisweek_cases
document.getElementById("usa_lastweek").innerHTML=usa_heatmap[0].lastweek_cases
document.getElementById("usa_posrate").innerHTML=usa_heatmap[0].positive_rate.toFixed(2)


// // consolelog data
// console.log(state_heatmap);
// console.log(usa_heatmap);
// console.log(county_heatmap);

// percentile funciton
function get_percentile($percentile, $array) {
    $array.sort(function (a, b) { return a - b; });
  
      $index = ($percentile/100) * $array.length;
      if (Math.floor($index) == $index) {
           $result = ($array[$index-1] + $array[$index])/2;
      }
      else {
          $result = $array[Math.floor($index)];
      }
      return $result;
  };

// Calculate quartiles State
var values=[];
for (var state in state_heatmap) {
    values=values.concat([state_heatmap[state].per100k]);
};
statelow=get_percentile(10,values);
statemid=get_percentile(50,values);
stateup=get_percentile(90,values);

var valuescounty=[];
for (var county in county_heatmap) {
    valuescounty=valuescounty.concat([county_heatmap[county].per100k]);
};
countylow=get_percentile(10,valuescounty);
countymid=get_percentile(50,valuescounty);
countyup=get_percentile(90,valuescounty);

// Hover over State
function hoverOverState(stateName) {
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
            break;
        }
    }
    return `${state_heatmap[index].state} <br>
    Total Cases: ${state_heatmap[index].total_cases} <br>
    Total Deaths: ${state_heatmap[index].total_deaths} <br>
    Last Week's Cases: ${state_heatmap[index].lastweek_cases} <br>
    This Week's Cases: ${state_heatmap[index].thisweek_cases} <br>
    Cases per 100K people ${state_heatmap[index].per100k.toFixed(0)} <br>
    Testing Positivity Rate ${state_heatmap[index].positive_rate.toFixed(2)}%
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
    return `${county_heatmap[index].county}<br>
    Total Cases: ${county_heatmap[index].total_cases} <br>
    Total Deaths: ${county_heatmap[index].total_deaths} <br>
    Last Week's Cases: ${county_heatmap[index].lastweek_cases} <br>
    This Week's Cases: ${county_heatmap[index].thisweek_cases} <br>
    Cases per 100K people ${county_heatmap[index].per100k.toFixed(0)} <br>
    `;
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
    var perc = county_heatmap[index].per100k;
    var r, g, b = 0;
    if (perc<countylow){
        g = 255;
        r = 0;
    } 
    else if (perc<countymid){
        var relave=((perc-countylow)/(countymid-countylow))
        g = 255;
        r = Math.round(255 * relave);
    }
    else if (perc<countyup){
        var relave=((perc-countymid)/(countyup-countymid))
        r = 255;
        g = Math.round(255-(255 * relave));
    }
    else {
        r = 255;
        g = 0;
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
    var perc = state_heatmap[index].per100k;
    var r, g, b = 0;
    if (perc<statelow){
        g = 255;
        r = 0;
    } 
    else if (perc<statemid){
        var relave=((perc-statelow)/(statemid-statelow))
        g = 255;
        r = Math.round(255 * relave);
    }
    else if (perc<stateup){
        var relave=((perc-statemid)/(stateup-statemid))
        r = 255;
        g = Math.round(255-(255 * relave));
    }
    else {
        r = 255;
        g = 0;
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
}

// fill state chart
function stateChart(stateName) {
    document.getElementById("state_name").innerHTML=stateName;
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
            break;
        }
    }
    document.getElementById("state_order").innerHTML=state_heatmap[index].order_date
    document.getElementById("state_order_end").innerHTML=state_heatmap[index].order_expiration_date
    document.getElementById("state_cases").innerHTML=state_heatmap[index].total_cases
    document.getElementById("state_deaths").innerHTML=state_heatmap[index].total_deaths
    document.getElementById("state_thisweek").innerHTML=state_heatmap[index].thisweek_cases
    document.getElementById("state_lastweek").innerHTML=state_heatmap[index].lastweek_cases
    document.getElementById("state_posrate").innerHTML=state_heatmap[index].positive_rate.toFixed(2)
}

stateChart('North Carolina')

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
        layer.bindPopup(
            `<h1>${hoverOverCounty(feature.properties.STATE, feature.properties.COUNTY)}</h1>`,
            popupOptions
        );
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
                stateChart(feature.properties.NAME)
            },
            mouseover: function (event) {
                layer.openPopup();
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
        layer.bindPopup(
            `<h1>${hoverOverState(feature.properties.NAME)}</h1>`,
            popupOptions
        );
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