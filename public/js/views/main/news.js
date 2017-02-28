
define(["jquery", "underscore", "backbone", "classie", "Modernizr", "collections/news", "views/gridItem", "views/contentItem"],
function($, _, Backbone, classie, Modernizr, newsCollection, ItemView, ContentView){
	var NewsGridView = Backbone.View.extend({

		el: "#theGrid",
		bodyEl: document.body,
		docElem: window.document.documentElement,
		support: {transitions: Modernizr.csstransitions},
		sidebarEl : document.getElementById("theSidebar"),
		current : -1,
		lockScroll : false,
		xscroll : false,
		yscroll : false,
		//isAnimating : false, -> moved to article View
		menuCtrl : document.getElementById("menu-toggle"),
		// transition end event name
		transEndEventNames: { 
			"WebkitTransition" : "webkitTransitionEnd",
			"MozTransition": "transitionend",
			"OTransition": "oTransitionEnd",
			"msTransition": "MSTransitionEnd",
			"transition": "transitionend"
		},

		onEndTransition: function(el, callback) {
			var onEndCallbackFn = function(ev) {
				if (this.support.transitions) {
					//if (ev.target != this) return;
					ev.target.removeEventListener(this.transEndEventName, onEndCallbackFn);
				}
				if (callback && typeof callback === "function") {callback.call(this);}
			}.bind(this);
			if (this.support.transitions) {
				el.addEventListener(this.transEndEventName, onEndCallbackFn);
			}
			else {
				onEndCallbackFn();
			}
		},

		/*
		var GridCollection = Backbone.Collection.extend({model: GridItemModel});
		*/

		// gets the viewport width and height
		// based on http://responsejs.com/labs/dimensions/
		getViewport: function(axis) {
			var client, inner;
			if( axis === "x" ) {
				client = this.docElem["clientWidth"];
				inner = window["innerWidth"];
			}
			else if(axis === "y") {
				client = this.docElem["clientHeight"];
				inner = window["innerHeight"];
			}
			
			return client < inner ? inner : client;
		},

		scrollX: function() { 
			return window.pageXOffset || this.docElem.scrollLeft; 
		},
		scrollY: function() {
			return window.pageYOffset || this.docElem.scrollTop;
		},

		initialize: function() {
			_.bindAll(this, "loadContent", "hideContent", "noscroll", "getViewport", "onEndTransition", "initEvents");
			// initialize of selectors
			this.gridItemsContainer = this.el.querySelector("section.grid");
			this.contentItemsContainer = this.el.querySelector("section.content");
			this.closeCtrl = this.contentItemsContainer.querySelector(".close-button");
			this.transEndEventName = this.transEndEventNames[Modernizr.prefixed("transition")];

			this.initEvents();

			// after refactoring
			this.listenTo(newsCollection, "add", this.addOne);

			newsCollection.fetch();	

		},
		// Add a single article item to the grid by creating a view for it, and
		// appending its element to the grid
		addOne: function(article) {
			var itemView = new ItemView({model: article}),
				contentView = new ContentView({model: article}),
				pos = article.get("index"),
				parentView = this;

			// rendering grid items
			this.gridItems = this.gridItemsContainer.querySelectorAll(".grid__item");
			if (this.gridItems.length) { 
				$(this.gridItems).last().after(itemView.render().el);
			} else {
				$(".top-bar").after(itemView.render().el);
			}

			// rendering content items 
			this.contentItems = this.contentItemsContainer.querySelectorAll(".content__item");
			if (this.contentItems.length) { 
				$(this.contentItems).last().after(contentView.render().el);
			} else {
				$(".scroll-wrap").append(contentView.render().el);
			}

			itemView.el.addEventListener("click", function(ev) {
				ev.preventDefault();
				if(parentView.isAnimating || pos === parentView.current) {
					return false;
				}
				parentView.isAnimating = true;
				// index of current item
				parentView.current = pos;
				// simulate loading time..
				classie.add(itemView.el, "grid__item--loading");
				setTimeout(function() {
					classie.add(itemView.el, "grid__item--animate");
					// reveal/load content after the last element animates out (todo: wait for the last transition to finish)
					setTimeout(function() { parentView.loadContent(itemView.el); }, 500);
				}, 1000);
			});

			
		},

		initEvents: function() {
			this.closeCtrl.addEventListener("click", function() {
				// hide content
				this.hideContent();
			}.bind(this));

			// keyboard esc - hide content
			document.addEventListener("keydown", function(ev) {
				if(!this.isAnimating && this.current !== -1) {
					var keyCode = ev.keyCode || ev.which;
					if(keyCode === 27) {
						ev.preventDefault();
						if ("activeElement" in document)
	    					document.activeElement.blur();
						this.hideContent();
					}
				}
			}.bind(this));

			// hamburger menu button (mobile) and close cross
			this.menuCtrl.addEventListener("click", function() {
				if( !classie.has(this.sidebarEl, "sidebar--open") ) {
					classie.add(this.sidebarEl, "sidebar--open");	
				}
			}.bind(this));
		},

		loadContent: function(item) {
			// add expanding element/placeholder 
			//var view = this;
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
				dummy.style.WebkitTransform = "translate3d(-5px, " + (this.scrollY() - 5) + "px, 0px)";
				dummy.style.transform = "translate3d(-5px, " + (this.scrollY() - 5) + "px, 0px)";
				// disallow scroll
				window.addEventListener("scroll", this.noscroll(this));
			}.bind(this), 25);

			this.onEndTransition(dummy, function() {
				// add transition class 
				classie.remove(dummy, "placeholder--trans-in");
				classie.add(dummy, "placeholder--trans-out");
				// position the content container
				this.contentItemsContainer.style.top = this.scrollY() + "px";
				// show the main content container
				classie.add(this.contentItemsContainer, "content--show");
				// show content item:
				classie.add(this.contentItems[this.current], "content__item--show");
				// show close control
				classie.add(this.closeCtrl, "close-button--show");
				// sets overflow hidden to the body and allows the switch to the content scroll
				classie.addClass(this.bodyEl, "noscroll");

				this.isAnimating = false;
			}.bind(this));
		},

		hideContent: function() {
			//var view = this;
			var gridItem = this.gridItems[this.current], 
				contentItem = this.contentItems[this.current];

			classie.remove(contentItem, "content__item--show");
			classie.remove(this.contentItemsContainer, "content--show");
			classie.remove(this.closeCtrl, "close-button--show");
			classie.remove(this.bodyEl, "view-single");

			setTimeout(function() {
				var dummy = this.gridItemsContainer.querySelector(".placeholder");

				classie.removeClass(this.bodyEl, "noscroll");

				dummy.style.WebkitTransform = "translate3d(" + gridItem.offsetLeft + "px, " + gridItem.offsetTop + "px, 0px) scale3d(" + gridItem.offsetWidth/this.gridItemsContainer.offsetWidth + "," + gridItem.offsetHeight/this.getViewport("y") + ",1)";
				dummy.style.transform = "translate3d(" + gridItem.offsetLeft + "px, " + gridItem.offsetTop + "px, 0px) scale3d(" + gridItem.offsetWidth/this.gridItemsContainer.offsetWidth + "," + gridItem.offsetHeight/this.getViewport("y") + ",1)";

				this.onEndTransition(dummy, function() {
					// reset content scroll..
					contentItem.parentNode.scrollTop = 0;
					this.gridItemsContainer.removeChild(dummy);
					classie.remove(gridItem, "grid__item--loading");
					classie.remove(gridItem, "grid__item--animate");
					this.lockScroll = false;
					window.removeEventListener("scroll", this.noscroll());
				}.bind(this));
				
				// reset current
				this.current = -1;
			}.bind(this), 25);
		},

		noscroll: function() {
			if(!this.lockScroll) {
				this.lockScroll = true;
				this.xscroll = this.scrollX();
				this.yscroll = this.scrollY();
			}
			window.scrollTo(this.xscroll, this.yscroll);
		}

	});

	return NewsGridView;
});