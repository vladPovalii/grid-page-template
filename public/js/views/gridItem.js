define(["jquery", "underscore", "backbone", "classie", "Modernizr"],
function($, _, Backbone, classie, Modernizr){
	var GridItemView = Backbone.View.extend({
		tagName: "a",
		
		className: "grid__item",

		tpl: _.template($("#grid-item-template").html()),

		initialize: function() {
			this.model.itemView = this;
		},

		/*
		expandItem: function(ev) {
			ev.preventDefault();
			var current = this.model.get("index"),
				el = this.el;
			if(this.isAnimating || this.parentView.current === current) {
				return false;
			}
			this.isAnimating = true;
			// index of current item
			this.parentView.current = current;
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

		loadContent: function(item) {
			// add expanding element/placeholder 
			var view = this;
			var dummy = document.createElement("div");
			dummy.className = "placeholder";

			// set the width/heigth and position
			dummy.style.WebkitTransform = "translate3d(" + (item.offsetLeft - 5) + "px, " + (item.offsetTop - 5) + "px, 0px) scale3d(" + item.offsetWidth/this.gridItemsContainer.offsetWidth + "," + item.offsetHeight/this.getViewport("y") + ",1)";
			dummy.style.transform = "translate3d(" + (item.offsetLeft - 5) + "px, " + (item.offsetTop - 5) + "px, 0px) scale3d(" + item.offsetWidth/this.gridItemsContainer.offsetWidth + "," + item.offsetHeight/this.getViewport("y") + ",1)";

			// add transition class 
			classie.add(dummy, "placeholder--trans-in");

			// insert it after all the grid items
			this.gridItemsContainer.appendChild(dummy);
			
			// body overlay
			classie.add(this.bodyEl, "view-single");

			setTimeout(function() {
				// expands the placeholder
				dummy.style.WebkitTransform = "translate3d(-5px, " + (view.scrollY() - 5) + "px, 0px)";
				dummy.style.transform = "translate3d(-5px, " + (view.scrollY() - 5) + "px, 0px)";
				// disallow scroll
				window.addEventListener("scroll", view.noscroll(view));
			}, 25);

			this.onEndTransition(dummy, function() {
				// add transition class 
				classie.remove(dummy, "placeholder--trans-in");
				classie.add(dummy, "placeholder--trans-out");
				// position the content container
				view.contentItemsContainer.style.top = view.scrollY() + "px";
				// show the main content container
				classie.add(view.contentItemsContainer, "content--show");
				// show content item:
				classie.add(view.contentItems[view.current], "content__item--show");
				// show close control
				classie.add(view.closeCtrl, "close-button--show");
				// sets overflow hidden to the body and allows the switch to the content scroll
				classie.addClass(view.bodyEl, "noscroll");

				view.isAnimating = false;
			});
		},
		*/
		render: function() {
			$(this.el).html(this.tpl(this.model.toJSON()));
			return this;
		}

	});

	return GridItemView;
});