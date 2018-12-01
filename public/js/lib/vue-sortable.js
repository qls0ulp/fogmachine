"use strict";function _toConsumableArray(t){if(Array.isArray(t)){for(var n=0,e=Array(t.length);n<t.length;n++)e[n]=t[n];return e}return Array.from(t)}var _extends=Object.assign||function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&(t[o]=e[o])}return t};!function(){function t(t,n,e){return void 0==e?t:(t=null==t?{}:t,t[n]=e,t)}function n(n){function e(t){t.parentElement.removeChild(t)}function o(t,n,e){var o=0===e?t.children[0]:t.children[e-1].nextSibling;t.insertBefore(n,o)}function i(t,n){return t.map(function(t){return t.elm}).indexOf(n)}function r(t,n,e){if(!t)return[];var o=t.map(function(t){return t.elm}),i=[].concat(_toConsumableArray(n)).map(function(t){return o.indexOf(t)});return e?i.filter(function(t){return t!==-1}):i}function s(t,n){var e=this;this.$nextTick(function(){return e.$emit(t.toLowerCase(),n)})}function a(t){var n=this;return function(e){null!==n.realList&&n["onDrag"+t](e),s.call(n,t,e)}}var l=["Start","Add","Remove","Update","End"],u=["Choose","Sort","Filter","Clone"],c=["Move"].concat(l,u).map(function(t){return"on"+t}),d=null,f={options:Object,list:{type:Array,required:!1,"default":null},value:{type:Array,required:!1,"default":null},noTransitionOnDrag:{type:Boolean,"default":!1},clone:{type:Function,"default":function(t){return t}},element:{type:String,"default":"div"},move:{type:Function,"default":null},componentData:{type:Object,required:!1,"default":null}},h={name:"draggable",props:f,data:function(){return{transitionMode:!1,noneFunctionalComponentMode:!1,init:!1}},render:function(n){var e=this.$slots["default"];if(e&&1===e.length){var o=e[0];o.componentOptions&&"transition-group"===o.componentOptions.tag&&(this.transitionMode=!0)}var i=e,r=this.$slots.footer;r&&(i=e?[].concat(_toConsumableArray(e),_toConsumableArray(r)):[].concat(_toConsumableArray(r)));var s=null,a=function(n,e){s=t(s,n,e)};if(a("attrs",this.$attrs),this.componentData){var l=this.componentData,u=l.on,c=l.props;a("on",u),a("props",c)}return n(this.element,s,i)},mounted:function(){var t=this;if(this.noneFunctionalComponentMode=this.element.toLowerCase()!==this.$el.nodeName.toLowerCase(),this.noneFunctionalComponentMode&&this.transitionMode)throw new Error("Transition-group inside component is not supported. Please alter element value or remove transition-group. Current element value: "+this.element);var e={};l.forEach(function(n){e["on"+n]=a.call(t,n)}),u.forEach(function(n){e["on"+n]=s.bind(t,n)});var o=_extends({},this.options,e,{onMove:function(n,e){return t.onDragMove(n,e)}});!("draggable"in o)&&(o.draggable=">*"),this._sortable=new n(this.rootContainer,o),this.computeIndexes()},beforeDestroy:function(){this._sortable.destroy()},computed:{rootContainer:function(){return this.transitionMode?this.$el.children[0]:this.$el},isCloning:function(){return!!this.options&&!!this.options.group&&"clone"===this.options.group.pull},realList:function(){return this.list?this.list:this.value}},watch:{options:{handler:function(t){for(var n in t)c.indexOf(n)==-1&&this._sortable.option(n,t[n])},deep:!0},realList:function(){this.computeIndexes()}},methods:{getChildrenNodes:function(){if(this.init||(this.noneFunctionalComponentMode=this.noneFunctionalComponentMode&&1==this.$children.length,this.init=!0),this.noneFunctionalComponentMode)return this.$children[0].$slots["default"];var t=this.$slots["default"];return this.transitionMode?t[0].child.$slots["default"]:t},computeIndexes:function(){var t=this;this.$nextTick(function(){t.visibleIndexes=r(t.getChildrenNodes(),t.rootContainer.children,t.transitionMode)})},getUnderlyingVm:function(t){var n=i(this.getChildrenNodes()||[],t);if(n===-1)return null;var e=this.realList[n];return{index:n,element:e}},getUnderlyingPotencialDraggableComponent:function(t){var n=t.__vue__;return n&&n.$options&&"transition-group"===n.$options._componentTag?n.$parent:n},emitChanges:function(t){var n=this;this.$nextTick(function(){n.$emit("change",t)})},alterList:function(t){if(this.list)t(this.list);else{var n=[].concat(_toConsumableArray(this.value));t(n),this.$emit("input",n)}},spliceList:function m(){var t=arguments,m=function(n){return n.splice.apply(n,t)};this.alterList(m)},updatePosition:function p(t,n){var p=function(e){return e.splice(n,0,e.splice(t,1)[0])};this.alterList(p)},getRelatedContextFromMoveEvent:function(t){var n=t.to,e=t.related,o=this.getUnderlyingPotencialDraggableComponent(n);if(!o)return{component:o};var i=o.realList,r={list:i,component:o};if(n!==e&&i&&o.getUnderlyingVm){var s=o.getUnderlyingVm(e);if(s)return _extends(s,r)}return r},getVmIndex:function(t){var n=this.visibleIndexes,e=n.length;return t>e-1?e:n[t]},getComponent:function(){return this.$slots["default"][0].componentInstance},resetTransitionData:function(t){if(this.noTransitionOnDrag&&this.transitionMode){var n=this.getChildrenNodes();n[t].data=null;var e=this.getComponent();e.children=[],e.kept=void 0}},onDragStart:function(t){this.context=this.getUnderlyingVm(t.item),t.item._underlying_vm_=this.clone(this.context.element),d=t.item},onDragAdd:function(t){var n=t.item._underlying_vm_;if(void 0!==n){e(t.item);var o=this.getVmIndex(t.newIndex);this.spliceList(o,0,n),this.computeIndexes();var i={element:n,newIndex:o};this.emitChanges({added:i})}},onDragRemove:function(t){if(o(this.rootContainer,t.item,t.oldIndex),this.isCloning)return void e(t.clone);var n=this.context.index;this.spliceList(n,1);var i={element:this.context.element,oldIndex:n};this.resetTransitionData(n),this.emitChanges({removed:i})},onDragUpdate:function(t){e(t.item),o(t.from,t.item,t.oldIndex);var n=this.context.index,i=this.getVmIndex(t.newIndex);this.updatePosition(n,i);var r={element:this.context.element,oldIndex:n,newIndex:i};this.emitChanges({moved:r})},computeFutureIndex:function(t,n){if(!t.element)return 0;var e=[].concat(_toConsumableArray(n.to.children)).filter(function(t){return"none"!==t.style.display}),o=e.indexOf(n.related),i=t.component.getVmIndex(o),r=e.indexOf(d)!=-1;return r||!n.willInsertAfter?i:i+1},onDragMove:function(t,n){var e=this.move;if(!e||!this.realList)return!0;var o=this.getRelatedContextFromMoveEvent(t),i=this.context,r=this.computeFutureIndex(o,t);return _extends(i,{futureIndex:r}),_extends(t,{relatedContext:o,draggedContext:i}),e(t,n)},onDragEnd:function(t){this.computeIndexes(),d=null}}};return h}if(Array.from||(Array.from=function(t){return[].slice.call(t)}),(typeof exports == "object")){var e=require("sortablejs");module.exports=n(e)}else if("function"==typeof define&&define.amd)define(["sortablejs"],function(t){return n(t)});else if(window&&window.Vue&&window.Sortable){var o=n(window.Sortable);Vue.component("draggable",o)}}();