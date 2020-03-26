$(function(){
    // Dom初期化
    var $mpw = $('.manuscript_paper_wrap');
    $mpw.append(
        $('<div>').addClass('manuscript_paper')
            .append(
                $('<canvas>').addClass('manuscript_paper_background'),
                $('<canvas>').addClass('manuscript_paper_cursor blinking'),
                $('<canvas>').addClass('manuscript_paper_letter')
            )
    );
    $mpw.before($('<div>').addClass('manuscript_paper_button'));
    $mpw.before($('<textarea>').addClass('manuscript_paper_textarea'));

    var $mp = $mpw.find('.manuscript_paper');
    var $mpb = $mp.find('.manuscript_paper_background');
    var $mpl = $mp.find('.manuscript_paper_letter');
    var $mpc = $mp.find('.manuscript_paper_cursor');
    var $mp_t = $('.manuscript_paper_textarea');
    var $mp_b = $('.manuscript_paper_button');


    // 変数セット
    var isIOS = /iP(hone|(o|a)d)/.test(navigator.userAgent);
    var w_o, h_o, w, h, w_i, h_i, cell_h, row_space_center, row_space, point, cursor, cells;
    var row_count = 20;
    var col_count = 20;
    var wrap_space = 0;
    var padding = {'x': 20, 'y': 30};
    var colors = {
        line: '#ffb85a',
        text: '#323232',
        page: '#595959',
        enter: '#e2e2e2',
    };
    var text = {
        page: 0,
        str: '',
        data: [''],
        index: [0]
    };


    // 解像度調整
    drawInit();


    function onDown(e) {
      console.log("down");
    }

    function onUp(e) {
      console.log("up");
    }

    function onClick(e) {
        $mp_t.first().focus();
        $(document).scrollTop($mp.offset().top);

        console.log("click");
        var x = Math.floor((point.ini.x - e.offsetX + cell_h / 2 + row_space) / (cell_h + row_space));
        if (x >= row_count / 2) {
            x = Math.floor((point.ini.x - e.offsetX + cell_h / 2 + row_space - row_space_center) / (cell_h + row_space));
            if (x <= row_count / 2 - 1) x = -1;
        }
        var y = Math.floor((e.offsetY - point.ini.y + cell_h / 2) / cell_h);
        if (0 <= x && x < row_count && 0 <= y && y < col_count) {
            console.log(x + '列');
            console.log(y + '行');
            focusCursor(x, y);
        }
    }

    function onOver(e) {
      console.log("mouseover");
    }

    function onOut() {
      console.log("mouseout");
    }


    $(document).keydown(function(event) {
        if (event.which === 8 || event.which === 46) {
            // １文字削除
            console.log('delete:');
            if (0 <= cursor.i && cursor.i <= cells.arr.length - 1) {
                setTextStr(strDel(getTextStr(), getCountFromCursorI(cursor.i)));

                // 文字がはみ出ている場合
                if (getTextStrLength() > cells.arr.length) {
                    cursor.i--;
                }
                updateText();
            } else if (0 > cursor.i && text.page > 0) {
                // 1ページ前の末尾を削除
                setTextStr(strDel(getTextStr(text.page - 1), getTextStr(text.page - 1).length - 1), text.page - 1);
                updatePage('prev');
            }
        } else if (cursor.move.keys.indexOf(event.key) !== -1) {
            moveCursor(event.key);
        }
    });

    var ime_flg = false;
    $mp_t.on({
        'compositionstart': function() {
            ime_flg = true;
        },
        'compositionend': function() {
            ime_flg = false;
            setTextStr(strIns(getTextStr(), getCountFromCursorI(cursor.i) + 1, $mp_t.val()));
            console.log(getTextStr());
            updateText();
            $mp_t.val('');
        },
        'keydown': function(e) {
            if (!ime_flg && (e.key.length === 1 || e.key === 'Enter')) {
                setTextStr(strIns(getTextStr(), getCountFromCursorI(cursor.i) + 1, (e.key === 'Enter' ? "←" : e.key)));
                updateText();
                $mp_t.val('');
            }
        },
        'focusin': function() {
            $mpl.addClass('focus');
        },
        'focusout': function() {
            $mpl.removeClass('focus');
        },
        'touchend': function() {
            drawInit();
        }
    });

    $(window).on({
        'resize': function() {
            console.log('resize:');
            drawInit();
        }
    });

    $mpl[0].addEventListener('mousedown', onDown, false);
    $mpl[0].addEventListener('mouseup', onUp, false);
    $mpl[0].addEventListener('click', onClick, false);
    $mpl[0].addEventListener('mouseover', onOver, false);
    $mpl[0].addEventListener('mouseout', onOut, false);

    // 背景非表示ボタン
    $mp_b.on('click', function() {
        $(this).toggleClass('hide');
        if ($(this).hasClass('hide')) {
            $mpb.css('opacity', 0);
        } else {
            $mpb.css('opacity', 1);
        }
    });

    function drawInit() {
        $mpb.clearCanvas();

        // 変数セット
        w_o = $mp.width();
        h_o = Math.floor(w_o * 0.8);
        w = w_o - padding.x * 2;
        h = h_o - padding.y * 2;
        w_i = w - wrap_space * 2;
        h_i = h - wrap_space * 2;
        cell_h = h_i / col_count;
        row_space_center = cell_h * 1.2;
        row_space = (w_i - row_space_center - cell_h * row_count) / row_count;
        point = {
            ini: {
                x: w_o - padding.x - wrap_space - row_space - cell_h / 2,
                y: padding.y + wrap_space + cell_h / 2
            }
        };
        cursorInit();
        cells = { arr:[], arr2d: [] };

        // サイズ調整
        $mpb.height(h_o).width(w_o);
        $mpl.height(h_o).width(w_o);
        $mpc.height(h_o).width(w_o);

        // 解像度調整
        resize($mpb[0]);
        resize($mpl[0], $mpb[0]);
        resize($mpc[0], $mpb[0]);
        $mpw.scrollLeft($mpw.width());


        var p = {type: 'line'}, p_c = 2, l_c = 0, pos = {x: 0, y: 0};

        var paths = {
            strokeStyle: colors.line,
            strokeWidth: 1,
            // 外枠
            p1: {
                type: 'line',
                x1: padding.x, y1: padding.y,
                x2: w_o - padding.x, y2: padding.y,
                x3: w_o - padding.x, y3: h_o - padding.y,
                x4: padding.x, y4: h_o - padding.y,
                x5: padding.x, y5: padding.y,
            },
            // 内枠
            p2: {
                type: 'line',
                x1: padding.x + wrap_space, y1: padding.y + wrap_space,
                x2: w_o - padding.x - wrap_space, y2: padding.y + wrap_space,
                x3: w_o - padding.x - wrap_space, y3: h_o - padding.y - wrap_space,
                x4: padding.x + wrap_space, y4: h_o - padding.y - wrap_space,
                x5: padding.x + wrap_space, y5: padding.y + wrap_space,
            },
        };

        pos.x = padding.x + wrap_space;
        pos.y = padding.y + wrap_space;
        for (var i = 0; i < row_count; i++) {
            // 行
            for (var j = 0; j < col_count - 1; j++) {
                p = {type: 'line'};
                p_c++;
                l_c = 0;
                pos.y = pos.y + cell_h

                l_c++;
                p['x' + l_c] = pos.x;
                p['y' + l_c] = pos.y;
                l_c++;
                p['x' + l_c] = pos.x + cell_h;
                p['y' + l_c] = pos.y;

                paths['p' + p_c] = p;
            }
            pos.y = padding.y + wrap_space;

            // 列
            p = {type: 'line'};
            p_c++;
            l_c = 0;
            pos.x = pos.x + cell_h;

            l_c++;
            p['x' + l_c] = pos.x;
            p['y' + l_c] = pos.y;
            l_c++;
            p['x' + l_c] = pos.x;
            p['y' + l_c] = pos.y + h_i;

            paths['p' + p_c] = p;

            if (i == row_count - 1) break;

            // 列間
            p = {type: 'line'};
            p_c++;
            l_c = 0;
            pos.x = pos.x + row_space;

            l_c++;
            p['x' + l_c] = pos.x;
            p['y' + l_c] = pos.y;
            l_c++;
            p['x' + l_c] = pos.x;
            p['y' + l_c] = pos.y + h_i;

            paths['p' + p_c] = p;

            if (i == row_count / 2 - 1) {
                // 中央間
                p = {type: 'line'};
                p_c++;
                l_c = 0;
                pos.x = pos.x + row_space_center;

                l_c++;
                p['x' + l_c] = pos.x;
                p['y' + l_c] = pos.y;
                l_c++;
                p['x' + l_c] = pos.x;
                p['y' + l_c] = pos.y + h_i;

                paths['p' + p_c] = p;
            }
        }
        console.log(paths);
        $mpb.drawPath(paths);

        updateText();
    }

    function resize(canvas, target_canvas) {
        if(target_canvas) {
            canvas.width  = target_canvas.width;
            canvas.height = target_canvas.height;
            return;
        }

        // ブラウザがcanvasを表示しているサイズを調べる。
        var displayWidth  = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;

        // canvasの「描画バッファーのサイズ」と「表示サイズ」が異なるかどうか確認する。
        if (canvas.width  != displayWidth ||
            canvas.height != displayHeight) {

            // サイズが違っていたら、描画バッファーのサイズを
            // 表示サイズと同じサイズに合わせる。
            canvas.width  = displayWidth;
            canvas.height = displayHeight;
        }
    }

    function updateText() {
        console.log("text:" + getTextStr());
        console.log(text);
        $mpl.clearCanvas();

        var count = 0, rotate = 0, center_adj = 0, str = '', match;
        var pos = {
            ini: point.ini,
            cell: {
                x: 0, y: 0
            }
        }
        var limit = Math.min(getTextStr().length, row_count * col_count);
        cells = { arr:[], arr2d: [] };

        for (var i = 0; i < limit; i++) {
            str = getTextStr()[i];

            // 括弧つき数字の場合1文字にまとめる
            if (jQuery.inArray(str, '(（') !== -1) {
                match = getTextStr().slice(i, i + 3).match(/(（|\()\d\d?(\)|）)/)
                if (match) {
                    str = match[0].replace('（', '(').replace('）', ')');
                    i += str.length - 1;
                }

            }

            // 縦書き用に90度回転させる
            rotate = str.length === 1 && jQuery.inArray(str, '()（）[]［］【】「」ー―-') !== -1 ? 90 : 0;

            // 欄外にはみ出して表示させる
            if ((pos.cell.y === col_count
                && jQuery.inArray(str, '。、」') === -1)
                || pos.cell.y > col_count) {
                pos.cell.y = 0;
                pos.cell.x++;

                // 最終列を過ぎていた場合
                if (pos.cell.x > row_count - 1) break;
            }

            // 中央の幅を調整する
            center_adj = pos.cell.x >= col_count / 2 ? row_space_center : 0;

            $mpl.drawText({
                fillStyle: str !== "←" ? colors.text : colors.enter,
                strokeWidth: 1,
                x: pos.ini.x - pos.cell.x * (cell_h + row_space) - center_adj,
                y: pos.ini.y + pos.cell.y * cell_h,
                fontSize: cell_h * (str.length === 1 ? 0.8 : 0.5),
                fromCenter: true,
                fontFamily: 'monospace, serif',
                text: str,
                rotate: rotate
            });
            setCell(pos.cell.x, pos.cell.y, str, i);

            if (str === "←") {
                pos.cell.y = 0;
                pos.cell.x++;

                // 最終列を過ぎていた場合
                if (pos.cell.x > row_count - 1) break;

                continue;
            }

            pos.cell.y++;
            count++;
        }
        console.log(cells);

        updateCursor();

        // updateRuby('あ', 2, 4);
    }

    function setCell(x, y, str, count) {
        if (!cells.arr2d[x]) {
            cells.arr2d[x] = [];
        }
        cells.arr2d[x][y] = { i: cells.arr.length, count: count, str: str };

        // 改行は選択しないため、カーソルが次列に来るように座標をセットする
        if (str === '←') {
            x++;
            y = -1;
        }
        cells.arr.push({ x: x, y: y, str: str });
    }

    function focusCursor(x, y) {
        if (cells.arr.length === 0) return;

        // 最終列より左を選択した場合
        if (!cells.arr2d[x]) {
            x = cells.arr2d.length - 1;
            y = cells.arr2d[x].length - 1;

        // 最終行より下を選択した場合
        } else if (cells.arr2d[x].length - 1 < y) {
            y = cells.arr2d[x].length - 1;
        }

        cursor.trans = cells.arr2d[x][y].i - (cells.arr.length - 1);

        // 末尾が改行の場合は改行の前に合わせる
        if (cells.arr2d[x][y].str === '←') {
            cursor.trans--;
        }
        updateCursor();
    }

    function moveCursor(key) {
        var opt = cursor.move[key];

        if (opt.type == 'y') {
            cursor.trans += opt.add;
            if (cursor.trans > 0) {
                cursor.trans = 0;
            } else if (cursor.trans + cells.arr.length < 0) {
                cursor.trans = cells.arr.length * -1;
            }
        } else {
            var x = cursor.cell.x + opt.add;
            var y = cursor.cell.y;

            console.log('x: ' + x);
            console.log('y: ' + y);

            // ページ遷移が起きる場合
            if (x > row_count - 1 && updatePage('next')) {
                focusCursor(0, y);
                return;
            } else if (x < 0 && updatePage('prev')) {
                focusCursor(row_count - 1, y);
                return;
            }

            // 列がない場合
            if (!cells.arr2d[x]) return;

            // 移動元の文字数分は共通して動かす
            cursor.trans += opt.add * (y + 1);

            // 列を進める場合
            if (opt.add > 0) {
                // 列の途中から移る場合、残りの文字分進める
                cursor.trans += cells.arr2d[cursor.cell.x].length - 1 - y;

                // 移動先の列の方が文字が少ない場合
                if (cells.arr2d[x].length - 1 < y) {
                    cursor.trans -= y - (cells.arr2d[x].length - 1);
                }

                // 移動先末尾が改行の場合
                if (cells.arr2d[x][cells.arr2d[x].length - 1].str === '←') {
                    cursor.trans -= 1;
                }

                // 移動元の列が改行のみの場合
                if (cells.arr2d[cursor.cell.x][0].str === '←') {
                    cursor.trans += 1;
                }

            // 列を戻る場合
            } else if (opt.add < 0) {
                // 移動先の列の方が文字が多い場合
                if (cells.arr2d[x].length - 1 >= y) {
                    cursor.trans -= cells.arr2d[x].length - 1 - y;

                // 移動先末尾が改行の場合
                } else if (cells.arr2d[x][cells.arr2d[x].length - 1].str === '←') {
                    cursor.trans -= 1;
                }
            }
        }
        updateCursor();
    }

    function updateCursor() {
        // カーソル表示をクリア
        $mpc.clearCanvas();

        // カーソルを何文字目に表示するか判定
        cursor.i = getTextStrLength() - 1 + cursor.trans;
        if (cursor.i < 0) {
            cursor.cell.x = 0;
            cursor.cell.y = -1;
        } else {
            if (cursor.i > cells.arr.length - 1) {
                cursor.i = cells.arr.length - 1;
            }
            cursor.cell.x = cells.arr[cursor.i].x;
            cursor.cell.y = cells.arr[cursor.i].y;
        }

        // カーソルが次のページに移動した場合
        if (cursor.cell.x > row_count - 1
            || (getTextStrLength() > cells.arr.length && cursor.cell.x === row_count - 1 && cursor.cell.y === col_count - 1)) {
            updatePage('next');
            return;
        }

        // 中央の幅を調整する
        var center_adj = cursor.cell.x >= col_count / 2 ? row_space_center : 0;

        // カーソル表示の座標を算出
        cursor.x = point.ini.x - cursor.cell.x * (cell_h + row_space) - center_adj - cell_h / 2;
        cursor.y = point.ini.y + cursor.cell.y * cell_h + cell_h / 2;

        $mpc.drawPath({
            strokeStyle: colors.text,
            strokeWidth: 1,

            // カーソル
            p1: {
                type: 'line',
                x1: cursor.x,
                y1: cursor.y,
                x2: cursor.x + cell_h,
                y2: cursor.y,
            },
        });

        // ページ番号
        $mpl.drawText({
            fillStyle: colors.page,
            strokeWidth: 1,
            x: w_o / 2,
            y: h_o - padding.y / 2,
            fontSize: cell_h * 0.7,
            fromCenter: true,
            fontFamily: 'monospace, serif',
            text: '- ' + (text.page + 1) + ' -'
        });

        console.log('cursor.i:' + cursor.i);
        console.log('cursor.trans: ' + cursor.trans);
    }

    function updateRuby(text, x, y) {
        var pos = {
            ini: {
                x: w_o - padding.x - wrap_space - row_space / 2,
                y: padding.y + wrap_space + cell_h / 2
            },
            cell: {
                x: x, y: y
            }
        }

        // 中央の幅を調整する
        var center_adj = pos.cell.x >= col_count / 2 ? row_space_center : 0;

        $mpl.drawText({
            fillStyle: colors.text,
            strokeWidth: 1,
            x: pos.ini.x - pos.cell.x * (cell_h + row_space) - center_adj,
            y: pos.ini.y + pos.cell.y * cell_h,
            fontSize: cell_h * 0.5,
            fromCenter: true,
            fontFamily: 'monospace, serif',
            text: text,
        });
    }

    function updatePage(type) {
        if (type === 'next') {
            var i = getLastCellIndex();
            if (getTextStr().length < i + 1) return false;

            text.index[text.page + 1] = text.index[text.page] + i + 1;
            setTextStr(getTextStr().slice(i + 1), text.page + 1);
            text.page++;
        } else if(type === 'prev' && text.page > 0) {
            text.page--;
        } else {
            return false;
        }
        updateText();
        return true;
    }

    function getLastCellIndex() {
        return cells.arr2d[row_count - 1][cells.arr2d[row_count - 1].length - 1].i;
    }

    function getTextStr(page) {
        page = typeof page === 'undefined' ? text.page : page;
        return text.str.slice(text.index[page]);
    }

    function getTextStrLength(page) {
        page = typeof page === 'undefined' ? text.page : page;
        return getTextStr(page).replace(/\(\d\d?\)/g, '(').length;
    }

    function getTextStrLengthAll(page) {
        page = typeof page === 'undefined' ? text.page : page;
        return getTextStr(page).length;
    }

    function setTextStr(str, page) {
        page = typeof page === 'undefined' ? text.page : page;
        text.str = text.str.slice(0, text.index[page]) + str;
    }

    function getCountFromCursorI(i) {
        return cells.arr.length !== 0
            ? cells.arr2d[cells.arr[i].x][cells.arr[i].y].count
            : 0;
    }

    function cursorInit() {
        cursor = {
            cell: { x: 0, y: 0 },
            trans: 0,
            move: {
                ArrowUp: { type: 'y', add: -1 },
                ArrowDown: { type: 'y', add: 1 },
                ArrowRight: { type: 'x', add: -1 },
                ArrowLeft: { type: 'x', add: 1 }
            },
        };
        cursor.move.keys = Object.keys(cursor.move);
    }

    function strDel(str, idx) {
        return str.slice(0, idx) + str.slice(idx + 1);
    };

    function strIns(str, idx, val){
      return str.slice(0, idx) + val + str.slice(idx);
    };
});
