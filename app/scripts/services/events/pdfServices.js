'use strict';

/**
 * @ngdoc service
 * @name clientApp.pdfServices
 * @description
 * # pdfService
 * Service in the clientApp.
 */

/* ================================================
    Service to Manage Modules
================================================ */
angular.module('clientApp.pdfServices', []).service('pdfService', [
    '$q',
    '$rootScope',
    '$route',
    '$window',
    '$location',
    'utils',
    'channels',
    'doc60',
    'moment', 
    'modalService',
    'picklist',
    'pickprint',
function($q, $rootScope, $route, $window, $location, utils, channels, doc60, moment, modalService, picklist, pickprint) {

    // INJECT PDFMAKE :: http://pdfmake.org/#/gettingstarted
    var pdfMake = $window.pdfMake;
    var pdfJS = $window.jsPDF;
    var html2canvas = $window.html2canvas;

    return {
        
        config: function( $scope, $event ){
            var self = this,
                thisModule = $scope.$parent.currentModule,
                thisModal = thisModule.modal,
                thisMethod = thisModal.method,
                moduleName = thisModule.name.toLowerCase(),
                moduleType = thisModule.type;
            
            console.log( '|-------------------------------------|' );
            console.log( 'PDF-SERVICE.CONFIG.THIS-MODULE >> ', thisModule );
            console.log( 'PDF-SERVICE.CONFIG.THIS-MODAL >> ', thisModal );
            console.log( 'PDF-SERVICE.CONFIG.METHOD >> ', thisMethod );
            console.log( 'PDF-SERVICE.CONFIG.MODULE-NAME >> ', moduleName );
            console.log( 'PDF-SERVICE.CONFIG.MODULE-TYPE >> ', moduleType );
        },
        
        pdfOptions: function( $scope, $event ){
            
            console.log( '|-------------------------------------|' );
            console.log( 'PDF-SERVICES.PDF-OPTIONS.SCOPE >> ', $scope );
            console.log( 'PDF-SERVICES>PDF-OPTIONS.EVENT >> ', $event );
            
            var self = this, 
                logo = null;
			
            utils.toType($rootScope.profile.company_logo) === 'undefined' ?
                $rootScope.profile.company_logo = self.drawImage(angular.element('#navlogo').get(0).src) : 
                $rootScope.profile.company_logo = self.drawImage($rootScope.profile.company_logo);
            
			// POST BASE64 LOGO TO $rootScope.profile
            console.log( 'LOGO >> ', $rootScope.profile.company_logo );

            var type = $event.currentTarget.dataset.type;
            var document = { 
                'doc60': function(){ return self.doc60($scope, $event); },
                'billoflading': function(){ return self.billOfLading($scope, $event); },
                'print': function(){ return self.print($scope, $event); }
            };

            return document[type]();
        },
        
        /*
        * Author: Jehanzeb Naeem Khan
        * Created: 24th September 2017
        * Reason: This function is created to avoid overloading the previous code
        * It would be very similar to pdfOptions if not the same.
        */
        pdfPickListOptions: function($scope, $event){
            console.log( '|-------------------------------------|' );
            console.log( 'PDF-SERVICES.PICK-LIST-OPTIONS.SCOPE >> ', $scope );
            console.log( 'PDF-SERVICES.PICK-LIST-OPTIONS.EVENT >> ', $event );
            
            var self = this, 
                logo = null;
			
            utils.toType($rootScope.profile.company_logo) === 'undefined' ?
                $rootScope.profile.company_logo = self.drawImage(angular.element('#navlogo').get(0).src) : 
                $rootScope.profile.company_logo = self.drawImage($rootScope.profile.company_logo);
            
			// POST BASE64 LOGO TO $rootScope.profile
            console.log( 'LOGO >> ', $rootScope.profile.company_logo );

            return self.printPickList($scope, $event); 
        },
        
        /*
        * 
        * 
        * 
        */
        pdfPrintPickOptions: function($scope, $event){
            console.log( '|-------------------------------------|' );
            console.log( 'PDF-SERVICES.PICK-LIST-OPTIONS.SCOPE >> ', $scope );
            console.log( 'PDF-SERVICES.PICK-LIST-OPTIONS.EVENT >> ', $event );
            
            var self = this, 
                logo = null;
			
            utils.toType($rootScope.profile.company_logo) === 'undefined' ?
                $rootScope.profile.company_logo = self.drawImage(angular.element('#navlogo').get(0).src) : 
                $rootScope.profile.company_logo = self.drawImage($rootScope.profile.company_logo);
            
			// POST BASE64 LOGO TO $rootScope.profile
            console.log( 'LOGO >> ', $rootScope.profile.company_logo );

            return self.printNew($scope, $event); 
        },
        
        /*
        * Author: Jehanzeb Naeem Khan
        * Created: 24th September 2017
        * Reason: 
        * This function was created to abstain from touching the original print function
        * If the code works, it should be merged/refactored into the original print function.
        */
        printPickList: function($scope, $event){
                var self = this,
                logo = self.drawImage(angular.element('#navlogo').get(0).src),
                pdfDocument = {},
                doc = [],
                thisBatch = $scope.thisBatch,
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toUpperCase();
            $rootScope.motto = 'There\'s no flesh or blood within this cloak to kill. There\'s only an idea. Ideas are bulletproof.';
            
            doc.push([
                {
                    columns: [
                        [ picklist.docImage(logo, { width: 30, height: 30 })],
                        [],
                        [ picklist.docText(moduleName, [ 'docHeader', 'textRight' ])]
                    ]
                },
                { columns: [ [{text: new Date().toString() || '', style:'basicTextRightAligned'}] ] },
                { columns: [ [{text: ' ', style:'basicTextCenterAligned'}] ] },
                //picklist.createDocument(thisBatch)
                pickprint.createDocument(thisBatch)
            ]);
            
            pdfDocument =   {
                content: doc, 
                styles: picklist.picklistStylingOptions(),
                pageOrientation: 'landscape'
            };
            
            console.log(' PDF document >> ', pdfDocument);
            
            pdfMake.createPdf(pdfDocument).print();
        },
        
        
        /**
         * Build batch items from ids
         *
         * @param  object  $scope
         * @param  id  assetId
         * @return  array  PDFItems
         *
         */
        parseAsset  :   function($scope){
            var self = this,
                moduleName = $scope.$parent.currentModule.name.toLowerCase(),
                customers = $rootScope.profile.customers,
                manufacturers = $rootScope.profile.manufacturers,
                batchItems = $scope.batchItems,
                PDFItems = [];
            
            $scope[moduleName].map(function(item, key){
                batchItems.map(function(ordinal, idx){
                    parseInt(ordinal) === parseInt(key) ? 
                        PDFItems.push(item) : 
                        null;
                });
            });
            
            angular.forEach(PDFItems, function (item, key) {
                // CUSTOMER ADDRESS
                utils.toType(item.customer) === 'object' ?
                    item.customer.selected.address = self.buildAddress('customers', item.customer.selected.id).$$state.value :
                    null;
                // MANUFACTURER ADDRESS
                utils.toType(item.manufacturer) === 'object' ?
                    item.manufacturer.selected.address = self.buildAddress('manufacturers', item.manufacturer.selected.id).$$state.value : null;
                // PRODUCT DETAILS
                utils.toType(item.products) === 'object' ? item.products.value = self.buildProduct('products', item.products.value, moduleName).$$state.value : null;
            });
            
            
            
            return PDFItems;
        },
        /**
         * 
         * @param  object  asset
         * @param  id  assetId
         * @return  object  Promise
         *
         */
        buildAddress: function(asset, assetId){
            var self = this, deferred = $q.defer();
            angular.forEach( $rootScope.profile[asset], function(item){
                parseInt(item.id) === parseInt(assetId) ? 
                    deferred.resolve(item.address) : 
                    null;
            });

            return deferred.promise;
        },
        /**
         * 
         * @param  object  asset
         * @param  object  assetItems
         * @param  string  moduleName
         * @return  object  Promise
         *
         */
		
        buildProduct: function (asset, assetItems, moduleName) {
            var self = this,
                deferred = $q.defer(),
                assetArray = [];
            angular.forEach($rootScope.assets[moduleName][asset], function(item){
                for (var i = 0; i < assetItems.length; i++) {
                    //// console.log('current item',item);
                    if ( parseInt(assetItems[i].id) === parseInt(item.id) ) {
                        //// console.log('current asset',assetItems[i]);
                        assetItems[i].price ? 
                            item.special_price = parseFloat(assetItems[i].price).toFixed(2) : parseFloat(0).toFixed(2);
                        
                        assetItems[i].quantity ? 
                            item.quantity = assetItems[i].quantity : 
                                    parseFloat(0).toFixed(2);
                        
                        //// console.log('current item',item);
                        
                        assetArray.push(item);
                    }
                }
            });
            //// console.log('buildProducts', assetArray);
            deferred.resolve(assetArray);
            return deferred.promise;
        },
		
        /**
         * Render doc60 PDF
         *
         * @param  object  $event
         * @param  object  $scope
         */
        doc60: function($scope, $event){
			
			console.log( '|-------------------------------------|' );
			console.log( 'SCOPE >> ', $scope );
			console.log( 'EVENT >> ', $event );
			console.log( '|-------------------------------------|' );
			console.log( 'PDF-THIS-BATCH >> ', $scope.thisBatch );
			
			var self = this, 
				deferred = $q.defer(),
				thisModule = $scope.$parent.currentModule,
				moduleName = thisModule.name.toLowerCase(),
				moduleType = thisModule.type,
				thisLocation = thisModule.location,
				thisBatch = $scope.thisBatch;
			
			// BUILD PDF-DOCUMENT
			var jsonDocument = [],
                docCSS = doc60.docStyleOptions();
			
			// SET A SCOPE FOR THIS DOCUMENT BUILDER
			$scope.pdfJSON = [];
			
			for( var i = 0; i < thisBatch.length; i++ ){
				
				console.log( '|-------------------------------------|' );
				console.log( 'THIS-BATCH[' + i  + '] >> ', thisBatch[i] );
				
				var // docHeader = null,
					// docTable = null,
					// docSignature = null,
					// docFooter = null,
					// docPageBreak = null,
					watermark = null;

				var docHeader = doc60.invoiceHeader( thisBatch[i] ),
                    docTable = doc60.invoiceTable( thisBatch[i] ),
                    docSignature = doc60.invoiceSignatures(),
                    docFooter = doc60.invoiceFooter( thisBatch[i] ),
                    docPageBreak = doc60.docPageBreak();
                
                console.log( '|-------------------------------------|' );
                console.log( 'DOC-HEADER >> ', docHeader );
                console.log( 'DOC-TABLE >> ', docTable );
                console.log( 'DOC-SIGNATURE >> ', docSignature );
                console.log( 'DOC-FOOTER >> ', docFooter );
                console.log( 'DOC-PAGE-BREAK >> ', docPageBreak );
				
				
				( i < (thisBatch.length - 1) ) ? 
					$scope.pdfJSON.push([ docHeader, docTable, docSignature, docFooter, docPageBreak ]) : 
					$scope.pdfJSON.push([ docHeader, docTable, docSignature, docFooter ]);

			}
			
			console.log( '|-------------------------------------|' );
			console.log( 'JSON-DOCUMENT >> ', jsonDocument );
			
				
			if( $scope.pdfJSON.length === $scope.thisBatch.length ){
				
				console.log( '|-------------------------------------|' );
				console.log( 'THIS-BATCH.LENGTH >> ', $scope.thisBatch.length );
				console.log( 'PDF-JSON.LENGTH >> ', $scope.pdfJSON.length );
				
				var finalDocument = [];
				angular.copy($scope.pdfJSON, finalDocument);
				
				var pdfDocument = {
					content: finalDocument,
					styles: docCSS
				};
				
				console.log( '|-------------------------------------|' );
				console.log( 'PDF-DOCUMENT >> ', pdfDocument );
				
				var pdfDate = moment(new Date()).format('YYYY-MM-DD'),
					pdfLabel = pdfDate + '.doc60.pdf';
				// pdfMake.createPdf(pdfDocument).open();
				pdfMake.createPdf(pdfDocument).download( pdfLabel, function(){
					
					delete $scope.pdfJSON;
					delete $scope.thisBatch;
					
				});

			}

        },
		
        /**
         * Render WayBill PDF
         *
         * @param  object  $event
         * @param  object  $scope
         */
        billOfLading : function( $scope, $event ){
			
			var self = this,
				pdfDocument = {}, 
				pdfItems = $scope.batchItems, 
				doc = [], 
				statusObject = { 
					items: [],
					status: 0 
				}, 
				errors = [], 
				thisModule = $scope.$parent.currentModule, 
				moduleName = thisModule.name.toLowerCase(),
				docId = 0;
            
            
            pdfItems.map(function( item, key ){
                
                console.log( '|--------------------------------------|' );
                console.log( 'BOL.PDF-ITEMS KEY | ITEM >> ', key, item );
				
				item.warehouse = {
					from: $rootScope.assets[moduleName].from_warehouse,
					to: $rootScope.assets[moduleName].to_warehouse
				};
                
                //console.log('Batch Item',item);
                if(!utils.isNull(item)){
                    item.moduleType = $scope.$parent.currentModule.id;
                    doc.push([
                        //Document Header
                        doc60.bolDocHeader(item),
                        //Addresses
						doc60.bolAddresses( item ),
                        //Order Table
                        //doc60.docTable(item),
                        doc60.bolOrderTable(item),
                        //Shipper Certification 
                        doc60.docText('Shippers Notification ',['bold','tiny']),
                        //Shippers Certification
                        doc60.docText('This is to certify that the above-names materials are properly classified, described , packaged, marked and labeled, and are in proper condition for transportation according to the applicable regions',['tiny']),

                        //doc60.bolDisclaimer(), 
                        doc60.bolSignatures(),

                        ((key < (pdfItems.length - 1)) ? 
                                doc60.docPageBreak() : '')
                    ]);
                }
                
            });
			
            pdfDocument.background = function(page){
				
                if (pdfItems[page - 1].status.selected.id === 4 ) {
                    return [
                        {
                            image: 'void',
                            width: 500,
                        }
                    ];
                }
            };
            
            pdfDocument.images = {
                void : self.drawText('VOID')
            };
            
            pdfDocument.content = doc;
            pdfDocument.styles = doc60.docStyleOptions(),
            pdfDocument.pageOrientation = 'landscape',
            pdfMake.createPdf(pdfDocument).open();

        },
		
        /******************************************** 
        THIS IS CRAP CODE WRITTEN BY A WEB DEVELOPER
        ********************************************
         * Render PDF Document of Line Items
         *
         * @param  object  $event
         * @param  object  $scope
         *
        
        print   :   function($scope,$event){
            // console.log($scope,$event);
            var self = this , pdfDocument = {} , doc = [],
                moduleName = $scope.$parent.currentModule.name,
                tableItems = $scope.batchItems;
            
            doc.push([
                {
                    columns : [
                        [ doc60.docImage($rootScope.profile.company_logo,{ width:30,height:30 })],
                        [],
                        [ doc60.docText(moduleName.toUpperCase(),['docHeader','textRight']) ]
                    ]
                },
                doc60.docTable(tableItems)
            ]);
            
            pdfDocument =   {
                content: doc, 
                styles: doc60.docStyleOptions(),
                pageOrientation: 'landscape'
            };

            pdfMake.createPdf(pdfDocument).print();
        },
        */
        
        /*****************************
         * AUTHOR: JAMES VAN LEUVEN
         * DATE: 2017-09-17 02:49:00 AM
         * REWRITE MODULE PRINT FUNCTION
         * REF: ./pseudo_code/pdfService.print.txt
		 */
        print: function( $scope, $event ){
            
            var self = this,
                // logo = $rootScope.profile.company_logo,
                logo = self.drawImage(angular.element('#navlogo').get(0).src),
                pdfDocument = {},
                doc = [],
                thisBatch = $scope.thisBatch,
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toUpperCase();
            
            console.log( '|----------------------|' );
            console.log( 'PDF-SERVICES.PRINT.THIS-MODULE >> ', thisModule );
            console.log( 'PDF-SERVICES.PRINT.THIS-BATCH >> ', thisBatch );
            
            doc.push([
                {
                    columns: [
                        [
                            doc60.docImage(logo, { 
                                width: 30, 
                                height: 30 
                            })
                        ],
                        [],
                        [
                            doc60.docText(moduleName, [
                                'docHeader',
                                'textRight'
                            ])
                        ]
                    ]
                },
                //pickprint.createTable(thisBatch)
                thisModule === 'Orders' ? doc60.docTableForOrders(thisBatch, thisModule): doc60.docTable(thisBatch)
            ]);
            
            
            console.log( '|----------------------|' );
            console.log( 'PDF-SERVICES.PRINT.DOC >> ', doc );
            
            pdfDocument =   {
                content: doc, 
                styles: doc60.pickprintStylingOptions(),
                pageOrientation: 'landscape'
            };
            
            //console.log('Jehanzeb - Jehanzeb');
            //console.log('PDF doc >> ', pdfDocument);

            pdfMake.createPdf(pdfDocument).print();
        },
        
        printNew : function( $scope, $event ){
            
            var self = this,
                // logo = $rootScope.profile.company_logo,
                logo = self.drawImage(angular.element('#navlogo').get(0).src),
                pdfDocument = {},
                doc = [],
                thisBatch = $scope.thisBatch,
                thisModule = $scope.currentModule,
                moduleName = thisModule.name.toUpperCase();
            
            console.log( '|----------------------|' );
            console.log( 'PDF-SERVICES.PRINT.THIS-MODULE >> ', thisModule );
            console.log( 'PDF-SERVICES.PRINT.THIS-BATCH >> ', thisBatch );
            $rootScope.motto = 'There\'s no flesh or blood within this cloak to kill. There\'s only an idea. Ideas are bulletproof.';
            
            doc.push([
                {
                    columns: [
                        [
                            pickprint.docImage(logo, { 
                                width: 30, 
                                height: 30 
                            })
                        ],
                        [],
                        [
                            pickprint.docText(moduleName, [
                                'docHeader',
                                'textRight'
                            ])
                        ]
                    ]
                },
                pickprint.createTable(thisBatch)
                // Let's use redirection for now and fix this later
                //thisModule === 'Orders' ? doc60.docTableForOrders(thisBatch, thisModule): doc60.docTable(thisBatch)
            ]);
            
            
            console.log( '|----------------------|' );
            console.log( 'PDF-SERVICES.PRINT.DOC >> ', doc );
            
            pdfDocument =   {
                content: doc, 
                styles: pickprint.pickprintStylingOptions(),
                pageOrientation: 'landscape'
            };
            
            //console.log('Jehanzeb - Jehanzeb');
            //console.log('PDF doc >> ', pdfDocument);

            pdfMake.createPdf(pdfDocument).print();
        },
        
        /**
         * Convert Image to dataurl
         *
         * @param  string  imageUrl
         * @return dataUrl;
         */
        drawImage    :function(imageUrl){
            var dataUrl = '',
                canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),img, 
                image = new Image(); // HTML5 Constructor
            
            image.src = imageUrl || angular.element('#navlogo').attr('src');
            img = angular.element(image).addClass('drawImage').get(0);
            
            //angular.element('document').append(img);
            
            // console.log('Image',img);
            
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img,0,0,img.naturalWidth,img.naturalHeight);
            dataUrl =   canvas.toDataURL('image/png',1.0);
            
            return dataUrl;
        },
		
         /**
         * Convert Text to dataurl
         *
         * @param  string  text
         * @return dataUrl;
         */
        drawText : function(text){
            var dataUrl =   '',
                canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d');
            
            canvas.height = 1000; // img.naturalHeight;
            
            canvas.width = 1000; // img.naturalWidth;
            
            ctx.font = "900 350px Arial";
            ctx.fillStyle = "lightgray";
            ctx.textAlign = "center";
            //ctx.rotate(-20*Math.PI/180);
            ctx.fillText(text, canvas.width/2, canvas.height/2); 
            ctx.fillText(text, canvas.width/2, canvas.height/2); 
            
            dataUrl =   canvas.toDataURL('image/png',1.0);
            
            //console.log('dataUrl',dataUrl);
            
            return dataUrl;
        },
		
        /**
         * Get the customer licensee types
         *
         * @param  object  $route
         * @param  object  $scope
         * @return Promise
         */
        getCustomers: function( $route, $scope ){
            var deferred = $q.defer() , self = this,
                data = utils.toType($scope.batchItems[0]) === 'number' ?  
                    self.parseAsset($scope) : 
                    $scope.batchItems;

            console.log( '|-------------------------------------|' );
            console.log( 'PDF-SERVICES.GET-CUSTOMER.SCOPE >> ', $scope );
            
            $scope.getCustomers = {};
            
            $scope.getCustomers.customer_ids = data.map(function( value ){
                
                console.log( '|-------------------------------------|' );
                console.log('SCOPE.GET-CUSTOMERS.CUSTOMER_IDS >> ', value );
                
                // return value.customer;
                return value.customer.selected.id;
            }); 
            
            channels.transaction( $route, $scope,'getCustomers').then(function(result){
                
                
                console.log( 'docGet result', result );
                deferred.resolve(result);
                
            });
            
            return deferred.promise;
        },
		
        /**
         * Check the server for the document
         *
         * @param  object  $scope
         * @return Promise
         */
        getDoc      :   function($scope){
            
            console.log( '|-------------------------------|' );
            console.log( 'GET-DOC >> ', $scope );
            
            var deferred = $q.defer();
            
            $scope.getDoc = $scope.orders;
            
            channels.transaction($route,$scope,'getDoc').then(function(result){
                console.log( 'docGet result', result );
                deferred.resolve(result);
                
            });
            
            return deferred.promise;
        },
		
        /**
         * Save a document to the server
         *
         * @param  object  $scope
         * @param  object  $scope
         * @param  array  data
         * @return Promise
         */
        saveDoc     :   function($route,$scope,docType){
            var deferred = $q.defer();
            
            $scope.saveDoc = {
                data : $scope.batchItems,
                type : docType
            };
                        
            channels.transaction($route,$scope,'saveDoc').then(function(result){
                console.log( 'saveDoc result', result );
                deferred.resolve(result);
            });
            
            return deferred.promise;
        }
		
    };

}]);