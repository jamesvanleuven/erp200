'use strict';

/**
 * @ngdoc directive
 * @name clientApp.customSelect
 * @description
 * # customSelect
 * Service in the clientApp.
 */
angular.module('clientApp')
    .directive('customSelect', function ($parse, $compile, $timeout, $q) {

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, controller) {
                
                // console.log( '|----------------------------------------|' );
                // console.log( 'CUSTOM-SELECT.ATTRS >> ', attrs );
                
				var customSelect = attrs.customSelect;
				if (!customSelect) {
					throw new Error('Expected custom-select attribute value.');
				}
                
                var format = function(value, replace){
                    if (!value) {
                        return value;
                    }
                    var target = value.toString();
                    if (replace === undefined) {
                        return target;
                    }
                    if (!angular.isArray(replace) && !angular.isObject(replace)) {
                        return target.split('$0').join(replace);
                    }
                    var token = angular.isArray(replace) && '$' || ':';

                    angular.forEach(replace, function (value, key) {
                        target = target.split(token + key).join(value);
                    });
                    return target;
                };
                
                var CS_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;

                var baseOptions = {
                    displayText: 'Select...',
                    emptyListText: 'There are no items to display',
                    emptySearchResultText: 'No results match "$0"',
                    addText: 'Add',
                    idx: attrs.id,
                    searchDelay: 300
                };

				var match = customSelect.match(CS_OPTIONS_REGEXP);

				if (!match) {
					throw new Error("Expected expression in form of " +
						"'_select_ (as _label_)? for _value_ in _collection_[ track by _id_]'" +
						" but got '" + customSelect + "'.");
				}

				// Ng-Options break down
				var displayFn = $parse(match[2] || match[1]),
					valueName = match[3],
					valueFn = $parse(match[2] ? match[1] : valueName),
					values = match[4],
					valuesFn = $parse(values),
					track = match[5],
					trackByExpr = track ? " track by " + track : "",
					dependsOn = attrs.csDependsOn;
                
                var getOptions = function(){
                    return angular.extend({}, baseOptions, scope.$eval(attrs.customSelectOptions));
                };
                
				var options = getOptions(),
					timeoutHandle,
					lastSearch = '',
					focusedIndex = -1,
						matchMap = {};
                
				var itemTemplate = element.html().trim() || '{{' + (match[2] || match[1]) + '}}',

					dropdownTemplate =
					'<a class="control-form input-sm dropdown-toggle" data-toggle="dropdown" href ng-class="{ disabled: disabled }">' +
						'<span>{{displayText}}</span>' +
						'<b></b>' +
					'</a>' +
					'<div class="dropdown-menu">' +
						'<div stop-propagation="click" class="custom-select-search">' +
                            '<input class="form-control" type="text" autocomplete="off" data-ng-model="searchTerm" />' +
							// '<input class="' + attrs.selectClass + '" type="text" autocomplete="off" data-ng-model="searchTerm" />' +
						'</div>' +
						'<ul role="menu">' +
							'<li role="presentation" ng-repeat="' + valueName + ' in matches' + trackByExpr + '">' +
								'<a role="menuitem" tabindex="-1" href ng-click="select(' + valueName + ')">' +
									itemTemplate +
								'</a>' +
							'</li>' +
							'<li ng-hide="matches.length" class="empty-result" stop-propagation="click">' +
								'<em class="muted">' +
									'<span ng-hide="searchTerm">{{emptyListText}}</span>' +
									'<span class="word-break" ng-show="searchTerm">{{ format(emptySearchResultText, searchTerm) }}</span>' +
								'</em>' +
							'</li>' +
						'</ul>' +
						'<div class="custom-select-action">' +
							(typeof options.onAdd === "function" ?
							'<button type="button" class="btn btn-primary btn-block add-button" ng-click="add()">{{addText}}</button>' : '') +
						'</div>' +
					'</div>';
                
				// Create dropdown element
				var dropdownElement = angular.element(dropdownTemplate),
					anchorElement = dropdownElement.eq(0).dropdown(),
					inputElement = dropdownElement.eq(1).find(':text'),
					ulElement = dropdownElement.eq(1).find('ul');

				// Create child scope for input and dropdown
				var childScope = scope.$new(true);
				var needsDisplayText;
                
				element.addClass('dropdown custom-select');

				// Clear element contents
				element.empty();
                
				var hashKey = function(obj) {
					if (obj === undefined){ return 'undefined'; }

					var objType = typeof obj,
						key;

					if (objType === 'object' && obj !== null) {
						if (typeof (key = obj.$$hashKey) === 'function') {
							// must invoke on object to keep the right this
							key = obj.$$hashKey();
						} else if (key === undefined) {
							key = obj.$$hashKey = 'cs-' + (current++);
						}
					} else {
						key = obj;
					}

					return objType + ':' + key;
				};
                
                var setDisplayText = function(){
					var locals = { };
					locals[valueName] = controller.$modelValue;
					var text = displayFn(scope, locals);

					if (text === undefined) {
						var map = matchMap[hashKey(controller.$modelValue)];
						if (map) {
							text = map.label;
						}
					}

					needsDisplayText = !text;
					childScope.displayText = text || options.displayText;
                };
                
                var configChildScope = function(){
					childScope.addText = options.addText;
					childScope.emptySearchResultText = options.emptySearchResultText;
					childScope.emptyListText = options.emptyListText;

					childScope.select = function (item) {
                        
                        // // console.log( 'childScope.select.item', item );
                        
						var locals = {};
						locals[valueName] = item;
						var value = valueFn(childScope, locals);
						//setDisplayText(displayFn(scope, locals));
						childScope.displayText = displayFn(childScope, locals) || options.displayText;
						controller.$setViewValue(value);

						anchorElement.focus();

						typeof options.onSelect === "function" && options.onSelect(item);
					};

					childScope.add = function () {
						$q.when(options.onAdd(childScope.searchTerm), function (item) {
							if (!item){ return; }

							var locals = {};
							locals[valueName] = item;
							var value = valueFn(scope, locals),
								label = displayFn(scope, locals);

							matchMap[hashKey(value)] = {
								value: value,
								label: label/*,
									model: matches[i]*/
							};

							childScope.matches.push(item);
							childScope.select(item);
						});
					};

					childScope.format = format;

					setDisplayText();
                };
				configChildScope();

				// Click event handler to set initial values and focus when the dropdown is shown
				anchorElement.on('click', function () {
                    // console.log( 'event', event );
					if (childScope.disabled) {
						return;
					}
					childScope.$apply(function () {
						lastSearch = '';
						childScope.searchTerm = '';
					});
					
					focusedIndex = -1;
					inputElement.focus();

                    // If filter is not async, perform search in case model changed
                    if (!options.async) {
                        getMatches('');
                    }
				});
				
				if (dependsOn) {
					scope.$watch(dependsOn, function (newVal, oldVal) {
						if (newVal !== oldVal) {
							childScope.matches = [];
							childScope.select(undefined);
						}
					});
				}

				// Event handler for key press (when the user types a character while focus is on the anchor element)
				anchorElement.on('keypress', function (event) {
					if (!(event.altKey || event.ctrlKey)) {
						anchorElement.click();
					}
				});

				// Event handler for Esc, Enter, Tab and Down keys on input search
				inputElement.on('keydown', function (event) {
					if (!/(13|27|40|^9$)/.test(event.keyCode)){ return; }
					event.preventDefault();
					event.stopPropagation();

					switch (event.keyCode) {
						case 27: // Esc
							anchorElement.dropdown('toggle');
							break;
						case 13: // Enter
							selectFromInput();
							break;
						case 40: // Down
							focusFirst();
							break;
						case 9:// Tab
							anchorElement.dropdown('toggle');
							break;
					}
				});

				// Event handler for Up and Down keys on dropdown menu
				ulElement.on('keydown', function (event) {
					if (!/(38|40)/.test(event.keyCode)){ return; }
					event.preventDefault();
					event.stopPropagation();

					var items = ulElement.find('li > a');

					if (!items.length){ return; }
					if (event.keyCode === 38){ focusedIndex--; } // up
					if (event.keyCode === 40 && focusedIndex < items.length - 1){ focusedIndex++; } // down
				    
                    // if (!~focusedIndex){ focusedIndex = 0; }

					if (focusedIndex >= 0) {
						items.eq(focusedIndex).focus();
					} else {
						focusedIndex = -1;
						inputElement.focus();
					}
				});
                
				var resetMatches = function() {
					childScope.matches = [];
					focusedIndex = -1;
				};

				resetMatches();

				// Compile template against child scope
				$compile(dropdownElement)(childScope);
				element.append(dropdownElement);

				// When model changes outside of the control, update the display text
				controller.$render = function () {
					setDisplayText();
				};
                
				var getDisplayText = function() {
					options = getOptions();
					return options.displayText;
				};

				// Watch for changes in the default display text
				childScope.$watch(getDisplayText, setDisplayText);

				childScope.$watch(function () { return element.attr('disabled'); }, function (value) {
					childScope.disabled = value;
				});

				childScope.$watch('searchTerm', function (newValue) {
					if (timeoutHandle) {
						$timeout.cancel(timeoutHandle);
					}

					var term = (newValue || '').trim();
					timeoutHandle = $timeout(function () {
						getMatches(term);
					},
					// If empty string, do not delay
					(term && options.searchDelay) || 0);
				});

				// Support for autofocus
				if ('autofocus' in attrs) {
					anchorElement.focus();
				}

				var focusFirst = function() {
					var opts = ulElement.find('li > a');
					if (opts.length > 0) {
						focusedIndex = 0;
						opts.eq(0).focus();
					}
				};

				// Selects the first element on the list when the user presses Enter inside the search input
				var selectFromInput = function() {
					var opts = ulElement.find('li > a');
					if (opts.length > 0) {
						var ngRepeatItem = opts.eq(0).scope();
						var item = ngRepeatItem[valueName];
						childScope.$apply(function() {
							childScope.select(item);
						});
						anchorElement.dropdown('toggle');
					}
				};

				var getMatches = function(searchTerm) {
					var locals = { $searchTerm: searchTerm };
					$q.when(valuesFn(scope, locals)).then(function (matches) {
						if (!matches){ return; }

						if (searchTerm === inputElement.val().trim()/* && hasFocus*/) {
							matchMap = {};
							childScope.matches.length = 0;
							for (var i = 0; i < matches.length; i++) {
								locals[valueName] = matches[i];
								var value = valueFn(scope, locals),
									label = displayFn(scope, locals);

								matchMap[hashKey(value)] = {
									value: value,
									label: label/*,
									model: matches[i]*/
								};

								childScope.matches.push(matches[i]);
                                
                                // scope.selectHide(key);
							}
							//childScope.matches = matches;
						}

						if (needsDisplayText){ setDisplayText(); }
					}, function() {
						resetMatches();
					});
				};

				var current = 0;
			}
		};
	})
    .directive('stopPropagation', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var events = attrs.stopPropagation;
				element.bind(events, function (event) {
					event.stopPropagation();
				});
			}
		};
	});