// --allow-file-access-from-files
// alexey-stratan.ftp.narod.ru
// /langtris
// alexey-stratan
// http://alexey-stratan.ftp.narod.ru/langtris/

//todo колонка для следующего слова выбирается так: исключаем две самые длинные колонки, и рандомно в остальные
//todo не показывать последнее слово перед проигрышем

function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

/**
 * вовзаращает случайное число в диапазоне from to исключая указаннные в массиве except
 * @param {number} from
 * @param {number} to
 * @param {Array} except
 * @return {Number}
 */
function random_except(from, to, except){
	var r = random(from, to);
	if (except.indexOf(r) == -1){
		return r;
	} else {
		random_except(from, to, except);
	}
}

function arr_random(arr){
	return arr[random(0, arr.length - 1)];
}

var Langtris = function(){
	var obj = this;

//	TODO учитывать аргументы, переданные в объект
	this.conf = {
		dict: "dicts/en-ru.dic",

		crop: 50,

		fall_column_speed: 150,
		fall_speed: 100,
		fall_delay: 100,

		initial_rows_fill: 9,

		wall_selector: "#wall",
		brick_template: "#template-brick",

		wall_row_count: 12,
		wall_column_count: 6,

		brick_w: 160,
		brick_h: 41,

		bottom_init: 505,

		// количество слов в уровне (в одном словаре)
		level_length: 100
	};

	this.level = 1;

	this.$wall = $(this.conf.wall_selector);
	this.$brick_template = $(this.conf.brick_template);


	//переменная-помощник для выбора слов, чтоб они не повторялись
	//первый массив - range от нуля до кол-ва слова в словаре
	//второй и третий - номера уже использованных слов
	this.used_words = [[], [], []];


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


	// точка входа
	this.load_dicts();
};

