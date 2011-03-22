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
        couchdbUrl: "http://localhost:5984/ipctest/",
        couchdbPersUrl: "http://localhost:5984/ipcstore/",
        proxyUrl: "proxy/proxy.php"
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
        "urn:iks:iks": {
            getAddress: function(){return iks.ipc.dataStorage.options.couchdbUrl + "urn%3Aeu%3Afp7%3Aict%3Aproject%3Aiks?callback=?";},
            loaded: false,
            data: null,
            postProcess: function(data){
                return data;
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
    storeDoc: function(doc, cb, error){
        this.proxyRequest(iks.ipc.dataStorage.options.couchdbPersUrl + (doc._id||doc.id), {
            method: "POST",
            success: function(res){
                    if(cb)cb(res);
            },
            error: function(err){
                if(error)error(err);
            }
        });
        $.noop();
    },
    // TODO finish implementing, to be called by report
    loadDoc: function(id, cb, error){
        $.get(iks.ipc.dataStorage.options.couchdbPersUrl + (doc._id||doc.id))
        .success(function(res){
            if(cb)cb(res);
        })
        .error(function(err){
            if(error)error(err);
        });
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
            var that = this;
            // Existing repository?
            if(repObj == null){
                throw ("Undefined repository " + rep);
            } else {
                if(repObj.loaded){
                    // repository already loaded
                    res[rep]=repObj.data;
                    that.getData(repositories, callback, res);
                } else {
                    // new data to get, so get it
                    $.ajax({
                        type: "GET", url: repObj.getAddress(),
                        dataType: "jsonp",
                        success: function(data){
                            // Data is here
                            repObj.data = repObj.postProcess((data));
                            res[rep]=repObj.data;
                            repObj.loaded = true;
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
    /**
     * generic call to a stanbol backend through a proxy
     * 
     */
    proxyRequest: function(uri, options){
        var ajaxOpt = 
        {
            url: this.options.proxyUrl, 
            type: "POST",
            data: {
                proxy_url: uri, 
                Accept: options.acceptHeader || "application/json", 
                verb: options.method || "GET"
            },
            success: options.success,
            error: options.error
        };
        $.extend(ajaxOpt.data, options.data);
        $.ajax(ajaxOpt);
        
    },

    getValues: function(couchdbResultArray){
        var res = [];
        for( var i = 0; i < couchdbResultArray.length; i++){
            res.push(couchdbResultArray[i].value);
        };
        return res;
    },
    getPeriod: function(projectId, periodId, cb){
        this.getData(["periods"], function(data){
            cb(data.periods[periodId]);
        });
    },
    /**
     * Get the planned and spent data based on the constraints and call the callback function.
     */
    getPlanEffortData: function(constraints, callback){
        var planned, spent;
        var that = this;
        var getValues = function(couchdbResultArray){
            var res = [];
            for(var i = 0;i < couchdbResultArray.length; i++){
                res.push(couchdbResultArray[i].value);
            }
            return res;
        };
        this.getData(["planPmByWbsPeriod", "spentPmByWbsPeriodPartner"], function(data){
            var filter = function(recordArray){
                return _.filter(recordArray, function(record){
                    return constraints.checkRecord(record)
                });
            };
            constraints.loadPeriods('', function(){
                var wbsTree = new WBSTree({
                    planned: {data: filter(data.planPmByWbsPeriod)}, 
                    spent:{data: filter(data.spentPmByWbsPeriodPartner)}
                });
                callback(wbsTree);
            });
        });
    },
    /**
     * set configuration
     */
    setConfig: function(options){
        $.extend(this.options, options);
    },
    /**
     * send ping to couchdb server to know if it's reachabl, up and running.
     */
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
