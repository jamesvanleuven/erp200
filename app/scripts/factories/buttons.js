'use strict';

/**
 * GENERAL JSON OBJECT BUTTON EVENT
 */

angular.module('clientApp').factory('buttons', function( $rootScope, utils ){
    
    return {

        // VIEW RECORD BUTTON 
        viewButton: function(){
            var btn = '<button type="button" class="btn btn-xs"';
            btn += ' data-id="view"';
            btn += ' data-ng-click="button($index, $event)"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="fa fa-eye"></i></button>';
            return btn;
        },

        // EDIT RECORD BUTTON
        editButton: function(){
            var btn = '<button type="button" class="btn btn-xs"';
            btn += ' data-id="edit"';
            btn += ' data-ng-click="button($index, $event)"';
            btn += ' data-ng-disabled="disableButton"';
            btn += ' style="margin-top: 5px;">';
            btn += '<i class="fa fa-pencil"></i></button>';
            return btn;
        },

        // DELETE RECORD BUTTON
        deleteButton: function(){
            var btn = '<button type="button" class="btn btn-sm"';
            btn += ' data-id="delete"';
            btn += ' data-ng-click="button($index, $event)"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="fa fa-trash-o"></i></button>';
            return btn;
        },
        
        // THE COMMENT BUTTON
        commentButton: function($scope){
            var btn = '<button type="button" class=""'; //btn btn-sm
            btn += ' custom-popover popover-html="{{';
            btn += $scope.$parent.currentModule.name.toLowerCase();
            btn += '[$index].notes.value[0].details}}"';
            btn += ' popover-label="comment"';
            btn += ' popover-placement="top">';
            btn += '<i class="fa fa-comment"></i></button>';
            return btn;
        },
        
        /********************************
         *  BUTTONS FOR Resource Form 
         */
        submitButton: function(){
             var btn = '<button type="submit" class="btn btn-sm btn-primary btn-block"';
            btn += ' data-id="submit">';
            //btn += ' data-ng-click="button($index, $event)"';
            //btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="fa fa-refresh"></i> Submit</button>';
            return btn;
        },
        /********************************
         *  BUTTONS FOR SEARCH PANEL
         */
        
        // SEARCH BUTTON
        filterSearch: function( $scope ){
            var thisModule = $scope.$parent.currentModule,
                moduleType = thisModule.type;
            
            var btn = '<button type="button" class="btn btn-primary btn-sm"';
            moduleType === 3 ? 
                btn += ' data-ng-click="reportFilter()"' : 
                btn += ' data-ng-click="searchfilter()"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="search-button fa fa-search"></i> Search</button>';
            return btn;
        },
        
        filterReset: function(){
            var btn = '<button type="button" class="btn btn-primary btn-sm"';
            btn += ' data-ng-click="resetfilter()"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="search-button fa fa-refresh"></i> Reset</button>';
            return btn;
        }, 
        
        filterClear: function(){
            var btn = '<button type="button" class="btn btn-primary btn-sm"';
            btn += ' data-ng-click="clearfilter()"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="search-button fa fa-minus-square-o"></i> Clear</button>';
            return btn;
        },
        
        filterClose: function(){
            var btn = '<button type="button" class="search-button btn btn-primary btn-sm"';
            btn += ' data-ng-click="sidebar()"';
            btn += ' data-ng-disabled="disableButton">';
            btn += '<i class="fa fa-times"></i> Close</button>';
            return btn;
        },
        
        modalClose: function(){
            var btn = '<button class="btn btn-sm btn-default" data-dismiss="modal" data-ng-click="resetModal();">';
            btn+= '<i class="fa fa-times"></i> cancel</button>';
            return btn;
        },
        
        modalTimesClose: function(){
            var btn = '<button type="button" class="close" data-dismiss="modal" aria-label="Close"';
            btn += ' data-ng-click="closeModal();"><span aria-hidden="true"><i class="fa fa-times"></i></span></button>';
            return btn;
        },
        
        modalSubmit: function( moduleName, moduleMethod ){
            var btn = '<button class="btn btn-sm btn-primary"';
            btn += ' data-ng-click="modalSubmit(\'' + moduleMethod + '\');">';
            btn += '<i class="fa fa-save"></i>';
            btn += ' <small>' + utils.stringCapitalise(moduleMethod.replace(/_/g, ' '));
            btn += ' ' + utils.stringCapitalise(moduleName.replace(/_/g, ' '));
            btn += '</small></button>';
            return btn;
        },
        
        modalExit: function(){
            var btn = '<button type="button" class="btn btn-sm btn-default" data-dismiss="modal" aria-label="Close"';
            btn += ' data-ng-click="closeModal();"><span aria-hidden="true"><i class="fa fa-times"></i> Close</span></button>';
            return btn;
        },
        
        addSubmit: function(label){
            var btn = '<button class="btn btn-sm btn-primary"';
            btn += ' data-ng-click="modalSubmit(0, $event, \'edit\');">';
            btn += '<i class="fa fa-download"></i> Place '+label+'</button>';
            return btn;
        },
        editSubmit: function(label){
            var btn = '<button class="btn btn-sm btn-primary"';
            btn += ' data-ng-click="modalSubmit($index, $event, \'edit\');">';
            btn += '<i class="fa fa-download"></i> Save '+label+'</button>';
            return btn;
        },
        update : function(object){
            var btn = '<button type="button" class="';//btn btn-sm
            btn += object.disabled ? ' disabled"' : '"';
            btn += object.id ? ' data-ng-click="button($index, $event)"' : '';
            btn += ' data-ng-disabled="disableButton"';
            btn += object.id ? ' data-id="'+object.id+'"' : ''; 
            btn += object.type ? ' data-type="'+object.type+'"' : ''; 
            btn += object.value ? ' data-value="'+object.value+'"' : '';
            btn += object.disabled ? 'disabled>' : '>';
            btn += object.icon ? '<i class="fa fa-'+object.icon+'"></i>' : '';
            btn += '</button>';
            return btn;
        }
        
    };

});
