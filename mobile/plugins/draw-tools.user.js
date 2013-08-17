// ==UserScript==
// @id             iitc-plugin-draw-tools@breunigs
// @name           IITC plugin: draw tools
// @category       Layer
// @version        0.5.0.20130817.153349
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      none
// @downloadURL    none
// @description    [mobile-2013-08-17-153349] Allows you to draw things into the current map so you may plan your next move
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==


function wrapper() {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};



// PLUGIN START ////////////////////////////////////////////////////////


// use own namespace for plugin
window.plugin.drawTools = function() {};

window.plugin.drawTools.loadExternals = function() {
  try { console.log('Loading leaflet.draw JS now'); } catch(e) {}
  /*
	Leaflet.draw, a plugin that adds drawing and editing tools to Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.draw
	http://leafletjs.com
	https://github.com/jacobtoye
	
	Attention - this version is manually modified to support integration with Leaflet.Geodesic (by qnstie).
	This should be backported into the original library!
*/
(function(t,e){L.drawVersion="0.2.0-dev",L.Draw={},L.Draw.Feature=L.Handler.extend({includes:L.Mixin.Events,initialize:function(t,e){this._map=t,this._container=t._container,this._overlayPane=t._panes.overlayPane,this._popupPane=t._panes.popupPane,e&&e.shapeOptions&&(e.shapeOptions=L.Util.extend({},this.options.shapeOptions,e.shapeOptions)),L.Util.extend(this.options,e)},enable:function(){this._enabled||(L.Handler.prototype.enable.call(this),this.fire("enabled",{handler:this.type}),this._map.fire("draw:drawstart",{layerType:this.type}))},disable:function(){this._enabled&&(L.Handler.prototype.disable.call(this),this.fire("disabled",{handler:this.type}),this._map.fire("draw:drawstop",{layerType:this.type}))},addHooks:function(){this._map&&(L.DomUtil.disableTextSelection(),this._tooltip=new L.Tooltip(this._map),L.DomEvent.addListener(this._container,"keyup",this._cancelDrawing,this))},removeHooks:function(){this._map&&(L.DomUtil.enableTextSelection(),this._tooltip.dispose(),this._tooltip=null,L.DomEvent.removeListener(this._container,"keyup",this._cancelDrawing))},setOptions:function(t){L.setOptions(this,t)},_fireCreatedEvent:function(t){this._map.fire("draw:created",{layer:t,layerType:this.type})},_cancelDrawing:function(t){27===t.keyCode&&this.disable()}}),L.Draw.Polyline=L.Draw.Feature.extend({statics:{TYPE:"polyline"},Poly:L.GeodesicPolyline,options:{allowIntersection:!0,drawError:{color:"#b00b00",message:"<strong>Error:</strong> shape edges cannot cross!",timeout:2500},icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"}),guidelineDistance:20,shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!1,clickable:!0},zIndexOffset:2e3},initialize:function(t,e){e&&e.drawError&&(e.drawError=L.Util.extend({},this.options.drawError,e.drawError)),this.type=L.Draw.Polyline.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._markers=[],this._markerGroup=new L.LayerGroup,this._map.addLayer(this._markerGroup),this._poly=new L.Polyline([],this.options.shapeOptions),this._tooltip.updateContent(this._getTooltipText()),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this).on("zoomend",this._onZoomEnd,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._clearHideErrorTimeout(),this._cleanUpShape(),this._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers,this._map.removeLayer(this._poly),delete this._poly,this._mouseMarker.off("click",this._onClick,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._clearGuides(),this._map.off("mousemove",this._onMouseMove,this).off("zoomend",this._onZoomEnd,this)},_finishShape:function(){var t=this._poly.newLatLngIntersects(this._poly.getLatLngs()[0],!0);return!this.options.allowIntersection&&t||!this._shapeIsValid()?(this._showErrorTooltip(),undefined):(this._fireCreatedEvent(),this.disable(),undefined)},_shapeIsValid:function(){return!0},_onZoomEnd:function(){this._updateGuide()},_onMouseMove:function(t){var e=t.layerPoint,i=t.latlng;this._currentLatLng=i,this._tooltip.updatePosition(i),this._updateGuide(e),this._mouseMarker.setLatLng(i),L.DomEvent.preventDefault(t.originalEvent)},_onClick:function(t){var e=t.target.getLatLng(),i=this._markers.length;return i>0&&!this.options.allowIntersection&&this._poly.newLatLngIntersects(e)?(this._showErrorTooltip(),undefined):(this._errorShown&&this._hideErrorTooltip(),this._markers.push(this._createMarker(e)),this._poly.addLatLng(e),2===this._poly.getLatLngs().length&&this._map.addLayer(this._poly),this._updateFinishHandler(),this._vertexAdded(e),this._clearGuides(),undefined)},_updateFinishHandler:function(){var t=this._markers.length;t>1&&this._markers[t-1].on("click",this._finishShape,this),t>2&&this._markers[t-2].off("click",this._finishShape,this)},_createMarker:function(t){var e=new L.Marker(t,{icon:this.options.icon,zIndexOffset:2*this.options.zIndexOffset});return this._markerGroup.addLayer(e),e},_updateGuide:function(t){t=t||this._map.latLngToLayerPoint(this._currentLatLng);var e=this._markers.length;e>0&&(this._errorShown||this._tooltip.updateContent(this._getTooltipText()),this._clearGuides(),this._drawGuide(this._map.latLngToLayerPoint(this._markers[e-1].getLatLng()),t))},_drawGuide:function(t,e){var i,o,s,a,n=Math.floor(Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2)));for(this._guidesContainer||(this._guidesContainer=L.DomUtil.create("div","leaflet-draw-guides",this._overlayPane)),i=this.options.guidelineDistance;n>i;i+=this.options.guidelineDistance)o=i/n,s={x:Math.floor(t.x*(1-o)+o*e.x),y:Math.floor(t.y*(1-o)+o*e.y)},a=L.DomUtil.create("div","leaflet-draw-guide-dash",this._guidesContainer),a.style.backgroundColor=this._errorShown?this.options.drawError.color:this.options.shapeOptions.color,L.DomUtil.setPosition(a,s)},_updateGuideColor:function(t){if(this._guidesContainer)for(var e=0,i=this._guidesContainer.childNodes.length;i>e;e++)this._guidesContainer.childNodes[e].style.backgroundColor=t},_clearGuides:function(){if(this._guidesContainer)for(;this._guidesContainer.firstChild;)this._guidesContainer.removeChild(this._guidesContainer.firstChild)},_getTooltipText:function(){var t,e,i;return 0===this._markers.length?t={text:"Click to start drawing line."}:(e=this._measurementRunningTotal+this._currentLatLng.distanceTo(this._markers[this._markers.length-1].getLatLng()),i=e>1e3?(e/1e3).toFixed(2)+" km":Math.ceil(e)+" m",t=1===this._markers.length?{text:"Click to continue drawing line.",subtext:i}:{text:"Click last point to finish line.",subtext:i}),t},_showErrorTooltip:function(){this._errorShown=!0,this._tooltip.showAsError().updateContent({text:this.options.drawError.message}),this._updateGuideColor(this.options.drawError.color),this._poly.setStyle({color:this.options.drawError.color}),this._clearHideErrorTimeout(),this._hideErrorTimeout=setTimeout(L.Util.bind(this._hideErrorTooltip,this),this.options.drawError.timeout)},_hideErrorTooltip:function(){this._errorShown=!1,this._clearHideErrorTimeout(),this._tooltip.removeError().updateContent(this._getTooltipText()),this._updateGuideColor(this.options.shapeOptions.color),this._poly.setStyle({color:this.options.shapeOptions.color})},_clearHideErrorTimeout:function(){this._hideErrorTimeout&&(clearTimeout(this._hideErrorTimeout),this._hideErrorTimeout=null)},_vertexAdded:function(t){1===this._markers.length?this._measurementRunningTotal=0:this._measurementRunningTotal+=t.distanceTo(this._markers[this._markers.length-2].getLatLng())},_cleanUpShape:function(){this._markers.length>0&&this._markers[this._markers.length-1].off("click",this._finishShape,this)},_fireCreatedEvent:function(){var t=new this.Poly(this._poly.getLatLngs(),this.options.shapeOptions);L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Polygon=L.Draw.Polyline.extend({statics:{TYPE:"polygon"},Poly:L.GeodesicPolygon,options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){L.Draw.Polyline.prototype.initialize.call(this,t,e),this.type=L.Draw.Polygon.TYPE},_updateFinishHandler:function(){var t=this._markers.length;1===t&&this._markers[0].on("click",this._finishShape,this),t>2&&(this._markers[t-1].on("dblclick",this._finishShape,this),t>3&&this._markers[t-2].off("dblclick",this._finishShape,this))},_getTooltipText:function(){var t;return t=0===this._markers.length?"Click to start drawing shape.":3>this._markers.length?"Click to continue drawing shape.":"Double click to close this shape.",{text:t}},_shapeIsValid:function(){return this._markers.length>=3},_vertexAdded:function(){},_cleanUpShape:function(){var t=this._markers.length;t>0&&(this._markers[0].off("click",this._finishShape,this),t>2&&this._markers[t-1].off("dblclick",this._finishShape,this))}}),L.SimpleShape={},L.Draw.SimpleShape=L.Draw.Feature.extend({addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._map.dragging.disable(),this._container.style.cursor="crosshair",this._tooltip.updateContent({text:this._initialLabelText}),this._map.on("mousedown",this._onMouseDown,this).on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._map.dragging.enable(),this._container.style.cursor="",this._map.off("mousedown",this._onMouseDown,this).off("mousemove",this._onMouseMove,this),L.DomEvent.off(e,"mouseup",this._onMouseUp),this._shape&&(this._map.removeLayer(this._shape),delete this._shape)),this._isDrawing=!1},_onMouseDown:function(t){this._isDrawing=!0,this._startLatLng=t.latlng,L.DomEvent.on(e,"mouseup",this._onMouseUp,this).preventDefault(t.originalEvent)},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._isDrawing&&(this._tooltip.updateContent({text:"Release mouse to finish drawing."}),this._drawShape(e))},_onMouseUp:function(){this._shape&&this._fireCreatedEvent(),this.disable()}}),L.Draw.Rectangle=L.Draw.SimpleShape.extend({statics:{TYPE:"rectangle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Rectangle.TYPE,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_initialLabelText:"Click and drag to draw rectangle.",_drawShape:function(t){this._shape?this._shape.setBounds(new L.LatLngBounds(this._startLatLng,t)):(this._shape=new L.Rectangle(new L.LatLngBounds(this._startLatLng,t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Rectangle(this._shape.getBounds(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)}}),L.Draw.Circle=L.Draw.SimpleShape.extend({statics:{TYPE:"circle"},options:{shapeOptions:{stroke:!0,color:"#f06eaa",weight:4,opacity:.5,fill:!0,fillColor:null,fillOpacity:.2,clickable:!0}},initialize:function(t,e){this.type=L.Draw.Circle.TYPE,L.Draw.SimpleShape.prototype.initialize.call(this,t,e)},_initialLabelText:"Click and drag to draw circle.",_drawShape:function(t){this._shape?this._shape.setRadius(this._startLatLng.distanceTo(t)):(this._shape=new L.Circle(this._startLatLng,this._startLatLng.distanceTo(t),this.options.shapeOptions),this._map.addLayer(this._shape))},_fireCreatedEvent:function(){var t=new L.Circle(this._startLatLng,this._shape.getRadius(),this.options.shapeOptions);L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this,t)},_onMouseMove:function(t){var e,i=t.latlng;this._tooltip.updatePosition(i),this._isDrawing&&(this._drawShape(i),e=this._shape.getRadius().toFixed(1),this._tooltip.updateContent({text:"Release mouse to finish drawing.",subtext:"Radius: "+e+" m"}))}}),L.Draw.Marker=L.Draw.Feature.extend({statics:{TYPE:"marker"},options:{icon:new L.Icon.Default,zIndexOffset:2e3},initialize:function(t,e){this.type=L.Draw.Marker.TYPE,L.Draw.Feature.prototype.initialize.call(this,t,e)},addHooks:function(){L.Draw.Feature.prototype.addHooks.call(this),this._map&&(this._tooltip.updateContent({text:"Click map to place marker."}),this._mouseMarker||(this._mouseMarker=L.marker(this._map.getCenter(),{icon:L.divIcon({className:"leaflet-mouse-marker",iconAnchor:[20,20],iconSize:[40,40]}),opacity:0,zIndexOffset:this.options.zIndexOffset})),this._mouseMarker.on("click",this._onClick,this).addTo(this._map),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){L.Draw.Feature.prototype.removeHooks.call(this),this._map&&(this._marker&&(this._marker.off("click",this._onClick,this),this._map.off("click",this._onClick,this).removeLayer(this._marker),delete this._marker),this._mouseMarker.off("click",this._onClick,this),this._map.removeLayer(this._mouseMarker),delete this._mouseMarker,this._map.off("mousemove",this._onMouseMove,this))},_onMouseMove:function(t){var e=t.latlng;this._tooltip.updatePosition(e),this._mouseMarker.setLatLng(e),this._marker?this._marker.setLatLng(e):(this._marker=new L.Marker(e,{icon:this.options.icon,zIndexOffset:this.options.zIndexOffset}),this._marker.on("click",this._onClick,this),this._map.on("click",this._onClick,this).addLayer(this._marker))},_onClick:function(){this._fireCreatedEvent(),this.disable()},_fireCreatedEvent:function(){var t=new L.Marker(this._marker.getLatLng(),{icon:this.options.icon});L.Draw.Feature.prototype._fireCreatedEvent.call(this,t)}}),L.Edit=L.Edit||{},L.Edit.Poly=L.Handler.extend({options:{icon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon"})},initialize:function(t,e){this._poly=t,L.setOptions(this,e)},addHooks:function(){this._poly._map&&(this._markerGroup||this._initMarkers(),this._poly._map.addLayer(this._markerGroup))},removeHooks:function(){this._poly._map&&(this._poly._map.removeLayer(this._markerGroup),delete this._markerGroup,delete this._markers)},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._markers=[];var t,e,i,o,s=this._poly.getLatLngs();for(t=0,i=s.length;i>t;t++)o=this._createMarker(s[t],t),o.on("click",this._onMarkerClick,this),this._markers.push(o);var a,n;for(t=0,e=i-1;i>t;e=t++)(0!==t||L.Polygon&&this._poly instanceof L.Polygon)&&(a=this._markers[e],n=this._markers[t],this._createMiddleMarker(a,n),this._updatePrevNext(a,n))},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:this.options.icon});return i._origLatLng=t,i._index=e,i.on("drag",this._onMarkerDrag,this),i.on("dragend",this._fireEdit,this),this._markerGroup.addLayer(i),i},_removeMarker:function(t){var e=t._index;this._markerGroup.removeLayer(t),this._markers.splice(e,1),this._poly.spliceLatLngs(e,1),this._updateIndexes(e,-1),t.off("drag",this._onMarkerDrag,this).off("dragend",this._fireEdit,this).off("click",this._onMarkerClick,this)},_fireEdit:function(){this._poly.edited=!0,this._poly.fire("edit")},_onMarkerDrag:function(t){var e=t.target;L.extend(e._origLatLng,e._latlng),e._middleLeft&&e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev,e)),e._middleRight&&e._middleRight.setLatLng(this._getMiddleLatLng(e,e._next)),this._poly.redraw()},_onMarkerClick:function(t){if(!(3>this._poly.getLatLngs().length)){var e=t.target;this._removeMarker(e),this._updatePrevNext(e._prev,e._next),e._middleLeft&&this._markerGroup.removeLayer(e._middleLeft),e._middleRight&&this._markerGroup.removeLayer(e._middleRight),e._prev&&e._next?this._createMiddleMarker(e._prev,e._next):e._prev?e._next||(e._prev._middleRight=null):e._next._middleLeft=null,this._fireEdit()}},_updateIndexes:function(t,e){this._markerGroup.eachLayer(function(i){i._index>t&&(i._index+=e)})},_createMiddleMarker:function(t,e){var i,o,s,a=this._getMiddleLatLng(t,e),n=this._createMarker(a);n.setOpacity(.6),t._middleRight=e._middleLeft=n,o=function(){var o=e._index;n._index=o,n.off("click",i,this).on("click",this._onMarkerClick,this),a.lat=n.getLatLng().lat,a.lng=n.getLatLng().lng,this._poly.spliceLatLngs(o,0,a),this._markers.splice(o,0,n),n.setOpacity(1),this._updateIndexes(o,1),e._index++,this._updatePrevNext(t,n),this._updatePrevNext(n,e)},s=function(){n.off("dragstart",o,this),n.off("dragend",s,this),this._createMiddleMarker(t,n),this._createMiddleMarker(n,e)},i=function(){o.call(this),s.call(this),this._fireEdit()},n.on("click",i,this).on("dragstart",o,this).on("dragend",s,this),this._markerGroup.addLayer(n)},_updatePrevNext:function(t,e){t&&(t._next=e),e&&(e._prev=t)},_getMiddleLatLng:function(t,e){var i=this._poly._map,o=i.latLngToLayerPoint(t.getLatLng()),s=i.latLngToLayerPoint(e.getLatLng());return i.layerPointToLatLng(o._add(s)._divideBy(2))}}),L.Polyline.addInitHook(function(){this.editing||(L.Edit.Poly&&(this.editing=new L.Edit.Poly(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()}))}),L.Edit=L.Edit||{},L.Edit.SimpleShape=L.Handler.extend({options:{moveIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-move"}),resizeIcon:new L.DivIcon({iconSize:new L.Point(8,8),className:"leaflet-div-icon leaflet-editing-icon leaflet-edit-resize"})},initialize:function(t,e){this._shape=t,L.Util.setOptions(this,e)},addHooks:function(){this._shape._map&&(this._map=this._shape._map,this._markerGroup||this._initMarkers(),this._map.addLayer(this._markerGroup))},removeHooks:function(){if(this._shape._map){this._unbindMarker(this._moveMarker);for(var t=0,e=this._resizeMarkers.length;e>t;t++)this._unbindMarker(this._resizeMarkers[t]);this._resizeMarkers=null,this._map.removeLayer(this._markerGroup),delete this._markerGroup}this._map=null},updateMarkers:function(){this._markerGroup.clearLayers(),this._initMarkers()},_initMarkers:function(){this._markerGroup||(this._markerGroup=new L.LayerGroup),this._createMoveMarker(),this._createResizeMarker()},_createMoveMarker:function(){},_createResizeMarker:function(){},_createMarker:function(t,e){var i=new L.Marker(t,{draggable:!0,icon:e,zIndexOffset:10});return this._bindMarker(i),this._markerGroup.addLayer(i),i},_bindMarker:function(t){t.on("dragstart",this._onMarkerDragStart,this).on("drag",this._onMarkerDrag,this).on("dragend",this._onMarkerDragEnd,this)},_unbindMarker:function(t){t.off("dragstart",this._onMarkerDragStart,this).off("drag",this._onMarkerDrag,this).off("dragend",this._onMarkerDragEnd,this)},_onMarkerDragStart:function(t){var e=t.target;e.setOpacity(0)},_fireEdit:function(){this._shape.edited=!0,this._shape.fire("edit")},_onMarkerDrag:function(t){var e=t.target,i=e.getLatLng();e===this._moveMarker?this._move(i):this._resize(i),this._shape.redraw()},_onMarkerDragEnd:function(t){var e=t.target;e.setOpacity(1),this._shape.fire("edit"),this._fireEdit()},_move:function(){},_resize:function(){}}),L.Edit=L.Edit||{},L.Edit.Rectangle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getBounds(),e=t.getCenter();this._moveMarker=this._createMarker(e,this.options.moveIcon)},_createResizeMarker:function(){var t=this._getCorners();this._resizeMarkers=[];for(var e=0,i=t.length;i>e;e++)this._resizeMarkers.push(this._createMarker(t[e],this.options.resizeIcon)),this._resizeMarkers[e]._cornerIndex=e},_onMarkerDragStart:function(t){L.Edit.SimpleShape.prototype._onMarkerDragStart.call(this,t);var e=this._getCorners(),i=t.target,o=i._cornerIndex;this._oppositeCorner=e[(o+2)%4],this._toggleCornerMarkers(0,o)},_onMarkerDragEnd:function(t){var e,i,o=t.target;o===this._moveMarker&&(e=this._shape.getBounds(),i=e.getCenter(),o.setLatLng(i)),this._toggleCornerMarkers(1),this._repositionCornerMarkers(),L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this,t)},_move:function(t){for(var e,i=this._shape.getLatLngs(),o=this._shape.getBounds(),s=o.getCenter(),a=[],n=0,r=i.length;r>n;n++)e=[i[n].lat-s.lat,i[n].lng-s.lng],a.push([t.lat+e[0],t.lng+e[1]]);this._shape.setLatLngs(a),this._repositionCornerMarkers()},_resize:function(t){var e;this._shape.setBounds(L.latLngBounds(t,this._oppositeCorner)),e=this._shape.getBounds(),this._moveMarker.setLatLng(e.getCenter())},_getCorners:function(){var t=this._shape.getBounds(),e=t.getNorthWest(),i=t.getNorthEast(),o=t.getSouthEast(),s=t.getSouthWest();return[e,i,o,s]},_toggleCornerMarkers:function(t){for(var e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setOpacity(t)},_repositionCornerMarkers:function(){for(var t=this._getCorners(),e=0,i=this._resizeMarkers.length;i>e;e++)this._resizeMarkers[e].setLatLng(t[e])}}),L.Rectangle.addInitHook(function(){L.Edit.Rectangle&&(this.editing=new L.Edit.Rectangle(this),this.options.editable&&this.editing.enable())}),L.Edit=L.Edit||{},L.Edit.Circle=L.Edit.SimpleShape.extend({_createMoveMarker:function(){var t=this._shape.getLatLng();this._moveMarker=this._createMarker(t,this.options.moveIcon)},_createResizeMarker:function(){var t=this._shape.getLatLng(),e=this._getResizeMarkerPoint(t);this._resizeMarkers=[],this._resizeMarkers.push(this._createMarker(e,this.options.resizeIcon))},_getResizeMarkerPoint:function(t){var e=this._shape._radius*Math.cos(Math.PI/4),i=this._map.project(t);return this._map.unproject([i.x+e,i.y-e])},_move:function(t){var e=this._getResizeMarkerPoint(t);this._resizeMarkers[0].setLatLng(e),this._shape.setLatLng(t)},_resize:function(t){var e=this._moveMarker.getLatLng(),i=e.distanceTo(t);this._shape.setRadius(i)}}),L.Circle.addInitHook(function(){L.Edit.Circle&&(this.editing=new L.Edit.Circle(this),this.options.editable&&this.editing.enable()),this.on("add",function(){this.editing&&this.editing.enabled()&&this.editing.addHooks()}),this.on("remove",function(){this.editing&&this.editing.enabled()&&this.editing.removeHooks()})}),L.LatLngUtil={cloneLatLngs:function(t){for(var e=[],i=0,o=t.length;o>i;i++)e.push(this.cloneLatLng(t[i]));return e},cloneLatLng:function(t){return L.latLng(t.lat,t.lng)}},L.Util.extend(L.LineUtil,{segmentsIntersect:function(t,e,i,o){return this._checkCounterclockwise(t,i,o)!==this._checkCounterclockwise(e,i,o)&&this._checkCounterclockwise(t,e,i)!==this._checkCounterclockwise(t,e,o)},_checkCounterclockwise:function(t,e,i){return(i.y-t.y)*(e.x-t.x)>(e.y-t.y)*(i.x-t.x)}}),L.Polyline.include({intersects:function(){var t,e,i,o=this._originalPoints,s=o?o.length:0;if(this._tooFewPointsForIntersection())return!1;for(t=s-1;t>=3;t--)if(e=o[t-1],i=o[t],this._lineSegmentsIntersectsRange(e,i,t-2))return!0;return!1},newLatLngIntersects:function(t,e){return this._map?this.newPointIntersects(this._map.latLngToLayerPoint(t),e):!1},newPointIntersects:function(t,e){var i=this._originalPoints,o=i?i.length:0,s=i?i[o-1]:null,a=o-2;return this._tooFewPointsForIntersection(1)?!1:this._lineSegmentsIntersectsRange(s,t,a,e?1:0)},_tooFewPointsForIntersection:function(t){var e=this._originalPoints,i=e?e.length:0;return i+=t||0,!this._originalPoints||3>=i},_lineSegmentsIntersectsRange:function(t,e,i,o){var s,a,n=this._originalPoints;o=o||0;for(var r=i;r>o;r--)if(s=n[r-1],a=n[r],L.LineUtil.segmentsIntersect(t,e,s,a))return!0;return!1}}),L.Polygon.include({intersects:function(){var t,e,i,o,s,a=this._originalPoints;return this._tooFewPointsForIntersection()?!1:(t=L.Polyline.prototype.intersects.call(this))?!0:(e=a.length,i=a[0],o=a[e-1],s=e-2,this._lineSegmentsIntersectsRange(o,i,s,1))}}),L.Control.Draw=L.Control.extend({options:{position:"topleft",draw:{},edit:!1},initialize:function(t){if("0.5.1">=L.version)throw Error("Leaflet.draw 0.2.0+ requires Leaflet 0.6.0+. Download latest from https://github.com/Leaflet/Leaflet/");L.Control.prototype.initialize.call(this,t);var e,i;this._toolbars={},L.DrawToolbar&&this.options.draw&&(i=new L.DrawToolbar(this.options.draw),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this)),L.EditToolbar&&this.options.edit&&(i=new L.EditToolbar(this.options.edit),e=L.stamp(i),this._toolbars[e]=i,this._toolbars[e].on("enable",this._toolbarEnabled,this))},onAdd:function(t){var e,i=L.DomUtil.create("div","leaflet-draw"),o=!1,s="leaflet-draw-toolbar-top";for(var a in this._toolbars)this._toolbars.hasOwnProperty(a)&&(e=this._toolbars[a].addToolbar(t),o||(L.DomUtil.hasClass(e,s)||L.DomUtil.addClass(e.childNodes[0],s),o=!0),i.appendChild(e));return i},onRemove:function(){for(var t in this._toolbars)this._toolbars.hasOwnProperty(t)&&this._toolbars[t].removeToolbar()},setDrawingOptions:function(t){for(var e in this._toolbars)this._toolbars[e]instanceof L.DrawToolbar&&this._toolbars[e].setOptions(t)},_toolbarEnabled:function(t){var e=""+L.stamp(t.target);for(var i in this._toolbars)this._toolbars.hasOwnProperty(i)&&i!==e&&this._toolbars[i].disable()}}),L.Map.mergeOptions({drawControl:!1}),L.Map.addInitHook(function(){this.options.drawControl&&(this.drawControl=new L.Control.Draw,this.addControl(this.drawControl))}),L.Toolbar=L.Class.extend({includes:[L.Mixin.Events],initialize:function(t){L.setOptions(this,t),this._modes={},this._actionButtons=[],this._activeMode=null},enabled:function(){return null!==this._activeMode},disable:function(){this.enabled()&&this._activeMode.handler.disable()},removeToolbar:function(){for(var t in this._modes)this._modes.hasOwnProperty(t)&&(this._disposeButton(this._modes[t].button,this._modes[t].handler.enable),this._modes[t].handler.disable(),this._modes[t].handler.off("enabled",this._handlerActivated,this).off("disabled",this._handlerDeactivated,this));this._modes={};for(var e=0,i=this._actionButtons.length;i>e;e++)this._disposeButton(this._actionButtons[e].button,this._actionButtons[e].callback);this._actionButtons=[],this._actionsContainer=null},_initModeHandler:function(t,e,i,o){var s=t.type;this._modes[s]={},this._modes[s].handler=t,this._modes[s].button=this._createButton({title:this.options[s].title,className:o+"-"+s,container:e,callback:this._modes[s].handler.enable,context:this._modes[s].handler}),this._modes[s].buttonIndex=i,this._modes[s].handler.on("enabled",this._handlerActivated,this).on("disabled",this._handlerDeactivated,this)},_createButton:function(t){var e=L.DomUtil.create("a",t.className||"",t.container);return e.href="#",t.text&&(e.innerHTML=t.text),t.title&&(e.title=t.title),L.DomEvent.on(e,"click",L.DomEvent.stopPropagation).on(e,"mousedown",L.DomEvent.stopPropagation).on(e,"dblclick",L.DomEvent.stopPropagation).on(e,"click",L.DomEvent.preventDefault).on(e,"click",t.callback,t.context),e},_disposeButton:function(t,e){L.DomEvent.off(t,"click",L.DomEvent.stopPropagation).off(t,"mousedown",L.DomEvent.stopPropagation).off(t,"dblclick",L.DomEvent.stopPropagation).off(t,"click",L.DomEvent.preventDefault).off(t,"click",e)},_handlerActivated:function(t){this._activeMode&&this._activeMode.handler.enabled()&&this._activeMode.handler.disable(),this._activeMode=this._modes[t.handler],L.DomUtil.addClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._showActionsToolbar(),this.fire("enable")},_handlerDeactivated:function(){this._hideActionsToolbar(),L.DomUtil.removeClass(this._activeMode.button,"leaflet-draw-toolbar-button-enabled"),this._activeMode=null,this.fire("disable")},_createActions:function(t){for(var e,i,o=L.DomUtil.create("ul","leaflet-draw-actions"),s=50,a=t.length,n=a*s+(a-1),r=0;a>r;r++)e=L.DomUtil.create("li","",o),i=this._createButton({title:t[r].title,text:t[r].text,container:e,callback:t[r].callback,context:t[r].context}),this._actionButtons.push({button:i,callback:t[r].callback});return o.style.width=n+"px",o},_showActionsToolbar:function(){var t=this._activeMode.buttonIndex,e=this._lastButtonIndex,i=26,o=1,s=t*i+t*o-1;this._actionsContainer.style.top=s+"px",0===t&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-top")),t===e&&(L.DomUtil.addClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.addClass(this._actionsContainer,"leaflet-draw-actions-bottom")),this._actionsContainer.style.display="block"},_hideActionsToolbar:function(){this._actionsContainer.style.display="none",L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-notop"),L.DomUtil.removeClass(this._toolbarContainer,"leaflet-draw-toolbar-nobottom"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-top"),L.DomUtil.removeClass(this._actionsContainer,"leaflet-draw-actions-bottom")}}),L.Tooltip=L.Class.extend({initialize:function(t){this._map=t,this._popupPane=t._panes.popupPane,this._container=L.DomUtil.create("div","leaflet-draw-tooltip",this._popupPane),this._singleLineLabel=!1},dispose:function(){this._popupPane.removeChild(this._container),this._container=null},updateContent:function(t){return t.subtext=t.subtext||"",0!==t.subtext.length||this._singleLineLabel?t.subtext.length>0&&this._singleLineLabel&&(L.DomUtil.removeClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!1):(L.DomUtil.addClass(this._container,"leaflet-draw-tooltip-single"),this._singleLineLabel=!0),this._container.innerHTML=(t.subtext.length>0?'<span class="leaflet-draw-tooltip-subtext">'+t.subtext+"</span>"+"<br />":"")+"<span>"+t.text+"</span>",this},updatePosition:function(t){var e=this._map.latLngToLayerPoint(t);return L.DomUtil.setPosition(this._container,e),this},showAsError:function(){return L.DomUtil.addClass(this._container,"leaflet-error-draw-tooltip"),this},removeError:function(){return L.DomUtil.removeClass(this._container,"leaflet-error-draw-tooltip"),this}}),L.DrawToolbar=L.Toolbar.extend({options:{polyline:{title:"Draw a polyline"},polygon:{title:"Draw a polygon"},rectangle:{title:"Draw a rectangle"},circle:{title:"Draw a circle"},marker:{title:"Add a marker"}},initialize:function(t){L.Toolbar.prototype.initialize.call(this,t)},addToolbar:function(t){var e=L.DomUtil.create("div","leaflet-draw-section"),i=0,o="leaflet-draw-draw";return this._toolbarContainer=L.DomUtil.create("div","leaflet-draw-toolbar leaflet-bar"),this.options.polyline&&this._initModeHandler(new L.Draw.Polyline(t,this.options.polyline),this._toolbarContainer,i++,o),this.options.polygon&&this._initModeHandler(new L.Draw.Polygon(t,this.options.polygon),this._toolbarContainer,i++,o),this.options.rectangle&&this._initModeHandler(new L.Draw.Rectangle(t,this.options.rectangle),this._toolbarContainer,i++,o),this.options.circle&&this._initModeHandler(new L.Draw.Circle(t,this.options.circle),this._toolbarContainer,i++,o),this.options.marker&&this._initModeHandler(new L.Draw.Marker(t,this.options.marker),this._toolbarContainer,i++,o),this._lastButtonIndex=--i,this._actionsContainer=this._createActions([{title:"Cancel drawing",text:"Cancel",callback:this.disable,context:this}]),e.appendChild(this._toolbarContainer),e.appendChild(this._actionsContainer),e},setOptions:function(t){L.setOptions(this,t);for(var e in this._modes)this._modes.hasOwnProperty(e)&&t.hasOwnProperty(e)&&this._modes[e].handler.setOptions(t[e])}}),L.EditToolbar=L.Toolbar.extend({options:{edit:{title:"Edit layers",selectedPathOptions:null},remove:{title:"Delete layers"},featureGroup:null},initialize:function(t){L.Toolbar.prototype.initialize.call(this,t),this._selectedFeatureCount=0},addToolbar:function(t){var e=L.DomUtil.create("div","leaflet-draw-section"),i=0,o="leaflet-draw-edit";return this._toolbarContainer=L.DomUtil.create("div","leaflet-draw-toolbar leaflet-bar"),this._map=t,this.options.edit&&this._initModeHandler(new L.EditToolbar.Edit(t,{featureGroup:this.options.featureGroup,selectedPathOptions:this.options.edit.selectedPathOptions}),this._toolbarContainer,i++,o),this.options.remove&&this._initModeHandler(new L.EditToolbar.Delete(t,{featureGroup:this.options.featureGroup}),this._toolbarContainer,i++,o),this._lastButtonIndex=--i,this._actionsContainer=this._createActions([{title:"Save changes.",text:"Save",callback:this._save,context:this},{title:"Cancel editing, discards all changes.",text:"Cancel",callback:this.disable,context:this}]),e.appendChild(this._toolbarContainer),e.appendChild(this._actionsContainer),e},disable:function(){this.enabled()&&(this._activeMode.handler.revertLayers(),L.Toolbar.prototype.disable.call(this))},_save:function(){this._activeMode.handler.save(),this._activeMode.handler.disable()}}),L.EditToolbar.Edit=L.Handler.extend({statics:{TYPE:"edit"},includes:L.Mixin.Events,options:{selectedPathOptions:{color:"#fe57a1",opacity:.6,dashArray:"10, 10",fill:!0,fillColor:"#fe57a1",fillOpacity:.1}},initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),e.selectedPathOptions=e.selectedPathOptions||this.options.selectedPathOptions,L.Util.setOptions(this,e),this._featureGroup=this.options.featureGroup,!(this._featureGroup instanceof L.FeatureGroup))throw Error("options.featureGroup must be a L.FeatureGroup");
this._uneditedLayerProps={},this.type=L.EditToolbar.Edit.TYPE},enable:function(){this._enabled||(L.Handler.prototype.enable.call(this),this._featureGroup.on("layeradd",this._enableLayerEdit,this).on("layerremove",this._disableLayerEdit,this),this.fire("enabled",{handler:this.type}))},disable:function(){this._enabled&&(this.fire("disabled",{handler:this.type}),this._featureGroup.off("layeradd",this._enableLayerEdit,this).off("layerremove",this._disableLayerEdit,this),L.Handler.prototype.disable.call(this))},addHooks:function(){this._map&&(this._featureGroup.eachLayer(this._enableLayerEdit,this),this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:"Drag handles, or marker to edit feature.",subtext:"Click cancel to undo changes."}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._featureGroup.eachLayer(this._disableLayerEdit,this),this._uneditedLayerProps={},this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._featureGroup.eachLayer(function(t){this._revertLayer(t)},this)},save:function(){var t=new L.LayerGroup;this._featureGroup.eachLayer(function(e){e.edited&&(t.addLayer(e),e.edited=!1)}),this._map.fire("draw:edited",{layers:t})},_backupLayer:function(t){var e=L.Util.stamp(t);this._uneditedLayerProps[e]||(this._uneditedLayerProps[e]=t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?{latlngs:L.LatLngUtil.cloneLatLngs(t.getLatLngs())}:t instanceof L.Circle?{latlng:L.LatLngUtil.cloneLatLng(t.getLatLng()),radius:t.getRadius()}:{latlng:L.LatLngUtil.cloneLatLng(t.getLatLng())})},_revertLayer:function(t){var e=L.Util.stamp(t);t.edited=!1,this._uneditedLayerProps.hasOwnProperty(e)&&(t instanceof L.Polyline||t instanceof L.Polygon||t instanceof L.Rectangle?t.setLatLngs(this._uneditedLayerProps[e].latlngs):t instanceof L.Circle?(t.setLatLng(this._uneditedLayerProps[e].latlng),t.setRadius(this._uneditedLayerProps[e].radius)):t.setLatLng(this._uneditedLayerProps[e].latlng))},_toggleMarkerHighlight:function(t){var e=t._icon;e.style.display="none",L.DomUtil.hasClass(e,"leaflet-edit-marker-selected")?(L.DomUtil.removeClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,-4)):(L.DomUtil.addClass(e,"leaflet-edit-marker-selected"),this._offsetMarker(e,4)),e.style.display=""},_offsetMarker:function(t,e){var i=parseInt(t.style.marginTop,10)-e,o=parseInt(t.style.marginLeft,10)-e;t.style.marginTop=i+"px",t.style.marginLeft=o+"px"},_enableLayerEdit:function(t){var e=t.layer||t.target||t,i=L.Util.extend({},this.options.selectedPathOptions);this._backupLayer(e),e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.options.previousOptions=e.options,e instanceof L.Circle||e instanceof L.Polygon||e instanceof L.Rectangle||(i.fill=!1),e.setStyle(i)),e instanceof L.Marker?(e.dragging.enable(),e.on("dragend",this._onMarkerDragEnd)):e.editing.enable()},_disableLayerEdit:function(t){var e=t.layer||t.target||t;e.edited=!1,e instanceof L.Marker?this._toggleMarkerHighlight(e):(e.setStyle(e.options.previousOptions),delete e.options.previousOptions),e instanceof L.Marker?(e.dragging.disable(),e.off("dragend",this._onMarkerDragEnd,this)):e.editing.disable()},_onMarkerDragEnd:function(t){var e=t.target;e.edited=!0},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)}}),L.EditToolbar.Delete=L.Handler.extend({statics:{TYPE:"remove"},includes:L.Mixin.Events,initialize:function(t,e){if(L.Handler.prototype.initialize.call(this,t),L.Util.setOptions(this,e),this._deletableLayers=this.options.featureGroup,!(this._deletableLayers instanceof L.FeatureGroup))throw Error("options.featureGroup must be a L.FeatureGroup");this.type=L.EditToolbar.Delete.TYPE},enable:function(){this._enabled||(L.Handler.prototype.enable.call(this),this._deletableLayers.on("layeradd",this._enableLayerDelete,this).on("layerremove",this._disableLayerDelete,this),this.fire("enabled",{handler:this.type}))},disable:function(){this._enabled&&(L.Handler.prototype.disable.call(this),this._deletableLayers.off("layeradd",this._enableLayerDelete,this).off("layerremove",this._disableLayerDelete,this),this.fire("disabled",{handler:this.type}))},addHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._enableLayerDelete,this),this._deletedLayers=new L.layerGroup,this._tooltip=new L.Tooltip(this._map),this._tooltip.updateContent({text:"Click on a feature to remove."}),this._map.on("mousemove",this._onMouseMove,this))},removeHooks:function(){this._map&&(this._deletableLayers.eachLayer(this._disableLayerDelete,this),this._deletedLayers=null,this._tooltip.dispose(),this._tooltip=null,this._map.off("mousemove",this._onMouseMove,this))},revertLayers:function(){this._deletedLayers.eachLayer(function(t){this._deletableLayers.addLayer(t)},this)},save:function(){this._map.fire("draw:deleted",{layers:this._deletedLayers})},_enableLayerDelete:function(t){var e=t.layer||t.target||t;e.on("click",this._removeLayer,this)},_disableLayerDelete:function(t){var e=t.layer||t.target||t;e.off("click",this._removeLayer,this),this._deletedLayers.removeLayer(e)},_removeLayer:function(t){var e=t.layer||t.target||t;this._deletableLayers.removeLayer(e),this._deletedLayers.addLayer(e)},_onMouseMove:function(t){this._tooltip.updatePosition(t.latlng)}})})(this,document);

  try { console.log('done loading leaflet.draw JS'); } catch(e) {}

  window.plugin.drawTools.boot();

  $('head').append('<style>/* ================================================================== */\n/* Toolbars\n/* ================================================================== */\n\n.leaflet-draw-section {\n	position: relative;\n}\n\n.leaflet-draw-toolbar {\n	margin-top: 12px;\n}\n\n.leaflet-draw-toolbar-top {\n	margin-top: 0;\n}\n\n.leaflet-draw-toolbar-notop a:first-child {\n	border-top-right-radius: 0;\n}\n\n.leaflet-draw-toolbar-nobottom a:last-child {\n	border-bottom-right-radius: 0;\n}\n\n.leaflet-draw-toolbar a {\n	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAAAeCAYAAABZs0CNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2RpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpBMTY2QTYwQzEwNjRFMjExODE5MEQyMUE5RURFRDgzMiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDRkRDQTY2NzY2OEIxMUUyODhFNkM1NjYwNzFBMjAyMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDRkRDQTY2NjY2OEIxMUUyODhFNkM1NjYwNzFBMjAyMCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBMjY2QTYwQzEwNjRFMjExODE5MEQyMUE5RURFRDgzMiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBMTY2QTYwQzEwNjRFMjExODE5MEQyMUE5RURFRDgzMiIvPiA8L3JkZjpEZXNjcmlwdGlv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);\n	background-repeat: no-repeat;\n}\n\n.leaflet-draw a {\n	display: block;\n	text-align: center;\n	text-decoration: none;\n}\n\n/* ================================================================== */\n/* Toolbar actions menu\n/* ================================================================== */\n\n.leaflet-draw-actions {\n	display: none;\n	list-style: none;\n	margin: 0;\n	padding: 0;\n	position: absolute;\n	left: 26px; /* leaflet-draw-toolbar.left + leaflet-draw-toolbar.width */\n	top: 0;\n}\n\n.leaflet-draw-actions li {\n	float: left;\n}\n\n.leaflet-draw-actions li:first-child a {\n	border-left: none;\n}\n\n.leaflet-draw-actions li:last-child a {\n	-webkit-border-radius: 0 4px 4px 0;\n	        border-radius: 0 4px 4px 0;\n}\n\n.leaflet-draw-actions a {\n	background-color: #919187;\n	border-left: 1px solid #AAA;\n	color: #FFF;\n	font: 11px/19px "Helvetica Neue", Arial, Helvetica, sans-serif;\n	line-height: 28px;\n	text-decoration: none;\n	width: 50px;\n	height: 28px;\n}\n\n.leaflet-draw-actions-bottom {\n	margin-top: 0;\n}\n\n.leaflet-draw-actions-top {\n	margin-top: 1px;\n}\n\n.leaflet-draw-actions-top a,\n.leaflet-draw-actions-bottom a {\n	height: 27px;\n	line-height: 27px;\n}\n\n.leaflet-draw-actions a:hover {\n	background-color: #A0A098;\n}\n\n.leaflet-draw-actions-top.leaflet-draw-actions-bottom a {\n	height: 26px;\n	line-height: 26px;\n}\n\n/* ================================================================== */\n/* Draw toolbar\n/* ================================================================== */\n\n.leaflet-draw-toolbar .leaflet-draw-draw-polyline {\n	background-position: -2px -2px;\n}\n\n.leaflet-draw-toolbar .leaflet-draw-draw-polygon {\n	background-position: -31px -2px;\n}\n\n.leaflet-draw-toolbar .leaflet-draw-draw-rectangle {\n	background-position: -62px -2px;\n}\n\n.leaflet-draw-toolbar .leaflet-draw-draw-circle {\n	background-position: -92px -2px;\n}\n\n.leaflet-draw-toolbar .leaflet-draw-draw-marker {\n	background-position: -122px -2px;\n}\n\n/* ================================================================== */\n/* Edit toolbar\n/* ================================================================== */\n\n.leaflet-draw-toolbar .leaflet-draw-edit-edit {\n	background-position: -152px -2px;\n}\n\n.leaflet-draw-toolbar .leaflet-draw-edit-remove {\n	background-position: -182px -2px;\n}\n\n/* ================================================================== */\n/* Drawing styles\n/* ================================================================== */\n\n.leaflet-mouse-marker {\n	background-color: #fff;\n	cursor: crosshair;\n}\n\n.leaflet-draw-tooltip {\n	background: rgb(54, 54, 54);\n	background: rgba(0, 0, 0, 0.5);\n	border: 1px solid transparent;\n	-webkit-border-radius: 4px;\n	        border-radius: 4px;\n	color: #fff;\n	font: 12px/18px "Helvetica Neue", Arial, Helvetica, sans-serif;\n	margin-left: 20px;\n	margin-top: -21px;\n	padding: 4px 8px;\n	position: absolute;\n	white-space: nowrap;\n	z-index: 6;\n}\n\n.leaflet-draw-tooltip:before {\n	border-right: 6px solid black;\n	border-right-color: rgba(0, 0, 0, 0.5);\n	border-top: 6px solid transparent;\n	border-bottom: 6px solid transparent;\n	content: "";\n	position: absolute;\n	top: 7px;\n	left: -7px;\n}\n\n.leaflet-error-draw-tooltip {\n	background-color: #F2DEDE;\n	border: 1px solid #E6B6BD;\n	color: #B94A48;\n}\n\n.leaflet-error-draw-tooltip:before {\n	border-right-color: #E6B6BD;\n}\n\n.leaflet-draw-tooltip-single {\n	margin-top: -12px\n}\n\n.leaflet-draw-tooltip-subtext {\n	color: #f8d5e4;\n}\n\n.leaflet-draw-guide-dash {\n	font-size: 1%;\n	opacity: 0.6;\n	position: absolute;\n	width: 5px;\n	height: 5px;\n}\n\n/* ================================================================== */\n/* Edit styles\n/* ================================================================== */\n\n.leaflet-edit-marker-selected {\n	background: rgba(254, 87, 161, 0.1);\n	border: 4px dashed rgba(254, 87, 161, 0.6);\n	-webkit-border-radius: 4px;\n	        border-radius: 4px;\n}\n\n.leaflet-edit-move {\n	cursor: move;\n}\n\n.leaflet-edit-resize {\n	cursor: pointer;\n}\n</style>');
}

