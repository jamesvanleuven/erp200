'use strict';

/**
 * @ngdoc service
 * @name clientApp.tableService
 * @description
 * # tableService
 * Service in the clientApp
 */


angular.module('clientApp.tableServices', []).service('tableService', function ($q, $rootScope, $window, utils, buttons, elements) {
    
    return {
        
        pagingList: function(a, b, c){
            var str = '';
			
            for(var k = 0; k < c.length; k++ ){
                str += '<option value="' + c[k] + '"';
                if( b === c[k] ){ str += ' selected="selected"'; }
                str += '>'+c[k]+'</option>';
            }
			
            // str += '<option value="'+parseInt(a*b)+'">All Records</option>';  --DISABLE ALL RECORDS
			
            return str;
        },
        
        loadPagingOptions: function(o, cnt, moduleType){
            var self = this, str = '<tr><th colspan="'+parseInt(cnt)+'">';
            str += '<div class="input-group center-block" style="margin:15px 0;"><span class="input-group-addon">'
            str += '<small>' + o.totalRecords + ' Total Records | Showing ';
            str += '<select name="itemsPerPage" data-ng-model="currentModule.paging.limit"';
            str += ' data-ng-change="setCurrent({{currentModule.paging.page}})">';
            str += self.pagingList(o.pages, o.limit, o.options)+'</select>';
            str += ' Rows Per Page</small></span>';
            str += '<span class="input-group-addon"><a href="" class="btn btn-primary btn-xs" title="Previous page"';
            str += ' data-ng-class="{ disabled : currentModule.paging.page == 1 }"';
            str += ' data-ng-click="setCurrent(currentModule.paging.page - 1)"';
            str += ' data-ng-disabled="disableButton">&lsaquo; last page</a></span>';
            str += '<span class="input-group-addon">';
            str += '<small>Page {{currentModule.paging.page}} of';
            str += ' <item data-ng-if="(currentModule.paging.totalRecords/currentModule.paging.limit) < 1">1</item>';
            str += ' <item data-ng-if="(currentModule.paging.totalRecords/currentModule.paging.limit) >= 1">';
            str += '{{ (currentModule.paging.totalRecords/currentModule.paging.limit) | number: 0 }}</item>';
            str += '</small></span>'
            str += '<span class="input-group-addon"><a href="" class="btn btn-primary btn-xs" title="Next page"';
            str += ' data-ng-class="{ disabled : ' + parseInt(o.page);
            str += ' == ' + parseInt(o.pages) + ' }"';
            str += ' data-ng-click="setCurrent(currentModule.paging.page + 1)"';
            str += ' data-ng-disabled="disableButton">next page &rsaquo;</a></span>';
            str += '<span class="search-bar input-group-addon">';
            str += '<div class="input-group" style="width: 400px;">';
			
			if(moduleType === 3){
				str += '<!-- REPORT TYPE -->';
				str += '<div class="col-md-3"><div class="form-group"><div class="input-group">';
				str += '<span class="input-group-addon input-sm">Report Type: </span>';
				str += '<div id="report" style="text-align:left;" custom-select="r as r.value for r';
				str += ' in $root.assets.reports.bi_types track by $index" data-ng-model="currentModule.report.type" data-ng-change="quickJump({{$event}})">';
				str += '<div class="media"><div class="media-body"><h6 class="media-heading text-capitalize">{{ r.value }}</h6>';
				str += '</div></div></div></div></div></div>';
			}
			
            str += '<!-- <input type="text" data-ng-model="search" class="form-control input-sm"';
            str += ' id="globalSearch" style="width: 400px;" placeholder="Global Search"/>';
            str += '<span class="input-group-btn">';
            str += '<button class="btn btn-primary btn-sm" type="button" data-ng-click="globalFilter()">Search</button>';
            str += '</span> -->';
            str += '</div>';
            str += '</span></div></span></th></tr>';
            return str;
        },
        
        parseTable: function($scope){
            var self = this, deferred = $q.defer(), parsed = {}, sstr = 'id', 
                thisModule = $scope.currentModule, 
                moduleName = angular.lowercase(thisModule.name), 
                moduleType = thisModule.type, 
                modulePermissions = thisModule.permissions, 
                moduleData = $scope[moduleName], 
                itemsPerPageOptions = thisModule.paging.options, 
                itemsPerPage = thisModule.paging.limit, pageNumber = thisModule.paging.page, 
                establishment = parseInt($window.sessionStorage.establishment);
            
            if( establishment === 0 && moduleName === 'products' ){
                var container = '<div data-ng-include="\'views/modules/_partials/_buttons/_viewbuttons.html\'"/>';
                var content = ({ selector: container });
                deferred.resolve(content);
            }
            else{
                var totalRecords = parseInt($window.sessionStorage.totalRecords), // moduleData[0].totalRecords, 
                    totalColumns = 0, 
                    totalPages = parseInt(Math.round(totalRecords / itemsPerPage)),
                    columns = [], 
                    newPagingOptions = {}, 
                    upper = parseInt( itemsPerPage * pageNumber), 
                    lower = parseInt( upper - itemsPerPage + 1);
                
                totalPages <= 0 ? 
                    totalPages = 1 : null;

                // PAGING OPTIONS
                newPagingOptions = {
                    limit: itemsPerPage, offset: lower, 
                    totalRecords: totalRecords, options: itemsPerPageOptions, 
                    page: pageNumber, pages: totalPages,
                    range: {  lower: lower, total: totalRecords, upper: upper }
                };
                // DEFINE PAGING SCOPE OBJECT
                (!$scope.currentModule.paging) ? 
                    $scope.currentModule.paging = newPagingOptions : 
                    null;
                
                //  BUILD FILTER
                var filter = self.loadPagingOptions( newPagingOptions, columns.length + 1, moduleType );

                var tHead = filter+'<div class="table-responsive">';
                tHead += '<table class="module-content table table-hover table-condensed"><thead>';

                var tColumns = '<tr>', 
                    tBody = '<tr data-ng-repeat="item in ' + moduleName, 
                    iconHeader = '<th></th>', 
                    icons = '';
                
                tBody += '" data-ordinal="{{$index}}" data-id="{{item.id}}">';
                
                if( moduleType === 2 || moduleType === 3 ){
                    tColumns += '<th>' + elements.batchCheckbox('th') + '</th>';
                    tBody += '<td data-id="{{$index}}">' + elements.batchCheckbox('td') + '</td>';   
                }
				
				var resourceAddresses = function(){};
                
                // BUILD TABLE COLUMNS & CELL ELEMENTS/FORM FIELDS
                var buildTable = function(row, key){
                    
                    if( row.input && row.input !== 'json' ){
                        
                        // COLUMNS
                        tColumns += '<th class="bold-column-header ' + key + '"';
                        row.visible === false ? 
                            tColumns += ' style="display: none;"' : 
                            tColumns += ' style=""';
                        
                        tColumns += '>' + elements.rowLabel(row, key) + '</th>';
						
                        // ROWS
                        tBody += '<td class="' + key + '"';
						
                        row.visible === false ? 
                            tBody += ' style="display: none;"' : 
                            tBody += ' style=""';
                        
                        tBody += '>' + elements.rowItem(row, key) + '</td>';
                    }
                    
                };
                
                // BUILD THE PAGINATION TABLE
                angular.forEach(moduleData[0], function(row, key){ 
					
					// console.log( '|-------------------------------------|' );
					// console.log( key, row );
					
                    if( utils.toType(row) !== 'undefined' ){
                        row.input !== 'null' ? buildTable(row, key) : null;
                    }
                    
                });
                
                tColumns += iconHeader;
                
                // PERMISSION BUTTONS
                var btnB = '';
                if( moduleData.length === 0){
                    btnB += '<td></td>';
                }else{
    
                    btnB += '<td style="padding:0px;">';
                    
                    moduleType !== 3 && modulePermissions._put === true ? 
                        btnB += buttons.editButton() : null;

                    btnB += '</td>';   
                }

                
                parsed['header'] = tHead+tColumns+'</tr></thead>';
                parsed['body'] = '<tbody>'+tBody+btnB+'</tr></tbody>';
                parsed['footer'] = '</table></div>';

                deferred.resolve(parsed);
            }
            return deferred.promise;
        }
    }
    
});
