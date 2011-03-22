(function(){
    $(document).ready(function(){
        reportInit();
        reportFillOut();
        iks.ipc.constraints.bind('change', function(e){
            reportFillOut(e);
        });
        
    });
    function reportInit(){
        function save(){
            var htmlContent = $('#reportAccordion').innerHTML;
            content = {};
            $('.editable').each(function(){content[this.id] = this.innerHTML;});
            console.info(content);
            
            var savedDate = new Date();
            
            var htmlContent = $('#reportAccordion').accordion("destroy").html();
            $('#reportAccordion').accordion(accordionStyle);
            console.info(htmlContent);
            
            $.extend(iks.ipc.reportDoc,
            {
                id:         reportTitle,
                title:      reportTitle,
                type:       "reportDoc",
                savedDate:  savedDate,
                fieldsContent: content,
                htmlContent: htmlContent,
                constraints: iks.ipc.constraints.toJSON()
            });
            iks.ipc.dataStorage.storeDoc(iks.ipc.reportDoc);
        }
        
        $('#report-buttons').append($("<button id='saveButton'>Save</button>"));
        $('#saveButton').button()
        .click(save);
    }
    function showReport() {
        
    }
    function hideReport(){
        
    }
    iks.ipc.reportDoc = {};
    var selectedPeriod, projectId, projectLabel, reportType, reportTitle;
    var accordionStyle = {clearStyle: true, autoHeight: false};
    function reportFillOut(e) {
        $('#reportAccordion').accordion("destroy").html("");
        $('#reportTitle').html("");
        selectedPeriod = iks.ipc.constraints.get('period');
        projectId = iks.ipc.constraints.get('projectId');
        projectLabel = iks.ipc.constraints.get('projectLabel');
        
        console.info("Reporting, selected period: " + selectedPeriod);
        if(selectedPeriod == "current" || !selectedPeriod){
            console.info("Reporting, no selected period.");
            return;
        } else if(selectedPeriod.length == 4){
            reportType = "annual";
            reportTitle = projectLabel + " annual report " + selectedPeriod;
        } else {
            reportType = "quarterly";
            reportTitle = projectLabel + " quarterly report " + selectedPeriod;
        }
        var reportTemplate = templateroot + "ipc.report." + reportType + "report.tmpl";
        $('#reportTitle').html(reportTitle);
        
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
                        if(withAloha)
                            $('#project_objectives_and_work_progress .workProgressPerWPList .editable.freeText').aloha();
                    });
                }
            );
        });
    
    
    }
})();
