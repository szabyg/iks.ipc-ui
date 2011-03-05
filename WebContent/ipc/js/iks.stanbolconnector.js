(function($){
$.stanbolConnector = {
    options: {
        stanbolUrl: "http://localhost:8080/",
        proxyUrl: "proxy/proxy.php",
        error: function(errMsg){alert(errMsg);}
    },
    /**
     * Get the entityhub sitelist
     * @cb callback, gets an array of site names, e.g. ["dbpedia", "geonames"]
     */
    getSites: function(cb, options){
        $.extend(this.options, options);
        var uri = this.options.stanbolUrl + "entityhub/sites/referenced";
        var that = this;
        this.stanbolRequest(uri,{
            acceptHeader: "application/json", 
            success: function (data, textStatus, jqXHR){
                var res = _.map(data, function(siteUri){
                    return siteUri.replace(this.options.stanbolUrl + "entityhub/site/","").replace("/","")
                }, that);
                cb(res);
            }
        });
    },
    entityhubQuery: function(site, s, cb, options){
        var uri = this.options.stanbolUrl + "entityhub/site/" + site + "/query";
        var fieldQuery = {
            "selected": [ 
                "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", 
                "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type"], 
            "offset": "0", 
            "limit": "11", 
            "constraints": [{ 
               "type": "text", 
               "patternType": "wildcard", 
               "text": "*" + s + "*", 
               "field": "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label" 
            }]
        };
        var postData = {query: JSON.serialize(fieldQuery)};
        this.stanbolRequest(uri,{
            method: "POST",
            success: function (data, textStatus, jqXHR){
                cb(_.map(data.results, function(entity){
                    var res = {};
                    _.each(entity, function(value, key){
                        if(_.isArray(value)){
                            res[key] = _.map(value, function(valueObj){
                                return valueObj.value;
                            });
                        } else {
                            res[key] = value;
                        }
                    });
                    return res;
                }));
            },
            data: postData,
            processData: false,
            dataType: "string"
        });
    },
    getEntity: function(site, uri, cb, options){
    
    },
    /**
     * generic call to a stanbol backend through a proxy
     * 
     */
    stanbolRequest: function(uri, options){
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
    autocompleteFn: function(sites, options){
        
    },
    
    
}
})(jQuery)
