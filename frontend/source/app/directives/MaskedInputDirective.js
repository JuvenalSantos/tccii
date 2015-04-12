define(['./module'], function (directives) {
	'use strict';

	/**
	 *
	 *	Directive used to mask input tag.
	 *
	 *	@component: MaskedInputDirective
	 *	@author: Anderson Koester
	 *	@version: 0.0.1
	 *	@dependencies: [https://github.com/RobinHerbots/jquery.inputmask, http://getbootstrap.com]
	 *
	 *	Usage with format type:
	 *	<div class="form-group"> ...
	 *	<input type="text" data-masked-input data-mask-format="money">
	 *	... </div>
	 *	<div class="form-group"> ...
	 *	<input type="text" data-error-class="has-error" data-masked-input data-mask-format="regex" data-mask-pattern="[0-9 a-z \.]">
	 *	... </div>
	 *
	 *	Usage without format type:
	 *	<div class="form-group"> ...
	 *	<input type="text" data-error-class="has-error" data-masked-input data-mask-pattern="999-9-99-9999 9">
	 *	... </div>
	 *
	 */

	var MaskedInput = function () {
		var LinkFn = function(scope, element){
			var elem = $(element),
				options = {
					onincomplete: function(){
						if( scope.onIncomplete == undefined ){
							elem.parents(".form-group").addClass("has-error");
						}else{
							scope.onIncomplete();
						}
					},
					oncomplete: function(){
						if( scope.onComplete == undefined ){
							elem.parents(".form-group").removeClass("has-error");
						}else{
							scope.onComplete();
						}
					}
				}

			if( scope.format == undefined && scope.pattern == undefined ){
				console.error("MaskedInput::ERROR=>(Format&&Pattern) == undefined", element);
				return false;
			}
			if( scope.format == undefined){
				elem.inputmask(scope.pattern);
			}else{
				switch(scope.format){
					case "money" :
						$.extend(options, {
							radixPoint : ",",
							groupSeparator : ".",
							digits : 2,
							autoGroup : true
						});
						elem.inputmask("decimal", options);
						break;
					case "phone" :
						options.mask = "(99) 9999[9]-9999";
						elem
						.inputmask(options)
							.focusout(function(){
								var phone;
								elem.inputmask("remove");
								phone = elem.val().replace(/\D/g, '');
								if(phone.length > 10) {
									options.mask = "(99) 99999-9999";
									elem.inputmask(options);
								} else {
									options.mask = "(99) 9999-9999";
									elem.inputmask(options);
								}
							})
							.focus(function(){
								options.mask = "(99) 9999[9]-9999";
								elem.inputmask("remove");
								elem.inputmask(options);
							});
						break;
					case "regex" :
						if( scope.pattern == undefined ){
							console.error("MaskedInput::ERROR=>(regex.pattern) == undefined", element);
							return false;
						}
						elem.inputmask("Regex", {regex: scope.pattern});
						break;
				}
			}
		}

		return {
			restrict : 'A',
			scope : {
				pattern: '@maskPattern',
				format: '@maskFormat',
				onComplete: '&onComplete',
				onIncomplete: '&onIncomplete',
			},
			link : LinkFn
		}
	}
	directives.directive('maskedInput', [MaskedInput]);
});