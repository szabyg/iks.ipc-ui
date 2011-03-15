(function(){
	$(document).ready(function(){
		iks.ipc.controlInit();
	});
	iks.ipc.controlInit = function(){
	    $('#control-rgraph').controldatavis({
			dataStore: iks.ipc.dataStorage, 
			constraints: iks.ipc.constraints,
			waitMsg: "collecting data..."
		});
		iks.ipc.constraintsChange(function(){$('#control-rgraph').controldatavis('refresh');});
	}
})();
