/**
 * IKS Intelligent Project Planning tool JS library
 * Basic app functionality
 * 
 * @author szabyg
 * @since 2011-03-12
 */
if (typeof iks == 'undefined' || !iks) {
	var iks = {};
}
if (typeof iks.ipc == 'undefined' || !iks.ipc) {
	iks.ipc = {};
}

(function(){
    function stanbolconnector_init(){
        // aloha connector
        if(withAloha){
            GENTICS.Aloha.Repositories.stanbolRepository.settings.stanbolUrl = iks.ipc.stanbolUrl;
        }
        // project selector's stanbol connector
        $.stanbolConnector.setConfig({stanbolUrl: iks.ipc.stanbolUrl});
        $.stanbolConnector.isAlive(function(alive){
            if(!alive)
                alert(iks.ipc.stanbolUrl + "is not reachable!");
            else {
                console.info("Connection to stanbol at " + iks.ipc.stanbolUrl + " is OK");
            }
        });
    }
    function dataStorage_init(){ // couchdb connector init
        iks.ipc.dataStorage.setConfig({couchdbUrl: iks.ipc.couchdbUrl});
        iks.ipc.dataStorage.isAlive(function(alive){
            if(!alive)
                alert(iks.ipc.couchdbUrl + "is not reachable!");
            else {
                console.info("Connection to couchdb at " + iks.ipc.couchdbUrl + " is OK");
            }
        });
    }
    
    function projectSelector_init(){
        $('#projectselect').bind('change', function(e){
            console.info("selected project: " + $(this).val());
            iks.ipc.constraints.set({
                projectId: $(this).val(), 
                projectLabel: this.children[this.selectedIndex].innerHTML
            });
        });

        $.stanbolConnector.entityhubQuery("srfg", "*", function( data ) {
            // filter internal project
            data = _.reject(data, function(item){return item.id.indexOf("INTERN") != -1});
            var projects = $.map( data, function( item ) {
                return {
                    label: item["http://www.w3.org/2000/01/rdf-schema#label"][0],
                    value: item.id
                }
            });
            projects = _(projects).sortBy(function(project){return project.label.toLowerCase()});
            iks.ipc._projectSelectOptionsTmpl = 
                "<% _.each(projects, function(project) { %>" + 
                " <option value='<%= project.value %>'>"+
                "<%= project.label %></option> <% }); %>";
            $('#projectselect').html(_.template(iks.ipc._projectSelectOptionsTmpl, {projects : projects}));
        },{constraints:[{ 
            "type": "reference", 
            "field": "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type", 
    /*        "value": "http:\/\/dbpedia.org\/ontology\/Person", */
            "value": "Project", 
        }]});
        
        // Project search autocompletion
	    $( "#projectlookup" ).autocomplete({
	        source: function( request, response ) {
                $.stanbolConnector.entityhubQuery("srfg", '*'+request.term+'*', function( data ) {
                    data = _.reject(data, function(item){return item.id.indexOf("INTERN") != -1});
		            response( $.map( data, function( item ) {
			            return {
				            label: item["http://www.w3.org/2000/01/rdf-schema#label"][0],
				            value: item["http://www.w3.org/2000/01/rdf-schema#label"][0]
			            }
		            }));
                });
	        },

	        minLength: 2,
	        select: function( event, ui ) {
		        console.log( ui.item ?
			        "Selected: " + ui.item.label :
			        "Nothing selected, input was " + this.value);
			    if(ui.item){
			        var label = ui.item.label;
			        // console.info(label);
			        $.stanbolConnector.entityhubQuery("srfg", label, function( data ) {
                        var id = data[0].id;
		                console.info(id);
		                $.stanbolConnector.entityhubQuery("srfg", label, function( data ) {
                                data = _.reject(data, function(item){return item.id.indexOf("INTERN") != -1});
		                        var projects = $.map( data, function( item ) {
		                            return {
				                        label: item["http://www.w3.org/2000/01/rdf-schema#label"][0],
				                        value: item.id
			                        }
		                        });
		                        projects = _(projects)
		                            .sortBy(function(project){return project.label.toLowerCase()});
                                $('#projectselect').html(_.template(iks.ipc._projectSelectOptionsTmpl, {projects : projects}));
                                $('#projectselect').trigger('change');
		                        // console.info(projects);
                            },{constraints:[{ 
                                "type": "reference", 
                                "field": "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type", 
                        /*        "value": "http:\/\/dbpedia.org\/ontology\/Person", */
                                "value": "Project", 
                        }]});
		                $.stanbolConnector.getEntity("srfg", id, function(data){
                            console.info(["entity representation of " + id + ":", data.representation]);
		                });
		            });
			    }
	        },
	        open: function() {
		        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
	        },
	        close: function() {
		        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
	        }
        });
    }
    
    function debug(){
        iks.ipc.constraints.bind('change', function(model){
            console.info(model.attributes);
        });
    }
    
    $(document).ready(function(){
        stanbolconnector_init();
        dataStorage_init();
        if(withAloha)iks.ipc.alohaconfig();
        projectSelector_init();
        
        // debug();
    });

    var Constraints = Backbone.Model.extend({
        periods: {},
        loadPeriods: function(projectId, cb){
            var that = this;
            iks.ipc.dataStorage.getData(["periods"], function(data){
                that.periods = $.extend(that.periods, data.periods);
                if(cb) cb();
            });
        },
        
        checkRecord: function(record){
            if(!this.periods[record.period]){
                console.info("Period not known yet! " + record.period);
            }
            var period = this.periods[record.period];
            var pStart = new Date(period.startdate), 
                pEnd = new Date(period.enddate);
            var res = true;
            var constKeys = _.keys(this.attributes);
            var constraints = this;
            _.each(constKeys, function(key){
                switch(key){
                case 'startdate':
                    var startDate = new Date(constraints.get('startdate'));
                    res = res && startDate < pEnd; // is the constraint start before the period end?
                    break;
                case 'enddate':
                    var endDate = new Date(constraints.get('enddate'));
                    res = res && endDate > pStart; // is the period start after the constraint end?
                    break;
                }
            });
            if(false){
                var log = "";
                if(res==true)
                    log += "+++ recordcheck: " + record.period;
                else
                    log += "--- recordcheck: " + record.period;
                console.info([log, {constr: constraints.toJSON(), period: period, rec: record}]);
            }

            return res;
        }
    });
    
    $.extend(iks.ipc, {
        getLifecyclemode: function(){
            return $('input[name=lifecyclemode]:checked').val() || '';
        },
        constraints: new Constraints(),
        constraintsChange: function(cb){
            this.constraints.bind('change', cb);
        }
    });
    iks.ipc.constraints.bind('change:projectId', function(constraints, projectId){
        console.info("projectId changed: " + projectId);
        iks.ipc.constraints.loadPeriods(projectId);
    });
})();
