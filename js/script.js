function random(from, to){
	return Math.floor(Math.random() * (to - from + 1) + from);
}

var Langtris = function(){
	var config = {
		map_row_count: 12,
		map_column_count: 5,

		brick_w: 143,
		brick_h: 41,

		fall_speed: 4000,
		fall_delay: 100
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

	var bricks_rain = function(){
//		выбираем словарь
		var lang = langs[random(0, 1)];
		var lang_dic = eval(lang + "_dic");

//		выбираем слово
		var word = lang_dic[random(0, lang_dic.length - 1)];

//		выбираю колонку, в которое будет падать слово
		var column = random(0, config.map_column_count - 1);

//		высчитываю пустое место (номер строки)
		var row;
//		если колонка есть (даже пустая)
		if (wall[column]){
			row = wall[column].length;
//		если же колонки нет
		} else {
			wall[column] = [];
			row = 0;
		}

		var obj = {
			lang: lang,
			word: word,
			row: row,
			column: column,
			left: config.brick_w * column,
			bottom: config.brick_h * row
		};

		var $elem = $($brick_template.render({
			lang: lang,
			word: word,
			left: config.brick_w * column,
			bottom: config.brick_h * row
		}));

		obj.dom_elem = $elem;

		wall[column][row] = obj;

		$wall.append($elem);

		setTimeout(function(){
			$elem.animate({bottom:"0px"}, config.fall_speed, function(){console.log("end");});
		}, 100);
	};

	bricks_rain();
	setInterval(function(){
		bricks_rain()
	}, config.fall_delay);

//	//карта областей
//	for (var i = 0; i < config.map_row_count; i++){
//		var row_arr = [];
//		for (var j = 0; j < config.map_column_count; j++){
//			row_arr.push({
//				lang: "",
//				word: "",
//				row_number: i,
//				column_number: j
//			});
//		}
//		me.map.push(row_arr);
//	}

	/**
	 * создание кирпичика
	 * @param {object} params
	 * @config {string} [lang]
	 * @config {string} [word]
	 * @config {int} [row] row number, 1-based, counts from bottom
	 * @config {int} [column] column number, 1-based
	 */
	var brick_create = function(params){
		var elem_html = $brick_template.render(params);

		params["html"] = elem_html;

		return params;
	};

	/**
	 * кирпичик падает
	 * @param {object} params
	 * @config {string} [lang]
	 * @config {string} [word]
	 * @config {int} [row] row number, 1-based, counts from bottom
	 * @config {int} [column] column number, 1-based
	 */
	var brick_fall = function(params){
		var $elem = brick_create(params.html);

		$tris.append($elem);


		$elem.animate({bottom:"0px"}, config.fall_speed);
	};


//
//	var fall_timeout;
//
//	var init = function(){
//		var params = {
//
//		};
//		var fall = setInterval(brick_fall(params), config.fall_delay);
//	};
//
//	brick_fall({
//		lang: "en",
//		word: "city",
//		row: 0,
//		column: 1
//	});

//	$tris.append(elems);
};

$(document).ready(function(){
	var langtris = new Langtris();
});