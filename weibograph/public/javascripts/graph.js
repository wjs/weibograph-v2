var g_node_width = '50'
var g_node_radius = '25'
var g_link_width = 200

function WeiboGraph(ele) {
	// var ele = ele = document.getElementById(elementID);
	typeof(ele)=='string' && (ele=document.getElementById(ele));
	var w = ele.clientWidth,
		h = ele.clientHeight,
		self = this;
	this.force = d3.layout.force().gravity(.05)
								.distance(function() { return (Math.random() + 0.6) * g_link_width; })
								.charge(-800).size([w, h]);
	this.nodes = this.force.nodes();
	this.links = this.force.links();
	this.vis = d3.select(ele)
				.append("svg:svg")
             	.attr("width", w)
             	.attr("height", h)
             	.attr("pointer-events", "all");

    var defs = this.vis.append('svg:defs');
	defs.append('svg:rect')
		.attr('id', 'rect')
		.attr('x', '0')
		.attr('y', '0')
		.attr('width', g_node_width)
		.attr('height', g_node_width)
		.attr('rx', g_node_radius);
	var chipPath = defs.append('svg:clipPath')
						.attr('id', 'circle_img');
	chipPath.append('svg:use')
			.attr('xlink:href', '#rect');

	this.force.on("tick", function(x) {
		self.vis.selectAll('g.node')
				.attr('transform', function(d) { return 'translate('+(d.x-g_node_radius)+','+(d.y-g_node_radius)+')'; });	
		self.vis.selectAll('line.link')
				.attr('x1', function(d) { return d.source.x; })
				.attr('y1', function(d) { return d.source.y; })
				.attr('x2', function(d) { return d.target.x; })
				.attr('y2', function(d) { return d.target.y; });
	});
}

WeiboGraph.prototype.doZoom = function() {
	d3.select(this).select('g')
					.attr('transform', 'translate('+d3.event.translate+') scale('+d3.event.scale+')');
}

WeiboGraph.prototype.addNode = function(node) {
	this.nodes.push(node);
}

WeiboGraph.prototype.addNodes = function(nodes) {
	if (Object.prototype.toString.call(nodes) == '[object Array]') {
		var self = this;
		nodes.forEach(function(node) {
			self.addNode(node);
		});
	}
}

WeiboGraph.prototype.addLink = function(source, target) {
	this.links.push({source: this.findNode(source), 
					target: this.findNode(target)});
}

WeiboGraph.prototype.addLinks = function(links) {
	if (Object.prototype.toString.call(links) == '[object Array]') {
		var self = this;
		links.forEach(function(link) {
			self.addLink(link['source'], link['target']);
		});
	}
}

WeiboGraph.prototype.removeNode = function(uid) {
	var i = 0,
		n = this.findNode(uid),
		links = this.links;
	while (i < links.length) {
		links[i]['source']==n || links[i]['target']==n ? links.splice(i, 1) : ++i;
	}
	this.nodes.splice(this.findNodeIndex(uid), 1);
}

WeiboGraph.prototype.findNode = function(uid) {
	var nodes = this.nodes;
	for (var i in nodes) {
		if (nodes[i]['uid'] == uid)
			return nodes[i];
	}
	return null;
}

WeiboGraph.prototype.findNodeIndex = function(uid) {
	var nodes = this.nodes;
	for (var i in nodes) {
		if (nodes[i]['uid'] == uid)
			return i;
	}
	return -1;
}

WeiboGraph.prototype.clearNodes = function() {
	this.nodes.length = 0;
}

WeiboGraph.prototype.clearLinks = function() {
	this.links.length = 0;
}

WeiboGraph.prototype.update = function() {
	var link = this.vis.selectAll('line.link')
						.data(this.links, function(d) { return d.source.uid + '-' + d.target.uid; })
						.attr('class', function(d) { return 'link'; });

	link.enter().insert('svg:line', 'g.node')
				.attr('class', function(d) { return 'link'; });

	link.exit().remove();

	var node = this.vis.selectAll('g.node')
						.data(this.nodes, function(d) { return d.uid; });

	var nodeEnter = node.enter().append('svg:g')
						.attr('class', 'node')
						.call(this.force.drag);
	
	
	nodeEnter.append('svg:image')
			.attr('clip-path', 'url(#circle_img)')
			.attr('xlink:href', function(d) { return 'http://tp2.sinaimg.cn/' + d.uid + '/50/0/1';})
			.attr('width', g_node_width+'px')
			.attr('height', g_node_width+'px')
			.on('mouseover', function(d) {
				x = event.x;
				y = event.y;
				showToolTip(d, x, y, true);
			})
			.on('mousemove', function(d) {
				x = event.x;
				y = event.y;
				tooltipDiv.css({top:y,left:x});
			})
			.on('mouseout', function(d) {
				showToolTip(" ",0,0,false);
			})
			.on('dblclick',function(d){ 
				changeGraphAjax(d.uid);
			});
	
	nodeEnter.append('svg:text')
			.attr('class', 'nodetext')
			.attr('dx', 0)
			.attr('dy', -5)
			.text(function(d) { return d.nick });

	node.exit().remove();

	this.force.start();
}


function changeGraphAjax(uid) {
	$.ajax({
		type: 'GET',
		url: $SCRIPT_ROOT + '/graph',
		contentType: 'application/json; charset=utf-8',
		data: {'uid': uid},
		success: function(data) {
			json = eval("("+data+")");

			if (json.nodes.length > 150) {
				g_node_width = '20';
				g_node_radius = '10';
				g_link_width = 110;
			} else if (json.nodes.length > 100) {
				g_node_width = '30';
				g_node_radius = '15';
				g_link_width = 140;
			}  else if (json.nodes.length > 50) {
				g_node_width = '40';
				g_node_radius = '20';
				g_link_width = 170;
			}  else {
				g_node_width = '50';
				g_node_radius = '25';
				g_link_width = 200;
			}
			d3.select(document.getElementById("graph")).html('');
			weiboGraph = new WeiboGraph('graph');

			// weiboGraph.clearNodes();
			// weiboGraph.clearLinks();
			weiboGraph.addNodes(json.nodes);
			weiboGraph.addLinks(json.links);
			weiboGraph.update();
		},
		error: function(data) {
			$('#loading-div').hide();
			alert('Ajax to get graph occur error.')
		}
	});
}

function showToolTip(node, x, y, isShow) {
	if (typeof(tooltipDiv) == "undefined") {
		tooltipDiv = $('<div id="tooltipDiv"></div>');
		$('body').append(tooltipDiv);
	}
	if (!isShow) { tooltipDiv.hide(); return; }

	htmlStr = '<div align="center"><img src="http://tp2.sinaimg.cn/' + node.uid + '/50/0/1"></div>'
	htmlStr += 'uid: ' + node.uid + '<br>';
	htmlStr += 'nick: ' + node.nick + '<br>';
	htmlStr += 'follows: ' + node.follows + '<br>';
	htmlStr += 'fans: ' + node.fans + '<br>';
	tooltipDiv.html(htmlStr);
	tooltipDiv.css({top:x, left:y});
	tooltipDiv.show();
}

/*-- Init global variable -----------------------------------------------------*/
var weiboGraph = new WeiboGraph('graph');