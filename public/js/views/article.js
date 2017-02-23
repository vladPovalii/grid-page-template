var ArticleView = Backbone.View.extend({
	tagName: "div",

	className: "grid__item",

	tpl: _.template($("#grid-item-template").html()),

	events: "",

	initialize: function(){

	},

	render: function(){
		this.$el.html(this.tpl({
			title: "test title",
			category: "test category",
			createdOnFormated: "4 november"
		}));
		return this.el;
	}
});