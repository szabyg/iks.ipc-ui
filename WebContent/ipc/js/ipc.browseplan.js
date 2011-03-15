(function(){
	$(document).ready(function(){
		controlInit();
	});
	function controlInit(){
		var constraints = iks.ipc.collectConstraints();
		$('#control-rgraph').controldatavis({
			dataStore: iks.ipc.dataStorage, 
			constraints: constraints,
			waitMsg: "collecting data..."
		});
	}
})();
