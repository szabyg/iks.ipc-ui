
function load_scripts(scripts) {
	for (var i=0; i < scripts.length; i++) {
		document.write('<script src="'+scripts[i]+'"><\/script>');
	};
};

function load_css(css_files) {
	for (var i=0; i < css_files.length; i++) {
		document.write('<link rel="stylesheet" href="'+css_files[i]+'" type="text/css" \/>');
	};
};
