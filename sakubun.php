<?php
/*
  Plugin Name: Sakubun
  Plugin URI:
  Description:  縦書き入力できる原稿用紙機能を追加します。
  Version: 1.0.0
  Author: Sawaguchi Shohei
  Author URI: https://www.lancers.jp/profile/yotayokuto
  License: GPLv2
 */


 class EmcPlugin {

     public $options;

     protected $defaults = array(
         'emc_sentence' => '',
         'plugin-version' => '0.0.0'
     );

     public function __construct() {
         // オプション読み込み
         $this->options = get_option('emcplugin_options', $this->defaults );

         // 設定メニュー
         add_action('admin_menu', array($this, 'add_menu') );
     }

     // 管理画面のサブメニュー追加
     public function add_menu() {
         add_options_page('縦書き入力', '縦書き入力', 'manage_options', 'emc-settings', array($this, 'emc_page_settings') );
     }

     // 設定画面
     public function emc_page_settings() {
         if ( isset($_POST['properties'])) {
             check_admin_referer('emc_options');
             $this->options = $_POST['properties'];
             update_option('emcplugin_options', $this->options);
         }
 ?>
 <div class="wrap">
     <div id="icon-options-general" class="icon32"></div>
     <h2>メイン設定</h2>
     <div id="settings" style="clear:both;">
     </div>
 </div>
 <?php
     }
 }

 $Class_EmcPlugin = new EmcPlugin;


// js, cssファイルを読み込み
function add_my_files() {
    wp_enqueue_style('emcbase-style', plugins_url('css/style.css', __FILE__));
    wp_enqueue_script('emcbase-script', plugins_url('js/lib.js', __FILE__));

    // javascript変数で処理します。

    // $data = get_option('emcplugin_options', [
    //     'emc_sentence' => '',
    //     'plugin-version' => '0.0.0'
    // ]);
    // wp_localize_script('emcbase-script', 'emc_sentence', $data);
}
add_action('wp_enqueue_scripts', 'add_my_files', 9999);


function sakubun_shortcode($atts, $content = '', $tag = '') {
    extract(shortcode_atts([
        's_id' => '',
        'auto_save' => 'true',
    ], $atts));

    // $content = '(1)昔々とある国のある城に王さまが住んでいました。王さまはぴっかぴかの新しい服が大好きで、服を買うことばかりにお金を使っていました。王さまののぞむことといったら、いつもきれいな服を着て、みんなにいいなぁと言われることでした。戦いなんてきらいだし、おしばいだって面白くありません。だって、服を着られればそれでいいんですから。新しい服だったらなおさらです。一時間ごとに服を着がえて、みんなに見せびらかすのでした。ふつう、めしつかいに王さまはどこにいるのですか、と聞くと、「王さまは会議室にいらっしゃいます。」と言うものですが、ここの王さまはちがいます。「王さまは衣装いしょう部屋にいらっしゃいます。」と言うのです。(2)昔々とある国のある城に王さまが住んでいました。王さまはぴっかぴかの新しい服が大好きで、服を買うことばかりにお金を使っていました。王さまののぞむことといったら、いつもきれいな服を着て、みんなにいいなぁと言われることでした。戦いなんてきらいだし、おしばいだって面白くありません。だって、服を着られればそれでいいんですから。新しい服だったらなおさらです。一時間ごとに服を着がえて、みんなに見せびらかすのでした。ふつう、めしつかいに王さまはどこにいるのですか、と聞くと、「王さまは会議室にいらっしゃいます。」と言うものですが、ここの王さまはちがいます。「王さまは衣装いしょう部屋にいらっしゃいます。」と言うのです。(3)昔々とある国のある城に王さまが住んでいました。王さまはぴっかぴかの新しい服が大好きで、服を買うことばかりにお金を使っていました。王さまののぞむことといったら、いつもきれいな服を着て、みんなにいいなぁと言われることでした。戦いなんてきらいだし、おしばいだって面白くありません。だって、服を着られればそれでいいんですから。新しい服だったらなおさらです。一時間ごとに服を着がえて、みんなに見せびらかすのでした。ふつう、めしつかいに王さまはどこにいるのですか、と聞くと、「王さまは会議室にいらっしゃいます。」と言うものですが、ここの王さまはちがいます。「王さまは衣装いしょう部屋にいらっしゃいます。」と言うのです。';

    if ($s_id !== '' && $content === '') {
        $content = get_option('emc_sentence_' . $s_id);
    }

    $output = '<div class="manuscript_paper_input_wrap" data-auto_save="' . $auto_save . '" data-s_id="' . $s_id . '">' . $content . '</div>';

    return $output;
}
add_shortcode('sakubun', 'sakubun_shortcode');


function add_under_content_widget($content){
    return $content.(is_single() && is_singular('post') ? do_shortcode('[sakubun s_id="' . get_the_ID() . '"]') : '');
}
add_filter( 'the_content', 'add_under_content_widget', '10' );


function add_my_ajaxurl() {
?>
    <script>
        var ajaxurl = '<?php echo admin_url( 'admin-ajax.php'); ?>';
    </script>
<?php
}
add_action( 'wp_head', 'add_my_ajaxurl', 1 );


function ajaxSaveSakubun(){
    $result = 'no';
    if(isset($_POST["emc_sentence"]) && isset($_POST["emc_s_id"])){

        // 新規投稿の場合
        $emc_s_id = $_POST["emc_s_id"];
        if ($emc_s_id == '') {
            if (isset($_POST["emc_title"])) {
                $emc_s_id = wp_insert_post([
                    'post_title'    => $_POST["emc_title"],
                    'post_content'  => '',
                    'post_status'   => 'publish'
                ]);
            }

            if (($emc_s_id ?? 0) == 0) {
                echo $result;
                die();
            }
        }

        update_option('emc_sentence_' . $emc_s_id, $_POST["emc_sentence"]);
        $result = $emc_s_id == $_POST["emc_s_id"] ? 'ok' : get_permalink($emc_s_id);
    }

    echo $result;
    die();
}
add_action( 'wp_ajax_ajaxsavesakubun', 'ajaxSaveSakubun' );
add_action( 'wp_ajax_nopriv_ajaxsavesakubun', 'ajaxSaveSakubun' );
?>
