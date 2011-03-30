/**
 * IKS Intelligent Project Planning tool JS library
 * Project selector widget
 * 
 * @author szabyg
 * @since 2010-11-10
 */

$.widget("iks.timerangeselector", {
	/**
	 * Initialize the projectautocomplete widget for all filter fields
	 */
	_create: function() {
		var _this = this;
		this._drawSelectors();
		// this.element.find("select, input").wrap("<div/>");
		this.element.find(".rangeSelector").bind("change", function(e){
			var timeRanges = $(this).data("timeRanges");
			_this.currentRange = _(timeRanges).detect(function(range){
			    return range.value == this.value;
			}, this);
			_this.element.trigger("rangeSelected", _this.currentRange);
/*		});
		this.rangeSelectorEl.bind("change", function(e){*/
//			_this.currentRange = _this.timeRanges[$(e.target).val()];
			
			// Set min and max dates for start and end date pickers
			_this.startDateSelector.datepicker('option', 'minDate', '');
			_this.startDateSelector.datepicker('option', 'maxDate', _this.currentRange.endDate);
			_this.endDateSelector.datepicker('option',   'minDate', _this.currentRange.startDate);
			_this.endDateSelector.datepicker('option',   'maxDate', '');
			
			// Set selected dates
			_this.startDateSelector.datepicker("setDate", _this.currentRange.startDate);
			_this.endDateSelector.datepicker("setDate", _this.currentRange.endDate);
		});
		$(".startDate, .endDate").bind("select", function(e){
		});
		this._generateTimeRanges();
	},
	getConstraints: function(){
		var res = {};
		if(this.currentRange.startDate)res.startDate = this.currentRange.startDate;
		if(this.currentRange.endDate)res.endDate = this.currentRange.endDate;
		return res;
	},
	options: {
		dateFormat: "yy-mm-dd",
		startDateLabel: 'Start', 
		endDateLabel: 'End',
		startYear: 2009,
		endYear: 2012
	},
	// Draw the selectors to define a timerange
	_drawSelectors: function(){
		this._drawRangeSelector();
		this._drawBeginEndSelectors();
	},
	_drawRangeSelector: function(){ 
		var res = "";
		res += "<div><b>" + this.options.periodLabel + "</b><br/><select class='rangeSelector'>";
		// res += "<option value=''></option>";
		res += "</select></div>";
		this.element.html(res);
		this.rangeSelectorEl = this.element.find(".rangeSelector");
	},
	_drawBeginEndSelectors: function(){
		this.element.append("<span style=''><b>" + this.options.startDateLabel + "</b><input type='date' class='startDate' id='startDate' /></span> ");
		this.element.append("<span style=''><b>" + this.options.endDateLabel + "</b><input type='date' class='endDate' id='endDate' /></span> ");
		var that = this;
		this.dates = this.element.find(".startDate, .endDate").datepicker({
				dateFormat: this.options.dateFormat,
				autoSize: true,
				onSelect: function( selectedDate ) {
					var option = this.id == "startDate" ? "minDate" : "maxDate",
							instance = $( this ).data( "datepicker" );
					date = $.datepicker.parseDate(
							instance.settings.dateFormat ||
							$.datepicker._defaults.dateFormat,
							selectedDate, instance.settings );
					that.dates.not( this ).datepicker( "option", option, date );

					that.currentRange = {
				        value: "custom", 
				        label: "",
				        startDate: that.startDateSelector.datepicker("getDate"),
				        endDate: that.endDateSelector.datepicker("getDate")
			        };
			        that.element.trigger("rangeSelected", that.currentRange);
			        //that.element.trigger("rangeSelected", timeRanges[$(this).val()]);
			        that.rangeSelectorEl.val("null");
				}
		});
		this.startDateSelector = this.dates.filter('.startDate');
		this.endDateSelector = this.dates.filter('.endDate');

		$.noop();
	},
	_generateTimeRanges: function(){
		var yearFrom = 2008, yearTo = 2011;
		var res = [];
		// Empty entry
		res.push({
				value: "null", 
				label: "",
				startDate: null,
				endDate: null
			});
		// uptonow entry
		res.push({
				value: "current", 
				label: "current",
				startDate: null,
				endDate: new Date()
			});
		for(var year = this.options.startYear; year<=this.options.endYear; year++){
			// Whole year entry
			var value = year + "";
			res.push({
				value: value, 
				label: year + "",
				startDate: new Date(year, 0,1),
				endDate: new Date(year, 12, 0)
			});
			for(var quartal = 1; quartal <=4; quartal++){
				// Quartal entry
				var value = year + "Q" + quartal;
				res.push({
					value: value, 
					label: "&nbsp;&nbsp;" + year + " Q" + quartal,
					startDate: new Date(year, (quartal-1)*3,1),
					endDate: new Date(year, quartal*3, 0)
				});
			}
		}
		this.timeRanges = res;
		this.setTimeRanges(this.timeRanges);
	},
	setTimeRanges: function(timeRanges){
		res = "";
		for(r in timeRanges){
			var range = timeRanges[r];
			res += "<option value='" + range.value + "'>" + range.label + "</option>";  
		};
		this.rangeSelectorEl.append(res);
		this.rangeSelectorEl.data("timeRanges", timeRanges);
		this.rangeSelectorEl.val("current");
		this.rangeSelectorEl.trigger("change");
	},
	enable: function(){
		$.Widget.prototype.enable.apply(this, arguments);
		this.rangeSelectorEl.enable();
		this.startDateSelector.enable();
		this.endDateSelector.enable();
	},
	disable: function(){
		$.Widget.prototype.disable.apply(this, arguments);
		this.rangeSelectorEl.disable();
		this.startDateSelector.disable();
		this.endDateSelector.disable();
	}
});

	
