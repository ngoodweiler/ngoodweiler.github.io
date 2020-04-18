// Define SVG area dimensions
var svgWidth = 1000;
var svgHeight = 3000;

// Define the chart's margins as an object
var margin = {
  top: 10,
  right: 40,
  bottom: 100,
  left: 50
};


var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3
  .select("#pricing")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
var parseTime = d3.timeParse("%m/%d/%Y");
d3.csv("./static/js/monthlyPrice.csv").then(function(priceData) {
  // Format the data
  priceData.forEach(function(data) {
    data.date = parseTime(data.date);
    data.gold = +data.gold;
    data.copper = +data.copper;
  });
   // Create scaling functions
   var xTimeScale = d3.scaleTime()
    .domain(d3.extent(priceData, d => d.date))
    .range([0, width]);

    var yLinearScale1 = d3.scaleLinear()
      .domain([0, d3.max(priceData, d => d.gold)])
      .range([height, 0]);

    var yLinearScale2 = d3.scaleLinear()
      .domain([0, d3.max(priceData, d => d.copper)])
      .range([height, 0]);

    var bottomAxis = d3.axisBottom(xTimeScale)
      .tickFormat(d3.timeFormat("%b-%Y"));
    var leftAxis = d3.axisLeft(yLinearScale1);
    var rightAxis = d3.axisRight(yLinearScale2);

    chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // Add y1-axis to the left side of the display
    chartGroup.append("g")
    // Define the color of the axis text
      .classed("gold", true)
      .call(leftAxis);
    chartGroup.append("g")
    // Define the color of the axis text
      .classed("copper", true)
      .attr("transform", `translate(${width}, 0)`)
      .call(rightAxis);

    // Line generators for each line
    var line1 = d3.line()
      .x(d => xTimeScale(d.date))
      .y(d => yLinearScale1(d.gold));

    var line2 = d3.line()
      .x(d => xTimeScale(d.date))
      .y(d => yLinearScale2(d.copper));

    // Append a path for line1
    chartGroup.append("path")
      .data([priceData])
      .attr("d", line1)
      .classed("line gold", true);

    // Append a path for line2
    chartGroup.append("path")
      .data([priceData])
      .attr("d", line2)
      .classed("line copper", true);

    // Append axes titles
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
      .classed("gold-text text", true)
      .text("Gold Price (US$ per oz t)");

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 37})`)
      .classed("copper-text text", true)
      .text("Copper Price (US$ per ton)");
}).catch(function(error) {
  console.log(error);
});