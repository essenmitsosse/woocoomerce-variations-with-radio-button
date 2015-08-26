<?php
/**
 * Woocommerce Varations with Radio Buttons Template
 *
 * Functions for the templating system.
 *
 * @author   essenmitsosse
 * @category Core
 * @package  Woocommerce-variations-with-radio-buttons/Functions
 * @version  0.0.1
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Output a list of variation attributes for use in the cart forms. 
 * used in the plugins template instead of wc_dropdown_variation_attribute_options
 *
 * @param array $args
 * @since 0.0.1
 */
function wc_radio_variation_attribute_options( $args = array() ) {
	$args = wp_parse_args( $args, array(
		'options'          => false,
		'attribute'        => false,
		'product'          => false,
		'selected' 	       => false,
		'name'             => '',
		'id'               => '',
		'class'            => '',
		'show_option_none' => __( 'Choose an option', 'woocommerce' )
	) );

	$options       = $args['options'];
	$product       = $args['product'];
	$attribute     = $args['attribute'];
	$name          = $args['name'] ? $args['name'] : 'attribute_' . sanitize_title( $attribute );
	$id            = $args['id'] ? $args['id'] : sanitize_title( $attribute );
	$class         = $args['class'];
	$selectedValue = $args['selected'];
	$first         = true;

	if ( empty( $options ) && ! empty( $product ) && ! empty( $attribute ) ) {
		$attributes = $product->get_variation_attributes();
		$options    = $attributes[ $attribute ];
	}
	
	echo '<fieldset id=\'' . esc_attr( $id ) . '\' class=\'' . esc_attr( $class ) . '\' name=\'' . esc_attr( $name ) . '\' data-attribute_name=\'' . esc_attr( $name ) . '\'>';
	echo '<legend>' . wc_attribute_label( $attribute ) . '</legend>';
	do_action( "before_variations_with_radio_buttons_list" );
	echo '<div class=\'product_variable_list\'>';

	if ( ! empty( $options ) ) {
		if ( $product && taxonomy_exists( $attribute ) ) {
			// Get terms if this is a taxonomy - ordered. We need the names too.
			$terms = wc_get_product_terms( $product->id, $attribute, array( 'fields' => 'all' ) );

			foreach ( $terms as $term ) {
				if ( in_array( $term->slug, $options ) ) {
					$checkedString = $selectedValue ?
						checked( sanitize_title( $selectedValue ), $term->slug, false )
						: checked( $first, true, false );

					wc_radio_select_button_for_add_to_cart( array(
						"value"       => esc_attr( $term->slug ), 
						"checked"     => $checkedString, 
						"content"     => apply_filters( 'woocommerce_variation_option_name', $term->name ),
						"name"        => sanitize_title( $attribute ),
						"description" => $term->description
					) );

					$first = false;
				}				
			}
		} else {
			foreach ( $options as $option ) {
				// This handles < 2.4.0 bw compatibility where text attributes were not sanitized.
				$checkedString = $selectedValue ?
					sanitize_title( $selectedValue ) === $selectedValue ? 
						checked( $selectedValue, sanitize_title( $option ), false ) 
						: checked( $selectedValue, $option, false )
					: checked( $first, true, false );

				wc_radio_select_button_for_add_to_cart( array(
					"value"       => esc_attr( $option ), 
					"checked"     => $checkedString, 
					"content"     => esc_html( apply_filters( 'woocommerce_variation_option_name', $option ) ),
					"name"        => sanitize_title( $attribute )
				) );

				$first = true;
			}
		}
	}

	echo '</div>';
	echo '</fieldset>';
}

/**
 * Shows a single selection as a radio button with a label
 *
 * @param string $args
 * @since 0.0.1
 */
function wc_radio_select_button_for_add_to_cart( $args ) {
	$value = $args[ "value" ];
	$checked = $args[ "checked" ];
	$content = $args[ "content" ];
	$name = $args[ "name" ];
	$description = array_key_exists( 'description', $args ) ? $args[ "description" ] : false;

	$id = 'product_value_' . $name . '_' . $value;

	echo "<div class='product_variable_option'>".
	"\t<input " . 
		"type='radio' " .
		"name='attribute_" . $name . "' " .
		"id='" . $id . "' " .
		$checked .
		"value='" . $value . "' " .
		"data-nicename='" . $content . "' " .
		( $description === false ? '' : "data-description='" . $description . "' " ) .
	"/>" .
	"\t<label for='" . $id . "'>" . $content . "</label>" .
	"</div>";
	// echo '<option value="' . esc_attr( $value ) . '" ' . selected( sanitize_title( $selected_valueString ), sanitize_title( $value ), false ) . '>' . $content . '</option>';

}