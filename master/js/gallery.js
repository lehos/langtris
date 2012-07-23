/**
 * @author Sergey Chikuyonok (gonarch@design.ru)
 * @copyright Art.Lebedev Studio (http://www.artlebedev.ru)
 */

/**
 * Галерея
 * @param {Element, jQuery} elem Элемент, на основе которого нужно сделать галерею
 */
function Gallery(elem){
	// сохраням указатель на  элемент
	this.ptr = $(elem);

	// позиция анимации в текущий момент.
	this.anim_pos = 0;

	// видны ли элементы галереи
	this.is_visible = false;

	// таймер
	this.timer_id = null;

	// аниматор
	this.tween = null;

	// достаем (jQuery) элементы, из которых сделаем элементы коллекции
	var items = this.ptr.find('li');

	// находим расстояние на круге (длина сегмента), на котором будут отстоять элементы друг от друга
	var segment_len = Math.PI * 2 / items.length;


	var _g_items = [];

	// находим центр композиции, относительно которого будут располагаться элементы галереи
	var origin = {
		x: this.ptr.width() / 2,
		y: this.ptr.height() / 2
	};

	// создаем элементы коллекции
	items.each(function(i){
		_g_items.push(new GalleryItem(this, segment_len * i, origin));
	});

	this.items = _g_items;

	var me = this;

	// вешаем события (jQuery)
	this.ptr.mouseover(function(){ me.onMouseOver(); }).mouseout(function(){ me.onMouseOut(); })
	this.hideTrigger = function(){ me.hide(); };
};

/** Радиус круга */
Gallery.RADIUS = 250;

/** Время анимации (количество кадров) */
Gallery.ANIMATION_TIME = 50;

Gallery.prototype = {
	/**
	 * Показать галерею
	 */
	show: function(){
		// если галерея уже видна — ничего не делаем
		if(this.is_visible)
			return;

		// останавливаем текущую анимацию, если она еще работает
		this.stopAnimation();

		// запускаем анимацию
		this.tween = new Tween(this, '', EEQ.Cubic.easeInOut, this.anim_pos, 1, Gallery.ANIMATION_TIME);
		this.tween.onMotionChanged = this._anim;
		this.is_visible = true;
	},

	/**
	 * Спрятать галерею
	 */
	hide: function(){
		// если галерея уже спрятана — ничего не делаем
		if(!this.is_visible)
			return;

		// останавливаем текущую анимацию, если она еще работает
		this.stopAnimation();

		// запускаем анимацию
		this.tween = new Tween(this, '', EEQ.Cubic.easeInOut, this.anim_pos, 0, Gallery.ANIMATION_TIME);
		this.tween.onMotionChanged = this._anim;
		this.is_visible = false;
	},

	/**
	 * Событие, вызываемое при наведении курсора на галерею
	 */
	onMouseOver: function(){
		clearTimeout(this.timer_id);
	},

	/**
	 * Событие, вызываемое при уходе курсора с галереи
	 */
	onMouseOut: function(){
		this.timer_id = setTimeout(this.hideTrigger, 10);
	},

	/**
	 * Основная анимационная функция. Вызывается из объекта класса Tween
	 * @memberOf {Tween}
	 * @param {Gallery} obj
	 */
	_anim: function(obj){
		// сохранаяем текущую позицию анимации
		obj.anim_pos = this.position;

		// считаем радиус круга, на котором располагаются все элементы
		var radius = Gallery.RADIUS * this.position;

		// считаем угол поворота круга
		var angle = Math.PI * 2  * this.position;

		// размещаем все элементы
		$.each(obj.items, function(i, n){
			this.place(radius, angle);
		});
	},

	/**
	 * Остановить анимацию
	 */
	stopAnimation: function(){
		if(this.tween)
			this.tween.stop();
	}
};

/**
 * Элемент галереи
 * @param {Element. jQuery} elem Указатель на HTML-элемент
 * @param {Number} angle Угол на окружности, где должен стоять элемент (в радианах)
 * @param {Object} origin Центр координат
 */
function GalleryItem(elem, angle, origin){
	// сохраняем ссылку на элемент
	this.ptr = $(elem);

	// сохраняем угол на круге, где располагается элемент
	this.angle = angle;

	// пересчитываем точку отсчета с учетом размера элемента
	this.origin = {
		x: origin.x - this.ptr.width() / 2,
		y: origin.y - this.ptr.height() / 2
	};

	// аниматор
	this.tween = null;

	var me = this;

	// вешаем события
	this.ptr.mouseover(function(){ me.hilite(); }).mouseout(function(){ me.downlite(); });

	// размещаем элемент в точке отсчета
	this.place(0);
};

/** Время анимации (количество кадров) */
GalleryItem.ANIMATION_ITEM = 15;

GalleryItem.prototype = {
	/**
	 * Разместить элемент на окружности
	 * @param {Number} radius Радиус окружности
	 * @param {Number} offset Смещение угла поворота (в радианах)
	 */
	place: function(radius, offset){
		offset = offset || 0;

		// счатаем координаты элемента на круге
		var x = Math.sin(offset + this.angle) * radius;
		var y = Math.cos(offset + this.angle) * radius;

		// размещаем элемент (jQuery)
		this.ptr.css({left: this.origin.x + x, top: this.origin.y + y});
	},


	/**
	 * Подсветить элемент
	 */
	hilite: function(){
		this.stopAnimation();
		this.tween = new Tween(this.ptr, 'background-color', EEQ.linear, '#b1d3fd', '#fdec7f', GalleryItem.ANIMATION_ITEM);
	},

	/**
	 * Убрать подсветку
	 */
	downlite: function(){
		this.stopAnimation();
		this.tween = new Tween(this.ptr, 'background-color', EEQ.linear, '#fdec7f', '#b1d3fd', GalleryItem.ANIMATION_ITEM);
	},

	/**
	 * Остановить анимацию
	 */
	stopAnimation: function(){
		if(this.tween)
			this.tween.stop();
	}
};