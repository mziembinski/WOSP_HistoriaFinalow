var dataset;

//Define bar chart function
	function barChart2(dataset){

		//Set width and height as fixed variables
		var w2 = 520;
		var h2 = 150;
		var padding2 = 25;

		//Scale function for axes and radius
		var yScale2 = d3.scale.linear()
						.domain(d3.extent(dataset, function(d){return d.wzrost;}))
						.range([h2-padding2-5,padding2]);

		var xScale2 = d3.scale.ordinal()
						.domain(dataset.map(function(d){ return d.Rok;}))
						.rangeRoundBands([padding2+10,w2-padding2],.2);

		//To format axis as a percent
		var formatPercent = d3.format("%1");
    var formatThs = d3.format(',.2f');
		//Create y axis
		var yAxis2 = d3.svg.axis().scale(yScale2).orient("left").ticks(5).tickFormat(formatThs);

		//Define key function
		var key = function(d){return d.Rok};

		//Define tooltip for hover-over info windows
		var div = d3.select("body").append("div")
  							.attr("class", "tooltip")
  							.style("opacity", 0);

		//Create svg element
		var svg2 = d3.select("#WOSP-growth").append("svg")
				.attr("width", w2-padding2).attr("height", h2-padding2)
				.attr("id", "chart");
		//		.attr("viewBox", "0 0 "+w+ " "+h)
		//		.attr("preserveAspectRatio", "xMinYMin");

		//Resizing function to maintain aspect ratio (uses jquery)
	/*	var aspect = w / h;
		var chart = $("#chart");
			$(window).on("resize", function() {
			    var targetWidth = $("body").width();

	    		if(targetWidth<w){
	    			chart.attr("width", targetWidth);
	    			chart.attr("height", targetWidth / aspect);
	    		}
	    		else{
	    			chart.attr("width", w);
	    			chart.attr("height", w / aspect);
	    		}

			});*/


		//Initialize state of chart according to drop down menu
		var state = d3.selectAll("option");

		//Create barchart
		svg2.selectAll("rect")
			.data(dataset, key)
			.enter()
		  	.append("rect")
		    .attr("class", function(d){return d.wzrost < 0 ? "negative" : "positive";})
		    .attr({
		    	x: function(d){
		    		return xScale2(d.Rok);
		    	},
		    	y: function(d){
		    		return yScale2(Math.max(0, d.wzrost));
		    	},
		    	width: xScale2.rangeBand(),
		    	height: function(d){
		    		return Math.abs(yScale2(d.wzrost) - yScale2(0));
		    	}
		    })
		    .on('mouseover', function(d){
							d3.select(this)
							    .style("opacity", 0.2)
							    .style("stroke", "black")

					var info = div
							    .style("opacity", 1)
							    .style("left", (d3.event.pageX+10) + "px")
							    .style("top", (d3.event.pageY-30) + "px")
							    .html('<strong>'+d.Rok+'</strong>');

					if(state[0][0].selected){
						info.append("p")
							    .text(formatThs(d.wzrost) + ' mln PLN');
					}
					else if(state[0][1].selected){
						info.append("p")
							    .text(formatPercent(d.wzrost_proc));
					}



						})
        				.on('mouseout', function(d){
        					d3.select(this)
							.style({'stroke-opacity':0.5,'stroke':'#a8a8a8'})
							.style("opacity",1);

							div
	    						.style("opacity", 0);
        				});

		//Add y-axis
		svg2.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(40,0)")
				.call(yAxis2);

		//Sort data when sort is checked
		d3.selectAll(".checkbox").
		on("change", function(){
			var x0 = xScale2.domain(dataset.sort(sortChoice())
			.map(function(d){return d.Rok}))
			.copy();

			var transition = svg2.transition().duration(750);
			var delay = function(d, i){return i*10;};

			transition.selectAll("rect")
			.delay(delay)
			.attr("x", function(d){return x0(d.Rok);});

		})

		//Function to sort data when sort box is checked
		function sortChoice(){
				var state = d3.selectAll("option");
				var sort = d3.selectAll(".checkbox");

				if(sort[0][0].checked && state[0][0].selected){
					var out = function(a,b){return b.wzrost - a.wzrost;}
					return out;
				}
				else if(sort[0][0].checked && state[0][1].selected){
					var out = function(a,b){return b.wzrost_proc - a.wzrost_proc;}
					return out;
				}
				else{
					var out = function(a,b){return d3.ascending(a.Rok, b.Rok);}
					return out;
				}
		};

		//Change data to correct values on input change
			d3.selectAll("select").
			on("change", function() {

				var value= this.value;

				if(value=="procent"){
					var x_value = function(d){return d.wzrost_proc;};
					var color = function(d){return d.wzrost_proc < 0 ? "negative" : "positive";};
					var y_value = function(d){
			    		return yScale2(Math.max(0, d.wzrost_proc));
			    	};
			    	var height_value = function(d){
			    		return Math.abs(yScale2(d.wzrost_proc) - yScale2(0));
			    	};
				yAxis2.tickFormat(formatPercent);
				}
				else if(value=="wzrost"){
					var x_value = function(d){return d.wzrost;};
					var color = function(d){return d.wzrost < 0 ? "negative" : "positive";};
					var y_value = function(d){
			    		return yScale2(Math.max(0, d.wzrost));
			    	};
			    	var height_value = function(d){
			    		return Math.abs(yScale2(d.wzrost) - yScale2(0));
			    	};
				yAxis2.tickFormat(formatThs);
				}

				//Update y scale
				yScale2.domain(d3.extent(dataset, x_value));

				//Update with correct data
				var rect = svg2.selectAll("rect").data(dataset, key);
				rect.exit().remove();

				//Transition chart to new data
				rect
				.transition()
				.duration(2000)
				.ease("linear")
				.each("start", function(){
					d3.select(this)
					.attr("width", "0.2")
					.attr("class", color)
				})
				.attr({
			    	x: function(d){
			    		return xScale2(d.Rok);
			    	},
			    	y: y_value,
			    	width: xScale2.rangeBand(),
			    	height: height_value

				});

				//Update y-axis
				svg2.select(".y.axis")
					.transition()
					.duration(1000)
					.ease("linear")
					.call(yAxis2);
			});

	};

	//Load data and call bar chart function
		d3.json("WOSP_results.json", function(error,data){
				if(error){
					console.log(error);
				}
				else{
					data.forEach(function(d) {
						d.wzrost = parseFloat(d.wzrost)/1e6;
            d.wzrost_proc = parseFloat(d.wzrost_proc);
					});
					dataset=data;
					barChart2(dataset);
				}
			});
