
define(["jquery", "underscore", "backbone", "classie", "Modernizr"], function($, _, Backbone, classie, Modernizr){
	var AppView = Backbone.View.extend({

		bodyEl: document.body,
		docElem: window.document.documentElement,
		support: {transitions: Modernizr.csstransitions},
		gridEl : document.getElementById("theGrid"),
		sidebarEl : document.getElementById("theSidebar"),
		current : -1,
		lockScroll : false,
		xscroll : false,
		yscroll : false,
		isAnimating : false,
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
			var view = this;
			var onEndCallbackFn = function(ev) {
				if (view.support.transitions) {
					if (ev.target != this) return;
					this.removeEventListener(view.transEndEventName, onEndCallbackFn);
				}
				if (callback && typeof callback === "function") { callback.call(view); }
			};
			if (this.support.transitions) {
				el.addEventListener(this.transEndEventName, onEndCallbackFn);
			}
			else {
				onEndCallbackFn();
			}
		},

		/*
		var GridItemModel = Backbone.Model.extend({});

		var GridCollection = Backbone.Collection.extend({model: GridItemModel});

		var GridView = Backbone.View.extend({
			el: ".grid",

			events: "",

			initialize: function(){
			},

			render: function(){

			},

			addNew: function(){
			}
		});


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
			// bind all methods

			// initialize of selectors
			this.gridItemsContainer = this.gridEl.querySelector("section.grid");
			this.contentItemsContainer = this.gridEl.querySelector("section.content");
			this.gridItems = this.gridItemsContainer.querySelectorAll(".grid__item");
			this.contentItems = this.contentItemsContainer.querySelectorAll(".content__item");
			this.closeCtrl = this.contentItemsContainer.querySelector(".close-button");
			this.transEndEventName = this.transEndEventNames[Modernizr.prefixed("transition")];

			this.initEvents();
			//var gridView = new GridView();
			//var gridItemView = new GridItemView();
		},

		initEvents: function() {
			var view = this;
			[].slice.call(this.gridItems).forEach(function(item, pos) {
				// grid item click event
				item.addEventListener("click", function(ev) {
					ev.preventDefault();
					if(view.isAnimating || view.current === pos) {
						return false;
					}
					view.isAnimating = true;
					// index of current item
					view.current = pos;
					// simulate loading time..
					classie.add(item, "grid__item--loading");
					setTimeout(function() {
						classie.add(item, "grid__item--animate");
						// reveal/load content after the last element animates out (todo: wait for the last transition to finish)
						setTimeout(function() { view.loadContent(item); }, 500);
					}, 1000);
				});
			});

			this.closeCtrl.addEventListener("click", function() {
				// hide content
				this.hideContent();
			});

			// keyboard esc - hide content
			document.addEventListener("keydown", function(ev) {
				if(!view.isAnimating && view.current !== -1) {
					var keyCode = ev.keyCode || ev.which;
					if(keyCode === 27) {
						ev.preventDefault();
						if ("activeElement" in document)
	    					document.activeElement.blur();
						view.hideContent();
					}
				}
			} );

			// hamburger menu button (mobile) and close cross
			this.menuCtrl.addEventListener("click", function() {
				if( !classie.has(view.sidebarEl, "sidebar--open") ) {
					classie.add(view.sidebarEl, "sidebar--open");	
				}
			});

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

		hideContent: function() {
			var view = this;
			var gridItem = this.gridItems[this.current], 
				contentItem = this.contentItems[this.current];

			classie.remove(this.contentItem, "content__item--show");
			classie.remove(this.contentItemsContainer, "content--show");
			classie.remove(this.closeCtrl, "close-button--show");
			classie.remove(this.bodyEl, "view-single");

			setTimeout(function() {
				var dummy = view.gridItemsContainer.querySelector(".placeholder");

				classie.removeClass(view.bodyEl, "noscroll");

				dummy.style.WebkitTransform = "translate3d(" + gridItem.offsetLeft + "px, " + gridItem.offsetTop + "px, 0px) scale3d(" + gridItem.offsetWidth/view.gridItemsContainer.offsetWidth + "," + gridItem.offsetHeight/view.getViewport("y") + ",1)";
				dummy.style.transform = "translate3d(" + gridItem.offsetLeft + "px, " + gridItem.offsetTop + "px, 0px) scale3d(" + gridItem.offsetWidth/view.gridItemsContainer.offsetWidth + "," + gridItem.offsetHeight/view.getViewport("y") + ",1)";

				view.onEndTransition(dummy, function() {
					// reset content scroll..
					contentItem.parentNode.scrollTop = 0;
					view.gridItemsContainer.removeChild(dummy);
					classie.remove(gridItem, "grid__item--loading");
					classie.remove(gridItem, "grid__item--animate");
					view.lockScroll = false;
					window.removeEventListener("scroll", view.noscroll(view));
				});
				
				// reset current
				view.current = -1;
			}, 25);
		},

		noscroll: function(view) {
			if(!view.lockScroll) {
				view.lockScroll = true;
				view.xscroll = view.scrollX();
				view.yscroll = view.scrollY();
			}
			window.scrollTo(view.xscroll, view.yscroll);
		}

	});

	return AppView;
});