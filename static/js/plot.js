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

// Function to initialize page using initial data
function init() {
  // Grab the dropdown menu and add choices from the dataset
  var dropdown = d3.select("#States");
  // Create list of datasets for the dropdown
  for (var state in orders) {
    dropdown.append("option").text(orders[state].state);
  }
  // Pull the state name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var StateStat = getRadioVal(document.getElementById('StateStat'), 'optionsRadios' );
  var StateCase = getRadioVal(document.getElementById('StateCase'), 'optionsRadios' );
  StateGraph(stateName,StateStat,StateCase)
  // Change county dropdown based on state selected
  countySelect(stateName);
  // Pull the county name and option and feed to the graph
  var countyName = d3.select("#Counties").property('value');
  var CountyStat = getRadioVal(document.getElementById('CountyStat'), 'optionsRadios' );
  var CountyCase = getRadioVal(document.getElementById('CountyCase'), 'optionsRadios' );
  CountyGraph(stateName,countyName,CountyStat,CountyCase)
};

// Change county dropdown based on selected state
function countySelect(stateName) {
  // Erase the current county names
  var dropdown = d3.select("#Counties");
  dropdown.html("");
  // Filter by the state name and append the dropdown menu
  for (var county in county_cases) {
    if ((county_cases[county].State.toUpperCase()) == stateName.toUpperCase()) {
      dropdown.append("option").text(county_cases[county].County);
    }
  }
};

// Event listener for the state name
d3.select('#States').on('change', function() {
  // Pull the state name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var StateStat = getRadioVal(document.getElementById('StateStat'), 'optionsRadios' );
  var StateCase = getRadioVal(document.getElementById('StateCase'), 'optionsRadios' );
  StateGraph(stateName,StateStat,StateCase)
  // Change county dropdown based on state selected
  countySelect(stateName);
  // Pull the county name and option and feed to the graph
  var countyName = d3.select("#Counties").property('value');
  var CountyStat = getRadioVal(document.getElementById('CountyStat'), 'optionsRadios' );
  var CountyCase = getRadioVal(document.getElementById('CountyCase'), 'optionsRadios' );
  CountyGraph(stateName,countyName,CountyStat,CountyCase)
});

// Event listener for the county name
d3.select('#Counties').on('change', function() {
  // Pull the county name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var CountyStat = getRadioVal(document.getElementById('CountyStat'), 'optionsRadios' );
  var CountyCase = getRadioVal(document.getElementById('CountyCase'), 'optionsRadios' );
  CountyGraph(stateName,countyName,CountyStat,CountyCase)
});

$('input[type=radio]').change( function() {
  var stateName = d3.select("#States").property('value');
  var StateStat = getRadioVal(document.getElementById('StateStat'), 'optionsRadios' );
  var StateCase = getRadioVal(document.getElementById('StateCase'), 'optionsRadios' );
  var countyName = d3.select("#Counties").property('value');
  var CountyStat = getRadioVal(document.getElementById('CountyStat'), 'optionsRadios' );
  var CountyCase = getRadioVal(document.getElementById('CountyCase'), 'optionsRadios' );
  StateGraph(stateName,StateStat,StateCase)
  CountyGraph(stateName,countyName,CountyStat,CountyCase)
});

// Function find average
function average(nums) {
  return nums.reduce((a, b) => (a + b)) / nums.length;
}

