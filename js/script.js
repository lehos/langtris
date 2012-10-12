//todo вначале все пары

//todo колонка для следующего слова выбирается так: исключаем две самые длинные колонки, и рандомно в остальные

function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

var Langtris = function(){
	var obj = this;

//	TODO учитывать аргументы, переданные в объект
	this.conf = {
		en_dict: "dicts/en.dic",
		ru_dict: "dicts/ru.dic",

		crop: 35,

		fall_column_speed: 150,
		fall_speed: 1000,
		fall_delay: 2000,

		initial_rows_fill: 6,

		wall_selector: "#wall",
		brick_template: "#template-brick",

		wall_row_count: 12,
		wall_column_count: 6,

		brick_w: 160,
		brick_h: 41,

		bottom_init: 505
	};

	this.$wall = $(this.conf.wall_selector);
	this.$brick_template = $(this.conf.brick_template);


	//переменная-помощник для выбора слов, чтоб они не повторялись
	//первый массив - range от нуля до кол-ва слова в словаре
	//второй и третий - номера уже использованных слов
	this.used_words = [[], [], []];

	this.langs = [];

	this.load_dicts();


	// переменная-помощник для выщелкивания слов
	// хранит в себе ссылки на соотв. им объекты
	this.matcher = [];

	this.$pause = $("#pause");
	this.$play = $(".play");
	this.$replay = $("#replay");
	this.$curtain = $("#curtain");

	this.$pause.click(function(){
		obj.pause();
	});

	this.$play.click(function(){
		obj.play();
	});

	this.$replay.click(function(){
		obj.replay();
	});
};

