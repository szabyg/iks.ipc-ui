/**
 * IKS Intelligent Project Planning tool JS library data manipulation for
 * monitoring
 * 
 * @author szabyg
 * @since 2010-11-10
 */

if (typeof iks == 'undefined' || !iks) {
	var iks = {};
}
if (typeof iks.ipc == 'undefined' || !iks.ipc) {
	iks.ipc = {};
}
if (typeof iks.ipc.monitoring == 'undefined' || !iks.ipc.monitoring) {
	iks.ipc.monitoring = {};
}


$.widget('ipc.monitoring', {
	_create: function(){
		var that = this;
		this.data = {};
		this.element.html(this.options.waitMsg);
		// Get data from the data layer
		this.options.dataStore.getPlanEffortData(this.options.constraints, function(wbsTree){
			that.data = wbsTree;
			
			// Insert an element for the sheet
			var html = "<div class='sheet'></div><div class='graph'></div>";
			that.element.html(html);
			that.sheetEl = $(that.element).find('.sheet');
			that.graphEl = $(that.element).find('.graph');
			// Insert an element for the graph
			
			// create the sheet
			that._sheet = that.sheetEl.sheet({
				// autoFiller: true,
				// inlineMenu: iks.ipc.tools.sheet.inlineMenu($.sheet.instance),
				urlMenu: libroot + "jquery.sheet/menu.html",
				buildSheet: false,
				urlGet: false,
				editable: false,
				minSize: {rows: 3, cols: 3}
			}).sheetInstance;
			// Listen zoom event
			that.element.bind("TableZoom", that.tableZoomEventHandler);
			// Fill in data
			that.tableZoom();
			if(typeof that.options.onLoad == "function"){
				that.options.onLoad();
			}
			// create the graph
			
		});
	},
	
	/**
	 * depends on 
	 * jquery, jquery.sheet
	 * iks.ipc.tools.sheet
	 *  
	 */
	renderSheet : function(data, constraints, callback) {
		var that = this;
		var wbsLabels = data.wbsLabels;
		var tableStatus = "o.k.";
		var tableConf = this.options.tableConf(data);

		var tableObj = iks.ipc.tools.sheet.buildSheetJSON(tableConf);
		// cb-return the tables to show.
		callback([
            tableObj
		]);
	},
	buildZoomLink: function(label, childId){
		return iks.ipc.tools.sheet.buildLink(label, '$("#%sheetID%").trigger', ['TableZoom', [childId, "e"]]);
	},
	/**
	 * Event handler for the zooming click coming from the table
	 */
	tableZoomEventHandler: function(event, wbs, clickEvent){
		$.noop();
		clickEvent.stopPropagation();
		if(clickEvent.shiftKey || clickEvent.ctrlKey)wbs = -1;
		$(event.target).monitoring("tableZoom", wbs);
	},
	/**
	 * Zoom in or out, then show the table
	 * @param child id of the child to zoom in, -1 to zoom out, null for no zooming (initial loading)
	 */
	tableZoom: function(child){
		// zoom to the right level
		if(!child){
			// root, no movement
		} else if(child==-1 && this.data.parent){
			// zoom out
			this.data = this.data.parent;
		} else if(this.data.children[child].children.length>0){
			// zoom in one level
			this.data = this.data.children[child];
		} else {
			// nowhere to go
			return;
		}
		
		// format the data for showing it in a jquery.sheet.
		var that = this;
		this.renderSheet(this.data, this.options.constraints, function(tableData){
			that._sheet.openSheet($.sheet.makeTable.json(tableData));
		});
	}
});

iks.ipc.monitoring.deviationRule = function(deviationPercent){
	return iks.ipc.rules.companyRules.statusByDeviationPercent(deviationPercent);
};
