/*
 * Intelligent project controlling
 * Project controlling-specific business rules.
 */
var yellowFrom = 10; // could come from configuration component
var redFrom = 25;

iks.ipc.rules = {
	companyRules: {
		statusByDeviationPercent: function(deviationPercent){
			if(Math.abs(deviationPercent) < yellowFrom) return '<span style="color: green;" title="Deviation under ' + yellowFrom + '%">GREEN</span>';
			else if(Math.abs(deviationPercent) < redFrom) return '<span style="color: orange;" title="Deviation over ' + yellowFrom + '%">YELLOW</span>';
			else return '<span style="color: red;" title="Deviation over ' + redFrom + '%">RED</span>';
			
		},
		deviationAlert: function(task){
			var planned = task.getSum("planned-pm");
		    var spent = task.getSum("spent-pm");
		    var diff = (planned-spent)<0 ? (spent-planned) : (planned-spent);
		    var diffRelative = diff / planned;
		    var costDeviation = task.getCompanyAPI().getSpentCosts(task) - task.getCompanyAPI().getPlannedCosts(task);
		    if((diff / planned) > 0.1 || costDeviation > 5000) 
		    	return true;
		    else 
		    	return false;
		}
	},
	sponsorRules: {
		deviationAlert: function(task){
			var planned = task.getSum("planned-pm");
		    var spent = task.getSum("spent-pm");
		    var diff = (planned-spent)<0 ? (spent-planned) : (planned-spent);
		    var diffRelative = diff / planned;
		    if((diff / planned) > 0.1) 
		    	return true;
		    else 
		    	return false;
		}
		
	}
}
