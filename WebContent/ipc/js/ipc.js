/**
 * IKS Intelligent Project Planning tool JS library
 * Basic app functionality
 * 
 * @author szabyg
 * @since 2011-03-12
 */


// Initialisation, component configuration
$(document).ready(function(){
    GENTICS.Aloha.Repositories.stanbolRepository.settings.stanbolUrl = stanbolUrl;
    $.stanbolConnector.setConfig({stanbolUrl: stanbolUrl});
    $.stanbolConnector.isAlive(function(alive){
        if(!alive)
            alert(stanbolUrl + "is not reachable!");
        else {
            console.info("Connection to stanbol at " + stanbolUrl + " is OK");
        }
    });
    iks.ipc.dataStorage.setConfig({couchdbUrl: couchdbUrl});
    iks.ipc.dataStorage.isAlive(function(alive){
        if(!alive)
            alert(stanbolUrl + "is not reachable!");
        else {
            console.info("Connection to couchdb at " + couchdbUrl + " is OK");
        }
    });
    
    if(withAloha)alohaconfig();

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
                var options = "<% _.each(projects, function(project) { %> <option id='<%= project.value %>'><%= project.label %></option> <% }); %>";
                $('#projectselect').html(_.template(options, {projects : projects}));
            },{constraints:[{ 
                "type": "reference", 
                "field": "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type", 
        /*        "value": "http:\/\/dbpedia.org\/ontology\/Person", */
                "value": "Project", 
            }]});

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
					    console.info(label);
					    $.stanbolConnector.entityhubQuery("srfg", label, function( data ) {
                            var id = data[0].id;
				            console.info(id);
				            $.stanbolConnector.entityhubQuery("srfg", label, function( data ) {
                                data = _.reject(data, function(item){return item.id.indexOf("INTERN") != -1});
				                var projects = $.map( data, function( item ) {
				                    console.info(item);
					                return {
						                label: item["http://www.w3.org/2000/01/rdf-schema#label"][0],
						                value: item.id
					                }
				                });
				                projects = _(projects).sortBy(function(project){return project.label.toLowerCase()});
                                var options = "<% _.each(projects, function(project) { %> <option id='<%= project.value %>'><%= project.label %></option> <% }); %>";
                                $('#projectselect').html(_.template(options, {projects : projects}));
				                console.info(projects);
                            },{constraints:[{ 
                                "type": "reference", 
                                "field": "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type", 
                        /*        "value": "http:\/\/dbpedia.org\/ontology\/Person", */
                                "value": "Project", 
                            }]});
				            $.stanbolConnector.getEntity("srfg", id, function(data){
				            });
				                console.info(data);
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

});

if (typeof iks == 'undefined' || !iks) {
	var iks = {};
}
if (typeof iks.ipc == 'undefined' || !iks.ipc) {
	iks.ipc = {};
}

$.extend(iks.ipc, {
    // Collect the set constraints from all the UI filter elements.
    collectConstraints: function (){
	    var res = {};
	    // $.extend(res, $("#project-selector").projectautocomplete("getConstraints"));
	    $.extend(res, $("#org-selector").projectautocomplete("getConstraints"));
	    $.extend(res, $("#timerange-selector").timerangeselector("getConstraints"));
	    return res;
    },
    getLifecyclemode: function(){
        return $('input[name=lifecyclemode]:checked').val() || '';
    }
});

$(document).ready(function(){
	// Header functionality
	iks.ipc.dataStorage.getProjectData(function(fields, projects){
		// $("#project-selector").projectautocomplete({fields: [{id: "acronym", label: "Select project"}], projects: projects});
		$("#project-selector").bind("projectSelection", function(event, data){
			$("#projects").html(data.acronyms.join(", "));

		});
		
		$("#org-selector").projectautocomplete({fields: [{id: "partners", label: "Partner"}], projects: projects, fieldElement: "input"});
		$("#org-selector").bind("projectSelection", function(event, data){
			$("#organisation").html(data.fieldValue);

		});

		$("#timerange-selector").timerangeselector({
			periodLabel: '3. Select Period', 
			startDateLabel: '', 
			endDateLabel: 'to<br/>',
			dateFormat: "yy-mm-dd",
			startYear: 2009
		});
		// .find("input").css("margin-left", "8px");
		$("#timerange-selector").bind("rangeSelected", function(e, timeRange){
			$("#timerange").html(
					"<b>value: </b>" + timeRange.value + 
					"<b> label: </b>" + timeRange.label + 
					"<b> start date: </b>" + timeRange.startDate +
					"<b> end date: </b>" + timeRange.endDate);
		});
		
	});
});
