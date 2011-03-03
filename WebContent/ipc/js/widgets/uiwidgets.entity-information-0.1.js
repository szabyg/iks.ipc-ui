/**
 * jQuery UI rdfaEditor
 *
 * IKS Project
 * @author szabyg
 *
 * http://docs.jquery.com/UI/Dialog
 *
 * Depends:
 *	jquery.ui.dialog.js
 *	
 */
(function( $, undefined ) {

$.widget("ui.rdfaEditor", {
	options: {
		editable: false,
		rdf: undefined,
		modal: false
	},
	_create: function(){
		var that = this;
		this.element.bind('click', function() {
			// Append an element at the end of body to use it as the dialog.
			var dialogEl = $(document.body).append("<div></div>").children().last();
			// check if the dialog exists and is shown, if so, close (destroy) it!
			// this prevents to display two dialogs at the same time
			if(window.rdfaDialog)
				window.rdfaDialog.dialog('close');
			// create a new dialog
			window.rdfaDialog = that.dialog = $(dialogEl).dialog({
				close: function(event, ui) {
					// destroy the element (dialogEl)
					$(this).dialog( "destroy" ).remove();
					window.rdfaDialog = null;
				},
				position: {
					my: "left top",
					at: "left top",
					of: that.element
				},
				autoOpen: false,
				modal: that.options.modal,
				title: that.getLabel(),
				show: "slide",
				width: "auto",
				height: "auto"
			});
			
			dialogEl.addClass("ui-widgetgermi");
			
			// set the content of the dialog.
			that.setDialogContent();
			that.dialog.dialog('open');
		});
	},
	getLabel: function() {
		var uri = this.element.attr('about');
		var type = this.element.attr('typeof');
		var rdf = this.options.rdf();
		var labelTriples = rdf.where('<'+$.uri(uri) + "> rdfs:label ?label");
		if(labelTriples.length==0 && type == "v:Person")
			labelTriples = rdf.where('<'+$.uri(uri) + "> v:name ?label");
		if(labelTriples.length==0 && type == "v:Event")
			labelTriples = rdf.where('<'+$.uri(uri) + "> v:summary ?label");
		return label = labelTriples[0].label.value;
	},
	/**
	 * Here we define what will be seen in the dialog.
	 */
	setDialogContent: function() {
		var that = this;
		var uri = this.uri = this.element.attr('about');
		var type = this.element.attr('typeof');
		var titleEl = $.ui.dialog.getTitleId(this.element);
		var rdf = this.options.rdf();
		var matches = rdf.where('<'+$.uri(uri) + "> ?p ?o").matches;
		var triples = $(matches).map(function(i, m){
			return m.triples[0];
		});
		triples.each(function(){
			var propertyLabel = that.resourceLabel(this.property);
			var valueLabel = that.resourceLabel(this.object);
			that._drawField(this.property, this.object, this);
		});
		var propertyList = [];
		if(this.options.ontology[type] && this.options.ontology[type].properties)
			propertyList = this.options.ontology[type].properties;
		
		var definedProperties = $.map(triples, function(triple){
			return triple.property.value.toString();
		});
		
		$(propertyList).each(function(i, prop) {
			var propertyLabel = that.resourceLabel(prop.uri);
			var defProps = $(definedProperties).map(function(i, p){
				return p;
			});
			if($.inArray(prop.uri.value.toString(), defProps) == -1){
				if(prop.type=="literal")
					that._drawField(prop.uri, '');
			}
		});
		$.noop();
	},
	_drawField: function(property, value, triple){
		var that = this;
		this.dialog
			.append("<span title = '" + property.value + "' alt = '" + property.value + "'>" + this.resourceLabel(property) + "</span>: ")
			.append("<br /><input " 
					+ "value='" + this.resourceLabel(value) + "' " 
					+ "property='" + property.value + "' " 
					+ "about='" + this.uri + "' " 
//					+ (triple? "triple='" + triple + "'" : "") 
					+ "/><br />");
		var inputEl = this.dialog.children().last();
		inputEl.data("triple", triple);
		inputEl.bind("change", function(ev){
				var el = $(ev.target);
				var property = $(ev.target).attr('property');
				var triple = $(ev.target).data('triple');
				var uri = $(ev.originalTarget).attr("about");
				that._rdfWriteBack(uri, property, el.val(), triple);
				console.log("changing " + property + ": ");
				ev.stopPropagation();
				$.noop();
			});
		this.dialog.append("<br/");
	},
	_rdfWriteBack: function(subject, property, object, triple){
		if(!subject || !property || !object || typeof object != "string"){
			console.log("subject: " + subject + ", property: " + property + ", object: " + object);
			alert("Wrong writeback, a parameter is missing!");
		}
		var element = $("[about=" + subject + "]");
		// jquery selector can be like
		// $(":type").filter(":about('http://localhost/iks/Sandbox/iks-ipc/markup-orig.html#ErasmusDarwin')")
		if(triple && triple.source){
			var srcEl = triple.source;
			var content = $(srcEl).html();
			if(content)$(srcEl).html(object);
			var val = $(srcEl).attr('content');
			if(val)$(srcEl).attr('content', object);
			var href = $(srcEl).attr('href');
			if(href)$(srcEl).attr('href', object);
			$.noop();
		} else {
			var sRes = jQuery.rdf.resource("<" + subject + ">"),
			pRes = jQuery.rdf.resource("<" + property + ">"),
			oRes = jQuery.rdf.literal('"' + object + '"');
			var triple = jQuery.rdf.triple(sRes, pRes, oRes);
			jQuery(this.element).rdfa(triple);
			/*
			this.element.append("<span"
					+ " property = '" + property + "'"
					+ " content = '" + object + "'"
					+ "></span>");
			*/
			$.noop();
			
		}
		//debugger;
	},
	resourceLabel: function(res){
		if(res && res.type=="uri")return res.value.fragment;
		if(res && res.type=="literal")return res.value;
		return "";
	}
});
}(jQuery));
