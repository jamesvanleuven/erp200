'use strict';

/**
 * @ngdoc service
 * @name clientApp.modalServices
 * @description
 * # generatePDF
 * Service in the clientApp.modalService
 */
angular.module('clientApp.modalServices',[]).service('modalService', function ($q, $compile, utils, buttons){
    
    return {
        
        closeModal: function(){
            angular.element('.modal').remove();
        },
        
        launchModal: function( $scope ){
            
            console.log( '|----------------------------------------|' );
            console.log( 'launchModal.$scope', $scope );
            
            var self = this, 
                modalHeader = '', modalBody = '', modalFooter = '',
                thisModule = $scope.$parent.currentModule,
                moduleName = thisModule.name,
                moduleMethod = thisModule.modal.method,
                moduleType = thisModule.type,
                status = 0;
            
            // PROTOTYPE HIJACK OF MODAL WINDOW ATTRIBUTES
            Element.prototype.setAttributes = function(attrs){
                for (var idx in attrs) {
                    if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
                        for (var prop in attrs[idx]){this.style[prop] = attrs[idx][prop];}
                    } else if (idx === 'html') {
                        this.innerHTML = attrs[idx];
                    } else {
                        this.setAttribute(idx, attrs[idx]);
                    }
                }
            };
            
            // console.log( '|----------------------------------------|' );
            // console.log( 'MODAL SCOPE >> ', $scope );
            
            var statuses = '<span class="pull-right status-title {{newTransaction.status.selected.value}}">';
            statuses += '<strong>{{newTransaction.status.selected.value}}</strong> &nbsp; &nbsp; &nbsp;';
            
            modalHeader += '<div class="modal-dialog modal-lg" data-backdrop="static" data-keyboard="false"';
            modalHeader += ' style="width: 100% !important;">';
            modalHeader += '<div class="modal-content">';
            modalHeader += '<div class="modal-header">';
            
            moduleType === 2 ? 
                modalHeader += statuses + buttons.modalTimesClose() :
                modalHeader += '<span class="pull-right">' + buttons.modalTimesClose();
            
            modalHeader += '<div growl inline="false" reference="3"/>';
            
			modalHeader += '</span><h4 class="modal-title">';
			modalHeader += '</span><h4 class="modal-title clearfix">';
			modalHeader += '<div class="modal-spinner-holder pull-left" style="display:none" data-loading>';		
			modalHeader += '<div class="modal-spinner">';		
			modalHeader += '<i class="fa fa-spinner fa-pulse fa-1x fa-fw margin-bottom"></i>';		
			modalHeader += '</div></div>';
			modalHeader += utils.stringCapitalise(moduleMethod + ' ' + moduleName);
			modalHeader += '</h4></div>';
            
            /*
            // modalHeader += '<div class="modal-dialog modal-lg" style="width: 100%;" data-backdrop="static" data-keyboard="false">';
            modalHeader += '<div class="modal-content">';
            // modalHeader += '<form name="form" novalidate>';
            modalHeader += '<div class="modal-header">';
            moduleName === 'Orders' || moduleName === 'Transfers' ? 
                modalHeader += statuses + buttons.modalTimesClose() : 
                modalHeader += '<span class="pull-right"><div growl inline="false" reference="3"></div>' + buttons.modalTimesClose();
            modalHeader += '</span><h4 class="modal-title">';
            modalHeader += utils.stringCapitalise(moduleMethod + ' ' + moduleName) + '</h4></div>';
            */
            
            modalBody += '<div class="modal-body container-fluid" id="modalContainer" bs-affix-target>';
            // modalBody += '<form name-="form" novalidate>';
            // modalBody += '<div id="modalContainer"></div>';
            // modalBody += '</form></div>';
            modalBody += '</div>';

            modalFooter += '<div class="modal-footer">';

            // if( utils.toType($scope.newTransaction.status) !== 'undefined' ){
                // REMOVE EDIT BUTTON FOR LOCKED TRANSACTIONS
                if( parseInt(moduleType) === 2 ){
                    status = $scope.newTransaction.status.selected.id;
                    // console.log( '|----------------------------------------|' );
                    // console.log( 'CURRENT STATUS >> ', status );
					/*
                    switch(moduleName.toLowerCase()){
                        case 'transfers':
                            // console.log( '|----------------------------------------|' );
                            // console.log( 'REMOVE TRANSFERS EDIT BUTTON' );
                            if( parseInt(status) === 4 || parseInt(status) === 7 ){
                                modalFooter += buttons.modalExit(moduleName);
                            }
                            else{
                                modalFooter += buttons.modalClose();
                                modalFooter += buttons.modalSubmit(moduleName,moduleMethod);
                            }
                        break;
                        case 'orders': 
                            // console.log( '|----------------------------------------|' );
                            // console.log( 'REMOVE ORDERS EDIT BUTTON' );
                            if( parseInt(status) === 3 || parseInt(status) === 4 ){
                                modalFooter += buttons.modalExit(moduleName);
                            }
                            else{
                                modalFooter += buttons.modalClose();
                                modalFooter += buttons.modalSubmit(moduleName,moduleMethod);
                            }
                        break;
                    }
					*/
					
					modalFooter += buttons.modalClose();
					modalFooter += buttons.modalSubmit(moduleName,moduleMethod);
					
                }
                else{
                    modalFooter += buttons.modalClose();
                    modalFooter += buttons.modalSubmit(moduleName,moduleMethod);
                }   
            // }
            
            modalFooter += '</div></div></div>';
            
            var modal = modalHeader + modalBody + modalFooter,
                id = utils.camelCase(moduleName + '-' + moduleMethod);
            
            var div = document.createElement('div');
            div.setAttributes({ 
                class: 'modal fade',role: 'document',
                style: {display: 'none'}
            });
            
            div.appendChild(document.createDocumentFragment(modal));
            angular.element('div#wrap').append($compile(div)($scope));
            // angular.element(document.body).append($compile(div)($scope));
            angular.element('div.modal').html($compile(modal)($scope));
            angular.element('div.modal').modal().on('hidden.bs.modal', function(e){ 
                self.closeModal(); 
            });
        }
        
    };
    
});