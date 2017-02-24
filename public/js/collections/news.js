define([
  'jquery',
  'underscore',
  'backbone',
  'models/article'
], function($, _, Backbone, Article){
  var NewsCollection = Backbone.Collection.extend({
    url: function () {
      return '/api/news'
    },
    model: Article
  });

  return new NewsCollection();
});