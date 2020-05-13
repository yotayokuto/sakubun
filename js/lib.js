jQuery(function($){
    var $mpiw = $('.manuscript_paper_input_wrap');

    var text = $mpiw.html();
    $mpiw.html('');

    $mpiw.append(
        $('<div>').addClass('manuscript_paper_input')
            .attr('contentEditable', 'true')
    ).append(
        $('<div>').addClass('manuscript_paper_view')
    ).after(
        $('<div>').addClass('manuscript_paper_page')
            .html($('<p>- <span></span> -</p>'))
    );

    var $mpi = $mpiw.find('.manuscript_paper_input');
    var $mpv = $mpiw.find('.manuscript_paper_view');
    var $mpp = $('.manuscript_paper_page');
    var $mpps = $mpp.find('span');

    var row = {
        width: 32,
        count: 20,
    };
    var col = {
        width: 32,
        count: 20,
    };
    var hanging_list = {
        '、': 'hanging_comma',
        '。': 'hanging_period',
    }
    var enclosed_num_list = {
        "99" : "&#xf100;", "98" : "&#xf101;", "97" : "&#xf102;", "96" : "&#xf103;", "95" : "&#xf104;", "94" : "&#xf105;", "93" : "&#xf106;", "92" : "&#xf107;", "91" : "&#xf108;", "90" : "&#xf109;", "11" : "&#xf10a;", "9" : "&#xf10b;", "89" : "&#xf10c;", "88" : "&#xf10d;", "80" : "&#xf10e;", "81" : "&#xf10f;", "82" : "&#xf110;", "83" : "&#xf111;", "84" : "&#xf112;", "85" : "&#xf113;", "86" : "&#xf114;", "87" : "&#xf115;", "73" : "&#xf116;", "74" : "&#xf117;", "75" : "&#xf118;", "76" : "&#xf119;", "77" : "&#xf11a;", "78" : "&#xf11b;", "79" : "&#xf11c;", "8" : "&#xf11d;", "72" : "&#xf11e;", "71" : "&#xf11f;", "70" : "&#xf120;", "7" : "&#xf121;", "69" : "&#xf122;", "68" : "&#xf123;", "67" : "&#xf124;", "66" : "&#xf125;", "59" : "&#xf126;", "6" : "&#xf127;", "60" : "&#xf128;", "61" : "&#xf129;", "62" : "&#xf12a;", "63" : "&#xf12b;", "64" : "&#xf12c;", "65" : "&#xf12d;", "58" : "&#xf12e;", "57" : "&#xf12f;", "56" : "&#xf130;", "55" : "&#xf131;", "54" : "&#xf132;", "53" : "&#xf133;", "52" : "&#xf134;", "51" : "&#xf135;", "44" : "&#xf136;", "45" : "&#xf137;", "46" : "&#xf138;", "47" : "&#xf139;", "48" : "&#xf13a;", "49" : "&#xf13b;", "5" : "&#xf13c;", "50" : "&#xf13d;", "43" : "&#xf13e;", "42" : "&#xf13f;", "41" : "&#xf140;", "40" : "&#xf141;", "4" : "&#xf142;", "39" : "&#xf143;", "38" : "&#xf144;", "37" : "&#xf145;", "3" : "&#xf146;", "30" : "&#xf147;", "31" : "&#xf148;", "32" : "&#xf149;", "33" : "&#xf14a;", "34" : "&#xf14b;", "35" : "&#xf14c;", "36" : "&#xf14d;", "29" : "&#xf14e;", "28" : "&#xf14f;", "27" : "&#xf150;", "26" : "&#xf151;", "25" : "&#xf152;", "24" : "&#xf153;", "23" : "&#xf154;", "22" : "&#xf155;", "15" : "&#xf156;", "16" : "&#xf157;", "17" : "&#xf158;", "18" : "&#xf159;", "19" : "&#xf15a;", "2" : "&#xf15b;", "20" : "&#xf15c;", "21" : "&#xf15d;", "14" : "&#xf15e;", "13" : "&#xf15f;", "12" : "&#xf160;", "100" : "&#xf161;", "10" : "&#xf162;", "1" : "&#xf163;", "0" : "&#xf164;",
    };
    var toggleFlg = true;
    var auto_save = $mpiw.data('auto_save');
    // $mpiw.after($('<input type="button" class="copyText" value="コピー">'));
    if (auto_save == false) {
        $mpiw.before($('<input type="text" name="emc_title" placeholder="タイトルを入力して下さい。" required>'));
        $mpiw.after($('<input type="button" class="saveText" value="投稿">'));
    }


    // スクロールバー
    $mpiw.after(
        $('<div>').addClass('manuscript_paper_bar_wrap')
            .append(
                $('<div>').addClass('manuscript_paper_bar')
            )
    );
    var $mpbw = $('.manuscript_paper_bar_wrap');
    var $mpb = $mpbw.find('.manuscript_paper_bar');

    // テスト
    $mpi.html(text);


    updateText();
    updatePage($mpv);

    $mpv.on({
        click: function() {
            toggleView(false);
        }
    });
    $mpi.on({
        focusout: function() {
            updateText();
            toggleView(true);
            if(auto_save == true) {
                saveText();
            }
        }
    });
    $('.manuscript_paper_view, .manuscript_paper_input').scroll(function() {
        updatePage($(this));
    });
    $('.manuscript_paper_view, .manuscript_paper_input').on('keyup', function() {
        updatePage($(this));
    });
    $('.saveText').on('click', function() {
        saveText();
    });
    $('.copyText').on('click', function() {
        copyText();
    });

    function updatePage($thisObj) {
        var maxScrollLeft = $thisObj[0].scrollWidth -  $thisObj[0].clientWidth;
        var scrollLeft = $thisObj.scrollLeft();
        $mpps.text(Math.floor((maxScrollLeft - scrollLeft + $thisObj.width() / 2) / (row.count * row.width)) + 1);


        $mpb.width($thisObj[0].scrollWidth);
        console.log(scrollLeft);
        $mpbw.scrollLeft(scrollLeft + 20);

        var barText = '';
        for (var i = 1; i < Math.floor(($thisObj[0].scrollWidth - 20) / 20); i++) {
            if (i % 10 == 0) {
                barText = barText + '<b>' + i + '</b>' + '<br>';
            } else if (i % 5 == 0) {
                barText = barText + i + '<br>';
            } else {
                barText = barText + '<br>';
            }
        }

        $mpb.html(barText);
    }

    function updateText() {
        var html = $mpi.html().replace(/^([^<]+)/g, "<div>$1</div>"); // 最初の列がdivで囲われないので囲う。
        var $html = $(html);
        var res = '';

        // 句読点ぶら下げ
        $html.filter('div').each(function(index) {
            var str = $(this).html();
            var p = /[、。]/g;
            var result, target, indexs = [];

            var count = 0;
            while (result = p.exec(str)) {
                if ((result.index - count) % col.count === 0) {
                    indexs.push(result.index);
                    count++;
                }
            }

            for (var i = indexs.length - 1; i >= 0; i--) {
                target = str[indexs[i]];
                str = strReplace(str, indexs[i], '<span class="' + hanging_list[target] + '">' + target + '</span>');
            }
            res += '<div>' + str + '</div>';
        });

        // 囲い数字
        res = res.replace(/(\(|（)([0-9０-９]{1,2})(\)|）)/g, function() {
            return convertEnclosedNum(arguments[2])
        });
        $mpi.html($mpi.html().replace(/(\(|（)([0-9０-９]{1,2})(\)|）)/g, function() {
            return convertEnclosedNum(arguments[2])
        }));

        $mpv.html(res);
    }

    function saveText() {
        var emc_title = '';
        if (auto_save == false) {
            emc_title = $('[name="emc_title"]').val();
            if (emc_title == '') {
                alert('タイトルが入力されていません。');
                return;
            }
        }

        var formData = new FormData();
        formData.append('emc_sentence', $mpi.html());
        formData.append('emc_s_id', $mpiw.data('s_id'));
        formData.append('emc_title', emc_title);
        formData.append('action' , 'ajaxsavesakubun');

        $.ajax({
            type: 'POST',
            url: ajaxurl,
            data: formData,
            processData: false,
            contentType: false,
            success: function( response ){
                if (response != 'ok' && response != 'no') {
                    location.href = response;
                }
                console.log(response);
                console.log('自動保存が完了しました。');
            },
            error: function( response ){
                console.log(response);
                console.log('自動保存に失敗しました。');
            }
        });
    }

    function copyText() {
        toggleView(false);

        var evt = $.Event('keydown');

        evt.keyCode = 65; // a
        evt.ctrlKey = true;
        $mpi.trigger(evt);

        evt.keyCode = 67; // c
        evt.ctrlKey = true;
        $mpi.trigger(evt);
        alert('コピーしました。');

        toggleView(true);
    }

    function toggleView(flag) {
        if (flag) {
            $mpv.css('z-index', '10');
        } else {
            $mpv.css('z-index', '-1');
            $mpi.focus();
        }
        toggleFlg = flag;
    }

    function strIns(str, idx, val){
        return str.slice(0, idx) + val + str.slice(idx);
    };

    function strDel(str, idx){
        return str.slice(0, idx) + str.slice(idx + 1);
    };

    function strReplace(str, idx, val){
        return str.slice(0, idx) + val + str.slice(idx + 1);
    };

    function hankaku2Zenkaku(str) {
        return str.replace(/[０-９]/g, function(s) {
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
    }

    function convertEnclosedNum(num) {
        return enclosed_num_list[hankaku2Zenkaku(String(num))];
    }
});
