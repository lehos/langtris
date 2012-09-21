function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

var Langtris = function(params){
	var obj = this;

//	TODO учитывать аргументы, переданные в объект
	this.conf = {
		wall_selector: "#wall",
		brick_template: "#template-brick",
		
		wall_row_count: 12,
		wall_column_count: 6,

		brick_w: 160,
		brick_h: 41,

		fall_speed: 1000,
		fall_delay: 500,

		initial_rows_fill: 3,

		bottom_init: 505
	};

	this.$wall = $(this.conf.wall_selector);
	this.$brick_template = $(this.conf.brick_template);

	this.langs = ["en", "ru"];
	this.en_dic = ["city", "cucumber", "gloves", "learn", "man", "skin", "spoon", "swim", "razor", "watch", "april",
		"august", "december", "february", "friday", "january", "july", "june", "monday", "november", "october",
		"saturday", "september", "sunday", "thursday", "tuesday", "wednesday"];
	this.ru_dic = ["город", "огурец", "перчатки", "учиться", "мужчина", "кожа", "ложка", "плавать", "бритва", "часы",
		"апрель", "август", "декабрь", "февраль", "пятница", "январь", "июль", "июнь", "понедельник", "ноябрь",
		"октябрь", "суббота", "сентябрь", "воскресенье", "четверг", "вторник", "среда"];


	this.matcher = {};

	this.init();

	var $pause = $("#toolbar .pause");
	var $play = $(".play");
	var $replay = $("#toolbar .replay");
	var $curtain = $("#curtain");

	$pause.click(function(){
		$play.show();
		$curtain.show();
		obj.pause();
	});

	$play.click(function(){
		$play.hide();
		$curtain.hide();
		obj.play();
	});

	$replay.click(function(){
		obj.replay();
	});
};

Langtris.prototype = {
	// профукали
	loss: function(){
		console.log("loss");
		
		clearInterval(this.rain);
		$(".loss").show();
	},

	pause: function(){
		console.log("pause");
		
		clearInterval(this.rain);
	},

	play: function(){
		console.log("play");
		
		var obj = this;
		this.rain = setInterval(function(){
			var b = new Brick(obj, $.extend({}, obj.calc_destination(), obj.choose_word()));
			b.fall();
		}, obj.conf.fall_delay);
	},

	replay: function(){
		console.log("replay");
		
		clearInterval(this.rain);
		this.clear_wall();
		this.init();
	},

	clear_wall: function(){
		console.log("clear_wall");
		
		for (var i = 0; i < this.conf.wall_column_count; i++){
			this.wall[i] = [];
		}
		this.$wall.html("");
		$(".loss").hide();
	},

	init: function(){
		console.log("init");
		
		/**
		 * массив колонок, каждая из которых,
		 * в свою очередь, массив объектов-кирпичиков
		 * @type {Array}
		 */
		this.wall = [];
		for (var i = 0; i < this.conf.wall_column_count; i++){
			this.wall[i] = [];
		}

		// массив с выпавшими словами, которые уже показвать не надо
		// сохраняю порядковые номера
		this.chosen_words = [];

		for (var i = 0; i < this.conf.initial_rows_fill; i++){
			for (var j = 0; j < this.conf.wall_column_count; j++){
				var b = new Brick(this, {
					row: i,
					column: j,
					lang: this.choose_word().lang,
					word: this.choose_word().word
				});

				b.init_show();
			}
		}

		this.play();
	},

	// расчитываем колонку и строку, где должен оказаться кирипич
	// параллельно ловим проигрыш уровня
	calc_destination: function(){
		var obj = this,
			column,
			row,
			loss = false;

		column = random(0, this.conf.wall_column_count - 1);

		// если если еще есть куда падать в этой колонке
		if (this.wall[column].length < this.conf.wall_row_count){
			row = this.wall[column].length;

		// места в этой колонке нет, ищем другую
		} else {
			var find_column = function(){
//				c = column + 1;
				// TODO сделать через random
				for (var i = 0; i < obj.conf.wall_column_count; i++){
					if (obj.wall[i].length < obj.conf.wall_row_count){
						column = i;
//						console.log("хотел упасть на " + c + " проход " + i, obj.wall[i].length);
						return;
					} else {
						if (i == obj.conf.wall_column_count - 1){
//							console.log("хотел упасть на " + c + " проход " + i);
							obj.loss();
						}
					}
				}
			};

			find_column();
		}

		return {column: column, row: row}
	},

	choose_word: function(){
		var r = {};
		var lang_n = random(0, 1);
		r.lang = this.langs[lang_n];
		var lang_dic = this[r.lang + "_dic"];

		if (lang_dic.length > 0) {
			var n = random(0, lang_dic.length - 1);

			//	выбираем слово из словаря
			r.word = lang_dic[n];

			//удаляем это слово из массива
			lang_dic.splice(n, 1);
		} else {
			console.log("словарь " + r.lang + " кончился, пробую другой");

			// берем другой словарь
			r.lang = this.langs[Math.abs(lang_n - 1)];
			lang_dic = this[r.lang + "_dic"];

//			console.log(r.lang, lang_dic);

			if (lang_dic.length > 0) {
				console.log("ok, в другом словаре еще что-то есть");
				var n = random(0, lang_dic.length - 1);

				//	выбираем слово из словаря
				r.word = lang_dic[n];

				//удаляем это слово из массива
				lang_dic.splice(n, 1);
			} else {
				console.log("все словари кончились, пока");

				this.loss();

				return
			}
		}

		return r;
	},

	match_words: function(){

	}
};


var Brick = function(obj, params){
	this.langtris = obj;
	var me = this;


//	$.extend(this, params);
	this.lang = params.lang;
	this.word = params.word;
	this.column = params.column;
	this.row = params.row;


	//	координата left кирпичика
	this.left = obj.conf.brick_w * this.column;

	//	Координата bottom кирпичика
	this.bottom_target = obj.conf.brick_h * this.row;
	this.bottom_init = obj.conf.bottom_init;

	console.log(this);
	//	рендерим кирпичик
	this.elem = $($(obj.$brick_template.render(this)));

	//	обрабатываем клик на кирпич
	this.elem.bind("click", function(){
		me.pick();
	});

	obj.wall[this.column][this.row] = this;

	//	добавляем кирпич на стену
	obj.$wall.append(this.elem);

	return this;
};


Brick.prototype = {
//	кирпичик сразу появляется на своем месте в начале уровня
	init_show: function(){
		this.elem.css({bottom: this.bottom_target + "px"}).addClass("stable");
	},

//	падение кубика на свободное место
	fall: function(){
		this.elem.animate({bottom: this.bottom_target + "px"}, this.langtris.conf.fall_speed, "linear", function(){
			$(this).addClass("stable");
		});
	},

	pick: function(){
		console.log("pick");
		if (!this.elem.hasClass("selected")){
			$(".brick.selected." + this.lang).removeClass("selected");
			this.elem.addClass("selected");
			this.langtris.matcher[this.lang] = this.word;
			console.log(this.langtris.matcher);
		}

	}
};


$(document).ready(function(){
	l = new Langtris();
});
