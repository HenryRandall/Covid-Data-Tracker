// Render the last date of data pulled
document.getElementById('last date').innerHTML=usa_heatmap[0].lastdate

// Format the popups to be used in the map
var popupOptions =
    {
      'maxWidth': '500',
      'maxHeight': '200',
};

// Add data to the Popups for States
function hoverOverState(stateName) {
    // Find the Index for the State
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            // If you found the correct state, set index and break
            index = state;
            break;
        }
    }
    // Return the information for the state
    return `${state_heatmap[index].state} <br>
    Total Cases: ${state_heatmap[index].total_cases} <br>
    Total Deaths: ${state_heatmap[index].total_deaths} <br>
    Last Week's Cases: ${state_heatmap[index].lastweek_cases} <br>
    This Week's Cases: ${state_heatmap[index].thisweek_cases} <br>
    Cases per 100K people ${state_heatmap[index].per100k.toFixed(0)} <br>
    Testing Positivity Rate ${state_heatmap[index].positive_rate.toFixed(2)}%
    `;
};

// Add data to the Popups for county
function hoverOverCounty(statefip, countyfip) {
    // Find the Index for the county
    var fip = statefip + countyfip;
    for (var county in county_heatmap) {
        if (county_heatmap[county].fips == fip) {
            // If you found the correct county, set index and break
            index = county;
            break;
        }
    }
    // Return the information for the county
    return `${county_heatmap[index].county}<br>
    Total Cases: ${county_heatmap[index].total_cases} <br>
    Total Deaths: ${county_heatmap[index].total_deaths} <br>
    Last Week's Cases: ${county_heatmap[index].lastweek_cases} <br>
    This Week's Cases: ${county_heatmap[index].thisweek_cases} <br>
    Cases per 100K people ${county_heatmap[index].per100k.toFixed(0)} <br>
    `;
};

// Choose County Colors
function chooseColorCounty(statefip, countyfip) {
    // Pull the type of value selected for use in heatmap
    var valuetype = getRadioVal(document.getElementById('valuetype'), 'optionsRadios' );
    var fip = statefip + countyfip;
    // Find county and set index
    for (var county in county_heatmap) {
        if (county_heatmap[county].fips == fip) {
            index = county;
        }
    }
    // Pull value for county
    var perc = county_heatmap[index][valuetype];
    var r, g, b = 0;
    // In below the lower bound, go green
    if (perc<countylow){
        g = 255;
        r = 0;
    } 
    // If between the lower and upper bound, gradient of green->yellow->red
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
    // If above the upper bound, red
    else {
        r = 255;
        g = 0;
    }
    // Calculate hexcode color and return
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
};

// Choose State Colors
function chooseColorState(stateName) {
    // Pull the type of value selected for use in heatmap
    var valuetype = getRadioVal(document.getElementById('valuetype'), 'optionsRadios' );
    // Find state and set index
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
        }
    }
    // Pull value for state
    var perc = state_heatmap[index][valuetype];
    var r, g, b = 0;
    // In below the lower bound, go green
    if (perc<statelow){
        g = 255;
        r = 0;
    } 
    // If between the lower and upper bound, gradient of green->yellow->red
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
    // If above the upper bound, red
    else {
        r = 255;
        g = 0;
    }
    // Calculate hexcode color and return
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
};

// fill state chart
function stateChart(stateName) {
    // Set name of state
    document.getElementById("state_name").innerHTML=stateName;
    // Find state and set index
    for (var state in state_heatmap) {
        if ((state_heatmap[state].state.toUpperCase()) == stateName.toUpperCase()) {
            index = state;
            break;
        }
    }
    // If there is an order, print. If not, print none
    if (state_heatmap[index].order_date != null) {
        document.getElementById("state_order").innerHTML=state_heatmap[index].order_date
    }
    else{
        document.getElementById("state_order").innerHTML='None'
    };
    // If there is an order, print. If not, print none
    if (state_heatmap[index].order_expiration_date != null) {
        document.getElementById("state_order_end").innerHTML=state_heatmap[index].order_expiration_date
    }
    else {
        document.getElementById("state_order_end").innerHTML='None'
    };
    // Call data and print to the chart
    document.getElementById("state_cases").innerHTML=state_heatmap[index].total_cases;
    document.getElementById("state_deaths").innerHTML=state_heatmap[index].total_deaths;
    document.getElementById("state_thisweek").innerHTML=state_heatmap[index].thisweek_cases;
    document.getElementById("state_lastweek").innerHTML=state_heatmap[index].lastweek_cases;
    document.getElementById("state_posrate").innerHTML=state_heatmap[index].positive_rate.toFixed(2);
};

