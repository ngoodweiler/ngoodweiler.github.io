// Define SVG area dimensions
var svgWidth2 = 1000;
var svgHeight2 = 3000;

// Define the chart's margins as an object
var margin2 = {
  top: 10,
  right: 40,
  bottom: 100,
  left: 50
};


var width2 = svgWidth - margin.left - margin.right;
var height2 = svgHeight - margin.top - margin.bottom - height;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg2 = d3
  .select("#goldProduction")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg2.append("g")
  .attr("transform", `translate(${margin2.left}, ${margin2.top})`);

d3.csv("./static/js/regression.csv").then(function(goldData) {
  // Format the data
  goldData.forEach(function(data) {
    data.date = +data.year;
    data.price = +data.goldPrice;
    data.gdp = +data.gdp;
    data.pop = +data.pop;
    data.prod = +data.goldProd;
  });
   // Create scaling functions
   var xScale = d3.scaleLinear()
    .domain(d3.extent(goldData, d => d.date))
    .range([0, width2]);

    var yLinearScale1 = d3.scaleLinear()
      .domain([0, d3.max(goldData, d => d.price)])
      .range([height2, 0]);

    var yLinearScale2 = d3.scaleLinear()
      .domain([0, d3.max(goldData, d => d.gdp)])
      .range([height2, 0]);

    var bottomAxis = d3.axisBottom(xScale);
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
      .classed("gdp", true)
      .attr("transform", `translate(${width2}, 0)`)
      .call(rightAxis);

    // Line generators for each line
    var line1 = d3.line()
      .x(d => xScale(d.date))
      .y(d => yLinearScale1(d.price));

    var line2 = d3.line()
      .x(d => xScale(d.date))
      .y(d => yLinearScale2(d.gdp));

    // Append a path for line1
    chartGroup.append("path")
      .data([goldData])
      .attr("d", line1)
      .classed("line gold", true);

    // Append a path for line2
    chartGroup.append("path")
      .data([goldData])
      .attr("d", line2)
      .classed("line gdp", true);

    // Append axes titles
    chartGroup.append("text")
      .attr("transform", `translate(${width2 / 2}, ${height2 + margin2.top + 20})`)
      .classed("gold-text text", true)
      .text("Annual Gold Price (US$ per oz t)");

    chartGroup.append("text")
      .attr("transform", `translate(${width2 / 2}, ${height2 + margin2.top + 37})`)
      .classed("copper-text text", true)
      .text("World GDP per Capita");
}).catch(function(error) {
  console.log(error);
});

