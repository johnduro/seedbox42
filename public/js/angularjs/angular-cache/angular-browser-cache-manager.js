"use strict";angular.module("BrowserCache",["angular-data.DSCacheFactory"]).provider("$browserCache",function(){var a="rev",b=[],c={hashParameter:a,customCacheMap:b};return{setHashParameter:function(b){a=b},addCustomCacheRule:function(a,c){if(!a instanceof RegExp||!c instanceof RegExp)throw new SyntaxError("addCustomCacheRule arguments must be an instance of RexExp");b.push({requestPattern:a,destinationPattern:c})},cleanCustomCacheRules:function(){b=[]},$get:function(){return c}}}).service("browserCacheManager",["DSCacheFactory","$browserCache",function(a,b){var c=-1,d="BrowserCache",e=b.customCacheMap,f=function(a){var b=a,c=a,d=c.indexOf("?");return-1===d&&(d=c.indexOf("#")),-1!==d&&(b=c.substring(0,d)),b};this.__cacheFactory=this.__cacheFactory||new a(d,{storageMode:"localStorage"}),this.get=function(a){a=f(a);var b=this.__cacheFactory.get(a)||this.__cacheFactory.put(a,c);return b},this.invalidateResourceCache=function(a){a=f(a);var b=this.__cacheFactory.get(a);b&&this.__cacheFactory.put(a,Number(b)-1);for(var c=0,d=e.length;d>c;c++)if(e[c].requestPattern.test(a))for(var g=this.__cacheFactory.keys(),h=0,i=g.length;i>h;h++)e[c].destinationPattern.test(g[h])&&(b=this.__cacheFactory.get(g[h]),b&&this.__cacheFactory.put(g[h],Number(b)-1))}}]).factory("browserCacheInterceptor",["$q","browserCacheManager","$browserCache",function(a,b,c){var d=c.hashParameter;return{request:function(c){if(-1===c.url.indexOf(".html"))if("GET"===c.method){var e=d+"="+b.get(c.url);c.url+=(c.url.split("?")[1]?"&":"?")+e}else("POST"===c.method||"PUT"===c.method||"PATCH"===c.method||"DELETE"===c.method)&&b.invalidateResourceCache(c.url);return c||a.when(c)}}}]);