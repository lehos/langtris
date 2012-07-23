/**
Quick port of Adobe Flash Tween class
Can be used with jQuery

@author Sergey Chikuyonok (gonarch@design.ru)
@version 1.1
*/

/**
 * Creates instance of Tween class and animates object
 * @param {Element, String, Array} elem Element or element's ID (since 1.01) to animate. Also, array of elements can be passed (since 1.1)
 * @param {String, Array} style_property Property or list of properties (since 1.1) of element's 'style' object to animate (pass empty string if you want to create complex animations)
 * @param {Function} anim_method Animation function
 * @param {Number} start_value Start value (MUST NOT equals to 0)
 * @param {Number} end_value End value
 * @param {Number} duration Animation duration (how many frames animation will last)
 * @param {String} [units] Value units (px, em, %, etc). Default is 'px'
 */
function Tween(elem, style_property, anim_method, start_value, end_value, duration, units){
	this.time=0;
	this.duration=duration;

	this.percent=0;

//	console.log(elem, (elem instanceof jQuery));

	if(elem instanceof Array || (typeof(jQuery) != 'undefined' && elem instanceof jQuery))
		this._list = elem;
	else if(typeof(elem) == 'string')
		this._list=[document.getElementById(elem)];
	else
		this._list=[elem];

	this._prop = null;

	if(style_property instanceof Array){
		this._prop = [];
		for(var i=0; i<style_property.length; i++){
			this._prop.push(this._toCamelCase(style_property[i]));
		}
	}
	else if(style_property){
		this._prop = [this._toCamelCase(style_property)];
	}

	this._ease=anim_method;
	this._isColor = false;
	if(this._prop && this._prop.join(',').toLowerCase().indexOf('color') != -1){
		//color value must be animated
		this._c1 = new TweenColor(start_value);
		this._c2 = new TweenColor(end_value);
		this._isColor = true;
		start_value = 0;
		end_value = 1;
	}

	this.position=start_value;
	this._start=parseFloat(start_value);
	this.finish=parseFloat(end_value);
	this._change=this.finish - this._start;
	this._animate=false;
	this._units=(typeof(units) == 'undefined') ? 'px' : units;

	if(this._prop){
		for(var i=0, il=this._prop.length; i<il; i++){
			var p=this._prop[i];
			switch(p){
				case 'opacity':
					if(Tween.browser.msie){
						// IE has trouble with opacity if it does not have layout
						// Force it by setting the zoom level

						for(var j=0, jl=this._list.length; j<jl; j++){
							var o = this._list[j];
							o.style.zoom=1;
							o.style.filter = o.style.filter.replace(/alpha\([^\)]*\)/gi,"") + "alpha(opacity=" + start_value * 100 + ")";
						}
					}
					break;
			}
		}
	}

	this.play();
}

Tween._stack=[];
Tween._idPoll=null;

/**
 * Animates all 'Tween' instances
 */
Tween._poll=function(){
	var il=Tween._stack.length;
	for(var i=0; i<il; i++){
		if(Tween._stack[i])
			Tween._stack[i]._onMotion();
	}
};

/**
 * Adds 'Tween' instance to animation stack
 * @param {Tween} obj
 */
Tween._add=function(obj){
	Tween._stack[Tween._stack.length]=obj;
};

/**
 * Removes 'Tween' instance from animation stack
 * @param {Tween} obj
 */
Tween._remove=function(obj){
	var s = Tween._stack;
	var il=s.length;
	for(var i=0; i < il; i++){
		if(s[i] == obj){
			s.splice(i,1);
			break;
		}
	}

	if(!s.length)
		Tween._stopPoll();
};

/**
 * Browser detection (took from jQuery)
 * @since 1.01
 */
new function() {
	var b = navigator.userAgent.toLowerCase();

	// Figure out what browser is being used
	/** @alias Tween.browser */
	Tween.browser = {
		safari: /webkit/.test(b),
		opera: /opera/.test(b),
		msie: /msie/.test(b) && !/opera/.test(b),
		mozilla: /mozilla/.test(b) && !/(compatible|webkit)/.test(b)
	};

	// Check to see if the W3C box model is being used
	/** @alias Tween.boxModel */
	Tween.boxModel = !Tween.browser.msie || document.compatMode == "CSS1Compat";
};

/**
 * Start all 'tween' animations
 */
Tween._startPoll=function(){
	Tween._idPoll=setInterval(Tween._poll, 23);
};

/**
 * Stops all 'tween' animations
 */
Tween._stopPoll=function(){
	clearInterval(Tween._idPoll);
	Tween._idPoll=null;
};

/**
 * Check if passed object is in tween's stack
 * @param {Tween} obj
 * @return {Boolean}
 */
Tween._inStack=function(obj){
	var il=this._stack.length;
	for(var i=0; i<il; i++){
		if(this._stack[i] == obj)
			return true;
	}
	return false;
};

