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
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
  // Change county dropdown based on state selected
  countySelect(stateName);
  // Pull the county name and option and feed to the graph
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
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
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
  // Change county dropdown based on state selected
  countySelect(stateName);
  // Pull the county name and option and feed to the graph
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

// Event listener for the county name
d3.select('#Counties').on('change', function() {
  // Pull the county name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

// Event listener for the state option
d3.select('#TotalS').on('change', function() {
  // Pull the state name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
});

// Event listener for the county option
d3.select('#TotalC').on('change', function() {
  // Pull the county name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
});

// Event listener for the state value
d3.select('#ResultS').on('change', function() {
  // Pull the state name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var totalsState = d3.select("#TotalS").property('value');
  var resultState = d3.select("#ResultS").property('value');
  StateGraph(stateName,totalsState,resultState)
});

// Event listener for the county value
d3.select('#ResultC').on('change', function() {
  // Pull the county name and option and feed to the graph
  var stateName = d3.select("#States").property('value');
  var countyName = d3.select("#Counties").property('value');
  var totalsCounty = d3.select("#TotalC").property('value');
  var resultCounty = d3.select("#ResultC").property('value');
  CountyGraph(stateName,countyName,totalsCounty,resultCounty)
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
  
  // Set the order dates as a global variable to be used in the county graph as well
  window.orderImplementation= (new Date(orderDates[1])).toLocaleDateString('en-US');
  window.orderExpiration= (new Date(orderDates[2])).toLocaleDateString('en-US');

  // Set indexes null in case that there isnt one
  index1 = undefined;
  index2 = undefined;

  // find the index value for the order dates
  for (var date in dates) {
    today=(new Date(dates[date])).toLocaleDateString('en-US');
    if (today == orderImplementation) {
      index1 = Number(date)+1;
    }
    if (today == orderExpiration) {
      index2 = Number(date)+1;
      break;
    }
  }

  //  Romove old plots and reset
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
        pointBackgroundColor: "#82CAFA",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#0000FF",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: index1,
      lineAtIndex2: index2
    },
    options: {
      scales: {
        yAxes: [{
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

  // Draw the vertical lines
  Chart.helpers.extend(Chart.controllers.line.prototype, {
    draw: function () {
    
      myLineExtend.apply(this, arguments);   

      var chart = this.chart;
      var ctx = chart.chart.ctx;

      var index1 = chart.config.data.lineAtIndex1;
      var index2 = chart.config.data.lineAtIndex2;
      var xaxis = chart.scales['x-axis-0'];
      var yaxis = chart.scales['y-axis-0'];

      // Begin date line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index1), yaxis.top + 24);
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index1), yaxis.bottom);
      ctx.stroke();
      ctx.restore();

      // End date line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xaxis.getPixelForValue(undefined, index2), yaxis.top + 24);
      ctx.strokeStyle = '#008000';
      ctx.lineWidth= 3;
      ctx.lineTo(xaxis.getPixelForValue(undefined, index2), yaxis.bottom);
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = 'end';
      ctx.font="20px sans-serif";
      ctx.fillStyle='#000000';
      ctx.fillText("Quarantine Begin", xaxis.getPixelForValue(undefined, index1), yaxis.top + 16);
      ctx.textAlign = 'start';
      ctx.fillText("Quarantine End", xaxis.getPixelForValue(undefined, index2), yaxis.top + 16);
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

  // Set indexes null in case that there isnt one
  index1 = undefined;
  index2 = undefined;

  // find the index value for the order dates
  for (var date in dates) {
    today=(new Date(dates[date])).toLocaleDateString('en-US');
    if (today == orderImplementation) {
      index1 = Number(date)+1;
    }
    if (today == orderExpiration) {
      index2 = Number(date)+1;
      break;
    }
  }

  //  Romove old plots and reset
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
        pointBackgroundColor: "#82CAFA",
        pointBorderColor: "#000000",
        pointHoverBackgroundColor: "#0000FF",
        data: values
      }],
      datasetFill: false,
      lineAtIndex1: index1,
      lineAtIndex2: index2
    },
    options: {
      scales: {
        yAxes: [{
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