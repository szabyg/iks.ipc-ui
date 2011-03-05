(function($){
$.stanbolConnector = {
    options: {
        stanbolUrl: "localhost:8080/",
        proxyUrl: "proxy/proxy.php",
        error: function(errMsg){alert(errMsg);}
    },
    /**
     * Get the entityhub sitelist
     */
    getSites: function(cb, options){
        $.extend(this.options, options);
        console.info("ajax...");
        
        var uri = this.options.stanbolUrl + "entityhub/sites/referenced";
        var that = this;
        console.info(uri);
        var xhr = $.ajax(
            {
                url: this.options.proxyUrl, 
                type: "POST",
                data: {
                    proxy_url: uri, 
//                    format: "application/rdf+json", 
                    verb: "GET"
                },
                success: function (data, textStatus, jqXHR){
                    _.map([1, 2, 3], function(num){ return num * 3; });
                    var res = 
                    _.map(data, function(siteUri){
                        return siteUri.replace(this.options.stanbolUrl + "entityhub/site/","").replace("/","")
                    }, that);
                    cb(res);
                },
                error: function(jqXHR, textStatus, errorThrown){
                    console.info(textStatus);
                },
            }
        );
        console.info(xhr);
    },
    stanbolAlive: function(options){
        return true;
    },
    autocompleteFn: function(sites, options){
    
    }
    
}
})(jQuery)
