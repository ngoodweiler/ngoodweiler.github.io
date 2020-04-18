
// Price graph
var dates = [];
var gold = [];
var copper = [];

d3.csv("./static/js/monthlyPrice.csv").then(function(priceData) {
  priceData.map(function(d) {
    dates.push(d.date);
    gold.push(d.gold);
    copper.push(d.copper);
  })
  var trace1 = {
    type: 'scatter',
    name: 'Gold Price (per oz t)',
    x: dates,
    y: gold
  };
  var trace2 = {
    type: 'scatter',
    name: 'Copper Price (per oz t)',
    x: dates,
    y: copper,
    yaxis: 'y2'
  };
  var data = [trace1,trace2];
  var layout = {
    title: 'Price of Gold and Copper by Month',
    autosize: true,
    legend: {
      'x': 1.05,
    },
    yaxis: {title: 'Gold (US$ per oz t)'},
    yaxis2: {
      title: 'Copper (US$ per ton)',
      overlaying: 'y',
      side: 'right'
    }
  };
  Plotly.newPlot('pricing',data,layout);
});

// Annual data
var year_g = [];
var goldPrice = [];
var gdp_g = [];
var pop_g = [];
var goldProd = [];
function goldProdInit(){
  d3.csv("./static/js/regression.csv").then(function(goldData) {
    goldData.map(function(d) {
      year_g.push(d.year);
      goldPrice.push(d.goldPrice);
      gdp_g.push(d.gdp);
      pop_g.push(d.pop);
      goldProd.push(d.goldProd);
    });
    var trace1 = {
      type: 'scatter',
      name: 'Gold Price (US$ per oz t)',
      x: year_g,
      y: goldPrice
    };
    var trace2 = {
      type: 'scatter',
      name: 'World GDP per Capita',
      x: year_g,
      y: gdp_g,
      yaxis: 'y2'
  };
  var data = [trace1,trace2];
  var layout = {
    title: 'Gold Price and Index Comparisons',
    legend: {
      'x': 1.05,
    },
    autosize: true,
    yaxis2: {
      overlaying: 'y',
      side: 'right'
    }
  };
  var goldProdChart = d3.selectAll('#goldProduction').node();
  Plotly.newPlot(goldProdChart,data,layout);
})};
d3.selectAll('#selDatasetGold').on('change',updateGoldProd);
function updateGoldProd(){
  var goldProdDropdown = d3.select('#selDatasetGold');
  var datasetGold = goldProdDropdown.node().value;
  var goldProdChart = d3.selectAll('#goldProduction').node();

  var x = [];
  var y = [];
  switch(datasetGold) {
    case 'goldGdp':
      x = year_g;
      y = gdp_g;
      name = 'World GDP per Capita';
      break;
    case 'goldPop':
      x = year_g;
      y = pop_g;
      name = 'World Population Growth Rate';
      break;
    case 'goldProd':
      x = year_g;
      y = goldProd;
      name = "World Gold Production ('000s oz t)";
      break;
    default:
      x = year_g;
      y = gdp_g;
      name = 'World GDP per Capita';
      break;
  }
  Plotly.restyle(goldProdChart, 'x',[undefined,x]);
  Plotly.restyle(goldProdChart,'y',[undefined,y]);
  Plotly.restyle(goldProdChart,'name',[undefined,name]);
}
goldProdInit();


