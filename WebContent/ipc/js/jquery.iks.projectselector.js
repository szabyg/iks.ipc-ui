/**
 * IKS Intelligent Project Planning tool JS library
 * Project selector widget
 * 
 * @author szabyg
 * @since 2010-10-08
 * TODO Connect facets and use them as filter. 
 * 		Output could be an event with a map of constraints which could be consumed by other 
 * 		UI elements or filter instances.
 */

$.widget("iks.projectautocomplete", {
	/**
	 * Initialize the projectautocomplete widget for all filter fields
	 */
	_create: function() {
		var _this = this;
		this.drawFilterFields();
		this.element.find(".autocomplete").each(function(i, ac) {
			_this.autocompleteFields(ac);
		});
	},
	/**
	 * 
	 */
	getConstraints: function(){
		var res = {};
		this.element.find(".autocomplete").each(function(){
			var fieldId = $(this).attr("id");
			var value = $(this).val();
			if(value.trim()){
				res[fieldId] = value;
			}
		});
		return res;
	},
	setConstraints: function(constraints){
		
	},
	/**
	 * Draw the filter fields in an html table.
	 */
	drawFilterFields: function() {
		res = "";
		// res = "<fieldset style='width:300px;padding:10px;font-size:80%;' id='projectselector'><label for='projectselector'>Project selector</label>";
		if(this.options.fields.length>1) res += "<table>";
		for ( var i = 0; i < this.options.fields.length; i++) {
			var field = this.options.fields[i];
			if(this.options.fields.length>1){
				res += "<tr>";
				res += "<td>";
			}
			res += "<b>" + field.label + "</b>:</td><td> <input" + " id='" + field.id
					+ "'" + " class='autocomplete'" + " rel='" + field.id + "'"
					+ "/>";
			if(this.options.fields.length>1){
				res += "</td>";
				res += "</tr>";
			}
		}
		if(this.options.fields.length>1) res += "</table>";
		// res += "</fieldset>";
		this.element.html(res);
	},
	/**
	 * Put autocompletion functionality on a fieldElement
	 */
	autocompleteFields: function(fieldEl){
		var _this = this;
		var fieldName = $(fieldEl).attr("rel");
		var src = this.getValueListFor(fieldName);
		$(fieldEl).autocomplete({
			source : src,
			minChars : 0,
			select : function(event, ui) {
				var fieldName = $(this).attr("rel");
				var value = $(this).val();
				_this.selectionMade(fieldName, ui.item.value);
				_this.autofill(fieldName, ui.item.value);
				// _this.updateTable(fieldName, ui.item.value);
			},
			formatItem: function(row, i, max) {
				return /*i + "/" + max + ": \"" + */row.name + "\" [" + row.nr + "]";
			},
			formatMatch: function(row, i, max) {
				return row.name + " " + row.nr;
			},
			formatResult: function(row) {
				return row.name;
			}
		});
		// This is not our business I think..
/*
 
		$(fieldEl).blur(function(event){
			var fieldName = $(this).attr("rel");
			var value = $(this).val();
			_this.autofill(fieldName, $(this).val());
			_this.selectionMade(fieldName, $(this).val());
			// _this.updateTable(fieldName, $(this).val());
		})
 */
	},
	/**
	 * list of possible values for a specific field name
	 */
	getValueListFor : function(fieldName) {
		var _this = this;
		var list = [];
		for ( var i = 0; i < this.options.projects.length; i++) {
			var pr = this.options.projects[i];
			var fieldValue = pr[fieldName];
			if (typeof fieldValue == "string") {
				if ($.inArray(fieldValue, list) == -1) {
					var nr = this.getProjectsByFieldValue(fieldName, fieldValue).length;
					list[list.length] = {label:fieldValue + " (" + nr + ")", value: fieldValue};
				}
			} else if (typeof fieldValue == "object") {
				$(fieldValue).each(function(i, el) {
					var valueList = $(list).map(function(i, listEl){
						return listEl.value;
					});
					if ($.inArray(el, valueList) == -1) {
						var nr = _this.getProjectsByFieldValue(fieldName, el).length;
						list[list.length] = {label:el + " (" + nr + ")", value: el};
					}
				});
			}
		}
		return list;
	},
	/**
	 * Fill out the filter form for a specific fieldvalue selection
	 */
	autofill : function(fieldName, fieldValue) {
		var _this = this;
		var projects = this.getProjectsByFieldValue(fieldName, fieldValue);
		if (projects.length == 1) {
			// Show one project
			var pr = projects[0];
			$(this.options.fields).each(function(i, field) {
				var value = pr[field.id];
				var valueLabel = _this.fieldToString(field, value);
				$("#" + field.id).val(valueLabel);
			});
		} else {
			// show a list of projects in the list field
			$(this.options.fields).each(function(i, field) {
				$("#" + field.id).val("");
			});
		}
		if (projects.length > 1) {
			// alert("There are " + projects.length + " matching projects.");
		}
	},
	fieldToString: function (field, fieldValue){
		if($.isFunction(field.formatString)) return field.formatString(fieldValue);
		if(typeof fieldValue == "string")
			return fieldValue;
		if($.isArray(fieldValue))
			return fieldValue.join(", ");
		
	},
	/**
	 * get the list of projects by a specific field value
	 */
	getProjectsByFieldValue : function(fieldName, fieldValue) {
		var res = [];
		for(var i in this.options.projects){
			var pr = this.options.projects[i];
			var field = pr[fieldName];
			if (typeof field == "string" && fieldValue == field) {
				res[res.length] = pr;
			} else if (typeof field == "object"
					&& $.inArray(fieldValue, field)!=-1) {
				res[res.length] = pr;
			}
		};
		return res;
	},
	selectionMade: function(fieldName, fieldValue){
		var projects = this.getProjectsByFieldValue(fieldName, fieldValue);
		var acronyms = $.map(projects,function(pr){
			return pr.acronym;
		});
		this.element.trigger("projectSelection", {
			fieldName: fieldName, 
			fieldValue: fieldValue, 
			projects: projects,
			acronyms: acronyms
		});
	}
});