(function($){
    var parts = [
        "home",
        "tabs-browse",
        "tabs-monitor",
        "tabs-audit",
        "tabs-report"
    ];
    iks.ipc.activePart = "home";
    function activatePart(partToActivate){
        _(parts).each(function(part){
            $('#' + part).hide();
        });
        $('#' + partToActivate).show();
        iks.ipc.activePart = partToActivate;
    }
    function modeSelector_init(){
	    // mode selector
		$("#mode-selector input").change(function(){
			var switchValue = $('#mode-selector input:checked').val();
			switch(switchValue){
			case "home":
				$("#pathApp").html("");
				activatePart("home");
				break;
			case "plan":
				$("#pathApp").html("Browse Plan");
				activatePart("tabs-browse");
				break;
			case "monitor":
				$("#pathApp").html("Monitor Project");
				activatePart("tabs-monitor");
				iks.ipc.monitoringInit();
				break;			
			case "report":
				$("#pathApp").html("Write Report");
				activatePart("tabs-report");
				$("#reportAccordion").accordion('resize');
				break;
			case "audit":
				$("#pathApp").html("Write Report");
				activatePart("tabs-audit");
				$("#reportAccordion").accordion('resize');
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
        $("#timerange-selector").bind("rangeSelected", function(e, timeRange){
            if(timeRange.startDate){
                iks.ipc.constraints.set({'startdate': new Date(timeRange.startDate)}, {silent: true});
            } else {
                iks.ipc.constraints.unset('startdate', {silent: true});
            }
            if(timeRange.label){
                iks.ipc.constraints.set({'period': timeRange.label.replace(/&nbsp;/gi,"")}, {silent: true});
            } else {
                iks.ipc.constraints.unset('period', {silent: true});
            }
            if(timeRange.endDate){
                iks.ipc.constraints.set({'enddate': new Date(timeRange.endDate)}, {silent: true});
            } else {
                iks.ipc.constraints.unset('enddate', {silent: true});
            }
            iks.ipc.constraints.change();
	        console.info(
//			        "value: " + timeRange.value + 
//			        "label: " + timeRange.label + 
			        " start date: " + timeRange.startDate +
			        " end date: " + timeRange.endDate);
        });

        $("#timerange-selector").timerangeselector({
	        periodLabel: '3. Select Period', 
	        startDateLabel: '', 
	        endDateLabel: 'to<br/>',
	        dateFormat: "yy-mm-dd",
	        startYear: 2009
        }).trigger("change");
    };

	$(document).ready(function(){
    	setupNav();
        modeSelector_init();
    });

})(jQuery);
