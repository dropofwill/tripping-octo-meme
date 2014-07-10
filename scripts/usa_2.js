	// Set Aspect Ratio in pixels
	var width = 960,
			height = 500,
			dotRadius = 3,
			dotBorder = 1,

			active = d3.select(null),
			hover = d3.select(null),
			locked = false,
			listSubunits = [],

			//scaledHash = { 'A-N': '#21313E','B-N': '#20575F','B-N': '#268073','C-N': '#53A976','D-N': '#98CF6F','F-N': '#EFEE69'},
			//scaledHash = { 'A-N': '#009962','B-N':  '#9dcc4c','C-N':  '#E8E834','D-N':  '#e09500','F-N':  '#b40d04'},
			//scaledHash = { 'A-N': '#009962', 'B-N':  '#9acc6d', 'C-N':  '#ffff76', 'D-N':  '#e1943a', 'F-N':  '#b40d04'},
			//scaledHash = { 'A-N': '#547949', 'B-N':  '#75bc41', 'C-N':  '#ffe14d', 'D-N':  '#ff454d', 'F-N':  '#ad2d30'},
			//scaledHash ={		'A-N':'#ffffff', 'B-N': '#f8c9bc', 'C-N': '#e8927d', 'D-N': '#d15b41', 'F-N': '#b40d04' }

			//scaledHash ={		'A-N':'#ffc5c5','B-N':'#e79990','C-N': '#cc6d5f','D-N': '#af4030','F-N': '#8e0000' },

			// tan - red -- warm
			//scaledHash ={   'A-N': '#fee5d9', 'B-N': '#fcae91', 'C-N': '#fb6a4a', 'D-N': '#de2d26', 'F-N': ' #a50f15' },

			// gray - red -- cold
			scaledHash ={   'A-N': '#d3d3d3', 'B-N': '#d7a9a3', 'C-N': '#d37f74', 'D-N': '#ca5148', 'F-N': '#bb071f'},
			
			// white - blue/purple
			//scaledHash ={   'A-N': '#f0ffff', 'B-N': '#c1c6e1', 'C-N': '#938fc4', 'D-N': '#635ba6', 'F-N': '#2c2c88'},
			
			lock_btn = document.getElementById("lock"),
			toggle_btn = document.getElementById("toggle"),
			countrySelector = document.getElementById("selector");

	var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);
	
	// Apply the projection to the path
	var path = d3.geo.path()
		.projection(projection);

	// Set the zoom behavior defaults
	var zoom = d3.behavior.zoom()
		.scale(1)
		.translate([0,0])
    .scaleExtent([1, 12])
    .on("zoom", zoomed);

	// Add the svg to the .container element, stop event propogation
	var svg = d3.select(".container").append("svg")
		.attr("viewBox", "0 0 " + width + " " + height )
		.attr("preserveAspectRatio", "xMidYMid meet")
		.attr("id", "svg--map")
		.on("click", stopped, true);

	// Apply the zoom settings to the root as gestures and events
	svg.call(zoom)
		.call(zoom.event)

	// A rectangle to reset the view, drawn behind the map
	//svg.append("rect")
		//.attr("class", "background")
		//.attr("width", width)
		//.attr("height", height)
		//.on("click", reset);
		
	// Create a pattern for each color and push it to an array to select from
	var defs = svg.append("defs")

	// Group the map features
	var features = svg.append("g");
	var dots = svg.append("g");

	createPatterns();
	loadMapData();
	plotBuyerData();

	function createPatterns() {
		for (var key in scaledHash) {
			var name = key.replace(/\-N/,"-Y");
			scaledHash[name] = "url(#" +name+ ")";

			pattern = defs.append("pattern")
				.attr("id", name)
				.attr("patternUnits", "userSpaceOnUse")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "10")
				.attr("height", "10")
				.attr("patternTransform", "rotate(45 0 0)");
			
			pattern.append("line")
						.attr("x1", "0")
						.attr("y1", "0")
						.attr("x2", "0")
						.attr("y2", "10")
						.attr("style", "stroke-width:15;stroke:" + scaledHash[key] + ";")
			pattern.append("line")
						.attr("x1", "13")
						.attr("y1", "0")
						.attr("x2", "13")
						.attr("y2", "10")
						.attr("style", "stroke-width:15;stroke:" + "darkslategray" + ";");
		}
	}

	function choosePattern(name) {
		return scaledHash[name];
	}

	function retrieveGrade(grade, immunity) {
		if (grade > 90) {
			return immunity ? "A-Y" : "A-N"; 
		}
		else if (grade <= 90 && grade > 80) {
			return immunity ? "B-Y" : "B-N"; 
		}
		else if (grade <= 80 && grade > 70) {
			return immunity ? "C-Y" : "C-N";
		}
		else if (grade <= 70 && grade > 60) { 
			return immunity ? "D-Y" : "D-N";
		}
		else if (grade <= 60) {
			return immunity ? "F-Y" : "F-N"; 
		}
		else {
			console.log(grade);
		}
	}

	// Load the actual map data
	function loadMapData() {
		d3.json("data/usa_states_500k_topo_codes.json", function(error, map) {
			if (error) return console.error(error);

			// The individual states/countries
			var subunits = topojson.feature(map, map.objects.states).features;
			// The entire map, used for the nice border
			var unit = topojson.feature(map, map.objects.states);

			//console.log(subunits);
			console.log(topojson.feature(map, map.objects.states));
			//console.log(unit);
			
			//features.append("path")
				//.datum(unit)
					//.attr("class", "country")
					//.attr("d", path)
					//.attr("stroke", "#ddd")
					//.attr("fill", "#ddd")
					//.attr("stroke-width", 7)
					//.attr("stroke-linejoin", "round");

			features.selectAll(".subunit")
					.data(subunits)
				.enter().append("path")
					.attr("d", path)
					.attr("class", function(d) { 
							var displayName = d.properties.NAME;
							var name = d.properties.NAME.replace(/\.+\ +/,"");
							listSubunits.push(name);
							var el = document.createElement("option");
							el.setAttribute("value", name);
							el.textContent = displayName;
							countrySelector.appendChild(el);

							console.log(displayName);
		
							return "subunit " + name; })
					.attr("fill", function(d) {
							var score = parseFloat(d.properties.ScorePercentage);
							var immunity = d.properties.MinorImmunity.toLowerCase();

							if ( ~immunity.indexOf("yes") ) {
								 immunity = true;
							} else {
								 immunity = false;
							}	
							grade = retrieveGrade(score,immunity);
							console.log(grade);
							return choosePattern(grade);
					})
					.attr("stroke", "#999")
					.attr("stroke-width", 1)
					.attr("stroke-linejoin", "round")
					.on("click", clicked)
					.on("mouseover", mouseover)
					.on("mouseout", mouseout);
		});
		
	}
	
	function plotBuyerData() {
		d3.csv("buyer_processing/buyers_export_2.csv", function(error, buyers) {
			if (error) return console.error(error);
			console.log(buyers);

			dots.selectAll("circle")
				.data(buyers)
					.enter()
					.append("circle")
					.attr("class", "case_dot")
					.attr("cx", function(d) {
						var proj = projection([d["Lon"], d["Lat"]]);
						return proj[0];
					})
					.attr("cy", function(d) {
						var proj = projection([d["Lon"], d["Lat"]]);
						return proj[1];
					})
					.attr("r", dotRadius)
					.attr("stroke", "#fff")
					.attr("stroke-width", dotBorder)
					.on("click", function(d) {console.log(d)});
		});
	}

	d3.select("#reset").on("click", reset);
	d3.select("#lock").on("click", lock);
	d3.select("#zoom_in").on("click", function() { zoomDir("in"); });
	d3.select("#zoom_out").on("click", function() { zoomDir("out"); });
	countrySelector.addEventListener("change", function(e) { 
			var classSelected = "." + this.options[this.selectedIndex].value.toString();
			var d = d3.select(classSelected);
			d.each(clicked);
	});
	toggle_btn.addEventListener("click", function(e) {
			var d = d3.selectAll(".subunit");
			d.each(toggle);
	});

	function zoomed() {
		svg.selectAll("path")
			.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");

		svg.selectAll("circle")
			// Shfit scale up 1 and then contract to give the same size at scale = 1:
			// Default is the size at scale = 1, x is scaling factor of the map
			// z is the compression factor, y is the output
			//
			// Default/x = y;
			// Default/x + 1 = y;
			// z * Default/x + 1 = y:
			// So: z * 3/x + 1 = y;
			// z * 3/1 + 1 = 3;
			// 3z + 1 = 3; z = 2/3;
			// Pluggin in: (2/3)*(3/x) + 1 = y
			// Simplified: x + 2 / x = y
			.attr("r", function() { return (d3.event.scale + 2) / d3.event.scale; })
			.attr("stroke-width", function() { return 0.25 + (0.75 / d3.event.scale); })
			.attr("transform", function() {
				return "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")";
			});

		svg.selectAll(".subunit")
			.style("stroke-width", 1/ d3.event.scale + "px");

		svg.selectAll(".country")
			.style("stroke-width", function() {
					var size = parseFloat(this.getAttribute("stroke-width") / d3.event.scale);
					return size;
			});
	}

	// This is called on click and onchange of the select box
	function clicked(d) {

		if (active.node() === this) return reset();
		active.classed("active", false);
		active = d3.select(this).classed("active", true);

		var bounds = path.bounds(d),
				dx = bounds[1][0] - bounds[0][0],
				dy = bounds[1][1] - bounds[0][1],
				x = (bounds[0][0] + bounds[1][0]) / 2,
				y = (bounds[0][1] + bounds[1][1]) / 2,
				scale = 0.9 / Math.max(dx / width, dy / height),
				translate = [width / 2 - scale * x, height / 2 - scale * y];

		svg.transition()
			.duration(1000)
			.call(zoom.translate(translate).scale(scale).event);

		// Account for the select a country item
		var name = d.properties.NAME.replace(/\.+\ +/,"")
		var index = listSubunits.indexOf(name) + 1;
		// Keep the select box up to date, even if navigating by click
		countrySelector.options[index].selected = true;
	}

	function reset() {
		active.classed("active", false);
		active = d3.select(null);

		svg.transition()
				.duration(750)
				.call(zoom.translate([0, 0]).scale(1).event);

		countrySelector.options[0].selected = true;
	}

	function toggle(d) {
		var name = d.properties.NAME.replace(/\.+\ +/,"")
		var index = listSubunits.indexOf(name);
		var offset = index * 1500;


		console.log(offset);	
		d3.select(this)
			.transition()
			.attr("transform", function(d) {
				var bbox = this.getBBox(),
						scaleRatio,
						dX,
						dY;
				
				scaleRatio =  100 / bbox.height;
				dX = -1 * bbox.x;
				//dY = (-1 * bbox.y);
				dY = (-1 * bbox.y) + (offset * scaleRatio);
				//dY = offset;
				console.log(scaleRatio, dX, dY, offset / bbox.height);

				return "scale(" + scaleRatio + ") translate(" + dX + "," + dY + ")";
			});
	}

	function lock() {
		if (!locked) {
			locked = true;
			lock_btn.innerHTML = "Unlock Zoom Gestures";
			svg.on(".zoom", null);
		}
		else {
			locked = false;
			lock_btn.innerHTML = "Lock Zoom Gestures";
			svg.call(zoom);
		}
	}

	function zoomDir(dir) {
		h = parseFloat(document.getElementById("svg--map").clientHeight);
		w = parseFloat(document.getElementById("svg--map").clientWidth);

		if (dir == "in") {
			var newZoom = zoom.scale() * 1.5;
			var newX = ((zoom.translate()[0] - (width / 2)) * 1.5) + width / 2;
			var newY = ((zoom.translate()[1] - (height / 2)) * 1.5) + height / 2;
		}
		else {
			var newZoom = zoom.scale() * 0.75; 
			var newX = ((zoom.translate()[0] - (width / 2)) * 0.75) + width / 2;
			var newY = ((zoom.translate()[1] - (height / 2)) * 0.75) + height / 2;
		}

		svg.transition()
				.duration(750)
				.call(zoom.translate([newX, newY]).scale(newZoom).event);
	}

	function mouseover(d) {
		hover.classed("hover", false);
		hover = d3.select(this).classed("hover", true);
	}
	
	function mouseout(d) {
		hover.classed("hover", false);
	}
	
	function stopped() {
		if (d3.event.defaultPrevented) d3.event.stopPropagation();
	}
	