// Add state plot
function StateGraph(stateName,type,variable) {
  // Select dataframe based on options selected
    if ((variable) == 'Cases') {
    var df=state_cases;
  }
  else {
    var df=state_deaths;
  }
  
  // Label
  var label= type+' '+variable;

  // Pull data from dataframe based on state selected
  for (var state in df) {
    if ((df[state].State.toUpperCase()) == stateName.toUpperCase()) {
        index = state;
    }
  }

  // Pull the date and values from the data and format
  data=JSON.parse(JSON.stringify(df[index]));
  delete data["State"];
  dates=Object.keys(data);
  var values=[];
  for (var date in dates) {
    values.push(data[dates[date]]);
  }

  // Format values
  // For Daily Totals
  if ((type) == 'Daily') {
    var last=0;
    for (var value in values) {
      current=values[value]-last;
      last=values[value];
      values[value]=current;
    }
  }
  //  7 Day Average
  if ((type) == '7 Day Average') {
    var last=0;
    for (var value in values) {
      current=values[value]-last;
      last=values[value];
      values[value]=current;
    }
    for (var value in values) {
      values[value]=Math.round(average(values.slice(value,Number(value)+7)));
    }
    values=values.slice(0,-6);
    dates=dates.slice(6);
  }

  // Pull the date from the order df and format
  orderData=JSON.parse(JSON.stringify(orders[index]));
  stateOrders=Object.keys(orderData);
  var orderDates=[];
  for (var orderDate in stateOrders) {
    orderDates.push(orderData[stateOrders[orderDate]]);
  };
  
  // Set the order dates and last date as a global variable to be used in the county graph as well
  window.orderImplementation= (new Date(orderDates[1])).toLocaleDateString('en-US');
  window.orderExpiration= (new Date(orderDates[2])).toLocaleDateString('en-US');
  window.lastDate= (new Date(usa_heatmap[0].lastdate)).toLocaleDateString('en-US');

  // Set indexes null in case that there isn't one
  index1 = undefined;
  index2 = undefined;
  index3 = undefined;

  // find the index value for the order dates and last date of available case data
  for (var date in dates) {
    today=(new Date(dates[date])).toLocaleDateString('en-US');
    if (today == orderImplementation) {
      index1 = Number(date)+1;
    }
    if (today == orderExpiration) {
      index2 = Number(date)+1;
    }
    if (today == lastDate) {
      index3 = Number(date)+1;
      break;
    }
  }

  //  Remove old plots and reset
  $('#Splot').remove();
  $('#Sgraph-container').html('<canvas id="Splot"></canvas>');

  // Configure drawing the vertical lines on the graphs and adding the data
  var myLineExtend = Chart.controllers.line.prototype.draw;
  var ctx = document.getElementById("Splot").getContext("2d");
  var config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: label,
        fill: false,
        borderColor: "#000000",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#000000",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: index1,
      lineAtIndex2: index2,
      lineAtIndex3: index3
    },
    options: {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: label
          },
          ticks: {
            beginAtZero: false
          },
        }],
      },
      legend: {
        display: false
      },
    }
  };

  // Draw the vertical lines
  Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw: function () {
    
      myLineExtend.apply(this, arguments);   

      var chart = this.chart;
      var ctx = chart.chart.ctx;

      var index1 = chart.config.data.lineAtIndex1;
      var index2 = chart.config.data.lineAtIndex2;
      var index3 = chart.config.data.lineAtIndex3;
      var xaxis = chart.scales['x-axis-0'];
      var yaxis = chart.scales['y-axis-0'];

      // Begin quarantine date line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index1), yaxis.top + 24);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index1), yaxis.bottom);
      ctx.stroke();
      ctx.textAlign = 'end';
      ctx.font="20px sans-serif";
      ctx.fillStyle='#000000';
      ctx.translate(xaxis.getPixelForValue(undefined, index1) - 10, yaxis.top + 30);
      ctx.rotate(-0.5 * Math.PI);
      ctx.fillText("Quarantine Begin", 0, 0);
      ctx.restore();

      // End quarantine date line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index2), yaxis.top + 24);
      ctx.strokeStyle = '#008000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index2), yaxis.bottom);
      ctx.stroke();
      ctx.textAlign = 'end';
      ctx.font="20px sans-serif";
      ctx.fillStyle='#000000';
      ctx.translate(xaxis.getPixelForValue(undefined, index2) - 10, yaxis.top + 30);
      ctx.rotate(-0.5 * Math.PI);
      ctx.fillText("Quarantine End", 0, 0);
      ctx.restore();

      // ML projections begin line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index3), yaxis.top + 24);
      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index3), yaxis.bottom);
      ctx.stroke();
      ctx.textAlign = 'end';
      ctx.font="20px sans-serif";
      ctx.fillStyle='#000000';
      ctx.translate(xaxis.getPixelForValue(undefined, index3) - 10, yaxis.top + 30);
      ctx.rotate(-0.5 * Math.PI);
      ctx.fillText("ML Projections", 0, 0);
      ctx.restore();
    }
  });

  // Add graph
  new Chart(ctx, config);
};

// Add county plot
function CountyGraph(stateName,countyName,type,variable) {
  // Select dataframe based on options selected
  if ((variable) == 'Cases') {
    var df=county_cases;
  }
  else {
    var df=county_deaths;
  }
  
  // Label
  var label= type+' '+variable;

  // Pull data from dataframe based on county selected
  for (var county in df) {
    if ((df[county].State.toUpperCase()) == stateName.toUpperCase() && (df[county].County.toUpperCase()) == countyName.toUpperCase()){
        index = county;
    }
  }

  // Pull the date and values from the data and format
  data=JSON.parse(JSON.stringify(df[index]));
  delete data["State"];
  delete data["County"];
  delete data["FIPS"];
  dates=Object.keys(data);
  var values=[];
  for (var date in dates) {
    values.push(data[dates[date]]);
  }

  // Format values
  // For Daily Totals
  if ((type) == 'Daily') {
    var last=0;
    for (var value in values) {
      current=values[value]-last;
      last=values[value];
      values[value]=current;
    }
  }
  //  7 Day Average
  if ((type) == '7 Day Average') {
    var last=0;
    for (var value in values) {
      current=values[value]-last;
      last=values[value];
      values[value]=current;
    }
    for (var value in values) {
      values[value]=Math.round(average(values.slice(value,Number(value)+7)));
    }
    values=values.slice(0,-6);
    dates=dates.slice(6);
  }

  // Set indexes null in case that there isn't one
  index1 = undefined;
  index2 = undefined;
  index3 = undefined;

  // find the index value for the order dates and last date of available case data
  for (var date in dates) {
    today=(new Date(dates[date])).toLocaleDateString('en-US');
    if (today == orderImplementation) {
      index1 = Number(date)+1;
    }
    if (today == orderExpiration) {
      index2 = Number(date)+1;
    }
    if (today == lastDate) {
      index3 = number(date)+1;
      break;
    }
  }

  //  Remove old plots and reset
  $('#Cplot').remove();
  $('#Cgraph-container').html('<canvas id="Cplot"></canvas>');

  // Configure drawing the vertical lines on the graphs and adding the data
  var myLineExtend = Chart.controllers.line.prototype.draw;
  var ctx = document.getElementById("Cplot").getContext("2d");
  var config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: label,
        fill: false,
        borderColor: "#000000",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#000000",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: index1,
      lineAtIndex2: index2,
      lineAtIndex3: index3
    },
    options: {
      scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Date'
          },
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: label
          },
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: false
      }
    }
  };
  
  // Add graph
  new Chart(ctx, config);
};

// Initialize
init();