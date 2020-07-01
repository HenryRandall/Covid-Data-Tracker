var trace1 = {
    x: Date,
    y: ["1,2,7,4,5"],
    type: "plot"
  };
  
  var data = [trace1];
  
  var layout = {
    title: "State Plots",
    xaxis:{title: "Date"},
    yaxis:{title: "# of cases/deaths"}
  };
  
  Plotly.newPlot("Stateplot", data, layout);
  
  var trace2 = {
    x: Date,
    y: ["1,2,7,4,5"],
    type: "plot"
  };
  
  var data = [trace2];
  
  var layout = {
    title: "County Plots",
    xaxis:{title: "Date"},
    yaxis:{title: "# of cases/deaths"}
  };
  
  Plotly.newPlot("Countyplot", data, layout);
  