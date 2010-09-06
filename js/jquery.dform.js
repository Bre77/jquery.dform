(function($)
{
	var _subscriptions = {};
	
	/**
	 * Create a new element with given tag and default attributes and settings
	 */
	function _create(tag, defaults, options)
	{
		return $($(tag).attr($.extend(defaults, options)));
	}

	$.fb =
	{
		// Subscribe builder functions
		subscribe : function(name, fn)
		{
			if(!_subscriptions[name])
				_subscriptions[name] = new Array();
			_subscriptions[name].push(fn);
		},
		// Clear all subscriptions for name
		clear : function(name)
		{
			delete _subscriptions[name];
		},
		// Core elements
		element :
		{
			/**
			 * Default builder function if no other element has been found
			 */
			__default : function(options)
			{
				return _create("<input>", {}, options);
			},
			/**
			 * Create a new form element with given options as attributes
			 */
			form : function(options)
			{
				return _create("<form>", { action : window.location, method : "post" }, options);
			},

			/**
			 * Create a new select form element with given select items as key
			 * value pairs.
			 */
			select : function(options)
			{
				return _create("<select>", {}, options);
			},

			fieldset : function(options)
			{
				return _create("<fieldset>", {}, options);
			}
		}
	};
	
	(function _init()
	{
		$.fb.subscribe("elements", function(options) {
			var scoper = $(this);
			$.each(options, function(name, nested) {
				var options = nested;
				options["name"] = name;
				$(scoper).formElement(options);
			});
			return $(this);
		});
		
		$.fb.subscribe("value", function(options) {
			$(this).val(options);
		});
		
		$.fb.subscribe("options", function(options) {
			if($(this).is("select"))
			{
				var scoper = $(this);
				$.each(options, function(value, text) {
					var option = $("<option>").attr("value", value).html(text);
					$(scoper).append(option);
				});
			}
		});
		
		$.fb.subscribe("default", function(options) {
			if($(this).is("input") && $(this).attr("type") == "text")
			{
				$(this).data("default", options);
				$(this).onClick(function() { 
				});
			}
		});
		
		$.fb.subscribe("label", function(options) {
			$(this).wrap($("<div>"));
			var label = $("<label>").html(options);
			$(this).parent().prepend(label);
		});
		
		$.fb.subscribe("legend", function(options) {
			if($(this).is("fieldset"))
			{
				var legend = $("<legend>").html(options);
				return $(this).prepend(legend);
			}
		});
	})();
	
	$.fn.extend(
	{
		buildForm : function(options)
		{

		},
		// Main form element builder function
		formElement : function(options)
		{
			// Find element options and subscription options
			var ops = {};
			var subscriberOps = {};
			var type = options["type"];
			$.each(options, function(key, value) {
				if(!_subscriptions[key] && key != "type") // element not subscribed
					ops[key] = value;
				else if(key != "type") // put in subscription options
					subscriberOps[key] = value;
			});
			
			// Get builder function for element and append to this or use default builder
			var builder = $.fb.element.__default;
			if($.fb.element[type])
				builder = $.fb.element[type];
			else
				ops["type"] = type;
			
			// Call builder function
			var element = builder(ops);
			$(this).append(element);
			
			// Run subscription functions
			$.each(subscriberOps, function(name, options) {
				$.each(_subscriptions[name], function(i, sfn){
					sfn.call(element, options); // run subscriber function with options
				});
			});
			return $(this);
		}
	});

})(jQuery);
