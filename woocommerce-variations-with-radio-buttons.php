<?php
/**
 * Plugin Name:     WooCommerce Variations with Radio Buttons
 * Description:     Changes the Woocoomerce Variations to use Radio Buttons instead of Select/Options
 * Author:          essenmitsosse
 * Version:         0.0.1
 * Author URI:      http://essenmitsosse.de
 * Text Domain:     woocommerce-variations-with-radio-buttons
 * Upgrade Check:   none
 * Last Change:     13.08.2015 09:01
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Woocommerce_Variations_With_Radio_Buttons {

	/**
     * Plugin version
     * @var string
     */
    static public $version = "0.0.1";

	/**
     * Singleton object holder
     * @var mixed
     */
    static private $instance = NULL;

	public function __construct() {
		add_filter( 'woocommerce_locate_template', array( 'Woocommerce_Variations_With_Radio_Buttons', 'add_woocommerce_templates' ), 10, 3 );
		
		// handles the variation selection of products, is replaced by add-to-cart-variation-with-radio
		wp_deregister_script( 'wc-add-to-cart-variation' );
	}

	/**
	* Creates an Instance of this Class
	*
	* @access public
	* @since 0.0.1
	* @return Woocommerce_Variations_With_Radio_Buttons
	*/
	public static function get_instance() {

		if ( NULL === self::$instance )
			self::$instance = new self;

		return self::$instance;
	}

	public static function add_woocommerce_templates( $template, $template_name, $template_path ){
		
		// Only check if the template is changed by this plugin
		if ( $template_name == 'single-product/add-to-cart/variable.php' ) {
			$path = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . 'woocommerce' . DIRECTORY_SEPARATOR;
		
			// Only load our templates if they are nonexistent in the theme
			if( file_exists( $path . $template_name ) && ! locate_template( array( WC()->template_path() . $template_name ) ) ) {
				$template = $path . $template_name;
			}
		}

		return $template;
	}

	public static function wc_radio_variation_attribute_options () {

	}

} // end class

if ( class_exists( 'Woocommerce_Variations_With_Radio_Buttons' ) ) {

	add_action( 'plugins_loaded', array( 'Woocommerce_Variations_With_Radio_Buttons', 'get_instance' ) );

	require_once 'includes/template-functions.php';

}