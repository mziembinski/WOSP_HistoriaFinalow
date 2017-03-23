var dataset;

//Define bar chart function
	function barChart(dataset){

    //Set width and height as fixed variables
		var w = 520;
		var h = 300;
		var padding = 25;

//var margin = {top: 20, right: 20, bottom: 70, left: 40},
//    width = 600 - margin.left - margin.right,
//    height = 300 - margin.top - margin.bottom;

var imgUrl = "http://static.wosp.org.pl/trunk/files/images/common/header/logo.png"

//Scale function for axes and radius
var yScale = d3.scale.linear()
        .domain([0,d3.max(dataset, function(d){return d.zebrano;})])
        .range([h-padding-5,padding]);

var xScale = d3.scale.ordinal()
        .domain(dataset.map(function(d){ return d.Rok;}))
        .rangeRoundBands([padding+10,w-padding],.1,.1);

// define the axis
var formatThs = d3.format(',.2f');
//Create y axis
var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);
var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5).tickFormat(formatThs);

//Define key function
var key = function(d){return d.Rok};

//Define tooltip for hover-over info windows
var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

//Create svg element
var svg = d3.select("#WOSP-results").append("svg")
    .attr("width", w+padding).attr("height", h+padding)
    .attr("id", "chart");

// define filling
console.log(xScale.rangeBand());
svg.append("defs")
      .append("pattern")
      .attr("id", "heart")
      .attr('patternUnits', 'userSpaceOnUse')
      //.attr('patternContentUnits', 'objectBoundingBox')
      .attr("width",xScale.rangeBand()+2)
      .attr("height", xScale.rangeBand()+2)
      .attr("x", +5)
      .attr("y", +2)
      .append("image")
      .attr("xlink:href", imgUrl)
      .attr("width",xScale.rangeBand())
      .attr("height", xScale.rangeBand());

// add the SVG element - zebrano charts
svg.selectAll("rect")
  .data(dataset, key)
  .enter()
    .append("rect")
    .attr("class", "bar")
    .attr({
      x: function(d){
        return xScale(d.Rok);
      },
      y: function(d){
        return yScale(Math.max(0, d.zebrano));
      },
      width: xScale.rangeBand(),
      height: function(d){
        return Math.abs(yScale(d.zebrano) - yScale(0));
      }
    })
    .attr("fill", "url(#heart)")
    .on('mouseover', function(d){
          d3.select(this)
              .style("opacity", 0.2)
              .style("stroke", "black")

      var info = div
              .style("opacity", 1)
              .style("left", (d3.event.pageX+10) + "px")
              .style("top", (d3.event.pageY-30) + "px")
              .html('<strong>'+d.Rok+'</strong>');

      info.append("p")
              .text(formatThs(d.zebrano) + ' mln PLN');
      })
            .on('mouseout', function(d){
              d3.select(this)
          .style({'stroke-opacity':0.5,'stroke':'#a8a8a8'})
          .style("opacity",0.9);

          div
              .style("opacity", 0);
            });
//Add y-axis
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(40,0)")
    .call(yAxis);
//Add x-axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");;
};

//Load data and call bar chart function
  d3.json("WOSP_results.json", function(error,data){
      if(error){
        console.log(error);
      }
      else{
        data.forEach(function(d) {
          d.zebrano = parseFloat(d.zebrano)/1e6;
        });
        dataset=data;
        barChart(dataset);
      }
    });
