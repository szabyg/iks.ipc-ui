/*
 * Intelligent project controlling
 * Project controlling-specific business rules.
 */
var yellowFrom  = 10; // could come from configuration component
var redFrom     = 25;

var greenHtml = function(status){return '<span style="color: green;" title="' + status + '">GREEN</span>';};
var yellowHtml = function(status){return '<span style="color: orange;" title="' + status + '">YELLOW</span>';};
var redHtml = function(status){return '<span style="color: red;" title="' + status + '">RED</span>';};

iks.ipc.rules = {
	companyRules: {
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
		},
		deviationExplanationRule: function(plan, spent){
		    return ((Math.abs(spent-plan)/plan) > 0.5)
		}
		
	},
	projectManagementRules: {
		statusByDeviationPercent: function(deviationPercent){
			if(Math.abs(deviationPercent) < yellowFrom) return greenHtml('Deviation under ' + yellowFrom + '%');
			else if(Math.abs(deviationPercent) < redFrom) return yellowHtml('Deviation over ' + yellowFrom + '%');
			else return redHtml('Deviation over ' + redFrom + '%');
			
		},
		deliverableAlert: function(deadline, historyStatus, monitoringDate){
		    var deadlineDate = iks.ipc.monthPeriods[deadline].enddate;
		    if(!iks.ipc.monitoring.deliverableStatus.hasOwnProperty(historyStatus)){
		        console.error('HistoryStatus doesn\'t exist: ' + historyStatus);
		    }
		    var delivStatus = iks.ipc.monitoring.deliverableStatus[historyStatus];
		    
		    if(
		        // deadline passed and deliv not yet submitted
		        (monitoringDate > deadlineDate && delivStatus < iks.ipc.monitoring.deliverableStatus['submitted']) ||
		        // deliv rejected
		        (delivStatus == iks.ipc.monitoring.deliverableStatus['rejected'])
		    ){
		        return redHtml('');
		    }
    		    // RED
                /* 
                if deadline  AND Deliv not submitted
                if Deliv rejected
                if dealine - 1month  AND Deliv  not qa 
                if deadline - 3 month AND Deliv not draft
                */
		    
		    if(
		        (delivStatus == iks.ipc.monitoring.deliverableStatus['approved in full']) ||
		        (delivStatus == iks.ipc.monitoring.deliverableStatus['submitted']) ||
		        (delivStatus == iks.ipc.monitoring.deliverableStatus['resubmitted'])
		    ){
		        return greenHtml('');
                /*
                GREEN
                if Deliv approved in full
                if Deliv submitted
                if Deliv re-submitted
                */
            } else {
                return yellowHtml('');
            }
        }
	}
}