Tween.prototype={
	/**
	 * Main animation method.
	 */
	_onMotion: function(){
		if(this._animate){
			if(this.time < this.duration){
				this.time++;
				this.position=this._ease(this.time, this._start, this._change, this.duration);

				//aliases
				var pos = this.position, u = this._units, prop = this._prop;
				this.percent=Math.abs((pos-this._start)/this._change);
				if(this._isColor){
					this.position = pos = this._c1.mix(this._c2, pos).toString();
					u = '';
				}

				for(var i=0, il=this._list.length; i<il; i++){
					var o = this._list[i], st = o.style;

					this.target=o;

					if(prop){
						for(var j=0, jl=prop.length; j<jl; j++){
							var p = prop[j];

							switch(p){
								/** @since 1.01 */
								case 'opacity':
									if(Tween.browser.msie){
										//IE uses filter for opacity
										st.filter = st.filter.replace(/alpha\([^\)]*\)/gi,"") + "alpha(opacity=" + pos * 100 + ")";
									}
									else{
										if(Tween.browser.mozilla && pos == 1){
											// Mozilla doesn't play well with opacity 1
											pos = 0.9999;
										}
										st[p] = pos;
									}
								break;
								default:
									st[p]=pos+u;
							}
						}
					}

					this.onMotionChanged(o);
				}
				this.onMotionChangeComplete();
			}
			else{
				this.percent=1;
				for(var i=0, il=this._list.length; i<il; i++){
					var o = this._list[i];
					this.target=o;
					this.onMotionFinished(o);
				}
				this.onMotionFinishComplete();
				this.stop();
			}
		}
	},

	/**
	 * Converts string to camel-case notation (i.e. padding-top -> paddingTop)
	 * @param {String} str
	 * @return {String}
	 */
	_toCamelCase: function(str){
		return str.replace(/\-(\w)/ig, function(str, p1){return p1.toUpperCase();});
	},

	/**
	 * Method invoked after each animation step for single object. Used for custom methods
	 * @param {Object} obj Object that was animated (since 1.1)
	 */
	onMotionChanged: function(obj){
		return;
	},

	/**
	 * Method invoked after each animation step when all objects was animated. Used for custom methods
	 * @since 1.1
	 */
	onMotionChangeComplete: function(obj){
		return;
	},

	/**
	 * Method invoked when animation is finished for single object. Used for custom methods
	 * @param {Object} obj Object that was animated (since 1.1)
	 */
	onMotionFinished: function(obj){
		return;
	},

	/**
	 * Method invoked when animation is finished for all objects. Used for custom methods
	 * @since 1.1
	 */
	onMotionFinishComplete: function(){
		return;
	},

	/**
	 * Plays current animation from the beginning
	 */
	play: function(){
		if(!this._animate){
			this._animate=true;
			this.time=0;
			if(!Tween._inStack(this)){
				Tween._add(this);
			}
		}
		if(!Tween._idPoll)
			Tween._startPoll();
	},

	/**
	 * Stops current animation
	 */
	stop: function(){
		this._animate=false;
		Tween._remove(this);
	},

	/**
	 * Resumes stopped animation
	 */
	resume: function(){
		this._animate=true;
		if(!Tween._inStack(this))
			Tween._add(this);
	}
};

/**
 * Class for working with colors<br>
 * <b>Alternatives</b><br>
 * Color(r: Number, g: Number, b: Number) : Color
 * @since 1.1
 * @param {String} value String hexadecimal value (example: #ff00cc)
 */
function TweenColor(){
	this.set.apply(this, arguments);
}

/**
 * Mix two colors
 * @param {String, Color} start Primary color
 * @param {String, Color} end Secondary color
 * @param {Number} bias Color mixing bias; from 0 (full primary color) to 1 (full secondary color)
 * @return {Color}
 */
TweenColor.mix=function(start, end, bias){
	return (new TweenColor(start)).mix(new TweenColor(end), bias);
};

