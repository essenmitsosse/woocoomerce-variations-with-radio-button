define( function () { 
	var available_combinations,
		order,
		figureOutWhyOptionIsUnavailable = ( function () {
		var loopThroughAttribute = function  ( info, currentStep, currentTree ) {
				// console.log( "in the loop. loopedAttr: ", info.loopedAttr.attrName, "tree: ", currentTree );
				var currentBranchName;

				for ( currentBranchName in currentTree ) {					
					if ( currentBranchName !== info.loopedAttr.val ) {
						// console.log( "-------loop in branch: ", currentBranchName, "----------" );

						if( checkNextTree( info, currentStep, currentTree, [ currentBranchName ] ) ) {
							return true;
						}
					}
				}
				return false;
			},

			checkNextTree = function ( info, currentStep, currentTree, nextTreeStep ) {
				var currentOrder = order[ currentStep ];
				// choose next tree branch
				currentTree = currentTree[ nextTreeStep[ 0 ] ] || currentTree[ nextTreeStep[ 1 ] ];

				// console.log( currentStep + "-" + ( currentStep + 1 ), "next tree: ", nextTreeStep, currentTree );

				if ( currentTree ) {
					// go through all attributes and check the current combination
					if ( currentStep < order.length - 1 ) {
						// console.log( "dig deeper, keep on searching" );
						return findBlockingAttributes( info, currentStep + 1, currentTree );
					} else {
						// console.log( "last step reached", currentTree ? true : false );

						return currentTree ? true : false;
					}
				} else {
					// console.log( "Tree ends here ", currentStep, " was supposed to be: ", nextTreeStep );
					return false;
				}				
			},

			findBlockingAttributes = function ( info, currentStep, currentTree ) {
				currentStep = currentStep || 0;
				currentTree = currentTree || available_combinations;

				var currentOrder = order[ currentStep ],
					nextTreeStep;

				// console.log( currentStep, ", order: " + currentOrder.attrName, ", tree: ", currentTree );

				// select next step from tree
				if ( currentOrder.attrName === info.blockedAttr.attrName ) {
					// console.log( "this is the blocked Attr - ", info.blockedAttr.attrName );
					nextTreeStep = [ info.blockedAttr.attrName, info.blockedAttr.val ];
				} else if ( currentOrder.attrName === info.loopedAttr.attrName ) {
					return loopThroughAttribute( info, currentStep, currentTree, currentStep, currentTree );
				} else {
					// console.log( "this is a static Attr - ", currentOrder.attrName );
					nextTreeStep = [ currentOrder.attrName, info.selected[ currentOrder.attrName ].val ];
				}

				return checkNextTree( info, currentStep, currentTree, nextTreeStep );
			};

		return function ( blockedAttr, selected ) {
			// // Blocked Attribute
			// // Attribute that is cycled
			// console.log( "\n\n\n* * * * * * * * * * * * * * " ); 
			// console.log( "order: ", order "\nblockendAttr: ", blockedAttr, "\nselected: ", selected );

			var currentAttr,
				blockList = [],
				currentSelected;

			for ( currentAttr in selected ) {
				if ( currentAttr !== blockedAttr.attrName ) {
					currentSelected = selected[ currentAttr ];
					// console.log( "\n\nLOOP: ", currentAttr );
					if( findBlockingAttributes( {
						blockedAttr: blockedAttr,
						loopedAttr: currentSelected, 
						selected: selected 
					} ) ) {
						blockList.push( currentSelected.attr.niceName + ": " + currentSelected.niceName );
					}
				}
			}

			return blockList;
		};
	} )(),

	checkIfPossible = function  ( checkedAttr, selected ) {
		var i = 0,
			currentOrder,
			tree = available_combinations,
			nextTreeName;

		while ( i < order.length ) {
			currentOrder = order[ i ];

			if ( !currentOrder.alwaysTrue ) {
				if ( currentOrder.attrName === checkedAttr.attrName ) {
					nextTreeName = checkedAttr.val;
					// console.log ( "checked", nextTreeName, 123 );
				} else {
					nextTreeName = selected[ currentOrder.attrName ].val;
					// console.log( "static", nextTreeName, 123 );
				}
			} else {
				nextTreeName = currentOrder.attrName;
				// console.log( "always true", nextTreeName, 123 );
			}

			tree = tree[ nextTreeName ];
			if ( !tree ) {
				return false;
			}		

			i += 1;
		}

		return true;
	};

	return function ( all_variations ) {
		var first = true,
			i = all_variations.length - 1,

			current_attributes,
			current_attributeName,
			current_attributeValue,
			current_attributeClassName,
			lastStep = {};

		available_combinations = {};
		order = [];

		while ( i >= 0 ) {

			current_attributes = all_variations[ i ].attributes;

			lastStep = available_combinations;

			for ( current_attributeName in current_attributes ) {
				current_attributeValue = current_attributes[ current_attributeName ] || current_attributeName;

				if ( ! lastStep[ current_attributeValue ] ) {
					lastStep[ current_attributeValue ] = {};
				}

				lastStep = lastStep[ current_attributeValue ];

				// saves the order in which the objects are structured
				if ( first ) {
					order.push( { attrName: current_attributeName, alwaysTrue: current_attributeValue === current_attributeName } );
				}
			}

			first = false;

			i -= 1;
		}

		return {
			checkIfPossible: checkIfPossible,
			figureOutWhyOptionIsUnavailable: figureOutWhyOptionIsUnavailable,
		};
	}; 
} );