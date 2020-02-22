'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * CSV IMPORT DIRECTIVE
 */

angular.module('clientApp')
.directive('ngCsvImportDirective', function( $scope, importService ) {
	return {
		restrict: 'E',
		transclude: true,
		replace: true,
		scope:{
            csv: {
                content:'=?',
                header: '=?',
                headerVisible: '=?',
                separator: '=?',
                separatorVisible: '=?',
                result: '=?',
                encoding: '=?',
                encodingVisible: '=?',
                accept: '=?',
                acceptSize: '=?',
                acceptSizeExceedCallback: '=?',
                callback: '=?',
                mdButtonClass: '@?',
                mdInputClass: '@?',
                mdButtonTitle: '@?',
                mdSvgIcon: '@?',
                uploadButtonLabel: '='   
            }
		},
		template: function(element, attrs) {
			var material = angular.isDefined(attrs.material);
			var multiple = angular.isDefined(attrs.multiple);

			return '<div class="ng-csv-import">' +
                '<input class="btn btn-default btn-sm cta gray" upload-button-label="{{uploadButtonLabel}}" type="file" ' + 
                (multiple ? 'multiple' : '') +' accept="{{accept}}"/>' + 
                (material ? '<md-button ng-click="onClick($event)" class="_md md-button {{mdButtonClass}}"><md-icon md-svg-icon="{{mdSvgIcon}}"></md-icon> {{mdButtonTitle}}</md-button><md-input-container style="margin:0;"><input type="text" class="_md md-input-readable md-input {{mdInputClass}}" ng-click="onClick($event)" ng-model="filename"></md-input-container>' : '') +
			'</div>';
		},
		link: function(scope, element, attrs) {
            
            console.log( 'CSV-IMPORT-DIRECTIVE' );
            console.log( 'SCOPE:: ', scope );
            console.log( 'ELEMENT:: ', element );
            console.log( 'ATTRIBUTES:: ', attrs );
            
			scope.csv.separatorVisible = !!scope.csv.separatorVisible;
			scope.csv.headerVisible = !!scope.csv.headerVisible;
			scope.csv.acceptSize = scope.csv.acceptSize || Number.POSITIVE_INFINITY;
			scope.csv.material = angular.isDefined(attrs.material);
			scope.csv.multiple = angular.isDefined(attrs.multiple);
			if (scope.csv.multiple) {
				throw new Error("Multiple attribute is not supported yet.");
			}
			var input = angular.element(element[0].querySelector('input[type="file"]'));
			var inputContainer = angular.element(element[0].querySelector('md-input-container'));

			if (scope.csv.material && input) {
				input.removeClass("ng-show");
				input.addClass("ng-hide");
				if (inputContainer) {
					var errorSpacer = angular.element(inputContainer[0].querySelector('div.md-errors-spacer'));
					if (errorSpacer) {
						errorSpacer.remove();
					}
				}
				scope.onClick = function() {
					input.click();
				};
			}

			angular.element(element[0].querySelector('.separator-input')).on('keyup', function(e) {
				if ( scope.csv.content !== null ) {
					var content = {
						csv: scope.csv.content,
						header: scope.csv.header,
						separator: e.target.value,
						encoding: scope.csv.encoding
					};
                    
					scope.result = csvToJSON(content);
					scope.$apply();
					if ( typeof scope.callback === 'function' ) {
						scope.callback(e);
					}
				}
			});

			element.on('change', function(onChangeEvent) {
				if (!onChangeEvent.target.files.length){
					return;
				}

				if (onChangeEvent.target.files[0].size > scope.csv.acceptSize){
					if ( typeof scope.csv.acceptSizeExceedCallback === 'function' ) {
						scope.csv.acceptSizeExceedCallback(onChangeEvent.target.files[0]);
					}
					return;
				}

				scope.csv.filename = onChangeEvent.target.files[0].name;
				var reader = new FileReader();
				reader.onload = function(onLoadEvent) {
					scope.$apply(function() {
						var content = {
							csv: onLoadEvent.target.result.replace(/\r\n|\r/g,'\n'),
							header: scope.csv.header,
							separator: scope.csv.separator
						};
						scope.csv.content = content.csv;
						scope.csv.result = csvToJSON(content);
						scope.csv.result.filename = scope.csv.filename;
						scope.$$postDigest(function(){
							if ( typeof scope.callback === 'function' ) {
								scope.callback(onChangeEvent);
							}
						});
                        
                        console.log( '|------------------------------------|' );
                        console.log( '121: IMPORT DIRECTIVE SCOPE', scope.csv.result );
                        
                        importService.buildHeaders( scope );
                        
					});
				};

				if ( (onChangeEvent.target.type === "file") && (onChangeEvent.target.files !== null || onChangeEvent.srcElement.files !== null) )  {
					reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0], scope.encoding);
				} else {
					if ( scope.csv.content !== null ) {
						var content = {
							csv: scope.csv.content,
							header: !scope.csv.header,
							separator: scope.csv.separator
						};
						scope.csv.result = csvToJSON(content);
						scope.$$postDigest(function(){
							if ( typeof scope.callback === 'function' ) {
								scope.callback(onChangeEvent);
							}
						});
                        
                        console.log( '|------------------------------------|' );
                        console.log( ' 143: IMPORT DIRECTIVE SCOPE', scope.result );
					}
				}
			});

			var csvToJSON = function(content) {
				var lines=content.csv.split(new RegExp('\n(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
				var result = [];
				var start = 0;
				var columnCount = lines[0].split(content.separator).length;

				var headers = [];
				if (content.header) {
					headers=lines[0].split(content.separator);
					start = 1;
				}

				for (var i=start; i<lines.length; i++) {
					var obj = {};
					var currentline=lines[i].split(new RegExp(content.separator+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
					if ( currentline.length === columnCount ) {
						if (content.header) {
							for (var j=0; j<headers.length; j++) {
								obj[headers[j]] = cleanCsvValue(currentline[j]);
							}
						} else {
							for (var k=0; k<currentline.length; k++) {
								obj[k] = cleanCsvValue(currentline[k]);
							}
						}
						result.push(obj);
					}
				}
				return result;
			};

			var cleanCsvValue = function(value) {
				return value
					.replace(/^\s*|\s*$/g,"") // remove leading & trailing space
					.replace(/^"|"$/g,"") // remove " on the beginning and end
					.replace(/""/g,'"'); // replace "" with "
			};
		}
	};
});