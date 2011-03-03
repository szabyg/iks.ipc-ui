/**
 * Work Breakdown Structure Tree
 * @param data 
 * @returns 
 */
var WBSTree = function(data){
	var planned = data.planned, spent = data.spent;
	// Convert the flat planned and spent Structures into a tree
	this.children = [];
	this.jsonMerge(planned, ["pm-planned"]);
	this.jsonMerge(spent, ["pm-spent"]);
//	var test = this.computeSum("pm-planned");
//	var test2 = this.computeSum("pm-spent");
	$.noop();
};
/**
 * Work Breakdown Structure TreeNode
 * @returns
 */
var TreeNode = function(){
	this.children = [];
};

// Define the TreeNode class
TreeNode.prototype = {
		addChild: function(child){
			this.children.push(child);
			child.parent = this;
		},
		setLabel: function(label){
			this.label = label;
		},
		/**
		 * Return the child node with the given id. If it doesn't yet exist, create it.
		 */
		getOrCreateChild: function(id, record){
			if(!this.children[id]){
				var newChild = new TreeNode();
				this.children[id] = newChild;
				newChild.id = id;
				newChild.wbs = id;
				newChild.parent = this;
				newChild._depth = this._depth + 1;
				newChild._createLabel(newChild, record);
			}
			return this.children[id];
		},
		/**
		 * Compute the sum of all <fieldName> arguments in all relevant records. 
		 */
		computeSum: function(fieldName, constraints){
			var sum=0;
			if(this.records){
				for(var i in this.records) if(this.records.hasOwnProperty(i)){
					var rec = this.records[i];
					if(this._isRecordRelevant(rec, constraints) && rec[fieldName])
						sum += Number(rec[fieldName]);
				}
			}
			for(var i in this.children) if(this.children.hasOwnProperty(i)){
				var child = this.children[i];
				if(child._isNodeRelevant(constraints))
					sum += child.computeSum(fieldName, constraints);
			}
			return sum;
		},
		/**
		 * Collects all relevant records
		 * @param constraints
		 * @returns {Array} array of records
		 */
		getRelevantRecords: function(constraints){
			var res=[];
			if(this.records){
				for(var i in this.records) if(this.records.hasOwnProperty(i)){
					var rec = this.records[i];
					if(this._isRecordRelevant(rec, constraints))
						$.merge(res, [rec]);
				}
			}
			for(var i in this.children) if(this.children.hasOwnProperty(i)){
				var child = this.children[i];
				if(child._isNodeRelevant(constraints))
					$.merge(res, child.getRelevantRecords(constraints));
			}
			return res;
		},
		/**
		 * get all relevant children
		 */
		getRelevantChildren: function(constraints){
			// filter node.children by relevance
			var relChildren=[];
			for(var i in this.children) if(this.children.hasOwnProperty(i)){
				var child = this.children[i];
				if(child._isNodeRelevant(constraints)){
					relChildren[i] = child;
				}
			};
			return relChildren;
		},
		/**
		 * Go through all records of the node and it's children nodes
		 * and find out if the node is relevant.
		 */
		_isNodeRelevant: function(constraints){
			if(!constraints)
				return true;
			var node = this;
			if(this.records){
				for(var i in this.records) if(this.records.hasOwnProperty(i)){
					if(node._isRecordRelevant(this.records[i], constraints))
						return true;
				}
			}
			for(var i in this.children) if(this.children.hasOwnProperty(i)){
				if(this.children[i]._isNodeRelevant(constraints))
					return true;
			}
			return false;
		},
		/**
		 * Go through all constraints and tell if all constraints have min 1 value which 
		 * makes the record relevant.
		 */
		_isRecordRelevant: function(record, constraints){
			// constraits: {period: '2010', organisation: ['srfg', 'srdc']}
			var res = true;
			for(var c in constraints) if(constraints.hasOwnProperty(c)){
				var _res = false;
				var constraintField = $.makeArray(constraints[c]);
				var fieldValue = record[c];
				// TODO this with the constraints should take place outside.. 
				if(!fieldValue)
					return true;
				for(i in constraintField){
					var cVal = constraintField[i];
					if(fieldValue.indexOf(cVal) != -1){
						_var = true;
					}
				}
				res = res && _res;
			}
			return res;
		},
		_createLabel: function(node, record){
			this.parent._createLabel(node, record);
		},
		isRoot: false
};

// Define WBSTree class
$.extend(WBSTree.prototype, TreeNode.prototype, {
	/**
	 * Merge the JSON data into the tree.
	 */
	jsonMerge: function(jsonData, mergeField){
		for(var i=0; i < jsonData.data.length; i++){
			var record = jsonData.data[i];
			if(typeof record == "object"){
				var node = this.getNodeByRecord(record);
				if(!node.records)node.records = [];
				node.records.push(record);
			}
			$.noop();
		}
	},
	/**
	 * Build the TreeNode using the project and wbs of the record 
	 */
	getNodeByRecord: function(rec){
//		node = this.getOrCreateChild(rec.project, rec);
		var node = this;
		
		var path = rec.wbs.split(".");
		
		// Extend the leaf structure?
		// path[path.length] = rec.partner;
		for(var i = 0; i<path.length; i++){
			var pathEl = path[i];
			node = node.getOrCreateChild(pathEl, rec);
		}
		return node;
	},
	/**
	 * 
	 */
	_createLabel: function(node, record){
		if(node._depth == 0){
			node.label = record.project;
			node.parent.childrenLabel = this._wbsLabels[0].plural;
		}
		else {
			var label;
			for(var nodeIt = node; nodeIt.parent && !nodeIt.parent.isRoot; nodeIt = nodeIt.parent){
				label = label?[nodeIt.id, label].join("."):nodeIt.id;
			}
			node.label = this._wbsLabels[node._depth].singular + " " + label;
			node.parent.childrenLabel = this._wbsLabels[node._depth].plural;
		}
	},
	_wbsLabels: [
         {singular: "Projekt", plural: "Projects"}, 
         {singular: "WP", plural: "Workpackages"}, 
         {singular: "Task", plural: "Tasks"},
         {singular: "Deliverable", plural: "Deliverables"}
	],
	isRoot: true,
	_depth: -1
});
