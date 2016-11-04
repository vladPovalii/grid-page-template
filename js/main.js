require.config({
	paths: {
		"jquery": "libs/jquery/jquery",
		"underscore": "libs/underscore/underscore",
		"backbone": "libs/backbone/backbone",
		"classie": "libs/classie/classie",
		"Modernizr": "libs/modernizr/modernizr"
	},
	shim: {
		"underscore": {
			exports: "_"
		},
		"backbone": {
			deps: ["underscore", "jquery"],
			exports: "Backbone"
		},
		'Modernizr': {
            exports: 'Modernizr'
        }
	}
});

require(['views/app'], function(AppView){
  var app_view = new AppView();
});