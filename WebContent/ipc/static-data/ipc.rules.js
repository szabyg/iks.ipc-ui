/*
 * Intelligent project controlling
 * Project controlling-specific business rules.
 */

iks.ipc.rules = {
	companyRules: {
		statusByDeviationPercent: function(deviationPercent){
			if(Math.abs(deviationPercent) < 10) return "GREEN";
			else if(Math.abs(deviationPercent) < 20) return "YELLOW";
			else return "RED";
			
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
