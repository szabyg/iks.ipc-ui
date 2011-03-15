(function(){
    iks.ipc.monitoringInit = function(){
	    $("#monitor-accordion").accordion({clearStyle: true, autoHeight: false})
	        .accordion('resize');
	    // Collect UI constraints for the presentation
	    var constraints = iks.ipc.collectConstraints();
	
	    $("#monitoring-01").monitoring({
		    dataStore: iks.ipc.dataStorage, 
		    constraints: constraints,
		    onLoad: function(){
			    $("#monitor-accordion").accordion("resize");
		    },
		    waitMsg: "collecting data...",
		    tableConf: function(data){
			    var tableConf = {
				    metadata: {
					    "title" : "Spent vs. Planned Effort", //  for <project> <period>",
					    "col_widths" : {"c0" : "120", "c1" : "120", "c2" : "120", "c3" : "120", "c4": "120", "c5": "80", "c6" : "220"}
				    },
				    conf: {
					    style: "height: 50px !important;"
				    },
				    rows: []
			    };
			    tableConf.rows.push({
				    fields: [data.childrenLabel, "Planned Effort", "Spent Effort", "Deviation (abs)", "Deviation (%)", "Status", "Graph"],
				    conf: {
					    cl: "styleBold"
				    }
			    });
			    var children = data.getRelevantChildren(constraints);
			    for(var wbsIndex in children)if(children.hasOwnProperty(wbsIndex)){
				    var childNode = children[wbsIndex];
				    // TODO fix this
				    if(true || Number(wbsIndex)){
					    // var rowLabel = data.planned.children[wbsIndex].wbsLabel.singular + " " + wbsIndex;
					    var rowLabel = childNode.label;
					    tableConf.rows.push({
						    fields: [
						        // iks.ipc.tools.sheet.buildLink(rowLabel, '$("#%sheetID%").trigger', ['TableZoom', [childNode.id, "e"]]),
						        $.ipc.monitoring.prototype.buildZoomLink(rowLabel, childNode.id),
						        "=Math.round(" + childNode.computeSum("pm-planned") + ")",
						        "=Math.round(" + childNode.computeSum("pm-spent") + ")",
						        "=(C%R0%-B%R0%)<0?Math.round(C%R0%-B%R0%):(\"+\" + Math.round(C%R0%-B%R0%))",
						        "=(C%R0%-B%R0%)<0? Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\" :\"+\" + Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\"",
						        "=iks.ipc.monitoring.deviationRule(Math.round((C%R0%-B%R0%)/B%R0% *100))",
						        "=CHART.HBAR(B%R0%:C%R0%)"
						    ]
					    });
				    }
			    }
			    tableConf.rows.push({
				    fields: [
				             "TOTAL",
				             "=SUM(B2:B%R-1%)",
				             "=SUM(C2:C%R-1%)",
				             "=(C%R0%-B%R0%)<0?(C%R0%-B%R0%):(\"+\" + (C%R0%-B%R0%))",
				             "=(C%R0%-B%R0%)<0? Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\" :\"+\" + Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\"",
				             "=iks.ipc.monitoring.deviationRule(Math.round((C%R0%-B%R0%)/B%R0% *100))",
				             "=CHART.HBAR(B%R0%:C%R0%)"
				             ],
				             conf: { 
				            	 cl: "styleBold"
				             }
			    });
			    return tableConf;
		    }
	    });

	    // Fill out the deliverable status table
	    iks.ipc.dataStorage.getData(["planDeliverables", "delivDocs"], function(data){
		    var delivDocsObj = {};
		    $(data.delivDocs).each(function(){delivDocsObj[this.key] = this.value;});
		    var templateData = [];
		    $(data.planDeliverables).each(function(){
			    var delivObj = {
				    wbs: this.value._id,
				    deadline: this.value.deadline,
			    };
			    if(delivDocsObj[delivObj.wbs]){
				    var delivDoc = delivDocsObj[delivObj.wbs];
				    delivObj.label = delivDoc["rdfs:label"];
				    delivObj.history = delivDoc.deliveryStatusInformation;
				    delivObj.source = delivDoc["dc:source"];
			    } else {
				    delivObj.label = this.value["rdfs:label"];
				    delivObj.history = [];
				    delivObj.source = "javascript:void(false);";
			    }
			
			    templateData.push(delivObj);
		    });
		    $("#monitoring-03 .content").html("");
		    $('#monitoringDelivStatusTableStatic').tmpl([{}]).appendTo("#monitoring-03 .content");
		    $('#monitoringDelivStatusTable').tmpl(templateData, {
			    getHistory: function(history){
				    var res = "", firstLine = "", rest = "";
				    var toggleClass = "historyToggle" + Math.round(Math.random() * 100000000);
				    $(history).each(function(i, hist){
					    if(i==0){
						    firstLine += "<p><u><a onclick='$(\"." + toggleClass + "\").toggle()'>";
						    firstLine += "<b>" + hist[0] + "</b> " + hist[2] + " (" + hist[1] + ")" 
						    firstLine += "</a></u></p>"
					    } else {
						    rest += "<p >";
						    rest += "<b>" + hist[0] + "</b> " + hist[2] + " (" + hist[1] + ")" 
						    rest += "</p>"										
					    }
				    });
				    res = 
					    "<div class='firstLine'>" + 
					    firstLine + 
					    "</div>" +
					    "<div class='" + toggleClass + "' style='display:none'>" + 
					    rest + 
					    "</div>";
				    return res;
			    }
		    })
		    .appendTo('#monitoring-03 table.monitoringDelivStatusTable');
	    });
	
    }
})();
