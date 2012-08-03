function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

var Langtris = function(){
	var config = {
		map_row_count: 12,
		map_column_count: 5,

		brick_w: 143,
		brick_h: 41,
		brick_init_bottom: 432,

		fall_speed: 4000,
		fall_delay: 1000,

		initial_rows_fill: 2
	};

	var langs = ["en", "ru"];
	var en_dic = ["city", "cucumber", "gloves", "learn", "man", "skin", "spoon", "swim", "razor", "watch"];
	var ru_dic = ["город", "огурец", "перчатки", "учиться", "мужчина", "кожа", "ложка", "плавать", "бритва", "часы"];

	var $wall = $("#tris");
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
		var lang = langs[random(0, 1)];
		var lang_dic = eval(lang + "_dic");

//		выбираем слово
		var word = lang_dic[random(0, lang_dic.length - 1)];

//		выбираю колонку, в которое будет падать слово
		var column;
		if (params.column){
			column = params.column;
		} else {
			column = random(0, config.map_column_count - 1);
		}

//		высчитываю пустое место (номер строки)
		var row;
		if (params.row) {
			row = params.row
		} else {
//			если колонка есть (даже пустая)
			if (wall[column]){
				row = wall[column].length;
//			если же колонки нет
			} else {
				wall[column] = [];
				row = 0;
			}
		}


		var obj = {
			lang: lang,
			word: word,
			row: row,
			column: column,
			left: config.brick_w * column,
			bottom_target: config.brick_h * row,
			// todo вычислять динамически
			bottom_init: config.brick_init_bottom
		};

		obj.elem = $($($brick_template.render(obj)));

		console.log(obj);
		wall[column][row] = obj;

		$wall.append(obj.elem);

		obj.init_show = function(){
			obj.elem.css({bottom: obj.bottom_target + "px"});
		};

//		obj.fall = function(){
//			obj.elem.animate({bottom: obj.bottom_target + "px"}, config.fall_speed, "linear");
//		};

		return obj;
	};

	for (var i = 0; i < config.initial_rows_fill * config.map_row_count; i++){
		for (var j = 0; j < config.map_column_count; j++){
			var b = new brick({
				row: i,
				column: j
			});
			b.init_show();
		}
	}

//	var bricks_rain = function(){
//		var b = new brick;
//		b.init_show();
//	};
//
//	bricks_rain();
//
//	setInterval(function(){
//		bricks_rain()
//	}, config.fall_delay);




};

$(document).ready(function(){
	var langtris = new Langtris();
});