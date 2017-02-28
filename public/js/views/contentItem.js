define(["jquery", "underscore", "backbone", "classie", "Modernizr"],
function($, _, Backbone, classie, Modernizr){
	var ContentItemView = Backbone.View.extend({
		tagName: "article",
		
		className: "content__item",

		tpl: _.template($("#expanded-item-template").html()),

		initialize: function() {
			this.model.contentView = this;
		},

		render: function() {
			$(this.el).html(this.tpl(this.model.toJSON()));
			return this;
		}

	});

	return ContentItemView;
});