(function(){
    $(document).ready(function(){
        // Initialize the view
        reportView.reportInit();
    });
    
    // Create empty object for the report
    iks.ipc.reportDoc = {};
    var accordionStyle = {clearStyle: true, autoHeight: false};
    
    var reportView = {
        //
        // Initialize report UI
        // Constraints change event handler
        // Save button click handler
        //
        reportInit: function(){
            iks.ipc.constraints.bind('change', reportView.constraintChangeHandler);
            $('#report-buttons').append($('<button id="saveButton">Save</button>'));
            $('#saveButton').button()
                .click(reportView.saveHandler);
        },
         // Whenever constraints change check them.
         // If the constraints are valid for a report 
         // check if a stored report is there and load it. If not, 
         // generate one based on a template and the data from the backend.
        constraintChangeHandler: function (e){
            reportView.wipeReport(e);
            selectedPeriod = iks.ipc.constraints.get('period');
            projectId = iks.ipc.constraints.get('projectId');
            projectLabel = iks.ipc.constraints.get('projectLabel');
            console.info('Reporting, selected period: ' + selectedPeriod);
            
            if(selectedPeriod == 'current' || !selectedPeriod){
                console.info('Reporting: no selected period.');
                return;
            } else if(selectedPeriod.length == 4){
                reportType = 'annual';
                reportTitle = projectLabel + ' annual report ' + selectedPeriod;
            } else {
                reportType = 'quarterly';
                reportTitle = projectLabel + ' quarterly report ' + selectedPeriod;
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
        //
        // Save button handler
        // For now, store whatever we can
        //
        saveHandler: function(e){
            // store editable elements content
            content = {};
            $('.editable').each(function(){content[this.id] = this.innerHTML;});
            console.info(content);
            
            // timestamp
            var savedDate = new Date();
            
            // HTML content without accordion functionality
            reportView.deactivateEditables();
            var htmlContent = $('#reportAccordion').accordion('destroy').html();
            $('#reportAccordion').accordion(accordionStyle);
            console.info(htmlContent);
            
            // form data: check boxes, radio buttons, select boxes
            var formData = {};
            $('#reportAccordion form').each(function(){
                formData[this.id] = $(this).serializeArray();
            });
            
            // store changes into the reportDoc object
            $.extend(iks.ipc.reportDoc,
            {
                id:         reportTitle,
                title:      reportTitle,
                type:       'reportDoc',
                savedDate:  savedDate,
                fieldsContent: content,
                formData: formData,
                htmlContent: htmlContent,
                constraints: iks.ipc.constraints.toJSON()
            });
            
            // Show new time stamp
            reportView.showTimeStamp(savedDate);
            /* iks.ipc.dataStorage.storeDoc(iks.ipc.reportDoc);*/
            
            // Store document in the local store for now
            store.set(reportId, iks.ipc.reportDoc);
        },
        // Show the time stamp and status
        showTimeStamp: function(dateObj){
            if(dateObj == 0){
                $('#report-lastsaved').html('Not yet saved');
            } else {
                $('#report-lastsaved').html('last saved at ')
                    .append(iks.ipc.tools.formatDateTime(dateObj));
            }
        },
        //
        // Remove the report and the title from the UI
        //
        wipeReport: function() {
            $('#reportAccordion').accordion('destroy').html('');
            $('#reportTitle, #report-lastsaved').html('');
        },
        //
        // Show a stored reportDoc on the UI
        //
        showReport: function(reportDoc){
            $('#reportAccordion').html(reportDoc.htmlContent);
            $('#reportAccordion').accordion(accordionStyle);
            reportView._fillInForms(reportDoc.formData);
            reportView.showTimeStamp(new Date(reportDoc.savedDate));
            reportView.makeEditable();
        },
        makeEditable: function(){
            if(withAloha)
                $('#project_objectives_and_work_progress .workProgressPerWPList .editable.freeText').aloha();
        },
        // If necessary, deactivate editable parts
        deactivateEditables: function() {
        
        },
        //
        // Generate a quarterly or annual report based on the 
        // constraints.
        // The templates are stored in the templates folder
        // After getting the templates, fill them out with the data coming from the back end.
        //
        generateReport: function() {
            // Show status of 'not saved'
            reportView.showTimeStamp(0);
            
            // relative path of the template based on the reportType
            var reportTemplateFilename = templateroot + 'ipc.report.' + reportType + 'report.tmpl';
            
            // Get the template, fill it in the report container and 
            // show it as an accordion
            $.get(reportTemplateFilename, function(yearlyreport){
                $.tmpl(yearlyreport, {}).appendTo('#reportAccordion');
                $('#reportAccordion').accordion(accordionStyle);
                console.info('report clearstyle: ' + $('#reportAccordion').accordion('option', 'clearStyle'));
                
                // Show basic report data header paragraph
                reportView._basicData();
                reportView._workProgressPerWP(function(templateData){
                    $.get(templateroot + 'ipc.report.workProgressPerWP.tmpl', function(workProgressPerWP_tmpl){
                        $.tmpl(workProgressPerWP_tmpl, templateData)
                            .appendTo('#project_objectives_and_work_progress .workProgressPerWPList');
                        reportView.makeEditable();
                    });
                });
            });
        },
        _basicData: function() {
            $.get(templateroot + 'ipc.report.basicData.tmpl', function(basicData_tmpl) {
                $('#basic_data').html('');
                $.tmpl(basicData_tmpl, {basicData: {
                    projectGrantAgreementNumber: 'iks...',
                    projectAcronym: iks.ipc.constraints.get('projectLabel'),
                    projectLabel: iks.ipc.constraints.get('projectLabel'),
                    fundingScheme: '{fundingScheme}',
                    projectContractDate: '12/34/56',
                    leadOrganisation: 'SRFG'
                }}).appendTo('#basic_data');
            });
        },
        _workProgressPerWP: function(callback) {
            // Get project data from the back end and fill them into 
            // the report template
            iks.ipc.dataStorage.getData([
                // have the textual description of the work packages
                'planWorkpackages',
                // planned and spent effort per partner, quarter and workpackage
                'plannedEffortPerPartnerPerQuartalPerWBS', 
                'spenteffortByprojectWBS'
                ],
                function(data){
                    // The order in which the partners are shown
                    var partners = iks.ipc.selectedProject['beneficiary-list'];
                    
                    // Build the data needed for filling out the template
                    var templateDataObj = {};
                    for(var wpI = 0; wpI < data.planWorkpackages.length;wpI++){
                        var wp = data.planWorkpackages[wpI].value;
                        var wpObj = templateDataObj[wp._id] = {
                            wpLabel: wp['rdfs:label'],
                            wpDescription: wp['dc:description'],
                            jsId: wp._id.replace('.',''),
                            spentVsPlannedByPartner: {}
                        };
                        for(var p = 0;p < partners.length; p++){
                            var partner = partners[p];
                            wpObj.spentVsPlannedByPartner[partner] = {plan: 0, spent:0, 
                                    partnerId: partner,
                                    jsId: wp._id.replace('.','_')+partner,
                                    partnerLabel: partner.substring(partner.lastIndexOf(':')+1,partner.length).toUpperCase()};// TODO
                        }
                    }
                    // Iterate through PLAN values
                    $(data.plannedEffortPerPartnerPerQuartalPerWBS.rows).each(function(){
                        var wpWbs = this.key[2]+'.'+this.key[3];
                        var partnerUri = this.key[0];
                        var recordPeriod = this.key[1];
                        if( templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri]){
                            if(iks.ipc.constraints.checkRecord({period: recordPeriod})){
                                templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri].plan += this.value;
                            }
                        } else {
                            console.error(['not added plan value', recordPeriod, this]);
                        }
                    });
                    // Iterate through SPENT values
                    $(data.spenteffortByprojectWBS.rows).each(function(){
                        var wpWbs = this.key[2]+'.'+this.key[3];
                        var partnerUri = this.key[0];
                        var recordPeriod = this.key[1];
                        if(templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri]) {
                            if(iks.ipc.constraints.checkRecord({period: recordPeriod})){
                                templateDataObj[wpWbs].spentVsPlannedByPartner[partnerUri].spent += this.value;
                            }
                        } else {
                            console.error(['not added spent value', recordPeriod, this]);
                        }
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
                    callback(templateData);
                }
            );
        },
        _fillInForms: function(formData) {
            _(formData).each(function(oneForm){
                _(oneForm).each(function(formElement){
                    $('input[name=' + formElement.name + '][value=' + formElement.value + ']').click();
                });
            });        
        }

    }
})();
