function alohaconfig(){
    // GENTICS.Aloha.Repositories.delicious.settings.username = "iks";
    GENTICS.Aloha.settings = {
	        logLevels: {'error': true, 'warn': true, 'info': true, 'debug': false},
	        errorhandling : false,
	        ribbon: false,    
	        "i18n": {
	            // you can either let the system detect the users language (set acceptLanguage on server)
	            // In PHP this would would be '<?=$_SERVER['HTTP_ACCEPT_LANGUAGE']?>' resulting in 
	            // "acceptLanguage": 'de-de,de;q=0.8,it;q=0.6,en-us;q=0.7,en;q=0.2'
	            // or set current on server side to be in sync with your backend system 
	            "current": "en" 
	        },
	        "repositories": {
	             "com.gentics.aloha.repositories.LinkList": {
	                 data: [
	                     { name: 'Aloha Developers Wiki', url:'http://www.aloha-editor.com/wiki', type:'website', weight: 0.50 },
	                     { name: 'Aloha Editor - The HTML5 Editor', url:'http://aloha-editor.com', type:'website', weight: 0.90  },
	                     { name: 'Aloha Demo', url:'http://www.aloha-editor.com/demos.html', type:'website', weight: 0.75  },
	                     { name: 'Aloha Wordpress Demo', url:'http://www.aloha-editor.com/demos/wordpress-demo/index.html', type:'website', weight: 0.75  },
	                     { name: 'Aloha Logo', url:'http://www.aloha-editor.com/images/aloha-editor-logo.png', type:'image', weight: 0.10  }
	                 ]
	            }
	        },
	        "plugins": {
	             "com.gentics.aloha.plugins.Format": {
	                 // all elements with no specific configuration get this configuration
	                config : [ 'b', 'i','sub','sup'],
	                  editables : {
	                    // no formatting allowed for title
	                    '#title'    : [ ], 
	                    // formatting for all editable DIVs
	                    'div'        : [ 'b', 'i', 'del', 'sub', 'sup'  ], 
	                    // content is a DIV and has class .article so it gets both buttons
	                    '.article'    : [ 'b', 'i', 'p', 'title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'removeFormat']
	                  }
	            },
	          }
	    };
}	

