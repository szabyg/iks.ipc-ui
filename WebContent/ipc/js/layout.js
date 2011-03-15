(function($){
	$(document).ready(function(){
	    // mode selector
		$("#mode-selector input").change(function(){
			var switchValue = $('#mode-selector input:checked').val();
			switch(switchValue){
			case "plan":
				$("#pathApp").html("Browse Plan");
				$("#tabs-control").show();
				$("#tabs-monitor").hide();
				$("#tabs-report").hide();
				// $("#reportAccordion").accordion("destroy");
				break;
			case "monitor":
				$("#pathApp").html("Monitor Project");
				$("#tabs-control").hide();
				$("#tabs-report").hide();		
				$("#tabs-monitor").show();
				monitoringInit();
				break;			
			case "report":
				$("#pathApp").html("Write Report");
				$("#tabs-control").hide();
				$("#tabs-monitor").hide();
				$("#tabs-report").show();
				$("#reportAccordion").accordion('resize');
				// $("#reportAccordion").accordion();
				break;
			default:
				alert("sorry, not implemented yet");
				
			}
        }).trigger("change");
//          iks.ipc.dataStorage.getData(["spentPmByWbsPeriodPartner"], function(data){
//              debugger;
//          });

		// Layout the tabs
		// Header functionality
		iks.ipc.dataStorage.getProjectData(function(fields, projects){
			// $("#project-selector").projectautocomplete({fields: [{id: "acronym", label: "Select project"}], projects: projects});
			$("#project-selector").bind("projectSelection", function(event, data){
				$("#projects").html(data.acronyms.join(", "));

			});
			
			$("#org-selector").projectautocomplete({fields: [{id: "partners", label: "Partner"}], projects: projects, fieldElement: "input"});
			$("#org-selector").bind("projectSelection", function(event, data){
				$("#organisation").html(data.fieldValue);

			});

			$("#timerange-selector").timerangeselector({
				periodLabel: '3. Select Period', 
				startDateLabel: '', 
				endDateLabel: 'to<br/>',
				dateFormat: "yy-mm-dd",
				startYear: 2009
			});
			// .find("input").css("margin-left", "8px");
			$("#timerange-selector").bind("rangeSelected", function(e, timeRange){
				$("#timerange").html(
						"<b>value: </b>" + timeRange.value + 
						"<b> label: </b>" + timeRange.label + 
						"<b> start date: </b>" + timeRange.startDate +
						"<b> end date: </b>" + timeRange.endDate);
			});
			
		});
	});

})(jQuery);
