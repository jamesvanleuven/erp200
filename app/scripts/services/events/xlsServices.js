'use strict';

angular.module('clientApp.xlsServices', []).service('xlsService', [
    '$q',
    '$rootScope',
    '$route',
    '$window',
    'utils',
    'channels',
    'pdfService',
    'mathService',
    'importService',
    'picklist',
    function ($q, $rootScope, $route, $window, utils, channels, pdfService, mathService, importService, picklist ) {
        return {
            xlsOptions: function($scope, $event){
                var self = this;

                    // BUILD REQUESTED PDF BASED UPON $SCOPE.MODULE, $EVENT.ID, $EVENT.TYPE            
                    var type = $event.currentTarget.dataset.type,
                        document = {
                            'csv': function(){ return self.exportData($scope); },
                            'xls': function(){ return self.exportXLS( $scope, $event ); },
                            'ldb': function(){ return self.exportLDB($scope); },
                            'export': function(){ return self.exportData($scope); }
                        };

                    return document[type]();
            },

            /**
             * Build CSV Table
             *
             * @param  object object
             */
            buildTable : function(object){
                var table = [],//document.createElement('TABLE'),
                    tableHeader = [],
                    tableBody = [],
                    hasHeader = false;

                angular.forEach(object,function(value){

                    //build table body
                    var tableRow = '';

                    angular.forEach( value, function( row, key ){

                        if( utils.toType(row) === 'object' && row.visible === true && key !== 'city' ){

                            // HEADER
                            hasHeader === false ? tableHeader += key + ',' : null;

                            // ROWS 
                            switch( row.input ){
                                case 'select': tableRow += row.selected.value + ','; break;
                                case 'cs': tableRow += row.selected.value + ','; break;
                                default: 
                                    key === 'address' ? 
                                        tableRow += row.value.split(',').join(' ') + ',' : 
                                        tableRow += row.value + ',';
                            }
                        }

                    });

                    hasHeader === false ? tableHeader += '\n' : null;
                    hasHeader = true;
                    tableBody += tableRow + '\n';

                });

                table += tableHeader;
                table += tableBody;

                return table;

            },

            /**
             * Save and download data
             *
             * @param  object  data
             * @param  object  $scope
             */
            exportData : function ($scope, $event) {
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleMethod = thisModule.modal.method,
                    data = utils.toType($scope.batchItems[0]) === 'number' ?  pdfService.parseAsset($scope) : $scope.batchItems,
                    csv = self.buildTable(data);
                console.log(' $event >> ', $event);

                if (csv === null) return;

                !csv.match(/^data:text\/csv/i) ? csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv) : null;

                var link = document.createElement("a"),
                    filename = moduleName + '-' + moduleMethod + '.csv' || 'download.csv';
                link.setAttribute('href', csv);
                link.setAttribute('title', filename);
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // $route.reload();
            },

            /* 
            * Export the pick list line items
            *
             * @param  object  data
             * @param  object  $scope
            */

            exportPickList : function ($scope){
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleMethod = thisModule.modal.method,
                    data = $scope.thisBatch,
                    csv = picklist.buildExcelDocument(data);
                /*            
                var blob = new Blob([csv], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
                });
                */

                //saveAs(blob, "Report.xls");

                //console.log( 'downloadCSV TEMPLATE CSV >> ', csv );

                if (csv === null) return;

                !csv.match(/^data:text\/csv/i) ? csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv) : null;

                var link = document.createElement("a"),
                    filename = moduleName + '-' + moduleMethod + '.csv' || 'download.csv';
                link.setAttribute('href', csv);
                link.setAttribute('title', filename);
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },

            /**
             * Export LDB Report as CSV
             *
             * @param  object  $scope
             */
            exportLDB : function($scope){
                var self = this , csv,
                    thisModule = $scope.$parent.currentModule,
                    moduleName = thisModule.name.toLowerCase(),
                    thisBatch = $scope.thisBatch,
                    thisReport = [];

                var headers = [
                    'store_number',
                    'transaction_type',
                    'transaction_date',
                    'invoice_reference_number',
                    'original_invoice_number',
                    'customer_number',
                    'customer_type',
                    'payment_method',
                    'sku',
                    'quantity',
                    'price',
                    'container_deposit',
                    'total_doc_amount',
                    'return_reason_code'
                ];

                thisReport.push(headers);

                // RENDER ROWS
                console.log( '|----------------------------------|' );
                console.log( 'EXPORT-LDB.THIS-BATCH >> ', thisBatch );

                // BUILD THE LDB FROM THE ROWS
                for(var i = 0; i < thisBatch.length; i++ ){

                    var thisRow = thisBatch[i],
                        customer = thisBatch[i].customer_info[0],
                        manufacturer = thisBatch[i].manufacturer_info[0], 
                        status = thisBatch[i].status.selected.id, 
                        lineItems = thisBatch[i].products.value;

                    // PARSE OUT STATUSES AND CUSTOMER TYPES FROM LDB
                    if( status !== 4 ){

                        if( customer.type.id !== 6 ) {

                            console.log( '|----------------------------------|' );
                            console.log( 'THIS-ROW >> ', thisRow );
                            console.log( 'THIS-STATUS >> ', status );
                            console.log( 'THIS-CUSTOMER >> ', customer );
                            console.log( 'THIS-MANUFACTURER >> ', manufacturer );
                            console.log( 'THIS-LINE-ITEMS >> ', lineItems );

                            var arrTypes = [0, 6, 7];


                            // PARSE OUT THE LINE ITEMS FIRST
                            angular.forEach(lineItems, function( item, idx ){

                                console.log( '|----------------------------------|' );
                                console.log( idx, item );

                                var needle = utils.hayStack(arrTypes, item.product_type );

                                // QTY * bottles per case / bottles per Sku

                                var finalQuantity = (parseInt(item.quantity) * parseInt(item.bottles_per_case) / parseInt(item.bottles_per_sku));

                                console.log( '|----------------------------------|' );
                                console.log( 'HAYSTACK[' + needle + '] >> ', utils.hayStack(arrTypes, needle) );
                                console.log( 'LINE-ITEM[' + idx + '] >> ', idx, item );
                                console.log( 'PRODUCT-TYPE >> ', item.product_type, arrTypes );

                                if( utils.hayStack(arrTypes, item.product_type) === false || item.product_type !== 0 ){

                                    var deposit = (((parseFloat(item.litter_rate) * parseInt(item.bottles_per_case)) / parseInt(item.bottles_per_sku)) * parseInt(item.quantity)).toFixed(2),
                                        total = Number(parseFloat(mathService.sumTransaction(lineItems, 'subTotal') + mathService.sumTransaction(lineItems, 'totalTax') + mathService.sumTransaction(lineItems, 'totalDeposit'))).toFixed(2);

                                    var column = [
                                        utils.isNull(manufacturer.store_number) === false ?  manufacturer.store_number : '',
                                        'Sale',
                                        moment(thisRow.deliver_date.value).format('MM/DD/YYYY') || '',
                                        thisRow.order_reference.value.toString() || '',
                                        '',
                                        customer.license.number.toString() || '',
                                        customer.type.abbr.toString() || '',
                                        '',
                                        item.sku.toString() || '',
                                        finalQuantity.toString() || '',
                                        parseFloat(item.price).toFixed(2) || '',
                                        // item.quantity.toString() || '',
                                        // parseFloat(item.calculatedPrice).toFixed(2) || '',
                                        parseFloat(deposit).toFixed(2) || '',
                                        parseFloat(total).toFixed(2) || '',
                                        ''
                                    ];

                                    thisReport.push( column );

                                }

                            });

                        }

                    }

                }

                console.log( 'THIS-REPORT >> ', thisReport.length, thisReport );


                var csvString = '';
                if( thisReport.length > 0 ){
                    for( var ldb = 0; ldb < thisReport.length; ldb++ ){
                        csvString += thisReport[ldb].toString() + '\n';
                    }

                    console.log( '|----------------------------------|' );
                    console.log( 'CSV-STRING >> ', csvString );

                    csvString = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);

                    var link = document.createElement("a"), 
                        filename = moduleName + '-LDB-'+moment().format()+'.csv' || 'download.csv';

                    link.setAttribute('href', csvString);
                    link.setAttribute('title', filename);
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }



                /*
                pdfService.getCustomers( $route, $scope ).then(function( result ){

                    console.log('customer result',result);


                    for( i = 0; i < data.length; i++ ){

                        var thisRow = data[i],
                            productList = thisRow.products.value;
                        console.log( '|----------------------------------|' );
                        console.log('EXPORT-LDB-ROW[' + i + '] >> ',thisRow );

                        if( productList.length > 0 && (parseInt(thisRow.status.selected.id) !== 4 || parseInt(thisRow.customer_type_id) !== 6) ){

                            var order_total = 0;

                            angular.forEach(productList, function( product ){

                                console.log( 'EXPORT-LDB.PRODUCT >> ', product );

                                var thisResult = result.doc;
                                var customer = thisResult.find(function( row ){

                                    console.log( 'CUSTOMER.ROW >> ', row );

                                    if( parseInt(data[i].customer.selected.id) === parseInt(row.id) ){
                                        return row;
                                    }
                                });

                                console.log( '|----------------------------------|' );
                                console.log( 'customer >> ', customer );

                                var deposit = Number(((parseFloat(product.litter_rate) * parseInt(product.bottles_per_case)) / parseInt(product.bottles_per_sku)) * parseInt(product.quantity)).toFixed(2);

                                ldb = {
                                    store_number: { 
                                        input: 'number', 
                                        value: customer.store_number ? parseInt(customer.store_number).toFixed(0) : " "
                                    },
                                    transaction_type: { 
                                        input: 'text', 
                                        value: 'Sale' 
                                    },
                                    transaction_date: { 
                                        input: 'date', 
                                        value: moment(thisRow.deliver_date.value).format('MM/DD/YYYY') 
                                    },
                                    invoice_reference_number: { 
                                        input: 'number', 
                                        value: thisRow.order_reference.value ? parseInt(thisRow.order_reference.value) : " "
                                    },
                                    original_invoice_number: { 
                                        input: 'number', 
                                        value: " " 
                                    },
                                    customer_number: { 
                                        input: 'number', 
                                        value: customer.license.number
                                    },
                                    customer_type: { 
                                        input: 'text', 
                                        value : customer.type.abbr 
                                    },
                                    payment_method: { 
                                        input:'text', 
                                        value: " " 
                                    },
                                    sku: { 
                                        input: 'number', 
                                        value: product.sku ? product.sku : " " 
                                    },
                                    quantity: { 
                                        input: 'number', 
                                        value: product.quantity ? product.quantity : " "
                                    },
                                    price: { 
                                        input: 'number', 
                                        value: parseFloat(product.subTotal).toFixed(2) || " "
                                    }, 
                                    container_deposit: { 
                                        input: 'number', 
                                        value:  deposit || " "
                                    },
                                    total_doc_amount: { 
                                        input: 'number', 
                                        value: parseFloat(mathService.getSubTotal(productList)).toFixed(2) || " "
                                    },
                                    return_reason_code: { 
                                        input: 'number', 
                                        value: " "
                                    },
                                };

                                console.log( '|----------------------------------|' );
                                console.log( 'LDB', ldb );

                                ldb_data.push(ldb);
                            });


                        }

                    }

                    console.log('LDB DATA ------->',ldb_data);


                    if(ldb_data.length > 0){
                        csv = self.buildTable(ldb_data);

                        console.log('CSV DATA ------->',csv);

                        if (csv === null) return;

                        !csv.match(/^data:text\/csv/i) ? csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv) : null;

                        var link = document.createElement("a"),
                            filename = moduleName + '-LDB-'+moment().format()+'.csv' || 'download.csv';
                        link.setAttribute('href', csv);
                        link.setAttribute('title', filename);
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        // $route.reload();
                    }else{
                        utils.growlMessage( 'error', 'No Order Products Available', 2);

                        return false;
                    } 
                });
                */
            },
            
            /*
            * Exports a product XLSX file from data provided
            * 
            */
            exportProductXLSX : function(data){
                var self = this,
                    csv = data;

                if (csv === null) return;

                !csv.match(/^data:text\/csv/i) ? csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv) : null;

                var link = document.createElement("a"),
                    filename = 'productImportErrors.csv' || 'download.csv';
                link.setAttribute('href', csv);
                link.setAttribute('title', filename);
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            
            /*
            * Exports a product XLSX file from data provided
            * 
            */
            exportSchema: function( $scope, $event ){
                
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleType = thisModule.type,
                    thisXLS = $scope.$parent.csv;
                
                
                // This is all bullshit but for now it works
                return channels.moduleSchema(moduleName).then(function(results){
                    console.log('Inside the promise >> ', results);
                    utils.toType(thisXLS.import) === 'undefined' ?
                    $scope.$parent.csv.import = results[0].result:
                    $scope.$parent.csv.import = thisXLS.import;
                    console.log('CSV >> ', $scope.$parent.csv);

                    var object = $scope.$parent.csv.import;
                    var rows = [];
                    for(var key in object){
                        rows.push(key.toString().toUpperCase());
                    }

                    console.log(' This is the CSV >> ', rows);

                    var csv = rows;

                    if (csv === null) return;

                    //!csv.match(/^data:text\/csv/i) ? csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv) : null;
                    csv = 'data:text/csv;charset=utf-8,' + encodeURI(csv);


                    var link = document.createElement("a"),
                        filename = 'Product Template.csv' || 'download.csv';
                    link.setAttribute('href', csv);
                    link.setAttribute('title', filename);
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    delete $scope.$parent.csv;
                    
                    console.log('$scope->', $scope);

                    return results;
                }, function(error){
                    return error;
                });    
            }, 
            
            runSomething : function(results)
            {
                
            },
            
            exportXLS: function( $scope, $event ){
                
                console.log( '|--------------------------|' );
                console.log( 'XLS-SERVICES.EXPORT-XLS.SCOPE >> ', $scope );
                
                var self = this,
                    thisModule = $scope.$parent.currentModule,
                    moduleName = thisModule.name.toLowerCase(),
                    moduleType = thisModule.type,
                    thisXLS = $scope.$parent.csv,
                    thisSchema = {};
                
                console.log( '|--------------------------|' );
                console.log( 'THIS-XLS >>', thisXLS );
                
                console.log( 'toType.value >> ', utils.toType(thisXLS.import) );
                
                utils.toType(thisXLS.import) === 'undefined' ?
                    thisSchema = self.exportSchema( $scope, $event ) :
                    thisSchema = thisXLS.import;
                
                console.log( '|--------------------------|' );
                console.log( 'THIS-SCHEMA >>', thisSchema );
                
                
            },
            
            buildXLSX : function(schema){
                var data = this.modifySchema(schema);
                
                console.log('Rows >> ', data);
                var ws_name = "Product_Template";

                ///* require XLSX */
                //var XLSX = require('xlsx');

                /* set up workbook objects -- some of these will not be required in the future */
                var wb = {}
                wb.Sheets = {};
                wb.Props = {};
                wb.SSF = {};
                wb.SheetNames = [];

                /* create worksheet: */
                var ws = {};

                /* the range object is used to keep track of the range of the sheet */
                var range = {s: {c:0, r:0}, e: {c:0, r:0 }};

                /* Iterate through each element in the structure */
                for(var R = 0; R != data.length; ++R) {
                  if(range.e.r < R) range.e.r = R;
                  for(var C = 0; C != data[R].length; ++C) {
                    if(range.e.c < C) range.e.c = C;

                    /* create cell object: .v is the actual data */
                    var cell = { v: data[R][C] };
                    if(cell.v == null) continue;

                    /* create the correct cell reference */
                    var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

                    /* determine the cell type */
                    if(typeof cell.v === 'number') cell.t = 'n';
                    else if(typeof cell.v === 'boolean') cell.t = 'b';
                    else cell.t = 's';

                    /* add to structure */
                    ws[cell_ref] = cell;
                  }
                }
                ws['!ref'] = XLSX.utils.encode_range(range);

                /* add worksheet to workbook */
                wb.SheetNames.push(ws_name);
                wb.Sheets[ws_name] = ws;

                /* write file */
                XLSX.writeFile(wb, 'Template.xlsx');
            },
            
            modifySchema: function(schema){
                var rows = [];
                for(var index =0; index< schema.length; index++){
                    rows.push(schema[index].name);
                }
                return rows;
            }
        }

    }
]);