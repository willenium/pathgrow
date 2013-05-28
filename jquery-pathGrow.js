/*
*	@Class:		Animate progressively
*	@Author:		Pim Hoogendoorn <pim.hoogendoorn@willenium.nl>
*	@Created:		May 2013
*	@Version:		0.9
*	@Description:	Makes progressively animating a svg path possible with stroke-dash-array
*	@Todo:
---------------------------------------------------------------------------- */

/*globals Tween:false */
(function ($)
{
	'use strict';

	$.pathGrow = function(element, opts)
	{
		/*
		* Default settings for plugin
		*
		*/
		var defaults =
		{
			speed: 4,
			startColor: '#fff',
			strokeLinecap: 'round',
			fill: '#ddd',
			stroke: '#000',
			strokeWidth: 5,
			reverse: false,
			target: null,
			easing: null,
			onComplete: null,
			onReset: null
		};

		/*
		* Var declaration
		*
		*/
		var plugin = this,
			svgDoc = element,
			options = $.extend({}, defaults, opts),
			allPaths = svgDoc.getElementsByTagName('path'),
			pathsArr = [],
			anims =[],
			pathCount = 0,
			onComplete = options.onComplete,
			targetId = options.target,
			speed = options.speed,
			fill = options.fill,
			stroke = options.stroke,
			strokeLinecap = options.strokeLinecap,
			strokeWidth = options.strokeWidth,
			easing = options.easing,
			reverse = options.reverse,
			onReset = options.onReset;

		// Constructor
		plugin.init = function()
		{
			/*
			* Animate path(s) in specific group with id or all paths in svg
			*
			*/
			if(targetId !== null)
			{
				var group = svgDoc.getElementById(targetId);
				allPaths = group.getElementsByTagName('path');
			}

			// Calculate pathlenghts
			loopPaths();
		};

		// PRIVATE
		var

		/*
		* Loop over found paths
		*
		*/
		loopPaths = function(reset)
		{
			// Loop over paths
			for (var i = allPaths.length - 1; i >= 0; i--)
			{
				var path = allPaths[i];

				// If reset
				if(reset)
				{
					// Remove path attributes previously set
					removePathAttrs(path);
				}
				else
				{
					// Calculate path lenghts in pixels for animation
					var pathLength = Math.round(path.getTotalLength());

					// Set path's attributes
					setPathAttrs(path, pathLength);

					// Store path in array
					pathsArr.push({
						d: allPaths[i],
						length: pathLength
					});
				}
			}

			// If paths order needs to be reversed, faster than changing your svg path order in the svg file ;)
			if(reverse)
			{
				pathsArr.reverse();
			}
		},

		/*
		* Remove path attributes
		* @param {object} path element
		*/
		removePathAttrs = function(path)
		{
			// Check if we need a custom fill
			if(typeof fill !== 'boolean' && fill !== false)
			{
				path.removeAttribute('fill');
			}

			// Remove path attributes
			path.removeAttribute('stroke');
			path.removeAttribute('stroke-linecap');
			path.removeAttribute('stroke-width');
			path.removeAttribute('stroke-dasharray');
		},

		/*
		* Set path attributes
		* @param {object} path element
		* @param {integer} pathLength in pixels
		*/
		setPathAttrs = function(path, pathLength)
		{
			// Check if we need a custom fill
			if(typeof fill !== 'boolean' && fill !== false)
			{
				path.setAttribute('fill', fill);
			}

			// Set path attributes
			path.setAttribute('stroke', stroke);
			path.setAttribute('stroke-linecap', strokeLinecap);
			path.setAttribute('stroke-width', strokeWidth);
			path.setAttribute('stroke-dasharray', '0 ' + pathLength);
		},

		/*
		* Animation tween
		* @param {integer} Path number
		*/
		animatePath = function(splitNr)
		{
			var index = splitNr || 0,
				path = pathsArr[index];

			// Set the stroke here
			// Setting it in setPathAttrs will show dots in FF and IE
			//path.d.setAttribute('stroke', stroke);

			if(path && path.length !== 'undefined')
			{
				// Create array with animations
				var anims =[];
				// Add animation to array
				anims.push(
					// Create a Tween
					Tween.to({
						x: 0
					},
					{
						x: path.length
					},
					speed,
					function(vars)
					{
						// Animate the stroke-dasharray attribute, to progressively show the path
						path.d.setAttribute('stroke-dasharray', (~~(vars.x)+1) + ' ' + path.length);

						// Check if we are at the end of the path(s)
						if(vars.x === path.length)
						{
							if(pathCount !== pathsArr.length)
							{
								// Count every split
								pathCount++;

								// Animate next path
								if(pathCount !== allPaths.length)
								{
									animatePath(pathCount);
								}
								else
								{
									// Animation is done
									if(typeof onComplete === 'function')
									{
										onComplete();
									}
								}
							}
						}
					}, easing) // Give easing
				);
			}
		},

		// Reset the path(s)
		reset = function()
		{
			// Reset vars
			pathsArr = [];
			anims = [];
			pathCount = 0;

			// Loop over paths to reset path attributes
			loopPaths(true);

			// Animation is done
			if(typeof onReset === 'function')
			{
				onReset();
			}
		};

		// PUBLIC
		// Start animating the path
		plugin.start = function()
		{
			animatePath();
		};

		// Reset the path
		plugin.reset = function()
		{
			reset();
			loopPaths();
		};

		// Execute plugin
		plugin.init();
	};

	/*
	* @jQuery wrapper around plugin.
	*/
	$.fn.pathGrow = function(options)
	{
		return this.each(function()
		{
			if (undefined === $(this).data('pathGrow'))
			{
				var plugin = new $.pathGrow(this, options);
				$(this).data('pathGrow', plugin);
			}
		});
	};
})(jQuery);