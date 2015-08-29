// Based on the original add-to-cart-variations.js from Woocommerce 
// plugins/woocommerce/assets/js/frontend/add-to-cart-variations.js

define( [ './add-to-cart-variations-with-radio/get-all-combinations' ], function ( getAllCombinations ) {
'use strict';
$.fn.betoniuWcVariationForm = function () {
	var $form = this,
	$fieldsets = this.find( 'fieldset' ),
	$inputWrappers = this.find( '.product_variable_option' ),
	$formVariationId = this.find( 'input.variation_id' ),

	$product = $( this ).closest( '.product' ),
	$imageDiv = $product.find( '.images' ),
	$product_img = $imageDiv.find( 'img:eq(0)' ),

	o_src = $product_img.attr( 'src' ),
	o_title = $product_img.attr( 'title' ),
	o_alt = $product_img.attr( 'alt' ),			

	attributes = {},
	values = {},

	allVariations = 
		$form.data( 'product_variations' ) ||
		window.product_variations ||
		window[ 'product_variations_' + parseInt( $form.data( 'product_id' ) ) ],

	initCheckSingleFieldset = function ( index, wrapper ) {
		var $fieldset = $( wrapper ),
		niceName = $fieldset.find( 'legend' ).html(),
		attrName = $fieldset.data( 'attribute_name' ) || $fieldset.attr( 'name' ),
		linkedData = {};

		linkedData.attrName = attrName;
		linkedData.niceName = niceName;
		linkedData.values = {};

		attributes[ attrName ] = linkedData;
	},

	initCheckSingleWrapper = function ( index, wrapper ) {
		var $wrapper = $( wrapper ),
		$input = $wrapper.find( 'input' ),
		$tooltip = $( '<p/>', {
			'class': 'tooltip',
			'disabled': 'disabled'
		} ),
		linkedData = {},
		val = $input.attr( 'value' ),
		attrName = $input.attr( 'name' ),
		attr = attributes[ attrName ];

		linkedData.$self = $wrapper;
		linkedData.$input = $input;
		linkedData.$tooltip = $tooltip;
		linkedData.attr = attr;
		linkedData.attrName = attrName;
		linkedData.val = val;
		linkedData.description = $input.data( 'description' );
		linkedData.niceName = $input.data( 'nicename' );

		wrapper.linkedData = attr.values[ val ] = values[ val ] = linkedData;
		$tooltip.appendTo( $wrapper );
	},

	changeFieldset = function( event ) {

		$formVariationId.val( '' ).change();

		$form
		.trigger( 'woocommerce_variation_select_change' )
		.trigger( 'check_variations', [ '', false ] );			

		$( this ).blur();

			// Custom event for when variation selection has been changed
			$form.trigger( 'woocommerce_variation_has_changed' );

		},

		checkVariations = ( function () {
			var currentSettings,
				currentSettingsDetailed,
				checkFieldsetsAndFindCurrentSettings = function () {
					var $this = $( this ),
					checked = $this.find( $( 'input:checked' ) ),
					fieldValue = checked.val(),
					attribute_name;

					// Get attribute name from data-attribute_name, or from input name if it doesn't exist
					attribute_name = $this.data( 'attribute_name' ) || $this.attr( 'name' );
					currentSettings[ attribute_name ] = fieldValue;
					currentSettingsDetailed[ attribute_name ] = values[ fieldValue ];
				};

			return function( event, exclude, focus ) {
				var matching_variations,
					product_id = parseInt( $form.data( 'product_id' ) ),

					variation,
					$variation_input;

				currentSettings = {};
				currentSettingsDetailed = {};

				// Get the current settings
				$fieldsets.each( checkFieldsetsAndFindCurrentSettings  );

				matching_variations = $.fn.betoniuWcVariationForm.find_matching_variations( allVariations, currentSettings );

				variation = matching_variations[ 0 ];

				if ( variation ) {
					// Set ID
					$formVariationId
					.val( variation.variation_id )
					.change();

					$form.trigger( 'update_variation_values', [ currentSettingsDetailed ] );
					$form.trigger( 'found_variation', [ variation ] );

				} else {

					alert( "Diese Variante ist nicht lieferbar." );

				}
			};

		} )(),

		update_variation_values = ( function () {
			return function( event, selectedValues ) {
				var checkCombinations = getAllCombinations( allVariations );

				// Check for each option if it could be selected given the other options
				$inputWrappers.each( function( index, el ) {
					var data = el.linkedData,
					$input = data.$input,
					$tooltip = data.$tooltip,
					description = data.description;

					if ( 
						checkCombinations.checkIfPossible(
							{ attrName: $input.attr( 'name' ), val: $input.attr( 'value' ) },
							selectedValues 
							) 
						) {

						$input.attr( 'disabled', false );

					if( description ) {
						$tooltip.attr( 'disabled', false );
						$tooltip.html( description );
					} else {
						$tooltip.attr( 'disabled', true );
						$tooltip.html( '' );
					}


				} else {

					$input.attr( 'disabled', true );

					$tooltip.attr( 'disabled', false );
					$tooltip.html( 
						'Nicht verfügbar für: ' +
						checkCombinations.figureOutWhyOptionIsUnavailable( 
							data,
							selectedValues
							).join( ', ' )
						);
				}
			} );
			};
		} )(),

		changeImage = function ( variation ) {
			var variation_image = variation.image_link,
				variation_title = variation.image_title,
				variation_alt = variation.image_alt;

			if ( variation_image && variation_image.length > 1 ) {
				$product_img
				.attr( 'src', variation_image )
				.attr( 'alt', variation_alt )
				.attr( 'title', variation_title );
			} else {
				$product_img
				.attr( 'src', o_src )
				.attr( 'alt', o_alt )
				.attr( 'title', o_title );
			}
		},

		found_variation = ( function () {
			var $variationButton = $form.find( '.variations_button' ),
				$single_variation = $form.find( '.single_variation' ),
				$single_variation_wrap = $form.find( '.single_variation_wrap' ),
				$sku = $product.find( '.product_meta' ).find( '.sku' ),
				$weight = $product.find( '.product_weight' ),
				$dimensions = $product.find( '.product_dimensions' ),
				$quantity = $single_variation_wrap.find( '.quantity' ),
				$inputQuantity = $quantity.find( 'input.qty' );

			if ( ! $sku.attr( 'data-o_sku' ) ) {
				$sku.attr( 'data-o_sku', $sku.text() );
			}				

			if ( ! $weight.attr( 'data-o_weight' ) ) {
				$weight.attr( 'data-o_weight', $weight.text() );
			}				

			if ( ! $dimensions.attr( 'data-o_dimensions' ) ) {
				$dimensions.attr( 'data-o_dimensions', $dimensions.text() );
			}

			return function( event, variation ) {

				changeImage( variation );

				$sku.html( variation.sku ?
					variation.sku
					: $sku.attr( 'data-o_sku' ) 
				);

				$weight.html( variation.weight ?
					variation.weight
					: $weight.attr( 'data-o_weight' ) 
				);
				
				$dimensions.html( variation.dimensions ?
					variation.dimensions
					: $dimensions.attr( 'data-o_dimensions' ) 
				);

				if ( variation.min_qty !== '' ) {
					$inputQuantity.attr( 'min', variation.min_qty );
				} else {
					$inputQuantity.removeAttr( 'min' );
				}

				if ( variation.max_qty !== '' ) {
					$inputQuantity.attr( 'max', variation.max_qty );
				} else {
					$inputQuantity.removeAttr( 'max' );
				}

				if ( variation.is_sold_individually === 'yes' ) {
					$inputQuantity.val( '1' );
					$quantity.hide();
				} else {
					$quantity.show();
				}

				// Hide if variation is not puchasable/out of stock/not visible
				if ( ! variation.is_purchasable || ! variation.is_in_stock || ! variation.variation_is_visible ) {
					$variationButton.hide();
				} else {
					$variationButton.show();
				}

				// Hide if variation is not available
				if ( ! variation.variation_is_visible ) {
					$single_variation.html( '<p>Diese Variante ist leider nicht verfügbar.</p>' );
				} else {
					$single_variation.html( variation.price_html + variation.availability_html );
				}

				$single_variation_wrap.show().trigger( 'show_variation', [ variation ] );

			};
		} )();

		$.fn.betoniuWcVariationForm.find_matching_variations = function( product_variations, settings ) {
			var matching = [],
			variation,
			variation_id;

			for ( var i = 0; i < product_variations.length; i++ ) {
				variation = product_variations[i];
				variation_id = variation.variation_id;

				if ( $.fn.betoniuWcVariationForm.variations_match( variation.attributes, settings ) ) {
					matching.push( variation );
				}
			}

			return matching;
		};

		$.fn.betoniuWcVariationForm.variations_match = function( attrs1, attrs2 ) {
			var match = true,
			attr_name,
			val1, val2;

			for ( attr_name in attrs1 ) {
				if ( attrs1.hasOwnProperty( attr_name ) ) {
					val1 = attrs1[ attr_name ];
					val2 = attrs2[ attr_name ];

					if ( val1 !== undefined && val2 !== undefined && val1.length !== 0 && val2.length !== 0 && val1 !== val2 ) {
						match = false;
					}
				}
			}

			return match;
		};

	// Unbind any existing events
	this.unbind( 'check_variations update_variation_values found_variation' );
	this.find( '.variations fieldset' ).unbind( 'change focusin' );

	// Prepare fieldsets
	$fieldsets.each( initCheckSingleFieldset );

	// Prepare the single options, for later use
	$inputWrappers.each( initCheckSingleWrapper );

	// remove existing price with range
	$( '.price' ).remove();

	// Bind events

	// Upon changing an option
	this.on( 'change', '.variations fieldset', changeFieldset );

	// Check variations
	this.on( 'check_variations', checkVariations );

	// Disable option fields that are unavaiable for current set of attributes
	this.on( 'update_variation_values', update_variation_values );

	// Show single variation details (price, stock, image)
	this.on( 'found_variation', found_variation );

	$form.trigger( 'betoniuWcVariationForm' );

	return $form;
};

$( function() {
	var $variationForms = $( '.variations_form' );

	if ( $variationForms.length > 0 ) {
		$variationForms.betoniuWcVariationForm();
		$variationForms.find( 'fieldset:first-child' ).change();
	}
	
	
});

} );