window.plugin.drawTools.setOptions = function() {
  window.plugin.drawTools.lineOptions = {
    stroke: true,
    color: '#f06eaa',
    weight: 4,
    opacity: 0.5,
    fill: false,
    clickable: true
  };

  window.plugin.drawTools.polygonOptions = {
    stroke: true,
    color: '#f06eaa',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,
    fillOpacity: 0.2,
    clickable: true
  };

  window.plugin.drawTools.markerOptions = {
    icon: new L.Icon.Default(),
    zIndexOffset: 2000
  };

}


// renders the draw control buttons in the top left corner
window.plugin.drawTools.addDrawControl = function() {
  var drawControl = new L.Control.Draw({
    draw: {
      rectangle: false,
      polygon: {
        title: 'Add a polygon\n\n'
          + 'Click on the button, then click on the map to\n'
          + 'define the start of the polygon. Continue clicking\n'
          + 'to draw the line you want. Click the first or last\n'
          + 'point of the line (a small white rectangle) to\n'
          + 'finish. Double clicking also works.',
        shapeOptions: window.plugin.drawTools.polygonOptions,
      },

      polyline: {
        title: 'Add a (poly) line.\n\n'
          + 'Click on the button, then click on the map to\n'
          + 'define the start of the line. Continue clicking\n'
          + 'to draw the line you want. Click the <b>last</b>\n'
          + 'point of the line (a small white rectangle) to\n'
          + 'finish. Double clicking also works.',
        shapeOptions: window.plugin.drawTools.lineOptions,
      },

      circle: {
        title: 'Add a circle.\n\n'
          + 'Click on the button, then click-AND-HOLD on the\n'
          + 'map where the circle’s center should be. Move\n'
          + 'the mouse to control the radius. Release the mouse\n'
          + 'to finish.',
        shapeOptions: window.plugin.drawTools.polygonOptions,
      },

      marker: {
        title: 'Add a marker.\n\n'
          + 'Click on the button, then click on the map where\n'
          + 'you want the marker to appear.',
        shapeOptions: window.plugin.drawTools.markerOptions,
      },

    },

    edit: {
      featureGroup: window.plugin.drawTools.drawnItems,

      edit: {
        title: 'Edit drawn items'
      },

      remove: {
        title: 'Delete drawn items'
      },

    },

  });

  map.addControl(drawControl);
//  plugin.drawTools.addCustomButtons();
}


