//
// Browse plan uses the iks.controldatavis widget to let the user browse through
// the planned effort on the work breakdown structure.
// 
(function(){
	$(document).ready(function(){
		iks.ipc.controlInit();
	});
	
	
	iks.ipc.controlInit = function(){
	    // Initialize the widget
	    $('#control-rgraph').controldatavis({
			dataStore: iks.ipc.dataStorage, 
			constraints: iks.ipc.constraints,
			waitMsg: "collecting data..."
		});
		// Bind the constraints change event to refreshing the widget
		iks.ipc.constraintsChange(function(){
		    $('#control-rgraph').controldatavis('refresh');
		});
	}
})();
