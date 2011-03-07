/**
 * IKS Intelligent Project Planning tool JS library
 * Data access layer
 * 
 * @author szabyg
 * @since 2010-11-10
 */

if (typeof iks == 'undefined' || !iks) {
	var iks = {};
}
if (typeof iks.ipc == 'undefined' || !iks.ipc) {
	iks.ipc = {};
}
if (typeof iks.ipc.dataStorage == 'undefined' || !iks.ipc.dataStorage) {
	iks.ipc.dataStorage = {};
}

$.extend(iks.ipc.dataStorage, {
    options: {
        couchdbUrl: "http://localhost:5984/ipctest/"
    },
	/**
	 * Get projects-data and fields-data and call the callback function 
	 */
	getProjectData: function(callback){
		// Load project data
		var fields, projects;
		$.ajax({
				type: "GET", url: "static-data/fields-data.json",
				// dataType: "json",
				success: function(data){
					fields=eval(data);
					$.ajax({
						type: "GET", url: "static-data/projects-data.json",
						// dataType: "json",
						success: function(data){
							projects=eval(data);
							callback(fields, projects);
						},
						error: function(XMLHttpRequest, textStatus, errorThrown){
							debugger;
						}
						
					});
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					debugger;
				}
				
		});
	
	},
	/**
	 * List of webservice addresses
	 * @TODO replace address with getter in order it's depending on change of options.
	 */
	repository: {
		"spentPmByWbsPeriodPartner": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/spentPmByWbsPeriodPartner?callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return iks.ipc.dataStorage.getValues(data.rows);
			}
		},
		"planPmByWbsPeriod": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/planPmByWbsPeriod?callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return iks.ipc.dataStorage.getValues(data.rows);
			}
		},
		"plannedEffortPerPartnerPerQuartalPerWBS": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/plannedEffortPerPartnerPerQuartalPerWBS?group_level=4&callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data;
			}
		},
		"periods": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/periods?callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				var res = {};
				$(data.rows).each(function(){
					res[this.key] = this.value;
				});
				return res;
			}
		},
		"spenteffortByprojectWBS": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/spenteffortByprojectWBS?group_level=4&callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data;
			}
		},
		"delivDocs": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/delivDocs?callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data.rows;
			}
		},
		"planDeliverables": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/planDeliverables?startkey=6&callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data.rows;
			}
		},
		"planWorkpackages": {
			getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "_design/ipc/_view/planWorkpackages?callback=?";},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data.rows;
			}
		}

	},
	/**
	 * If not yet loaded, gets the data from the webservices and calls the callback.
	 * Recursive method, loads one data set at a time, then calls itself.
	 * @param repositories String array of data set names to load and mix in the result object.
	 * @param callback To be called with all the asked data sets.
	 * @param res 
	 */
	getData: function(repositories, callback, res) {
		if(typeof res != "object")res = {};
		// Last iteration? Call callback
		if(repositories.length == 0){
			callback(res);			
		} else {
			
			var rep = repositories.pop();
			var repObj = this.repository[rep];
			// Existing repository?
			if(repObj == null){
				throw ("Undefined repository " + rep);
			} else {
				if(repObj.loaded){
					// repository already loaded
					res[rep]=getValues(eval(data).rows);
					that.getData(repositories, callback, res);
				} else {
					// new data to get, so get it
					var that = this;
					$.ajax({
						type: "GET", url: repObj.getAddress(),
						dataType: "jsonp",
						success: function(data){
							// Data is here
							repObj.data = repObj.postProcess((data));
							res[rep]=repObj.data;
							that.getData(repositories, callback, res);
						},
						error: function(XMLHttpRequest, textStatus, errorThrown){
							throw rep + " AJAX error: " + textStatus;
						}
					});
				}
			}
			
		}
	},
	getValues: function(couchdbResultArray){
		var res = [];
		for(var i in couchdbResultArray){
			res.push(couchdbResultArray[i].value);
		}
		return res;
	},
	/**
	 * Get the planned and spent data based on the constraints and call the callback function.
	 */
	getPlanEffortData: function(constraints, callback){
		var planned, spent;
		var that = this;
		var getValues = function(couchdbResultArray){
			var res = [];
			for(var i in couchdbResultArray){
				res.push(couchdbResultArray[i].value);
			}
			return res;
		};
		this.getData(["planPmByWbsPeriod", "spentPmByWbsPeriodPartner"], function(data){
			var wbsTree = new WBSTree({planned: {data: data.planPmByWbsPeriod}, spent:{data: data.spentPmByWbsPeriodPartner}});
			callback(wbsTree);
		});
	},
	applyToConstraints: function(constraints, d){
		return true;
	},
    setConfig: function(options){
        $.extend(this.options, options);
    },
    isAlive: function(cb){
        var that = this;
        this.repository.test = {
			getAddress: function(){return that.options.couchdbUrl;},
			loaded: false,
			data: null,
			postProcess: function(data){
				return data.rows;
			}
		};
		this.getData(["test"], function(){
		    cb(true);
		});
    }

});
