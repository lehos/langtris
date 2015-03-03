$traceurRuntime.options.symbols = true;
System.registerModule("../../js/script.js", [], function(require) {
  "use strict";
  var __moduleName = "../../js/script.js";
  var Langtris = function() {
    var obj = this;
    this.conf = {
      dict: 'dicts/en-ru.dic',
      fall_column_speed: 150,
      fall_speed: 1000,
      fall_delay: 2000,
      initial_rows_fill: 6,
      wall_selector: '#wall',
      brick_template: '#template-brick',
      wall_row_count: 12,
      wall_column_count: 4,
      brick_w: 176,
      brick_h: 41,
      bottom_init: 505,
      max_level: 100,
      level_length: 100,
      level: 1,
      levels_complete: 20
    };
    this.level = this.conf.level;
    obj.debug = true;
    if (obj.debug = true) {
      for (var item in this.conf)
        if (!$traceurRuntime.isSymbolString(item)) {
          $('.debug-' + item).val(this.conf[$traceurRuntime.toProperty(item)]);
        }
      var change_conf = function() {
        $('.debug input:text').each(function() {
          var prop = $(this).attr('class').substr(6);
          obj.conf[$traceurRuntime.toProperty(prop)] = $(this).val();
        });
        obj.start_new_level();
      };
      $('.debug').submit(function() {
        change_conf();
        return false;
      });
    }
    this.$wall = $(this.conf.wall_selector);
    this.$brick_template = $(this.conf.brick_template);
    this.matcher = [];
    this.$pause = $('#pause');
    this.$play = $('.play');
    this.$replay = $('#replay');
    this.$curtain = $('#curtain');
    this.$pause.click(function() {
      obj.pause();
    });
    this.$play.click(function() {
      obj.start_rain();
    });
    this.$replay.click(function() {
      obj.start_new_level();
    });
    this.$levels = $('.levels');
    this.$level_current = $('.level-current');
    for (var i = 1; i <= this.conf.max_level; i++) {
      var cls = (i <= this.conf.levels_complete) ? '' : 'disabled';
      this.$levels.append('<span class=\'levels-item level-' + i + ' ' + cls + '\' data-level=\'' + i + '\'>' + i + '</span>');
    }
    this.$levels.find('.levels-item').click(function() {
      var $me = $(this);
      if (!$me.hasClass('disabled') && !$me.hasClass('current')) {
        obj.level = $me.data('level');
        obj.start_new_level();
        obj.$levels.hide();
      }
    });
    this.load_dicts();
  };
  Langtris.prototype = {
    load_dicts: function() {
      var obj = this;
      $.get(obj.conf.dict, function(data) {
        var raw_dict = data.split('\n');
        var en_dict = [];
        var ru_dict = [];
        for (var i = 0; i < raw_dict.length; i++) {
          var s = raw_dict[$traceurRuntime.toProperty(i)].split(' | ');
          en_dict.push(s[0]);
          ru_dict.push(s[1]);
        }
        obj.dicts = [];
        obj.level_dicts = [];
        obj.dicts.push({
          name: 'en',
          dict: en_dict
        });
        obj.dicts.push({
          name: 'ru',
          dict: ru_dict
        });
        obj.dict_length = obj.dicts[0].dict.length;
        console.log('словари загружены');
        obj.init_level();
      });
    },
    build_level_dicts: function() {
      console.log('build_level_dicts');
      var obj = this;
      var level = obj.level - 1;
      var n = obj.dict_length;
      var n1 = Math.floor(n / 3);
      var n2 = n1 * 2;
      var n3 = n1 * 3;
      var k = obj.conf.max_level;
      var l = obj.conf.level_length;
      var l1;
      var l2;
      var l3;
      if (level <= l / 2) {
        l1 = Math.round(l * (1 - 2 * level / k));
        l2 = Math.round(2 * l * level / k);
        l3 = 0;
      } else {
        l1 = 0;
        l2 = Math.round(2 * l * (1 - level / k));
        l3 = Math.round(l * (2 * level / k - 1));
      }
      var en_dict = [];
      var ru_dict = [];
      var used = [];
      var r = 0;
      for (var i = 0; i < l1; i++) {
        r = Langtris.utils.random_except(0, n1, used);
        if (r == undefined) {
          r = Langtris.utils.random_except(0, n1, used);
          if (r == undefined) {
            r = Langtris.utils.random_except(0, n1, used);
            if (r == undefined) {
              r = Langtris.utils.random_except(0, n1, used);
              console.log('todo: починить эту херь!!!');
            }
          }
        }
        used.push(r);
        en_dict.push(obj.dicts[0].dict[$traceurRuntime.toProperty(r)]);
        ru_dict.push(obj.dicts[1].dict[$traceurRuntime.toProperty(r)]);
      }
      used = [];
      for (var i = 0; i < l2; i++) {
        r = Langtris.utils.random_except(n1, n2, used);
        if (r == undefined) {
          r = Langtris.utils.random_except(n1, n2, used);
          if (r == undefined) {
            r = Langtris.utils.random_except(n1, n2, used);
            if (r == undefined) {
              r = Langtris.utils.random_except(n1, n2, used);
              console.log('todo: починить эту херь!!!');
            }
          }
        }
        used.push(r);
        en_dict.push(obj.dicts[0].dict[$traceurRuntime.toProperty(r)]);
        ru_dict.push(obj.dicts[1].dict[$traceurRuntime.toProperty(r)]);
      }
      used = [];
      for (var i = 0; i < l3; i++) {
        console.log(3);
        r = Langtris.utils.random_except(n2, n3, used);
        if (r == undefined) {
          r = Langtris.utils.random_except(n2, n3, used);
          if (r == undefined) {
            r = Langtris.utils.random_except(n2, n3, used);
            if (r == undefined) {
              r = Langtris.utils.random_except(n2, n3, used);
              console.log('todo: починить эту херь!!!');
            }
          }
        }
        used.push(r);
        en_dict.push(obj.dicts[0].dict[$traceurRuntime.toProperty(r)]);
        ru_dict.push(obj.dicts[1].dict[$traceurRuntime.toProperty(r)]);
      }
      obj.level_dicts[0] = {
        name: 'en',
        dict: en_dict
      };
      obj.level_dicts[1] = {
        name: 'ru',
        dict: ru_dict
      };
    },
    init_level: function() {
      console.log('init level ' + this.level);
      var obj = this;
      obj.build_level_dicts();
      obj.used_words = [[], [], []];
      obj.used_words[0] = _.range(obj.conf.level_length);
      obj.$levels.find('.current').removeClass('current');
      obj.$levels.find('.level-' + obj.level).removeClass('disabled').addClass('current');
      obj.$level_current.text(obj.level);
      this.wall = [];
      for (var i = 0; i < this.conf.wall_column_count; i++) {
        this.wall[$traceurRuntime.toProperty(i)] = [];
      }
      this.chosen_words = [];
      this.initial_pairs = [[], []];
      var fill_initial_pairs = (function() {
        var initial_pairs = [];
        var unique_random = $traceurRuntime.initTailRecursiveFunction(function(n, l) {
          return $traceurRuntime.call(function(n, l) {
            return initial_pairs.indexOf(n) == -1 ? n : $traceurRuntime.continuation(unique_random, null, [Langtris.utils.random(0, l), l]);
          }, this, arguments);
        });
        for (i = 0; i < obj.conf.initial_rows_fill * obj.conf.wall_column_count / 2; i++) {
          initial_pairs.push(unique_random(Langtris.utils.random(0, obj.conf.level_length - 1), obj.conf.level_length - 1));
        }
        for (var i = 0; i < initial_pairs.length; i++) {
          obj.initial_pairs[0].push(initial_pairs[$traceurRuntime.toProperty(i)]);
          obj.initial_pairs[1].push(initial_pairs[$traceurRuntime.toProperty(i)]);
        }
      })();
      for (i = 0; i < this.conf.initial_rows_fill; i++) {
        for (var j = 0; j < this.conf.wall_column_count; j++) {
          var b = new Langtris.Brick(this, $.extend({
            row: i,
            column: j
          }, this.choose_word({initial: true}, i, j)));
          b.init_show();
        }
      }
      this.start_rain();
    },
    choose_word: function(params) {
      var obj = this;
      var initial = (params != undefined && params.initial) ? true : false;
      var lang_id = Langtris.utils.random(0, 1);
      var lang = this.level_dicts[$traceurRuntime.toProperty(lang_id)];
      var word_id;
      var word;
      var choose_word = function() {
        if (initial) {
          if (obj.initial_pairs[$traceurRuntime.toProperty(lang_id)].length == 0) {
            lang_id = Math.abs(lang_id - 1);
            lang = obj.level_dicts[$traceurRuntime.toProperty(lang_id)];
          }
          var z = Langtris.utils.random(0, obj.initial_pairs[$traceurRuntime.toProperty(lang_id)].length - 1);
          word_id = obj.initial_pairs[$traceurRuntime.toProperty(lang_id)][$traceurRuntime.toProperty(z)];
          obj.initial_pairs[$traceurRuntime.toProperty(lang_id)].splice(z, 1);
        } else {
          var diff = _.difference(obj.used_words[0], obj.used_words[$traceurRuntime.toProperty(lang_id + 1)]);
          word_id = diff[$traceurRuntime.toProperty(Langtris.utils.random(0, diff.length - 1))];
        }
        word = lang.dict[$traceurRuntime.toProperty(word_id)];
        obj.used_words[$traceurRuntime.toProperty(lang_id + 1)].push(word_id);
      };
      if (this.used_words[$traceurRuntime.toProperty(lang_id + 1)].length < this.conf.level_length) {
        choose_word();
      } else {
        lang_id = Math.abs(lang_id - 1);
        lang = this.level_dicts[$traceurRuntime.toProperty(lang_id)];
        if (this.used_words[$traceurRuntime.toProperty(lang_id + 1)].length < this.conf.level_length) {
          choose_word();
        } else {
          this.stop_rain();
          console.log('словари в уровне закончились');
        }
      }
      return {
        lang_id: lang_id,
        lang_name: lang.name,
        word_id: word_id,
        word: word
      };
    },
    start_rain: function() {
      console.log('play');
      this.$play.hide();
      this.$curtain.hide();
      var obj = this;
      this.rain_interval = setInterval(function() {
        var word = obj.choose_word();
        if (word.word != undefined) {
          var b = new Langtris.Brick(obj, $.extend({}, obj.calc_destination(), word));
          b.fall();
        }
      }, obj.conf.fall_delay);
    },
    stop_rain: function() {
      clearInterval(this.rain_interval);
    },
    pause: function() {
      console.log('pause');
      this.$play.show();
      this.$curtain.show();
      this.stop_rain();
    },
    loss: function() {
      console.log('loss');
      this.stop_rain();
      $('.loss').show();
    },
    check_level_complete: function() {
      var obj = this;
      var flag = true;
      for (var i = 0; i < this.wall.length; i++) {
        if (this.wall[$traceurRuntime.toProperty(i)].length != 0) {
          flag = false;
        }
      }
      if (flag) {
        console.log('слова закончились, уровень пройден');
        $('.level-complete').show().animate({opacity: 0}, 4000, function() {
          $(this).hide();
          obj.level++;
          obj.start_new_level();
        });
      }
    },
    start_new_level: function() {
      console.log('start_new_level');
      clearInterval(this.rain_interval);
      this.clear_wall();
      this.init_level();
    },
    clear_wall: function() {
      console.log('clear_wall');
      for (var i = 0; i < this.conf.wall_column_count; i++) {
        this.wall[$traceurRuntime.toProperty(i)] = [];
      }
      for (var i = 1; i < 3; i++) {
        this.used_words[$traceurRuntime.toProperty(i)].splice(0, this.used_words[$traceurRuntime.toProperty(i)].length);
      }
      this.$wall.html('');
      $('.loss').hide();
    },
    calc_destination: function() {
      var obj = this;
      var column;
      var row;
      var loss = false;
      var len_arr = [];
      for (var i = 0; i < obj.wall.length; i++) {
        len_arr.push(obj.wall[$traceurRuntime.toProperty(i)].length);
      }
      var min = Math.min.apply(Math, len_arr);
      var max = Math.max.apply(Math, len_arr);
      if (min == max) {
        column = Langtris.utils.random(0, this.conf.wall_column_count - 1);
      } else {
        var min_indexes = [];
        for (var i = 0; i < len_arr.length; i++) {
          if (len_arr[$traceurRuntime.toProperty(i)] != max) {
            min_indexes.push(i);
          }
        }
        column = Langtris.utils.random_arr(min_indexes);
      }
      row = obj.wall[$traceurRuntime.toProperty(column)].length;
      if (row == obj.conf.wall_row_count - 1) {
        obj.loss();
      }
      return {
        column: column,
        row: row
      };
    },
    fall_column: function(column_id) {
      var hole;
      for (var i = 0; i < this.wall[$traceurRuntime.toProperty(column_id)].length; i++) {
        if (i != this.wall[$traceurRuntime.toProperty(column_id)][$traceurRuntime.toProperty(i)].row) {
          hole = i;
          break;
        }
      }
      if (hole != undefined) {
        for (var i = hole; i < this.wall[$traceurRuntime.toProperty(column_id)].length; i++) {
          var brick = this.wall[$traceurRuntime.toProperty(column_id)][$traceurRuntime.toProperty(i)];
          brick.set_row(i);
          brick.fall({fall_column: true});
        }
        console.log('в колонке ' + column_id + ' дыра ' + hole);
      }
    }
  };
  Langtris.Brick = function(obj, params) {
    this.obj = obj;
    var me = this;
    $.extend(this, params);
    this.id = 0;
    this.left = obj.conf.brick_w * this.column;
    this.bottom_target = obj.conf.brick_h * this.row;
    this.bottom_init = obj.conf.bottom_init;
    this.elem = $($(obj.$brick_template.render(this)));
    this.elem.bind('click', function() {
      me.pick();
    });
    obj.wall[$traceurRuntime.toProperty(this.column)][$traceurRuntime.toProperty(this.row)] = this;
    obj.$wall.append(this.elem);
    return this;
  };
  Langtris.Brick.prototype = {
    init_show: function() {
      this.elem.css({bottom: this.bottom_target + 'px'}).addClass('stable');
    },
    fall: function(params) {
      var speed = (params != undefined && params.fall_column) ? this.obj.conf.fall_column_speed : this.obj.conf.fall_speed;
      this.elem.animate({bottom: this.bottom_target + 'px'}, speed * 1, 'linear', function() {
        $(this).addClass('stable');
      });
    },
    set_row: function(row) {
      this.row = row;
      this.bottom_target = this.obj.conf.brick_h * this.row;
    },
    pick: function() {
      if (this.elem.hasClass('selected')) {
        return false;
      }
      console.log('pick');
      $('.brick.selected.' + this.lang_name).removeClass('selected');
      this.select();
      var lang_id = this.lang_id;
      var o_lang_id = Math.abs(lang_id - 1);
      var matcher = this.obj.matcher;
      matcher[$traceurRuntime.toProperty(lang_id)] = this;
      if (matcher[$traceurRuntime.toProperty(o_lang_id)] != undefined) {
        if (matcher[$traceurRuntime.toProperty(lang_id)].word_id == matcher[$traceurRuntime.toProperty(o_lang_id)].word_id) {
          this.remove();
          matcher[$traceurRuntime.toProperty(o_lang_id)].remove();
          matcher.splice(0, 2);
          this.obj.check_level_complete();
        } else {
          $('.brick.selected').removeClass('selected');
          matcher.splice(0, 2);
        }
      }
    },
    select: function() {
      this.elem.addClass('selected');
    },
    deselect: function() {
      this.elem.removeClass('selected');
    },
    remove: function() {
      console.log('удаляем слово ' + this.word);
      var me = this;
      var elem = this.elem;
      var speed = 100;
      this.elem.animate({
        height: 0,
        opacity: 0
      }, speed, function() {
        elem.remove();
      });
      me.obj.wall[$traceurRuntime.toProperty(me.column)].splice(me.row, 1);
      me.obj.fall_column(me.column);
    }
  };
  Langtris.utils = {
    random: $traceurRuntime.initTailRecursiveFunction(function(from, to) {
      return $traceurRuntime.call(function(from, to) {
        return $traceurRuntime.continuation(Math.floor, Math, [Math.random() * (to - from + 1) + from]);
      }, this, arguments);
    }),
    random_except: function(from, to, except) {
      var r = Langtris.utils.random(from, to);
      if (except.indexOf(r) == -1) {
        return r;
      } else {
        Langtris.utils.random_except(from, to, except);
      }
    },
    random_arr: function(arr) {
      return arr[$traceurRuntime.toProperty(Langtris.utils.random(0, arr.length - 1))];
    }
  };
  $(document).ready(function() {
    window.langtris = new Langtris();
    $('.level-changer-toggler').click(function() {
      $('.levels').toggle();
    });
  });
  return {};
});
System.get("../../js/script.js" + '');