// Regression Data
var goldPriceR = [];
var gdp_gr = [];
var pop_gr = [];
var goldProdR = [];
function goldProdInitR(){
  d3.csv("./static/js/regression.csv").then(function(goldDataR) {
    goldDataR.map(function(d) {
      goldPriceR.push(d.goldPrice);
      gdp_gr.push(d.gdp);
      pop_gr.push(d.pop);
      goldProdR.push(d.goldProd);
    });
    var rawData=[];
    var x_reg = gdp_gr;
    for (var i=0; i<gdp_gr.length; i++){
      rawData.push([+x_reg[i],+goldPriceR[i]]);
    }
    console.log(rawData);
    var result=regression('linear',rawData);
    var coeff = result.equation;
    anychart.onDocumentReady(function(){
      var data_1 = rawData;
      var data_2 = setTheoryData(rawData);

      chart = anychart.scatter();
      chart.title('The calculated formula: '+result.string+'\nThe coefficient of determination: '+result.r2.toPrecision(2));
      chart.legend(true);
      var series1=chart.marker(data_1);
      series1.name('Experimental data');
      var series2=chart.line(data_2);
      series2.name('Theoretically calculated data');
      series2.markers(true);
      chart.container('chartContainer');
      chart.draw();
    });
    function formula(coeff, x) {
      var result = null;
      for (var i=0, j=coeff.length - 1; i<coeff.length; i++, j--){
        result += coeff[i]*Math.pow(x,j);
      }
      return result;
    }
    function setTheoryData(rawData) {
      var theoryData = [];
      for (var i=0; i<rawData.length; i++){
        theoryData[i]=[rawData[i][0],formula(coeff,rawData[i][0])];
      }
      return theoryData;
    }
    var trace1 = {
      type: 'scatter',
      mode: 'markers',
      name: 'Gold Price (US$ per oz t)',
      x: gdp_gr,
      y: goldPriceR
    };

    var data = [trace1];
    var layout = {
      title: 'Gold Price (US$ per oz t) vs Indices',
      showlegend: false,
      legend: {
        'x': 1.05,
      },
      autosize: true,
    };
    var goldProdChartR = d3.selectAll('#goldRegression').node();
    Plotly.newPlot(goldProdChartR,data,layout);
})};
d3.selectAll('#selDatasetGoldR').on('change',updateGoldProdR);
function updateGoldProdR(){
  var goldProdDropdownR = d3.select('#selDatasetGoldR');
  var datasetGoldR = goldProdDropdownR.node().value;
  var goldProdChartR = d3.selectAll('#goldRegression').node();

  var x = [];
  var y = [];
  switch(datasetGoldR) {
    case 'goldGdpR':
      x = gdp_gr;
      y = goldPriceR;
      name = 'World GDP per Capita';
      x_reg = gdp_gr;
      break;
    case 'goldPopR':
      x = pop_gr;
      y = goldPriceR;
      name = 'World Population Growth Rate';
      x_reg = pop_gr;
      break;
    case 'goldProdR':
      x = goldProdR;
      y = goldPriceR;
      name = "World Gold Production ('000s oz t)";
      x_reg = goldProdR;
      break;
    default:
      x = gdp_gr;
      y = goldPriceR;
      name = 'World GDP per Capita';
      x_reg = gdp_gr;
      break;
  }
  Plotly.restyle(goldProdChartR, 'x',[x]);
  Plotly.restyle(goldProdChartR,'y',[y]);
  Plotly.restyle(goldProdChartR,'name',[name]);

}
goldProdInitR();

// Gold Model
var gModelYears = [];
var goldModel = [];
var goldActual = [];

d3.csv("./static/js/regression.csv").then(function(gModelData) {
  gModelData.map(function(d) {
    gModelYears.push(d.year);
    goldModel.push(d.goldModel);
    goldActual.push(d.goldPrice);
  })
  var trace1 = {
    type: 'scatter',
    name: 'Actual Gold Price',
    x: gModelYears,
    y: goldActual
  };
  var trace2 = {
    type: 'scatter',
    name: 'Estimated Gold Price',
    x: gModelYears,
    y: goldModel,
  };
  var data = [trace1,trace2];
  var layout = {
    title: 'Actual vs Estimated Gold Price',
    autosize: true,
    legend: {
      'x': 1.05,
    },
    yaxis: {title: 'Gold Price (US$ per oz t)'},
  };
  Plotly.newPlot('goldModel',data,layout);
});

// Copper Prod
var year_c = [];
var copperPrice = [];
var gdp_c = [];
var pop_c = [];
var copperProd = [];
function copperProdInit(){
  d3.csv("./static/js/regression.csv").then(function(copperData) {
    copperData.map(function(d) {
      year_c.push(d.year);
      copperPrice.push(d.copperPrice);
      gdp_c.push(d.gdp);
      pop_c.push(d.pop);
      copperProd.push(d.copperProd);
    });
    var trace1 = {
      type: 'scatter',
      name: 'Copper Price (US$ per ton)',
      x: year_c,
      y: copperPrice
    };
    var trace2 = {
      type: 'scatter',
      name: 'World GDP per Capita',
      x: year_c,
      y: gdp_c,
      yaxis: 'y2'
  };
  var data = [trace1,trace2];
  var layout = {
    title: 'Copper Price and Index Comparisons',
    legend: {
      'x': 1.05,
    },
    autosize: true,
    yaxis2: {
      overlaying: 'y',
      side: 'right'
    }
  };
  var copperProdChart = d3.selectAll('#copperProduction').node();
  Plotly.newPlot(copperProdChart,data,layout);
})};
d3.selectAll('#selDatasetCopper').on('change',updateCopperProd);
function updateCopperProd(){
  var copperProdDropdown = d3.select('#selDatasetCopper');
  var datasetCopper = copperProdDropdown.node().value;
  var copperProdChart = d3.selectAll('#copperProduction').node();

  var x = [];
  var y = [];
  switch(datasetCopper) {
    case 'copperGdp':
      x = year_c;
      y = gdp_c;
      name = 'World GDP per Capita';
      break;
    case 'copperPop':
      x = year_c;
      y = pop_c;
      name = 'World Population Growth Rate';
      break;
    case 'copperProd':
      x = year_c;
      y = copperProd;
      name = "World copper Production ('000s tons)";
      break;
    default:
      x = year_c;
      y = gdp_c;
      name = 'World GDP per Capita';
      break;
  }
  Plotly.restyle(copperProdChart, 'x',[undefined,x]);
  Plotly.restyle(copperProdChart,'y',[undefined,y]);
  Plotly.restyle(copperProdChart,'name',[undefined,name]);
}
copperProdInit();
