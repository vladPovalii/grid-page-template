var ArticleView = Backbone.View.extend({
	tagName: "a",

	isAnimating: false,
	
	className: "grid__item",

	tpl: _.template($("#grid-item-template").html()),

	events: {
		"click": "expandContent"
	},

	initialize: function() {

	},

	expandContent: function(ev) {
		ev.preventDefault();
		var currentId = this.model.get("Id"),
			el = this.el;
		if(this.isAnimating || this.parentView.current === currentId) {
			return false;
		}
		this.isAnimating = true;
		// index of current item
		this.parentView.current = currentId;
		// simulate loading time..
		classie.add(el, "grid__item--loading");
		setTimeout(function() {
			classie.add(el, "grid__item--animate");
			// reveal/load content after the last element animates out (todo: wait for the last transition to finish)
			setTimeout(function() {
				this.loadContent(el);
			}, 500);
		}.bind(this), 1000);
	},

	render: function() {
		this.$el.html(this.tpl({
			title: "test title",
			category: "test category",
			createdOnFormated: "4 november"
		}));
		return this.el;
	}
});