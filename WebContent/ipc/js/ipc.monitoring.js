(function(){
    // iks.ipc.monitoring.deliverableStatus
    iks.ipc.monitoring = {
        deliverableStatus: {
            '': 0,
            'work in progress': 1,
            'draft': 2,
            'quality-checked': 3,
            'submitted': 4,
            'rejected': 5,
            'approved in part': 6,
            'approved subject to the conditions listed under remarks': 7,
            'resubmitted': 8, 
            're-submitted': 8,
            'approved in full': 9
        }
    };

    iks.ipc.monitoringInit = function(){
        $("#monitor-accordion").accordion({clearStyle: true, autoHeight: false})
            .accordion('resize');
        
        deviation_init();
        
        deliverables_init();
        iks.ipc.constraintsChange(function(){
            deliverables_init();
        });
    };
        
    function deviation_init(){
        
        function createTable(){
            $("#monitoring-01").html("");
            $("#monitoring-01").append($("<div id='monitoringsheet01' class='monitoring-sheet'></div>"));
            $("#monitoring-01 .monitoring-sheet").monitoring({
                dataStore: iks.ipc.dataStorage, 
                constraints: iks.ipc.constraints,
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
                    var children = data.getRelevantChildren(iks.ipc.constraints);
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
                                    "=Math.round(" + childNode.computeSum("pm-planned", iks.ipc.constraints) + ")",
                                    "=Math.round(" + childNode.computeSum("pm-spent", iks.ipc.constraints) + ")",
                                    "=(C%R0%-B%R0%)<0?Math.round(C%R0%-B%R0%):(\"+\" + Math.round(C%R0%-B%R0%))",
                                    "=(C%R0%-B%R0%)<0? Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\" :\"+\" + Math.round((C%R0%-B%R0%)/B%R0% *100)+\" %\"",
                                    "=iks.ipc.monitoring.deviationRule(Math.round((C%R0%-B%R0%)/B%R0% *100))",
                                    "=CHART.HBAR(B%R0%:C%R0%,{colors:[\"green\",\"blue\"]})"
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
                                 "=CHART.HBAR(B%R0%:C%R0%,{colors:[\"green\",\"blue\"]})"
                                 ],
                                 conf: { 
                                     cl: "styleBold"
                                 }
                    });
                    return tableConf;
                }
            });
        }
        
        createTable();
        
        iks.ipc.constraints.bind('change', function(){
            console.info('recreate monitoring widget in #monitoring-01');
            $("#monitoring-01 .monitoring-sheet").monitoring('destroy');
            // deliverables_init();
            createTable();
        });

    }

    function deliverables_init(){
        // Fill out the deliverable status table
        iks.ipc.dataStorage.getData(["planDeliverables", "delivDocs"], function(data){
            var delivDocsObj = {};
            $(data.delivDocs).each(function(){delivDocsObj[this.key] = this.value;});
            var templateData = [];
            $(data.planDeliverables).each(function(){
                if(iks.ipc.constraints.checkRecord(this.value)){
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
                }
            });
            $("#monitoring-03 .content").html("");
            $.get(templateroot + "ipc.monitoring.monitoringDelivStatusTableStatic.tmpl", 
                    function(monitoringDelivStatusTableStatic_tmpl){
                $.tmpl(monitoringDelivStatusTableStatic_tmpl, [{}])
                    .appendTo("#monitoring-03 .content");
                $.get(templateroot + "ipc.monitoring.monitoringDelivStatusTable.tmpl", 
                        function(monitoringDelivStatusTable_tmpl){
                        
                    $.tmpl(monitoringDelivStatusTable_tmpl, templateData, {
                        getHistory: function(history){
                            var res = "", firstLine = "", rest = "";
                            var toggleClass = "historyToggle" + Math.round(Math.random() * 100000000);
                            $(history).each(function(i, hist){
                                var status = hist[0];
                                var org = iks.ipc.tools.getLastUrnPart(hist[2]).toUpperCase();
                                var date = hist[1];
                                if(i==0){
                                    firstLine += "<p><u><a onclick='$(\"." + toggleClass + "\").toggle()'>";
                                    firstLine += "<b>" + status + "</b> by " + org + " (" + date + ")" 
                                    firstLine += "</a></u></p>"
                                } else {
                                    rest += "<p >";
                                    rest += "<b>" + status + "</b> by " + org + " (" + date + ")" 
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
                        },
                        getStatus: function(deadline, history){
                            if(!history.length)return "";
                            var i = 0;
                            var lastHistory = history[i];
                            while(new Date(lastHistory[1]) > iks.ipc.constraints.get('enddate')) {
                                if(history.length > i+1){
                                    i++;
                                    lastHistory = history[i];
                                } else {
                                    lastHistory = [''];
                                }
                            }
                            console.info(['history: ', lastHistory[1], history]);
                            return iks.ipc.rules.projectManagementRules.deliverableAlert(
                                deadline, 
                                lastHistory[0], 
                                iks.ipc.constraints.get('enddate')
                            );
                        }
                        
                    })
                    .appendTo('#monitoring-03 table.monitoringDelivStatusTable');
                })

            });
        });
    
    }
})();