// percentile funciton
function get_percentile($percentile, $array) {
    // Sort the array
    $array.sort(function (a, b) { return a - b; });
    // Find the percentile Threshold 
      $index = ($percentile/100) * $array.length;
    // If you need to average then average, if not dont
      if (Math.floor($index) == $index) {
           $result = ($array[$index-1] + $array[$index])/2;
      }
      else {
          $result = $array[Math.floor($index)];
      }
      return $result;
};

// Define which value the heatmap is based on
function getRadioVal(form, name) {
    var val;
    // get list of radio bubbles
    var radios = form.elements[name];
    
    // loop through list of selections
    for (var i=0, len=radios.length; i<len; i++) {
        // Check if the bubble is checked
        if ( radios[i].checked ) { 
            // Set value and break if true
            val = radios[i].value;
            break;
        }
    }
    // Return the value
    return val;
};

// Reference Data
var statelink = "static/data/stateborders.json";
var countylink = "static/data/countyborders.json";

// Fill in the chart for the USA data
document.getElementById("usa_cases").innerHTML=usa_heatmap[0].total_cases
document.getElementById("usa_deaths").innerHTML=usa_heatmap[0].total_deaths
document.getElementById("usa_thisweek").innerHTML=usa_heatmap[0].thisweek_cases
document.getElementById("usa_lastweek").innerHTML=usa_heatmap[0].lastweek_cases
document.getElementById("usa_posrate").innerHTML=usa_heatmap[0].positive_rate.toFixed(2)+('%')

// Set event listener to view the radio bubbles
const selectElement = document.querySelector('#valuetype');
selectElement.addEventListener('change', (event) => {
    //  If the radio bubbles are changed, remove the old map, and add a new updated map
    myMap.off();
    myMap.remove();
    var valuetype = getRadioVal(document.getElementById('valuetype'), 'optionsRadios' );
    myMap=maps(valuetype);
}, {
    passive: true
});

// Function to add a map
function maps(valuetype) {
    // Erase the container if it is filled
    var container = L.DomUtil.get('map');
    if(container != null){
        container._leaflet_id = null;
    };

    // Add map functionality
    var myMap = L.map("map", {
        center: [45.8283, -108.5795],
        zoom: 3,
        dragging: true
    });

    //  Add Background map 
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

    // Calculate the quartiles for the State values
    var values=[];
    for (var state in state_heatmap) {
        values=values.concat([state_heatmap[state][valuetype]]);
    };
    // Find the bounds for green, yellow and red. Current set to 10th percentile for g, 50th for y and 90th for r
    statelow=get_percentile(10,values);
    statemid=get_percentile(50,values);
    stateup=get_percentile(90,values);

    // Calculate the quartiles for the County values
    var valuescounty=[];
    for (var county in county_heatmap) {
        valuescounty=valuescounty.concat([county_heatmap[county][valuetype]]);
    };
    // Find the bounds for green, yellow and red. Current set to 10th percentile for g, 50th for y and 90th for r
    countylow=get_percentile(10,valuescounty);
    countymid=get_percentile(50,valuescounty);
    countyup=get_percentile(90,valuescounty);
    
    // Add County Map
    var countymap = L.geoJson.ajax(countylink, {
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

    // Add State Map
    var statemap = L.geoJson.ajax(statelink, {
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
                    // Fill start Chart when clicked
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
    var stateoutlinemap = L.geoJson.ajax(statelink, {
        style: function (feature) {
            return {

                color: '#000000',
                fill: false,
                weight: 10,
                opacity: 1,
            };
        },
    });

    // Zoom threshold is set to 5
    // on zoom in add county and state outlines, remove state
    myMap.on('zoomend', function () {
        if (myMap.getZoom() >= 5) {
            myMap.removeLayer(statemap);
            stateoutlinemap.addTo(myMap);
            countymap.addTo(myMap);
        }
    });

    // on zoom out add state, remove state outlines and county
    myMap.on('zoomend', function () {
        if (myMap.getZoom() < 5) {
            myMap.removeLayer(countymap);
            myMap.removeLayer(stateoutlinemap);
            statemap.addTo(myMap);
        }
    });

    // Add state map and return the map value itself
    statemap.addTo(myMap);
    return myMap;
}

//  Initialize by pulling the radio button value and adding the map
var valuetype = getRadioVal(document.getElementById('valuetype'), 'optionsRadios' );
myMap=maps(valuetype);
// Initialize chart to NC
stateChart('North Carolina');