Langtris.prototype = {
	load_dicts: function(){
		var obj = this;

//		$.when($.get("dicts/en.dic"), $.get("dicts/ru.dic")).done(function(args1, args2){

		// скачиваю с сервера файл-словарь и формирую из него два массива со словами
		$.get(obj.conf.dict, function(data){
			var raw_dict = data.split("\n");
			var en_dict = [];
			var ru_dict = [];
			for (var i = 0; i < raw_dict.length; i++){
				
				var s = raw_dict[i].split(" | ");
				en_dict.push(s[0]);
				ru_dict.push(s[1]);
			}

			obj.langs = [];
			obj.dicts = [];

			obj.langs.push({
				name: "en",
				dict: en_dict
			});

			obj.langs.push({
				name: "ru",
				dict: ru_dict
			});

			obj.dicts.push({
				name: "en",
				dict: en_dict
			});

			obj.dicts.push({
				name: "ru",
				dict: ru_dict
			});

			//уменьшаю словари (временное явление, до появление уровней)
			if (obj.conf.crop != undefined){
				for (var i = 0; i < 2; i++){
					obj.langs[i].dict.splice(obj.conf.crop, obj.langs[i].dict.length - obj.conf.crop);
				}
			}

			//запоминаю длину словаря
			obj.dict_length = obj.langs[0].dict.length;

			obj.used_words[0] = _.range(obj.langs[0].dict.length);

			console.log("словари загружены");

			// запускаем игру
			obj.init();
		});
	},

	build_level: function(level){

	},

	init: function(){
		console.log("init");

		var obj = this;

		/**
		 * массив колонок, каждая из которых,
		 * в свою очередь, массив объектов Brick
		 * @type {Array}
		 */
		this.wall = [];
		for (var i = 0; i < this.conf.wall_column_count; i++){
			this.wall[i] = [];
		}

		// массив с выпавшими словами, которые уже показвать не надо.
		// сохраняю порядковые номера
		this.chosen_words = [];

		// массив айдишников слов, которые окажутся на игровом поле сразу
		this.initial_pairs = [[], []];

		// заполняю его
		var fill_initial_pairs = function(){
			var initial_pairs = [];

			var unique_random = function(n, l){
				return initial_pairs.indexOf(n) == -1
					? n
					: unique_random(random(0, l), l);
			};

			for (i = 0; i < obj.conf.initial_rows_fill * obj.conf.wall_column_count / 2; i++){
				initial_pairs.push(unique_random(random(0, obj.dict_length - 1), obj.dict_length - 1));
			}

//			obj.initial_pairs = [initial_pairs, initial_pairs];

			for (var i = 0; i < initial_pairs.length; i++){
				obj.initial_pairs[0].push(initial_pairs[i]);
				obj.initial_pairs[1].push(initial_pairs[i]);
			}
		}();



		// половина поля заполняется словами сразу
		for (i = 0; i < this.conf.initial_rows_fill; i++){
			for (var j = 0; j < this.conf.wall_column_count; j++){
				var b = new Brick(this, $.extend({row: i, column: j}, this.choose_word({initial: true}, i, j)));
//				console.log(b);

				b.init_show();
			}
		}

		this.play();
	},


	/**
	 * выбираем слово из словаря
	 * @return {object}
	 */
	choose_word: function(params, ii, jj){
		var obj = this;

		// флаг состояния, тру если для начального заполнения
		var initial = (params != undefined && params.initial) ? true : false;

		var lang_id = random(0, 1);
		var lang = this.langs[lang_id];
		var word_id;
		var word;

		var choose_word = function(){
			if (initial) {
				// если один словарь пуст, берем другой
				if (obj.initial_pairs[lang_id].length == 0) {
					lang_id = Math.abs(lang_id - 1);
					lang = obj.langs[lang_id];
				}

				var z = random(0, obj.initial_pairs[lang_id].length - 1);
				word_id = obj.initial_pairs[lang_id][z];
				obj.initial_pairs[lang_id].splice(z, 1);

//				console.log(jj + 1, ii + 1, z, word_id, lang.dict[word_id]);
//				console.log(obj.initial_pairs[0]);
//				console.log(obj.initial_pairs[1]);
			} else {
				//все слова минус использованные
				var diff = _.difference(obj.used_words[0], obj.used_words[lang_id + 1]);
				//из них выбираю айдишник нового слова
				word_id = diff[random(0, diff.length - 1)];
			}

			//достаю слово из словаря
			word = lang.dict[word_id];
//			console.log(word_id, word, obj.used_words[lang_id + 1], diff);

			//добавляю этот айдишник в использованные
			obj.used_words[lang_id + 1].push(word_id);
		};
		
//		console.log(this.used_words[lang_id + 1].length, this.dict_length);


		// если в этом словаре еще остались неиспользованные слова
		if (this.used_words[lang_id + 1].length < this.dict_length){
			choose_word();
		} else {
			// смотрим в другой словарь
			lang_id = Math.abs(lang_id - 1);
			lang = this.langs[lang_id];

			// если в нем что-то есть
			if (this.used_words[lang_id + 1].length < this.dict_length){
				choose_word();
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


	// игра проиграна
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

		var t = [];
		for (var i = 0; i < obj.conf.wall_column_count; i ++){
			t.push(obj.wall[i].length);
		}
		var tm = Math.max.apply({}, t);
		var t2 = _.without(t, tm);
		var t2m = Math.max.apply({}, t2);
		var t3 = _.without(t2, t2m);

//		console.log(t, t2, t3);

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
						row = obj.wall[i].length;
						return;
					} else {
						if (i == obj.conf.wall_column_count - 1){
							obj.loss();
							return ({loss: true});
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

		this.elem.animate({opacity: op}, speed, function(){
			elem.animate({opacity: 1}, speed, function(){
				elem.animate({opacity: op}, speed, function(){
					elem.animate({opacity: 1}, speed, function(){
						elem.animate({opacity: 0}, speed, function(){
							elem.animate({opacity: 1}, speed, function(){
								elem.remove();
								me.obj.wall[me.column].splice(me.row, 1);
								me.obj.fall_column(me.column);
							})
						})
					})
				})
			})
		});

//		elem.remove();
//		me.obj.wall[me.column].splice(me.row, 1);
//		me.obj.fall_column(me.column);
	}
};


//var func = ( function(){
//	function write(){
//		this.number = 18;
//	}
//
//	var f = function(){
//		this.number = 10;
//
//		write.call( this );
//	}
//
//	var obj = {
//		number2: 10
//	}
//
//	f.prototype = obj;
//
//	return f;
//}() );
//
//var p = new func();


$(document).ready(function(){
	window.langtris = new Langtris();

	$(".level-changer-toggler").click(function(){
		$(".levels").toggle();
	});
});
