/**
 * Controlling data visualisation widget - Intelligent Project Controlling
 * IKS Project
 * @author szabyg
 * @since 2011-01-12
 */
$.widget('ipc.controldatavis', {
	_create: function(){
		this.position = ['iks', '8'];
		
		// DOM element for the mode switches
		this.element.append($('<div class="modeSwitches"/>'));
		this.modeSwitchElement = $(".modeSwitches", this.element);
		this.prepareModeSwitches();
		
		// DOM element for the breadCrumbs
		this.element.append($('<div class="breadCrumbs"/>'));
		this.breadCrumbsElement = $(".breadCrumbs", this.element);
		this.preparebreadCrumbs();
		
		// Canvas DOM element 
		this.element.append($('<canvas class="controlCanvas" width="650" height="400" style="border: 1px solid #CCCCCC;top:0;position:relative;"/>'));
		this.canvasElement = $(".controlCanvas", this.element);
		
		// show initial data
		this.init();
	},
	/**
	 * get data tree and show graph in the canvas
	 */
	init: function(){
		var that = this;
		// Get planned and effort data
		this.options.dataStore.getPlanEffortData(this.options.constraints, function(data){
			that.data = data;
			that.refresh();
		});
	},
	/**
	 * Draw graph with the current options
	 */
	refresh: function(){
		RGraph.Clear(this.canvasElement[0]);
		this.preparebreadCrumbs();
		this.showPlanned = true; 
		this.showSpent = false;
		this.showDetails = this.options.detailed;
		this.canvasId = this.canvasElement.getUID();
		var dataArrays = this.getDataArrays();

		if(this.showPlanned){
			// BarChart for planned data
			var planBarChart = new RGraph.Bar(this.canvasId, dataArrays.planArr);
			RGraph.SetConfig(planBarChart, 
					this.getBarchartConfig(dataArrays.maxVal, dataArrays.labels, {
						// 'chart.background.grid': false,
						'chart.colors': [
										    'rgba(0,200,0,1)',
										    'rgba(255,0,0,0.7)'
						]
						// 'chart.key': ['Underspent', 'Overspent']
					})
			);
			planBarChart.Draw();
			RGraph.Register(planBarChart);
		}

		if(this.showSpent){
			// BarChart for spent data
			var spentBarChart = new RGraph.Bar(this.canvasId, dataArrays.spentArr);
			RGraph.SetConfig(spentBarChart, 
					this.getBarchartConfig(dataArrays.maxVal, dataArrays.labels, {
						'chart.grouping': 'stacked',
						'chart.colors': ['rgba(255,0,0,0.7)']
					})
			);
			spentBarChart.Draw();

			// Can only register one chart for being redrawn?
/*
			RGraph.Register(spentBarChart);
			spentBarChart.canvas.onclick = function (e)
			{
				RGraph.Redraw();
				
				var canvas  = e.target;
				var context = canvas.getContext('2d');
				var obj     = canvas.__object__;
				var coords  = obj.getBar(e);
				
				if (coords) {
					var top    = coords[1];
					var left   = coords[2];
					var width  = coords[3];
					var height = coords[4];
					
					context.beginPath();
					context.strokeStyle = 'black';
					context.fillStyle = 'rgba(255,255,255,0.5)';
					context.strokeRect(top, left, width, height);
					context.fillRect(top, left, width, height);
					context.stroke();
					context.fill();
				}
			};
*/
	    }
		
		if(this.showDetails){
			// BarChart for planned data
			var plannedDetailBarChart = new RGraph.Bar(this.canvasId, dataArrays.plannedEffortDetail);
			RGraph.SetConfig(plannedDetailBarChart, 
				this.getBarchartConfig(dataArrays.maxVal, dataArrays.labels, {
					'chart.grouping': 'stacked',
					'chart.colors': [
									    'rgba(0,120,0,0.7)',
									    'rgba(0,180,0,0.7)',
									    'rgba(0,240,0,0.7)',
									    
									    'rgba(0,120,0,0.7)',
									    'rgba(0,180,0,0.7)',
									    'rgba(0,240,0,0.7)',
									    
									    'rgba(0,120,0,0.7)',
									    'rgba(0,180,0,0.7)',
									    'rgba(0,240,0,0.7)',
									    
									    'rgba(0,120,0,0.7)',
									    'rgba(0,180,0,0.7)',
									    'rgba(0,240,0,0.7)',
									    
									    'rgba(0,120,0,0.7)',
									    'rgba(0,180,0,0.7)',
									    'rgba(0,240,0,0.7)',
									    
										    
										    'rgba(255,0,0,0.7)', 'rgba(0,255,0,0.7)', 'rgba(0,0,255,0.7)'],
 					'chart.tooltips2': dataArrays.plannedEffortDetailTooltip,
 					'chart.tooltips.event': ''
				})
			);

			canvas_onmousemove = function (e){
				var e = RGraph.FixEventObject(e);
				RGraph.Redraw();
				
				var canvas  = e.target;
				var context = canvas.getContext('2d');
				var obj     = canvas.__object__;
				var coords  = obj.getBar(e);
				
				if (coords) {
					var cols = obj.data.length;
					var rows = obj.data[0].length;
					var row = coords[5] % rows;
					
					// Highlight the whole task over all periods
					for (var col = 0; col<cols;col++){
						var c = obj.coords[col * rows + row];
						var top    = c[0];
						var left   = c[1];
						var width  = c[2];
						var height = c[3];
						
						context.beginPath();
						context.strokeStyle = 'black';
						context.fillStyle = 'rgba(255,255,255,0.5)';
						context.strokeRect(top, left, width, height);
						context.fillRect(top, left, width, height);
						context.stroke();
						context.fill();
					}

					// Show tooltip
	                /**
	                * If there are bar coords AND the bar has height
	                */
	                if (coords && coords[4] > 0) {

	                    /**
	                    * Get the tooltip text
	                    */
	                    if (typeof(obj.Get('chart.tooltips2')) == 'function') {
	                        var text = String(obj.Get('chart.tooltips2')(coords[5]));
	                    
	                    } else if (typeof(obj.Get('chart.tooltips2')) == 'object' && typeof(obj.Get('chart.tooltips2')[coords[5]]) == 'function') {
	                        var text = String(obj.Get('chart.tooltips2')[coords[5]](coords[5]));
	                    
	                    } else if (typeof(obj.Get('chart.tooltips2')) == 'object' && (typeof(obj.Get('chart.tooltips2')[coords[5]]) == 'string' || typeof(obj.Get('chart.tooltips2')[coords[5]]) == 'number')) {
	                        var text = String(obj.Get('chart.tooltips2')[coords[5]]);
	                
	                    } else {
	                        var text = null;
	                    }

	                    if (text) {
	                        canvas.style.cursor = 'pointer';
	                    } else {
	                        canvas.style.cursor = 'default';
	                    }
	                    
	                    /**
	                    * Hide the currently displayed tooltip if the index is the same
	                    */
	                    if (   RGraph.Registry.Get('chart.tooltip')
	                        && RGraph.Registry.Get('chart.tooltip').__canvas__.id != obj.id
	                        && obj.Get('chart.tooltips.event') == 'onmousemove') {

	                        RGraph.Redraw();
	                        RGraph.HideTooltip();
	                    }

	                    /**
	                    * This facilitates the tooltips using the onmousemove event
	                    */

	                    if (   obj.Get('chart.tooltips.event') == ''
	                        && (
	                               (RGraph.Registry.Get('chart.tooltip') && RGraph.Registry.Get('chart.tooltip').__index__ != coords[5])
	                            || !RGraph.Registry.Get('chart.tooltip')
	                           )
	                        && text) {
	                        RGraph.Tooltip(canvas, text, e.pageX, e.pageY, coords[5]);
	                    }
	                } else {
	                    canvas.style.cursor = 'default';
	                }
// -------------------------
				}
			};
			var that = this;
			canvas_onclick = function(e){
				var e = RGraph.FixEventObject(e);
				RGraph.Redraw();
				
				var canvas  = e.target;
				var context = canvas.getContext('2d');
				var obj     = canvas.__object__;
				var coords  = obj.getBar(e);
				
				if (coords) {
					var cols = obj.data.length;
					var rows = obj.data[0].length;
					var row = coords[5] % rows;
					
					that.zoomIn(row);
				}
			};
			RGraph.AddCustomEventListener(plannedDetailBarChart.canvas, 'ondraw', function(){
				RGraph.AddEventListener(plannedDetailBarChart.canvas.id, 'mousemove', canvas_onmousemove);
				plannedDetailBarChart.canvas.addEventListener('mousemove', canvas_onmousemove, false);

				RGraph.AddEventListener(plannedDetailBarChart.canvas.id, 'click', canvas_onclick);
				plannedDetailBarChart.canvas.addEventListener('click', canvas_onclick, false);
			});
			plannedDetailBarChart.Draw();
			RGraph.Register(plannedDetailBarChart);

		}
		$.noop();
	},
	/**
	 * 
	 * @param child
	 */
	zoomIn: function(child){
		// get actual position treenode
		var actualTreeNode = this.getData();
		// get children keys
		var keys=[];for(var i in actualTreeNode.children) if(actualTreeNode.children.hasOwnProperty(i)){keys.push(i);};
		// extend position
		this.position.push(keys[child]);
		// redraw chart
		this.refresh();
	},
	zoomOut: function(level){
		this.position = this.position.slice(0, level);
		this.refresh();
		return false;
	},
	/**
	 * Default options
	 */
	options: {
		dataStore: iks.ipc.dataStorage, 
		constraints: {},
		waitMsg: "collecting data...",
		planned: 'pm-planned',
		spent: 'pm-spent',
		showPlan: true,
		showSpent: false,
		detailed: "wbs",
		ecSwitch: 'effort',
		zoomSwitch: 'smart'
	},
	/**
	 * Collect records by periods
	 * Extract data sets for planned AND/OR spent effort OR costs WITH/WITHOUT details in wbs OR organisation 
	 * @returns {}
	 */
	getDataArrays: function() {
		// Find relevant records and assign them to their quarter
		// TODO Fix this.options.constraints
		var children = this.getData().getRelevantChildren(/*this.options.constraints*/);
		var records = this.getData().getRelevantRecords(this.options.constraints);
		var periodIds = [];
		for(var recI = 0; recI<records.length; recI++){
			var record = records[recI];
			if (periodIds.indexOf(record['period']) == -1)
				periodIds.push(record['period']);
		}
		periodIds = this.getTotalPeriodsArray(periodIds);
		var periods=[];
		for(var i=0;i<periodIds.length;i++){
			periods.push([periodIds[i], []]); 
		}
		for(var recI = 0; recI<records.length; recI++){
			var record = records[recI];
			var perI = 0;
			while(periods[perI][0]!=record.period || perI>periods.length)
				perI++;
			if(periods[perI][0] == record.period)
				periods[perI][1].push(record);
			else
				throw new Exception("wrong period in getDataArrays");
		}
		
		// ********** Planned, spent, wbs and other details from here
		
		var planArr = [], spentArr = [], labels = [], maxVal = 0;
		
		// Sum planned and spent data to show on the charts
		for(var i=0;i<periods.length;i++){
			var periodI = periods[i][0];
			var plannedSum = 0, spentSum = 0;
			labels[labels.length] = this.getLabelById(periodI);
			var per = periods[i][1];
			
			// TODO This should be done by the tree using constraints (depends on cleaning up constraints)
			for(var recI in per) if(per.hasOwnProperty(recI)){
				var rec = per[recI];
				if(rec[this.options.planned])
					plannedSum += Number(rec[this.options.planned]);
				if(rec[this.options.spent])
					spentSum += Number(rec[this.options.spent]);
			}
			// get first+last quarter, config labels
			planArr[planArr.length] = [plannedSum];
			spentArr[spentArr.length] = [spentSum];
			maxVal = Math.max(maxVal, plannedSum, spentSum);
			
			$.noop();
		}
		var res = {
				labels: labels, 
				maxVal: maxVal};
		if(this.showPlanned)res.planArr = planArr; 
		if(this.showSpent)res.spentArr = spentArr;
		if(this.showDetails)$.extend(res, this.getDetailedDataArray(periods));
		return res;
	},
	getTotalPeriodsArray: function(periodIds){
		// Sort them
		periodIds.sort(function(A, B){
			var nA, nB;
			var kA, kB;
			kA = A; kB = B;
            nA = Number(kA.substring(kA.lastIndexOf(":")+2,kA.length));
            nB = Number(kB.substring(kB.lastIndexOf(":")+2,kB.length));
            return nA>nB;
		});
		// Take the first key and the last and fill the gap using the prefix
//		var aKey;for(var k in periodIds[0])aKey = k;
		var prefix = periodIds[0].substring(0, periodIds[0].lastIndexOf(":")+2);
		var first = periodIds[0], last = periodIds[periodIds.length-1];
		var firstI = Number(first.substring(first.lastIndexOf(":")+2)),
			lastI  = Number(last. substring(last. lastIndexOf(":")+2));
		var res = [];
		for(var i = firstI; i<= lastI; i++){
			res.push(prefix+i);
		}
		return res;
	},
	getLabelById: function(id){
		if(id.indexOf("period") != -1 && id.indexOf("urn:")==0){
			return id.substring(id.lastIndexOf(":")+1, id.length);
		}else {
			return id;
		}
	},
	getDetailedDataArray: function(periods){
		/*
		 * For each period we need the sums for each children
		 * - structure: [[2,3,1],[3,1,2], ...] meaning [<periods>[<children>]]
		 * first we need {<per>: {<childId>: sum}
		 * TODO umgekehrte Reihenfolge
		 */
		
		var children = this.getData().getRelevantChildren(/*this.options.constraints*/);
//		var records = this.getData().getRelevantRecords(this.options.constraints);
//		var periods = {};
//		for(var recI = 0; recI<records.length; recI++){
//			var record = records[recI];
//			if (!periods[record['period']])
//				periods[record['period']] = [];
//			periods[record['period']].push(record);
//		}

		var childrenIds = [], periodNames = [];
		for(var perI in periods)periodNames.push(periods[perI][0]);
		for(var childId in children)childrenIds.push(childId);
		
		// The result as an object. It has to be converted to an array then.
		var resObj = {};
		for(var perI in periodNames) if(periodNames.hasOwnProperty(perI)){
			var perId = periodNames[perI];
			resObj[perId] = {};
			var perObj = resObj[periodNames[perI]];
			for(var childI in childrenIds) if(childrenIds.hasOwnProperty(childI)){
				var childId = childrenIds[childI];
				perObj[childId] = {};
				perObj[childId][this.options.spent] = 0;
				perObj[childId][this.options.planned] = 0;
			}
		}
		for(var childId in children) if(children.hasOwnProperty(childId)){
			var child = children[childId];
			var records = child.getRelevantRecords(this.options.constraints);
//			var periods = {};
			// TODO Put together the periods as in not detailed
			var periodIds = [];
			for(var recI = 0; recI<records.length; recI++){
				var record = records[recI];
				if (periodIds.indexOf(record['period']) == -1)
					periodIds.push(record['period']);
			}
			periodIds = this.getTotalPeriodsArray(periodIds);
			var periods=[];
			for(var i=0;i<periodIds.length;i++){
				periods.push([periodIds[i], []]); 
			}
			for(var recI = 0; recI<records.length; recI++){
				var record = records[recI];
				var perI = 0;
				while((periods[perI+1] && periods[perI][0]!=record.period) || perI>periods.length)
					perI++;
				if(periods[perI][0] == record.period)
					periods[perI][1].push(record);
				else
					throw "wrong period in getDataArrays";
			}
///////////////////////
			for(var recI = 0; recI<records.length; recI++){
				var rec = records[recI];
				if (!periods[rec['period']])
					periods[rec['period']] = [];
				periods[rec['period']].push(rec);
				// add record value to sum
				if(rec[this.options.planned])
					 resObj[rec['period']][childId][this.options.planned] += Number(rec[this.options.planned]);
				if(rec[this.options.spent])
					 resObj[rec['period']][childId][this.options.spent] += Number(rec[this.options.spent]);
			}
		}
		var detailedPlanArr = [], detailedSpentArr = [], 
			detailedPlanArrTooltip = [], detailedSpentArrTooltip = [];
		var i=0;
		for(var perId in resObj) if(resObj.hasOwnProperty(perId)){
			var plArr = [], spArr = [];
			// The sorting is decided here:
			for(var childId in resObj[perId]) if(resObj[perId].hasOwnProperty(childId)){
				var planSum = resObj[perId][childId][this.options.planned];
				var spentSum = resObj[perId][childId][this.options.spent];
				plArr.push(planSum);
				spArr.push(spentSum);
				var label = children[childId].label + " in " + this.getLabelById(perId) + ": ";
				detailedPlanArrTooltip.push(label + " has " + planSum + " PM");
				detailedSpentArrTooltip.push(label + spentSum);
			}
			detailedPlanArr.push(plArr);
			detailedSpentArr.push(spArr);
		}
		var res = {};
		res.plannedEffortDetail = detailedPlanArr;
		res.plannedEffortDetailTooltip = detailedPlanArrTooltip;
		res.spentEffortDetail = detailedSpentArr;
		res.spentEffortDetailTooltip = detailedSpentArrTooltip;
		
		return res;
	},
	/**
	 * Get data subtree according to this.position
	 */
	getData: function() {
		var res = this.data;
		for(var i in this.position) if(this.position.hasOwnProperty(i)){
			if(!res.children[this.position[i]]){
				alert("wrong position value: " + this.position[i]);
				debugger;
				return null;
			}
			res = res.children[this.position[i]];
		}
		return res;
	},
	/**
	 * creates a barchart configuration
	 */
	getBarchartConfig: function(maxVal, labels, custom){
		var config = {
				'chart.units.post': 'PM',
//				'chart.title': 'Sales in the last 8 months (tooltips)'
				'chart.colors': ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,255,255,0.5)'],
				'chart.gutter': 50, // space for left scale
				'chart.ymax': maxVal,
				'chart.shadow': true,
				'chart.shadow.color': '#aaa',
//				'chart.background.barcolor1': 'white',
//				'chart.background.barcolor2': 'white',
//				'chart.background.grid.hsize': 5,
//				'chart.background.grid.vsize': 5,
//				'chart.grouping': 'stacked',
				'chart.labels': labels,
				'chart.labels.above': true,
//				'chart.key': ['Overspent', 'Available', 'Spent'],
				'chart.key.background': 'rgba(255,255,255,0.7)',
				'chart.key.position': 'gutter',
				'chart.key.position.gutter.boxed': false,
				'chart.key.position.y': (40) - 15,
				'chart.key.border': true,
				
				'chart.background.grid.width': 0.3, // Decimals are permitted
				'chart.text.angle': 45,
				'chart.strokecolor': 'rgba(0,0,0,0)',
				'chart.tooltips.event': 'onmousemove'
		};
		$.extend(config, custom);
		return config;
	},
	/**
	 * 
	 */
	prepareModeSwitches: function(){
		var widgetId = this.element.getUID();
	/*	
		// http://jsbin.com/ovuku4
		// Button group for switching between effort and costs
		var ecSwitchName = "effCostSwitch";
		
		this.modeSwitchElement.append(
			"<span class='switch " + ecSwitchName + "'>" +
				"<input type='radio' name='" + ecSwitchName + "' class='effort' value='effort' id='" + widgetId + "-eff'> <label for='" + widgetId + "-eff'>effort</label>" +
				"<input type='radio' name='" + ecSwitchName + "' class='costs' value='costs' id='" + widgetId + "-costs'> <label for='" + widgetId + "-costs'>costs</label>" +
			'</span>'
		);
		$('.' + ecSwitchName, this.modeSwitchElement).buttonset();
		var that = this;
		$('.' + ecSwitchName + ' input', this.modeSwitchElement).change(function(){
			var switchValue = $('input[name=' + ecSwitchName + ']:checked', that.modeSwitchElement).val();
			that.options.ecSwitch = switchValue;
			that.refresh();
		});
		// Default is effort
		this.setEffCostSwitchValue('effort');
		
		// Button group for switching between zoom modes
		var zSwitchName = "zoomSwitch";
		this.modeSwitchElement.append(
			"<span class='switch " + zSwitchName + "'>Zoom: " +
				"<input type='radio' name='" + zSwitchName + "' class='project' value='project' id='" + widgetId + "-project'> <label for='" + widgetId + "-project'>project</label>" +
				"<input type='radio' name='" + zSwitchName + "' class='smart' value='smart' id='" + widgetId + "-smart'> <label for='" + widgetId + "-smart'>smart</label>" +
			"</span>"
		);
		$('.' + zSwitchName, this.modeSwitchElement).buttonset();
		var that = this;
		$('.' + zSwitchName + ' input', this.modeSwitchElement).change(function(){
			var switchValue = $('input[name=' + zSwitchName + ']:checked', that.modeSwitchElement).val();
			that.options.zoomSwitch = switchValue;
			that.refresh();
		});
		// Default is smart
		this.setZoomSwitchValue('smart');
*/		
		// Button for turning details on/off
		var detSwitchName = "detailSwitch";
		this.modeSwitchElement.append(
			"<span class='switch " + detSwitchName + "'>" +
				"<input type='checkbox' name='" + detSwitchName + "' class='details' id='" + widgetId + "-det'> <label for='" + widgetId + "-det'>details</label>" +
			"</span>"
		);
//		$('.' + detSwitchName, this.modeSwitchElement).button();
		var that = this;
		$('.' + detSwitchName + ' input', this.modeSwitchElement).button().change(function(){
			var switchValue = $('input[name=' + detSwitchName + ']', that.modeSwitchElement).checked;
			that.options.detailed = that.getDetailButtonValue();
			that.refresh();
//			alert(that.getDetailButtonValue());
		});
		// Default is smart
		this.setDetailButtonValue(true);

		
		/*
		var copSwitchName = "consOrgPeopleSwitch";
		this.modeSwitchElement.append(
			'<span class="switch ' + copSwitchName + '">' +
				"<input type='radio' name='" + copSwitchName + "' class='consortium' value='consortium' id='" + widgetId + "-cons'> <label for='" + widgetId + "-cons'>consortium</label>" +
				"<input type='radio' name='" + copSwitchName + "' class='organisation' value='organisation' id='" + widgetId + "-org'> <label for='" + widgetId + "-org'>organisation</label>" +
				"<input type='radio' name='" + copSwitchName + "' class='people' value='people' id='" + widgetId + "-people'> <label for='" + widgetId + "-people'>people</label>" +
			'</span>'
		);
		$('.' + copSwitchName, this.modeSwitchElement).buttonset();
		*/
	},
	/**
	 * Show the whole position path with back-links
	 */
	preparebreadCrumbs: function(){
		this.breadCrumbsElement.html("");
		var label = "";
		for(var i = 0; i < this.position.length; i++){
			var bcEl = this.position[i];
			if(label=="")label += bcEl;else label += "." + bcEl;
			if(i==0)label = bcEl;
			if(i==1)label = "WP " + bcEl;
			if(i==2)label = "Task " + this.position[1] + "." + this.position[2];
			
			this.breadCrumbsElement.append('<a onclick="$(\'#' + this.element[0].id + '\').controldatavis(\'zoomOut\', ' + (i+1) + ')" class="bcElement">' + label + '</a> ');
		}
		$(".bcElement", this.breadCrumbsElement).button();
	},
	/**
	 * Return the switch value
	 * @returns one of ['effort', 'costs']
	 */
	getEffCostSwitchValue: function(){
		var radioName = "effCostSwitch";
		return $('input[name=' + radioName + ']:checked', this.element).val() || '';
	},
	/**
	 * Select 
	 * @param val ['effort', 'costs', '']
	 */
	setEffCostSwitchValue: function(val){
		var radioName = "effCostSwitch";
		if(!val){
			$('input[name=' + radioName + ']', this.element).each(function(){
				this.checked = false; this.button("refresh");
			});
		} else {
			var swButton = $('input[name=' + radioName + '][value=' + val + ']', this.element);
			swButton[0].checked = true; swButton.button("refresh");
		}
	},
	/**
	 * Return the switch value
	 * @returns one of ['project', 'smart']
	 */
	getZoomSwitchValue: function(){
		var radioName = "zoomSwitch";
		return $('input[name=' + radioName + ']:checked', this.element).val() || '';
	},
	/**
	 * Select 
	 * @param val ['effort', 'costs', '']
	 */
	setZoomSwitchValue: function(val){
		var radioName = "zoomSwitch";
		if(!val){
			$('input[name=' + radioName + ']', this.element).each(function(){
				this.checked = false; this.button("refresh");
			});
		} else {
			var swButton = $('input[name=' + radioName + '][value=' + val + ']', this.element);
			swButton[0].checked = true; swButton.button("refresh");
		}
	},
	/**
	 * Return the switch value
	 * @returns one of [true, false]
	 */
	getDetailButtonValue: function(){
		var radioName = "detailSwitch";
		var button = $('input[name=' + radioName + ']', this.element);
		return button.attr('checked');
	},
	/**
	 * Select 
	 * @param val [true, false]
	 */
	setDetailButtonValue: function(val){
		var radioName = "detailSwitch";
		$('input[name=' + radioName + ']', this.element).each(function(){
			this.checked = val; $(this).button("refresh");
		});
	}
	/**
	 * Return the switch value
	 * @returns one of ['effort', 'costs']
	getconsOrgPeopleSwitchValue: function(){
		var radioName = "consOrgPeopleSwitch";
		return $('input[name=' + radioName + ']:checked', this.element).val() || '';
	},
	 */
	/**
	 * Select 
	 * @param val ['effort', 'costs', '']
	setconsOrgPeopleSwitchValue: function(val){
		var radioName = "consOrgPeopleSwitch";
		if(!val){
			$('input[name=' + radioName + ']', this.element).each(function(){
				this.checked = false; this.button("refresh");
			});
		} else {
			var swButton = $('input[name=' + radioName + '][value=' + val + ']', this.element);
			swButton[0].checked = true; swButton.button("refresh");
		}
	}
	 */
});