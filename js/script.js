var Langtris = function(){
	var MAP_ROW_COUNT = 12;
	var MAP_COLUMN_COUNT = 5;

	//TODO: рассчитывать динамически
	var BRICK_W = 143;
	var BRICK_H = 41;

	var $tris = $("#tris");
	var $brick_template = $("#template-brick");

	var me = this;

	me.map = [];
	var elems = "";

	//отсчет координат идёт из нижнего левого угла
	//заполняем массив объектами-кирпичами
	for (var i = 0; i < MAP_ROW_COUNT; i++){
		var row_arr = [];
		for (var j = 0; j < MAP_COLUMN_COUNT; j++){
			row_arr.push({
				state: 0, //поле изначально пустое
				language: "ru",
				word: "пельмень",
				row_number: i + 1,
				column_number: j + 1,
				left: BRICK_W * j,
				bottom: BRICK_H * i
			});

			elems = elems + $brick_template.render({
				left: BRICK_W * j,
				bottom: BRICK_H * i,
				text: "aas",
				lang: "ru"
			});
		}
		me.map.push(row_arr);
	}

	$tris.append(elems);

};

$(document).ready(function(){
	var langtris = new Langtris();
//	console.log(langtris);
});