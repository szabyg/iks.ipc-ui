(function($){
    function modeSelector_init(){
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
				iks.ipc.monitoringInit();
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
    }
    
    function setupNav() {
		// Header functionality
        /*
        iks.ipc.dataStorage.getProjectData(function(fields, projects){
	        $("#org-selector").projectautocomplete({fields: [{id: "partners", label: "Partner"}], projects: projects, fieldElement: "input"});
	        $("#org-selector").bind("projectSelection", function(event, data){
		        $("#organisation").html(data.fieldValue);
	        });
        });
        */

        $("#timerange-selector").timerangeselector({
	        periodLabel: '3. Select Period', 
	        startDateLabel: '', 
	        endDateLabel: 'to<br/>',
	        dateFormat: "yy-mm-dd",
	        startYear: 2009
        });
        $("#timerange-selector").bind("rangeSelected", function(e, timeRange){
            iks.ipc.constraints.set({'startdate': timeRange.startDate.clone()});
            iks.ipc.constraints.set({'enddate': timeRange.endDate.clone()});
	        console.info(
//			        "value: " + timeRange.value + 
//			        "label: " + timeRange.label + 
			        " start date: " + timeRange.startDate +
			        " end date: " + timeRange.endDate);
        });
    };

	$(document).ready(function(){
    	setupNav();
        modeSelector_init();
    });

})(jQuery);
