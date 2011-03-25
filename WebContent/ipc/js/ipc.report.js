(function(){
    $(document).ready(function(){
        // Initialize the view
        reportView.reportInit();
    });
    
    // Create empty object for the report
    iks.ipc.reportDoc = {};
    var accordionStyle = {clearStyle: true, autoHeight: false};
    
    var reportView = {
         // Whenever constraints change check them.
         // If the constraints are valid for a report 
         // check if a stored report is there and load it. If not, 
         // generate one based on a template and the data from the backend.
        constraintChangeHandler: function (e){
            reportView.wipeReport(e);
            selectedPeriod = iks.ipc.constraints.get('period');
            projectId = iks.ipc.constraints.get('projectId');
            projectLabel = iks.ipc.constraints.get('projectLabel');
            console.info("Reporting, selected period: " + selectedPeriod);
            
            if(selectedPeriod == "current" || !selectedPeriod){
                console.info("Reporting: no selected period.");
                return;
            } else if(selectedPeriod.length == 4){
                reportType = "annual";
                reportTitle = projectLabel + " annual report " + selectedPeriod;
            } else {
                reportType = "quarterly";
                reportTitle = projectLabel + " quarterly report " + selectedPeriod;
            }
            reportId = reportTitle;
            $('#reportTitle').html(reportTitle);

            var reportDoc = store.get(reportId);
            // Does a stored report exist?
            if(reportDoc){
                reportView.showReport(reportDoc);
            } else {
                reportView.generateReport();
            }
        },
        /**
         * 
         */
        reportInit: function(){
            iks.ipc.constraints.bind('change', reportView.constraintChangeHandler);
            $('#report-buttons').append($("<button id='saveButton'>Save</button>"));
            $('#saveButton').button()
                .click(reportView.saveHandler);
        },
        /**
         * 
         */
        saveHandler: function(e){
            var htmlContent = $('#reportAccordion').innerHTML;
            content = {};
            $('.editable').each(function(){content[this.id] = this.innerHTML;});
            console.info(content);
            
            var savedDate = new Date();
            
            var htmlContent = $('#reportAccordion').accordion("destroy").html();
            $('#reportAccordion').accordion(accordionStyle);
            console.info(htmlContent);
            
            var formData = {};
            $('#reportAccordion form').each(function(){
                formData[this.id] = $(this).serializeArray();
            });
            
            $.extend(iks.ipc.reportDoc,
            {
                id:         reportTitle,
                title:      reportTitle,
                type:       "reportDoc",
                savedDate:  savedDate,
                fieldsContent: content,
                formData: formData,
                htmlContent: htmlContent,
                constraints: iks.ipc.constraints.toJSON()
            });
            reportView.showTimeStamp(savedDate);
            // iks.ipc.dataStorage.storeDoc(iks.ipc.reportDoc);
            
            store.set(reportId, iks.ipc.reportDoc);
            
            console.info(["in localStore: ", store.get(reportTitle)]);
        },
        /**
         * 
         */
        showTimeStamp: function(dateObj){
            if(dateObj == 0){
                $('#report-lastsaved').html("Not yet saved");
            } else {
                $('#report-lastsaved').html("last saved at ")
                    .append(iks.ipc.tools.formatDateTime(dateObj));
            }
        },
        /**
         * Remove the report and the title
         */
        wipeReport: function() {
            $('#reportAccordion').accordion("destroy").html("");
            $('#reportTitle, #report-lastsaved').html("");
        },
        /**
         * 
         */
        showReport: function(reportDoc){
            $('#reportAccordion').html(reportDoc.htmlContent);
            $('#reportAccordion').accordion(accordionStyle);
            reportView.showTimeStamp(new Date(reportDoc.savedDate));
            reportView.makeEditable();
        },
        makeEditable: function(){
            if(withAloha)
                $('#project_objectives_and_work_progress .workProgressPerWPList .editable.freeText').aloha();
        },
        /**
         * 
         */
        generateReport: function() {
            reportView.showTimeStamp(0);
            var reportTemplate = templateroot + "ipc.report." + reportType + "report.tmpl";
            
            $.get(reportTemplate, function(yearlyreport){
                $.tmpl(yearlyreport, {}).appendTo('#reportAccordion');
                $("#reportAccordion").accordion(accordionStyle);
                console.info("report clearstyle: " + $("#reportAccordion").accordion("option", "clearStyle"));
                
                iks.ipc.isQuarterInPeriod = function(key, period){
                    if(this.periods[key] && this.periods[key]["startdate"].indexOf(period) != -1)
                        return true;
                    else
                        return false;
                };
                var period = "2010";
                iks.ipc.dataStorage.getData([
                    "plannedEffortPerPartnerPerQuartalPerWBS", 
                    "spenteffortByprojectWBS", 
                    "periods", 
                    "planWorkpackages",
                    "urn:iks:iks"],
                    function(data){
                        iks.ipc.periods = data.periods;
                        var partners = data["urn:iks:iks"]["beneficiary-list"];
                        var templateDataObj = {};// Obj of WPs
                        // var plannedPerWP = {};
                        for(var wpI = 0; wpI < data.planWorkpackages.length;wpI++){
                            var wp = data.planWorkpackages[wpI].value;
                            var wpObj = templateDataObj[wp._id] = {
                                wpLabel: wp["rdfs:label"],
                                wpDescription: wp["dc:description"],
                                jsId: wp._id.replace(".",""),
                                spentVsPlannedByPartner: {}
                            };
                            for(var p = 0;p < partners.length; p++){
                                var partner = partners[p];
                                wpObj.spentVsPlannedByPartner[partner] = {plan: 0, spent:0, 
                                        partnerId: partner,
                                        jsId: wp._id.replace(".","_")+partner,
                                        partnerLabel: partner.substring(partner.lastIndexOf(":")+1,partner.length).toUpperCase()};// TODO
                            }
                        }
                        // Iterate through PLAN values
                        $(data.plannedEffortPerPartnerPerQuartalPerWBS.rows).each(function(){
                            var wpWbs = this.key[2]+"."+this.key[3];
                            var partnerUri = this.key[0];
                            var recordPeriod = this.key[1];
                            if( templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri] &&
                                    iks.ipc.isQuarterInPeriod(recordPeriod), period){
                                // console.info(this);
                                templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri].plan += this.value;
                            } else
                                console.error(this);
                        });
                        // Iterate through SPENT values
                        $(data.spenteffortByprojectWBS.rows).each(function(){
                            var wpWbs = this.key[2]+"."+this.key[3];
                            var partnerUri = this.key[0];
                            var recordPeriod = this.key[1];
                            if(templateDataObj[wpWbs][partnerUri] &&
                                    iks.ipc.isQuarterInPeriod(recordPeriod), period)
                                templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri].spent += this.value;
                            else
                                console.error(this);
                        });
                        // Convert templateDataObject to templateData array
                        var templateData = [];
                        _.each(templateDataObj, function(wpObj){
                            var spentVsPlannedByPartner = wpObj.spentVsPlannedByPartner;
                            wpObj.spentVsPlannedByPartner = [];
                            _.each(spentVsPlannedByPartner, function(spPartner){
                                wpObj.spentVsPlannedByPartner.push(spPartner);
                            });
                            templateData.push(wpObj);
                        });
                        $.get(templateroot + "ipc.report.workProgressPerWP.tmpl", function(workProgressPerWP_tmpl){
                            $.tmpl(workProgressPerWP_tmpl, templateData, {
                                test: function(){
                                    debugger;
                                    return "Template function testBlah";
                                }
                            })
                            .appendTo('#project_objectives_and_work_progress .workProgressPerWPList');
                            reportView.makeEditable();
                        });
                    }
                );
            });
        }
    }
})();
