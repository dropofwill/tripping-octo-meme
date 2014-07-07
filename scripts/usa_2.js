	// Set Aspect Ratio in pixels
	var width = 960,
			height = 500,
			active = d3.select(null),
			hover = d3.select(null),
			locked = false,
			listSubunits = [],
			scaledColors = ['#f0ffff', '#bbb9d8', '#8679b2', '#503b8c', '#000066'],
			scaledHash ={   'A-Y': '#f0ffff',
											'B-Y': '#c1c6e1',
											'C-Y': '#938fc4',
											'D-Y': '#635ba6',
											'F-Y': '#2c2c88'},
			scaledFills = scaledColors.slice(0),
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
    .scaleExtent([1, 6])
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
	svg.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height)
		.on("click", reset);
		
	// Group the map features
	var features = svg.append("g");

	// Create a pattern for each color and push it to an array to select from
	var defs = features.append("defs")
	createPatterns();

	function createPatterns() {
		for (var key in scaledHash) {
			var name = key.replace(/\-Y/,"-N");
			scaledHash[name] = "url(#" +name+ ")";

			pattern = defs.append("pattern")
				.attr("id", name)
				.attr("patternUnits", "userSpaceOnUse")
				.attr("x", "0")
				.attr("y", "0")
				.attr("width", "10")
				.attr("height", "10")
				.attr("patternTransform", "rotate(45 0 0)")
					.append("line")
						.attr("x1", "0")
						.attr("y1", "0")
						.attr("x2", "0")
						.attr("y2", "10")
						.attr("style", "stroke-width:17;stroke:" + scaledHash[key] + ";");
		}
		//Array.prototype.forEach.call(scaledColors, function(el, i) {
			//var name = "pat_" + el.toString().replace(/\#/,"");
			//scaledFills.push("url(#" + name + ")");
//
			//pattern = defs.append("pattern")
				//.attr("id", name)
				//.attr("patternUnits", "userSpaceOnUse")
				//.attr("x", "0")
				//.attr("y", "0")
				//.attr("width", "10")
				//.attr("height", "10")
				//.attr("patternTransform", "rotate(45 0 0)")
					//.append("line")
						//.attr("x1", "0")
						//.attr("y1", "0")
						//.attr("x2", "0")
						//.attr("y2", "10")
						//.attr("style", "stroke-width:17;stroke:" + el.toString() + ";");
		//});
		console.log(scaledHash);
	}

	function choosePattern(ith) {
		i = ith%scaledFills.length;
		return scaledFills[i];
	}

	function retrieveGrade(grade,immunity) {
		switch (grade,immunity) {
			case 5:
				return immunity ? "A-Y" : "A-N";
			case 4:
				return immunity ? "B-Y" : "B-N";
			case 3:
				return immunity ? "C-Y" : "C-N";
			case 2:
				return immunity ? "D-Y" : "D-N";
			case 1:
				return immunity ? "F-Y" : "F-N";
			default:
				return "azure";
		}
	}

	

	// Choose a pattern for a given number (probably random)
	function choosePatternRandom(ith) {
		i = ith%scaledFills.length;
		return scaledFills[i];
	}

	// Choose a fill color for a given number (probably random)
	function chooseColor(ith, colors) {
		var colors = typeof colors !== 'undefined' ? colors :['#f0ffff', '#bbb9d8', '#8679b2', '#503b8c', '#000066']
		i = ith%colors.length
		return colors[i];
	}


	// Load the actual map data
	d3.json("data/usa_states_500k_topo_codes.json", function(error, map) {
		if (error) return console.error(error);

		// The individual states/countries
		var subunits = topojson.feature(map, map.objects.states).features;
		// The entire map, used for the nice border
		var unit = topojson.feature(map, map.objects.states);

		//console.log(subunits);
		console.log(topojson.feature(map, map.objects.states));
		//console.log(unit);
		
		// Generate a random number for each to kick off the states
		var i = Math.floor(Math.random() * 10) + 1;

		features.append("path")
			.datum(unit)
				.attr("class", "country")
				.attr("d", path)
				.attr("stroke", "#ddd")
				.attr("fill", "#ddd")
				.attr("stroke-width", 7)
				.attr("stroke-linejoin", "round");

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
	
						return "subunit " + name; })
				.attr("fill", function(d) {
						i++;
						var score = d.properties.Score/5;
						var immunity = d.properties.MinorImmunity.toLowerCase();
						//if ( ~immunity.indexOf("yes")) {
							//immunity = true;
						//} else if (~immunity.indexOf("no") {
							//immunity = false;
						//}	
						console.log(score, immunity);
						console.log(retrieveGrade(Math.round(score, immunity)));
						return choosePattern(i); })
				.attr("stroke", "#999")
				.attr("stroke-width", 1)
				.attr("stroke-linejoin", "round")
				.on("click", clicked)
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);
	});

	
	d3.csv("buyer_processing/buyers_export_2.csv", function(error, buyers) {
		if (error) return console.error(error);
		console.log(buyers);

		features.selectAll("circle")
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
				.attr("r", 3)
				.attr("stroke", "#fff")
				.attr("stroke-width", "1")
				.on("click", function(d) {console.log(d)});
	});

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
			.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");

		svg.selectAll(".subunit")
			.style("stroke-width", 1/ d3.event.scale + "px");

		svg.selectAll(".country")
			.style("stroke-width", function() {
					return parseFloat(this.getAttribute("stroke-width") / d3.event.scale);
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
	
