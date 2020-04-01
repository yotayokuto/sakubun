$(function(){
    var $mpiw = $('.manuscript_paper_input_wrap');
    $mpiw.append(
        $('<div>').addClass('manuscript_paper_input')
            .attr('contentEditable', 'true')
    ).append(
        $('<div>').addClass('manuscript_paper_view')
    );
    var $mpi = $mpiw.find('.manuscript_paper_input');
    var $mpv = $mpiw.find('.manuscript_paper_view');

    var row_count = 20;
    var col_count = 20;
    var hanging_list = {
        '、': 'hanging_comma',
        '。': 'hanging_period',
    }

    // テスト
    $mpi.text('　昔々、とある国のある城に王さまが住んでいました。王さまはぴっかぴかの新しい服が大好きで、服を買うことばかりにお金を使っていました。王さまののぞむことといったら、いつもきれいな服を着て、みんなにいいなぁと言われることでした。戦いなんてきらいだし、おしばいだって面白くありません。だって、服を着られればそれでいいんですから。新しい服だったらなおさらです。一時間ごとに服を着がえて、みんなに見せびらかすのでした。ふつう、めしつかいに王さまはどこにいるのですか、と聞くと、「王さまは会議室にいらっしゃいます。」と言うものですが、ここの王さまはちがいます。「王さまは衣装いしょう部屋にいらっしゃいます。」と言うのです。');


    updateText();

    $mpv.on('click', function() {
        toggleView(false);
    });
    $mpi.on('focusout', function() {
        updateText();
        toggleView(true);
    });

    function updateText() {
        var html = $mpi.html().replace(/^([^<]+)/g, "<div>$1</div>"); // 最初の列がdivで囲われないので囲う。
        var $html = $(html);
        var $res = $('<div>');

        $html.filter('div').each(function(index) {
            var str = $(this).html();
            var p = /[、。]/g;
            var result, target, indexs = [];

            var count = 0;
            while (result = p.exec(str)) {
                if ((result.index - count) % col_count === 0) {
                    indexs.push(result.index);
                    count++;
                }
            }

            for (var i = indexs.length - 1; i >= 0; i--) {
                target = str[indexs[i]];
                str = strReplace(str, indexs[i], '<span class="' + hanging_list[target] + '">' + target + '</span>');
            }
            $res.append($('<div>' + str + '</div>'));
        });
        $mpv.html($res);
    }

    function toggleView(flag) {
        if (flag) {
            $mpv.css('z-index', '10');
        } else {
            $mpv.css('z-index', '-1');
            $mpi.focus();
        }
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
});
