<?php
/**
 * Plugin Name:     WooCommerce Variations with Radio Buttons
 * Description:     Changes the Woocoomerce Variations to use Radio Buttons instead of Select/Options
 * Author:          essenmitsosse
 * Version:         1.0.0
 * Author URI:      http://essenmitsosse.de
 * Text Domain:     woocommerce-variations-with-radio-buttons
 * Upgrade Check:   none
 * Last Change:     15.08.2015 14:00
 */

if ( ! defined( "ABSPATH" ) ) {
	exit; // Exit if accessed directly
}

class Woocommerce_Variations_With_Radio_Buttons {

	/**
     * Plugin version
     * @var string
     */
    static public $version = "1.0.0";

	/**
     * Singleton object holder
     * @var mixed
     */
    static private $instance = NULL;

	public function __construct() {
		add_filter( "woocommerce_locate_template", 			array( "Woocommerce_Variations_With_Radio_Buttons", "add_woocommerce_templates" ), 10, 3 );
		add_filter( "woocommerce_ajax_variation_threshold", array( "Woocommerce_Variations_With_Radio_Buttons", "infinite_wc_ajax_variation_threshold" ), 10, 2 );
		add_action( "wp_enqueue_scripts", 					array( "Woocommerce_Variations_With_Radio_Buttons", "add_scripts" ), 20 );
		
		// Shows price, even min and max price are the same (by default price wouldn’t be added to the product variation info)
		add_filter( "woocommerce_show_variation_price",     array( "Woocommerce_Variations_With_Radio_Buttons", "always_show_price" ), 100 );

		// Check if variable product and change order in hook
		add_action( "woocommerce_before_single_product",    array( "Woocommerce_Variations_With_Radio_Buttons", "check_hook_order" ), 1 );
	}

	/**
	* Creates an Instance of this Class
	*
	* @access public
	* @since 1.0.0
	* @return Woocommerce_Variations_With_Radio_Buttons
	*/
	public static function get_instance() {

		if ( NULL === self::$instance )
			self::$instance = new self;

		return self::$instance;
	}

	public static function add_woocommerce_templates( $template, $template_name, $template_path ){
		
		// Only check if the template is changed by this plugin
		if ( $template_name == "single-product/add-to-cart/variable.php" ) {
			$path = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . "templates" . DIRECTORY_SEPARATOR . "woocommerce" . DIRECTORY_SEPARATOR;
		
			// Only load our templates if they are nonexistent in the theme
			if( file_exists( $path . $template_name ) && ! locate_template( array( WC()->template_path() . $template_name ) ) ) {
				$template = $path . $template_name;
			}
		}

		return $template;
	}

	public static function add_scripts() {
		$suffix = ( defined( "SCRIPT_DEBUG" ) && SCRIPT_DEBUG ) ? "" : ".min";

		// handles the variation selection of products, is replaced by add-to-cart-variation-with-radio
		wp_deregister_script( "wc-add-to-cart-variation" );

		if ( function_exists( "is_woocommerce" ) ) {
			if ( is_woocommerce() && is_product() ) {
				// Add the plugin script
				wp_enqueue_script( "woocommerce-variations-with-radio-buttons-frontend", plugins_url( "/assets/js/main" . $suffix . ".js", plugin_basename( __FILE__ ) ), array( "jquery", "woocommerce" ), "1.0.0", true );
			}
		}
	}

	public static function infinite_wc_ajax_variation_threshold( $qty, $product ) {
		return 1000;
	}

	public static function always_show_price ( $val ) {
		return true;
	}

	public static function check_hook_order () {
		global $product;
		

		if ( $product->product_type == "variable" ) {
			// move add to cart above the price for variable product
			remove_action( "woocommerce_single_product_summary", "woocommerce_template_single_add_to_cart" , 30 );
			add_action( "woocommerce_single_product_summary", "woocommerce_template_single_add_to_cart" , 5 );

			// add no Javascript notice;
			add_action( "wgm_before_single_price_html", array( "Woocommerce_Variations_With_Radio_Buttons", "show_product_price_is_loading_via_javascript" ), 50 );

			// for variable product move shipping time notice below the price
			remove_action( "woocommerce_single_product_summary", array( "WGM_Template", "add_template_loop_shop" ), 11 );
			add_action( "woocommerce_single_variation", array( "WGM_Template", "add_template_loop_shop" ), 16 );
		}
	}

	// Show loading information or the information that javascript needs to be activated for variations to be working
	public static function show_product_price_is_loading_via_javascript () {
		echo "<aside class=\"js\"><p>Informationen werden geladen …</p></aside>".
			"<noscript><p>Ihr Browser unterstützt kein Javascript. Bitte aktiveren sie Javascript oder verwenden sie eine anderen Browser.</p></noscript>";
	}

} // end class

if ( class_exists( "Woocommerce_Variations_With_Radio_Buttons" ) ) {

	add_action( "plugins_loaded", array( "Woocommerce_Variations_With_Radio_Buttons", "get_instance" ) );

	require_once "includes/template-functions.php";

}