TweenColor.prototype = {
	/**
	 * Set color value
	 * Color(r: Number, g: Number, b: Number)
	 * @param {String} value String hexadecimal value (example: #ff00cc)
	 */
	set: function(){
		if(arguments.length == 1 && typeof(arguments[0]) == 'string'){
			if(typeof(arguments[0]) == 'string'){
				var color = arguments[0].replace('#', '');
				this.r=parseInt(color.substr(0, 2), 16);
				this.g=parseInt(color.substr(2, 2), 16);
				this.b=parseInt(color.substr(4, 2), 16);
			}
			else if(arguments[0] instanceof TweenColor){
				var color = arguments[0];
				this.r=color.r;
				this.g=color.g;
				this.b=color.b;
			}
		}
		else if(arguments.length == 3){
			this.r=parseInt(arguments[0]);
			this.g=parseInt(arguments[1]);
			this.b=parseInt(arguments[2]);
		}
		this.value=(this.r<<16|this.g<<8|this.b);
	},

	/**
	 * Get color value
	 * @return {Number}
	 */
	get: function(){
		return this.value;
	},

	/**
	 * Mix current color with another one
	 * @param {Color} color Color to mix with
	 * @param {Number} bias Color mixing bias; from 0 (full primary color) to 1 (full secondary color)
	 */
	mix: function(color, bias){
		bias=bias||0;
		return new TweenColor(
			this.r + (color.r - this.r) * bias,
			this.g + (color.g - this.g) * bias,
			this.b + (color.b - this.b) * bias
		);
	},

	/**
	 * Return color value in hexadecimal notation (example: af0956)
	 * @return {String}
	 */
	toHex: function(){
		return this.value.toString(16);
	},

	/**
	 * Returns string value of current color, suitable for HTML (example: #af0956)
	 * @return {String}
	 */
	toString: function(){
		var v = this.toHex();
		for(var i=v.length, il = 6; i < il; i++){
			v=0+v;
		}
		return '#'+v;
	}
};



/**
  Easing Equations v1.5
  This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html.
  @copyright 2003 Robert Penner, all rights reserved.
*/

/**
 * Easing equations container
 */
var EEQ={};

/**
 * Simple linear tweening - no easing
 * @param {Number} t Current time
 * @param {Number} b Beginning value
 * @param {Number} c Change in value
 * @param {Number} d Duration
 * @return {Number}
 */
EEQ.linear = function (t, b, c, d){
	return c*t/d + b;
};

/** Quadratic easing: t^2 */
EEQ.Quadratic={
	easeIn: function(t, b, c, d){
		return c*(t/=d)*t + b;
	},

	easeOut: function (t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},

	easeInOut: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	}
};

/** Cubic easing: t^3 */
EEQ.Cubic={
	easeIn: function (t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},

	easeOut: function (t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},

	easeInOut: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	}
};

/** Quartic easing: t^4 */
EEQ.Quartic={
	easeIn: function (t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},

	easeOut: function (t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},

	easeInOut: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	}
};

/** Quintic easing: t^5 */
EEQ.Quintic={
	easeIn:	function (t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},

	easeOut: function (t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},

	easeInOut: function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	}
};

/** Sinusoidal easing: sin(t) */
EEQ.Sine={
	easeIn: function (t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},

	easeOut: function (t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},

	easeInOut: function (t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}
};

/** Exponential easing: 2^t */
EEQ.Exponential={
	easeIn: function (t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},

	easeOut: function (t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},

	easeInOut: function (t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	}
};

/** Circular easing: sqrt(1-t^2) */
EEQ.Circular={
	easeIn: function (t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},

	easeOut: function (t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},

	easeInOut: function (t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	}
};

/** Elastic easing: exponentially decaying sine wave */
EEQ.Elastic={
	easeIn: function (t, b, c, d){
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},

	easeOut: function (t, b, c, d, a, p) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*0.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},

	easeInOut: function (t, b, c, d, a, p) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(0.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -0.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	}
};

/**
 * Back easing: overshooting cubic easing: (s+1)*t^3 - s*t^2.
 * 's' controls the amount of overshoot: higher 's' means greater overshoot
 * 's' has a default value of 1.70158, which produces an overshoot of 10 percent
 * 's'==0 produces cubic easing with no overshoot
 */
EEQ.Back={
	easeIn: function (t, b, c, d, s) {
		if (s == null) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},

	easeOut: function (t, b, c, d, s) {
		if (s == null) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},

	easeInOut: function (t, b, c, d, s) {
		if (s == null) s = 1.70158;
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	}
};

/** Bounce easing: exponentially decaying parabolic bounce */
EEQ.Bounce={
	easeIn: function (t, b, c, d) {
		return c - EEQ.Bounce.easeOut(d-t, 0, c, d) + b;
	},

	easeOut: function (t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
		}
	},

	easeInOut: function (t, b, c, d) {
		if (t < d/2)
			return EEQ.Bounce.easeIn(t*2, 0, c, d) * 0.5 + b;

		return EEQ.Bounce.easeOut(t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
};

/*
 * map easing functions to jQuery, if exists
 * jQuery easing methods will be named as 'EasingClass.easingMethod', for example: 'Bounce.easeIn'
 */
if(window.jQuery){
	if(!jQuery.easing)
		jQuery.easing={};

	jQuery.each(EEQ, function(i, n){
		if(n.constructor == Object){
			jQuery.each(n, function(k, l){
				if(l.constructor == Function){
					var obj={};
					obj[i+'.'+k]=function(){
						return l.apply(l, [].slice.call(arguments, 1));
					};
					jQuery.extend(jQuery.easing, obj);
				}
			});
		}
	});
}