// given a container point it tries to find the most suitable portal to
// snap to. It takes the CircleMarker’s radius and weight into account.
// Will return null if nothing to snap to or a LatLng instance.
window.plugin.drawTools.getSnapLatLng = function(containerPoint) {
// TODO: use this function again, if possible
  var candidates = [];
  $.each(window.portals, function(guid, portal) {
    var ll = portal.getLatLng();
    var pp = map.latLngToContainerPoint(ll);
    var size = portal.options.weight + portal.options.radius;
    var dist = pp.distanceTo(containerPoint);
    if(dist > size) return true;
    candidates.push([dist, ll]);
  });

  if(candidates.length === 0) return;
  candidates = candidates.sort(function(a, b) { return a[0]-b[0]; });
  return candidates[0][1];
}


window.plugin.drawTools.save = function() {
  var data = [];

  window.plugin.drawTools.drawnItems.eachLayer( function(layer) {
    var item = {};
    if (layer instanceof L.GeodesicCircle || layer instanceof L.Circle) {
      item.type = 'circle';
      item.latLng = layer.getLatLng();
      item.radius = layer.getRadius();
    } else if (layer instanceof L.GeodesicPolygon || layer instanceof L.Polygon) {
      item.type = 'polygon';
      item.latLngs = layer.getLatLngs();
    } else if (layer instanceof L.GeodesicPolyline || layer instanceof L.Polyline) {
      item.type = 'polyline';
      item.latLngs = layer.getLatLngs();
    } else if (layer instanceof L.Marker) {
      item.type = 'marker';
      item.latLng = layer.getLatLng();
    } else {
      console.warn('Unknown layer type when saving draw tools layer');
      return; //.eachLayer 'continue'
    }

    data.push(item);
  });

  localStorage['plugin-draw-tools-layer'] = JSON.stringify(data);

  console.log('draw-tools: saved to localStorage');
}

