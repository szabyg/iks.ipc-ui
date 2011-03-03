/**
 * IKS Intelligent Project Planning tool JS library with tools to save codelines.
 * 
 * @author szabyg
 * @since 2010-11-13
 */

if (typeof iks == 'undefined' || !iks) {
	var iks = {};
}
if (typeof iks.ipc == 'undefined' || !iks.ipc) {
	iks.ipc = {};
}
if (typeof iks.ipc.tools == 'undefined' || !iks.ipc.tools) {
	iks.ipc.tools = {};
}


/**
 * jQuery sheet related tools
 */
if (typeof iks.ipc.tools.sheet == 'undefined' || !iks.ipc.tools.sheet) {
	iks.ipc.tools.sheet = {};
}
$.extend(iks.ipc.tools.sheet, {
	/**
	 * 
	 */
	buildSheetJSON: function(tableConf){
		var that = this;
		var res = {};
		res.metadata = {
			"columns" : tableConf.rows[0].fields.length,
			"rows" : tableConf.rows.length
		};
		$.extend(res.metadata, tableConf.metadata);
		
		res.data = {};
		$.each(tableConf.rows, function(i, row){
			var conf = {};
			$.extend(conf, tableConf.conf, row.conf);
			res.data["r"+i] = that._createRow(row.fields, conf, i);
		});
		return res;
	},
	_createRow: function(fields, conf, r){
		var that = this;
		var res = {};
		// iterate through the title columns
		$.each(fields, function(c, field){
			var cell = {
				value: that._relativeCells(field, r+1, c+1),
				style: conf.style,
				colspan: null,
				cl: conf.cl
			};
			res["c" + c] = $.extend(cell, conf);
		});
		return res;
	},
	_relativeCells: function(fieldValue, row, col){
		fieldValue = fieldValue.replace(/\%R([+-]?[0-9])\%/g, function(ocurrance , $1){return Number($1)+row;});
		fieldValue = fieldValue.replace(/\%C([+-]?[0-9])\%/g, function(ocurrance , $1){return Number($1)+col;});
		$.noop();
		return fieldValue;
	},
	/**
	 * To use in a formel for creating a link to a method call in a table cell.
	 * @param label is shown in the cell
	 * @param method to call as String
	 * @param params is an array of parameters (Strings or numbers) 
	 */
	buildLink: function(label, method, params){
		var res = "=iks.ipc.tools.sheet._buildLink('" + label + "', '" + method + "'";
		res += params?", " + JSON.serialize(params) /*"['" + params.join("', '")+ "']"*/:"";
		res += ", jS";
		res += ")";
		return res;
	},
	/**
	 * Creates a link to a method call in a table cell.
	 */
	_buildLink: function(label, method, params, jS){
		var sheetID = jQuery.sheet.instance[jS.I].s.parent.parent().attr('id');
		method = method.replace(/\%sheetID\%/g, sheetID);
		var res = "<a href=\'javascript:void(false);\' onclick=\'" + method + "(";
		// res += params?", " + "['" + params.join("', '") + "']":"";
		res += JSON.serialize(params).substring(1, JSON.serialize(params).length-1) + ")\'>" + label + "</a>";
		res = res.replace(/"e"/, "arguments[0]");
		return res;
	},
	// This function builds the inline menu to make it easy to interact with
	// each sheet instance
	// The method is from the jquery.sheet demo page
	inlineMenu : function(instance) {
		var I = (instance ? instance.length : 0);
	
		// we want to be able to edit the html for the menu to make them
		// multi-instance
		var html = $('#inlineMenu').html().replace(/pics\//g,
				libroot + "jquery.sheet/pics/").replace(/sheetInstance/g,
				"$.sheet.instance[" + I + "]");
	
		var menu = $(html);
	
		// The following is just so you get an idea of how to style cells
		menu.find('.colorPickerCell').colorPicker().change(
				function() {
					$.sheet.instance[I].cellChangeStyle('background-color', $(
							this).val());
				});
	
		menu.find('.colorPickerFont').colorPicker().change(function() {
			$.sheet.instance[I].cellChangeStyle('color', $(this).val());
		});
	
		menu.find('.colorPickers').children().eq(1).css('background-image',
				"url('pics/icons/palette.png')");
		menu.find('.colorPickers').children().eq(3).css('background-image',
				"url('pics/icons/palette_bg.png')");
	
		return menu;
	}
});
(function($) {
    var uid = 0;
    $.getUID = function() {
        uid++;
        return 'jQ-uid-'+uid;
    };
    $.fn.getUID = function() {
        if(!this.length) {
            return 0;
        }
        var fst = this.first(), id = fst.attr('id');
        if(!id) {
            id = $.getUID();
            fst.attr('id', id);
        }
        return id;
    };
})(jQuery);

$('#has-id').getUID(); // returns "has-id"
$('<div>').getUID(); // sets id attribute to "jQ-uid-1" and returns it
