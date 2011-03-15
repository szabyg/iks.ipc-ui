(function(){
	$(document).ready(function(){
		iks.ipc.controlInit();
	});
	iks.ipc.controlInit = function(){
		var constraints = iks.ipc.collectConstraints();
		$('#control-rgraph').controldatavis({
			dataStore: iks.ipc.dataStorage, 
			constraints: constraints,
			waitMsg: "collecting data..."
		});
	}
})();