window.plugin.drawTools.load = function() {
  var dataStr = localStorage['plugin-draw-tools-layer'];
  if (dataStr === undefined) return;

  var data = JSON.parse(dataStr);
  $.each(data, function(index,item) {
    var layer = null;
    switch(item.type) {
      case 'polyline':
        layer = L.geodesicPolyline(item.latLngs,window.plugin.drawTools.lineOptions);
        break;
      case 'polygon':
        layer = L.geodesicPolygon(item.latLngs,window.plugin.drawTools.polygonOptions);
        break;
      case 'circle':
        layer = L.circle(item.latLng,item.radius,window.plugin.drawTools.polygonOptions);
        break;
      case 'marker':
        layer = L.marker(item.latLng,window.plugin.drawTools.markerOptions)
        break;
      default:
        console.warn('unknown layer type "'+item.type+'" when loading draw tools layer');
        break;
    }
    if (layer) {
      window.plugin.drawTools.drawnItems.addLayer(layer);
    }

  });

}


window.plugin.drawTools.boot = function() {
  window.plugin.drawTools.setOptions();

  //create a leaflet FeatureGroup to hold drawn items
  window.plugin.drawTools.drawnItems = new L.FeatureGroup();

  //load any previously saved items
  plugin.drawTools.load();

  //add the draw control - this references the above FeatureGroup for editing purposes
  plugin.drawTools.addDrawControl();

  //start off hidden. if the layer is enabled, the below addLayerGroup will add it, triggering a 'show'
  $('.leaflet-draw-section').hide();


  //hide the draw tools when the 'drawn items' layer is off, show it when on
  map.on('layeradd', function(obj) {
    if(obj.layer === window.plugin.drawTools.drawnItems) {
      $('.leaflet-draw-section').show();
    }
  });
  map.on('layerremove', function(obj) {
    if(obj.layer === window.plugin.drawTools.drawnItems) {
      $('.leaflet-draw-section').hide();
    }
  });

  //add the layer
  window.addLayerGroup('Drawn Items', window.plugin.drawTools.drawnItems, true);


  //place created items into the specific layer
  map.on('draw:created', function(e) {
    var type=e.layerType;
    var layer=e.layer;
    window.plugin.drawTools.drawnItems.addLayer(layer);
    window.plugin.drawTools.save();
  });

  map.on('draw:deleted', function(e) {
    window.plugin.drawTools.save();
  });

  map.on('draw:edited', function(e) {
    window.plugin.drawTools.save();
  });


}


var setup =  window.plugin.drawTools.loadExternals;

// PLUGIN END //////////////////////////////////////////////////////////


if(window.iitcLoaded && typeof setup === 'function') {
  setup();
} else {
  if(window.bootPlugins)
    window.bootPlugins.push(setup);
  else
    window.bootPlugins = [setup];
}
} // wrapper end
// inject code into site context
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ wrapper +')();'));
(document.body || document.head || document.documentElement).appendChild(script);