Langtris.prototype = {
	load_dicts: function(){
		var obj = this;

		$.when($.get("dicts/en.dic"), $.get("dicts/ru.dic")).done(function(args1, args2){
			obj.langs.push({
				name: "en",
				dict: args1[0].split("\n")
			});

			obj.langs.push({
				name: "ru",
				dict: args2[0].split("\n")
			});

			//уменьшаю словари
			if (obj.conf.crop != undefined){
				for (var i = 0; i < 2; i++){
					obj.langs[i].dict.splice(obj.conf.crop, obj.langs[i].dict.length - obj.conf.crop);
				}
			}


			//запомниаю длину словаря
			obj.dict_length = obj.langs[0].dict.length;

			obj.used_words[0] = _.range(obj.langs[0].dict.length);

//			console.log("словари загружены");

			// запускаем игру
			obj.init();
		});
	},

	/**
	 * выбираем слово из словаря
	 * @return {object}
	 */
	choose_word: function(){
		var obj = this;
		var lang_id = random(0, 1);
		var lang = this.langs[lang_id];
		var word_id;
		var word;

		var choose_word_body = function(){
			//все слова минус использованные
			var diff = _.difference(obj.used_words[0], obj.used_words[lang_id + 1]);
			//из них выбираю айдишник нового слова
			word_id = diff[random(0, diff.length - 1)];

			//достаю слово из словаря
			word = lang.dict[word_id];

//			console.log(word_id, word, obj.used_words[lang_id + 1], diff);

			//добавляю этот айдишник в использованные
			obj.used_words[lang_id + 1].push(word_id);
		};
		
//		console.log(this.used_words[lang_id + 1].length, this.dict_length);


		// если в этом словаре еще остались неиспользованные слова
		if (this.used_words[lang_id + 1].length < this.dict_length){
			choose_word_body();
		} else {
			// смотрим в другой словарь

			lang_id = Math.abs(lang_id - 1);
			lang = this.langs[lang_id];

			// если в нем что-то есть
			if (this.used_words[lang_id + 1].length < this.dict_length){
				choose_word_body();
			// если нет
			} else {
				this.stop_rain();

				console.log("словари закончились");
			}
		}

		return {
			lang_id: lang_id,
			lang_name: lang.name,
			word_id: word_id,
			word: word
		};
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

		for (i = 0; i < this.conf.initial_rows_fill; i++){
			for (var j = 0; j < this.conf.wall_column_count; j++){
				var b = new Brick(this, $.extend({row: i, column: j}, this.choose_word() ));
//				console.log(b);

				b.init_show();
			}
		}

		this.play();
	},

	// профукали
	loss: function(){
		console.log("loss");
		
		this.stop_rain();
		$(".loss").show();
	},

	pause: function(){
		console.log("pause");

		this.$play.show();
		this.$curtain.show();

		this.stop_rain();
	},

	stop_rain: function(){
		clearInterval(this.rain_interval);
	},

	play: function(){
		console.log("play");

		this.$play.hide();
		this.$curtain.hide();

		var obj = this;
		this.rain_interval = setInterval(function(){
			var b = new Brick(obj, $.extend({}, obj.calc_destination(), obj.choose_word()));
			b.fall();
		}, obj.conf.fall_delay);
	},

	replay: function(){
		console.log("replay");
		
		clearInterval(this.rain_interval);
		this.clear_wall();

		this.init();
	},

	clear_wall: function(){
		console.log("clear_wall");
		
		for (var i = 0; i < this.conf.wall_column_count; i++){
			this.wall[i] = [];
		}

		for (var i = 1; i < 3; i++){
			this.used_words[i].splice(0, this.used_words[i].length);
		}

		this.$wall.html("");
		$(".loss").hide();
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

	// когда выщелкивается слово, другие слова над этим словом в колонке падают вниз
	fall_column: function(column_id){
		// ищем дыру в стене
		var hole;
		for (var i = 0; i < this.wall[column_id].length; i++){
			if (i != this.wall[column_id][i].row){
				hole = i;
				break;
			}
		}

		if (hole != undefined){
			for (var i = hole; i < this.wall[column_id].length; i++){
				var brick = this.wall[column_id][i];
				brick.set_row(i);
				brick.fall({"fall_column": true});
			}
			console.log("в колонке " + column_id + " дыра " + hole);
		}
	}
};


var Brick = function(obj, params){
	this.obj = obj;
	var me = this;

	$.extend(this, params);

	this.id = 0;

	//	координата left кирпичика
	this.left = obj.conf.brick_w * this.column;

	//	Координата bottom кирпичика
	this.bottom_target = obj.conf.brick_h * this.row;
	this.bottom_init = obj.conf.bottom_init;

	// console.log(this);

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
	fall: function(params){
		var speed = (params != undefined && params.fall_column)
			?  this.obj.conf.fall_column_speed
			: this.obj.conf.fall_speed;

		this.elem.animate({bottom: this.bottom_target + "px"}, speed, "linear", function(){
			$(this).addClass("stable");
		});
	},

	set_row: function(row){
		this.row = row;
		this.bottom_target = this.obj.conf.brick_h * this.row;
	},

	pick: function(){
		if (this.elem.hasClass("selected")){
			return false;
		}

		console.log("pick");
//			console.log(this);
		$(".brick.selected." + this.lang_name).removeClass("selected");
		this.select();

		var lang_id = this.lang_id;
		var o_lang_id = Math.abs(lang_id - 1);
		var matcher = this.obj.matcher;

		matcher[lang_id] = this;

		if (matcher[o_lang_id] != undefined){
			// если выбрано слово-перевод
			if (matcher[lang_id].word_id == matcher[o_lang_id].word_id){
//				console.log(this.column, this.obj.wall[this.column]);
				this.remove();
				matcher[o_lang_id].remove();
				matcher.splice(0, 2);
//				console.log(this.column, this.obj.wall[this.column]);

			// если выбраны разные слова
			} else {
				$(".brick.selected").removeClass("selected");
				matcher.splice(0, 2);
			}
		}
	},

	select: function(){
		this.elem.addClass("selected");
	},

	deselect: function(){
		this.elem.removeClass("selected");
	},

	remove: function(){
		console.log("удаляем слово " + this.word);

		var me = this;
		var elem = this.elem;

		var speed = 50;
		var op = 0;

//		this.obj.wall[this.column].splice(this.row, 1);
//		this.elem.animate({opacity: op}, speed, function(){
//			elem.animate({opacity: 1}, speed, function(){
//				elem.animate({opacity: op}, speed, function(){
//					elem.animate({opacity: 1}, speed, function(){
//						elem.animate({opacity: 0}, speed, function(){
//							elem.animate({opacity: 1}, speed, function(){
//								elem.remove();
//								me.obj.wall[me.column].splice(me.row, 1);
//								me.obj.fall_column(me.column);;
//							})
//						})
//					})
//				})
//			})
//		});


		elem.remove();
		me.obj.wall[me.column].splice(me.row, 1);
		me.obj.fall_column(me.column);
	}
};


$(document).ready(function(){
	l = new Langtris();
});
