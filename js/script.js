function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

var Langtris = function(){
	var config = {
		map_row_count: 12,
		map_column_count: 5,

		brick_w: 143,
		brick_h: 41,

		fall_speed: 1000,
		fall_delay: 100,

		initial_rows_fill: 5,

		bottom_init: 505
	};

	var langs = ["en", "ru"];
	var en_dic = ["city", "cucumber", "gloves", "learn", "man", "skin", "spoon", "swim", "razor", "watch"];
	var ru_dic = ["город", "огурец", "перчатки", "учиться", "мужчина", "кожа", "ложка", "плавать", "бритва", "часы"];

	var $wall = $("#wall");
	var $brick_template = $("#template-brick");

	var me = this;

	/**
	 * массив колонок, каждая из которых,
	 * в свою очередь, массив объектов-кирпичиков
	 * @type {Array}
	 */
	var wall = [];

	var brick = function(params){
//		выбираем словарь
		this.lang = langs[random(0, 1)];
		var lang_dic = eval(this.lang + "_dic");

//		выбираем слово
		this.word = lang_dic[random(0, lang_dic.length - 1)];

//		выбираю колонку, в которое будет падать слово
		if (params && params.column != undefined){
			this.column = params.column;
		} else {
			this.column = random(0, config.map_column_count - 1);
		}

//		высчитываю пустое место (номер строки)
		if (params && params.row) {
			this.row = params.row
		} else {
//			если колонка есть (даже пустая)
			if (wall[this.column]){
				this.row = wall[this.column].length;
//			если же колонки нет
			} else {
				wall[this.column] = [];
				this.row = 0;
			}
		}

		this.left = config.brick_w * this.column;

		this.bottom_target = config.brick_h * this.row;
		this.bottom_init = config.bottom_init;

		this.elem = $($($brick_template.render(this)));

		this.elem.click(function(){
			if (!$(this).is(":animated")){
				$(this).toggleClass("selected");
			}
		})

		wall[this.column][this.row] = this;

		$wall.append(this.elem);

		this.init_show = function(){
			this.elem.css({bottom: this.bottom_target + "px"}).addClass("stable");
		};

		this.fall = function(){
			this.elem.animate({bottom: this.bottom_target + "px"}, config.fall_speed, "linear", function(){
				$(this).addClass("stable");
			});
		};

		return this;
	};

	for (var i = 0; i < config.initial_rows_fill; i++){
		for (var j = 0; j < config.map_column_count; j++){
			var b = new brick({
				row: i,
				column: j
			});

			b.init_show();
		}
	}

	var bricks_rain = function(){
		var b = new brick;
		b.fall();
	};


	setInterval(function(){
		bricks_rain()
	}, config.fall_delay);
};

$(document).ready(function(){
	var langtris = new Langtris();
});