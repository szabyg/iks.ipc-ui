var Constraints = function(constraintList) {
	this.constraints = constraintList;
}
Constraints.prototype = {
	recordRelevant: function(record){
		return true;
	}
}
