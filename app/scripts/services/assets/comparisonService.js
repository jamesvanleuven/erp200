'use strict';

/**
 * @ngdoc service
 * @name clientApp.comparisonService
 * @description
 * # comparisonService for the headers
 */
angular.module('clientApp.comparisonServices',[])
    .service('comparisonService', function ( $compile , $q , $rootScope, utils) {
    var errorThreshold = 0;
    return {
        /*
        * Compares the header with the laready loaded object from the database and returns the array of headers
        * @param importedObject the object that was imported from the xls file
        * @param csvObject the object built from the DB call
        * returns object containing array of strings representing the header. the unmatched header would be ' ' or TBD
        *         object also contains the mapping of headers to the columns supplied in the xls file
        *         object 
        */
        compareHeader : function (importedObject, csvObject){
            // 0. Get the header from the importedObject
            // 1. Loop through the array
            // 2. If a match for a header is found in the xls
            //          push the string into the header array
            //          push the column number in the mapping array
            // 3. If the loop is ending and no match is found
            //          push ' ' in the header array
            //          push 0 in the mapping array
            alert('Called the wrond method/function>>', this);
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Builds the JSON structure for use in the analysis of the uploaded data
        * @param importedSheet is the sheet that was uploaded as part of the import feature
        * @param csv is the database returned structure for the imported sheet to be compared with
        * @return returns the object built for the use in importing the data into the database
        */
        buildJSON : function(importedSheet, csv){
            //console.log(' @Params >> ',importedSheet, csv);
            
            var objectBuiltFromImportedSheet = {};
            // 0. Make a deep copy of the sheet
            var sheet = jQuery.extend(true, {}, importedSheet);
            // A-> Housekeeping -> Delete the first unreferenced/unused key value
            delete sheet['!ref'];
            
            // 1. Build the headers in the object
            objectBuiltFromImportedSheet.headers = this.buildObject(sheet);
            
            // Insert an array for unmatched headers
            objectBuiltFromImportedSheet.unmatchedHeaders = [];
            
            //// 2. Fill the data into the headers to make the object usable
            //for(var key in sheet){
            //    objectBuiltFromImportedSheet.headers[this.getColumnFrom(key)].column.push(sheet[key]);
            //}
            
            // 3. Insert into the matching headers from CSV the rules for the data within them
            // 3.1 Loop through the object csv for the headers under columns
            for(var key in csv.import.columns){
                var columns = csv.import.columns;
                
                if(objectBuiltFromImportedSheet.headers[columns[key].name] !== null){
                    // 3. Insert into the matching headers from CSV the rules for the data within them
                    objectBuiltFromImportedSheet.headers[columns[key].name].validation= columns[key];
                    // 4. Run the test on the data in the columns and keep incrementing a counter and marking the erroneous indice
                    this.validate(objectBuiltFromImportedSheet.headers[columns[key].name]);
                }
                else{
                    objectBuiltFromImportedSheet.unmatchedHeaders.push(objectBuiltFromImportedSheet.headers[key]);
                    delete objectBuiltFromImportedSheet.headers[key];
                }
            }
            
            this.analyze(objectBuiltFromImportedSheet);
            
            // 5. Return the table to the front end to render if errors are found
            if(objectBuiltFromImportedSheet.userInputNeeded === true){
                alert('Please check the sheet used for import.');
            }
            else{
                if(objectBuiltFromImportedSheet.errors === 0){
                    alert('File is ready to be imported');
                }
                else{
                    // Render the window to fix errors
                    // The front end would do that
                }
            }
            
            console.log(' These are the headers >> ', objectBuiltFromImportedSheet.headers);
            console.log(' This is the sheet >> ', sheet);
            console.log(' objectBuiltFromImportedSheet >> ', objectBuiltFromImportedSheet);
            
            return objectBuiltFromImportedSheet;
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Iterates through the whole object and analyzes whether user input is needed
        * @param the object that was created in the buildJSON function is used for analysis
        */
        analyze : function (importedObject){
            importedObject.errors = this.getErrorCount(importedObject);
            
            if(importedObject.errors > errorThreshold || importedObject.unmatchedHeaders.length>0){
                importedObject.userInputNeeded = true;
            }
            else{
                importedObject.userInputNeeded = false;
            }
            
            var length = -1;
            
            for(var key in importedObject.headers){
                if(length ===-1){
                    length = importedObject.headers[key].column.length;
                }
                
                if(length === importedObject.headers[key].column.length){
                    length = importedObject.headers[key].column.length;
                }
                else{
                    importedObject.userInputNeeded = true;
                }
            }
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Iterates through the object and sums up all the errors
        * @param uses the object built in the buildJSON function to calculate the number of errors in the document
        * @return returns the error count in the document
        */
        getErrorCount : function(importedObject){
            var errorCount =0;
            for(var key in importedObject.headers){
                errorCount += importedObject.headers[key].errorCount;
            }
            return errorCount;
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Validates the data in the cell with the information from the header matched from the database
        * @param data the object that contains all the information required for the validation
        */
        validate : function(data){
            data.errorCount =0;
            for(var key in data.column){
                switch(data.validation.type){
                    case 'text':
                    case 'character varying':
                        this.check(data, key, 'string');
                        break;
                    case 'bigint':
                    case 'integer':
                        this.check(data, key, 'number');
                        break;
                    case 'numeric(10,4)':
                    case 'numeric(10,2)':
                    default:
                        //console.log('REGEX >>',data.validation.type, data.validation.type.match(/numeric/g));
                        this.check(data, key, 'number');
                        break;
                };  
            }
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Checks for the data and matching data type
        * Created as a function to enhance readability in code in the method above
        * @param data the object that contains all the information required for the validation
        * @param key the key to use for the iteration
        * @param typeString the type supplied as a string to match with the data type
        */
        check : function(data, key, typeString){
            if(utils.toType(data.column[key].v) !== typeString){
                if(data.errorCount++===0){
                    data.erroneousCellArray = {};
                }
                data.erroneousCellArray[data.column[key].cell] = data.column[key];
            }
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Gets the header from the first row
        * Places them in an object with their mapping column name
        * Fills the object with the data from the sheet
        * @param sheet is the sheet supplied as an argument from the object imports.sheets.sheet{x}
        * @returns an array of objects of the form {header, columnName, column}
        */
        buildObject : function (sheet){
            var headers = {}, completeObject = {};
            for(var key in sheet){
                if(key.toString().match(/[A-Z]1\b/g)){
                    headers[this.getColumnFrom(key)] = {
                        header: sheet[key],
                        columnName: this.getColumnFrom(key),
                        column: [],
                        validation: null
                    };
                    // So that we don't run into the information that we have already parsed
                    delete sheet[key];
                }
                else{
                    sheet[key].cell = key;
                    headers[this.getColumnFrom(key)].column.push(sheet[key]);
                    delete sheet[key];
                }
            }
            
            for(var key in headers){
                completeObject[headers[key].header.v.toLowerCase()] = {
                    header: headers[key].header,
                    columnName: headers[key].columnName,
                    column: headers[key].column
                };
            }
            
            return completeObject;
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Created to enhance readability
        * just an inline function
        * @return returns the key without the numerics so just a column name thing
        */
        getColumnFrom : function (key){
            return key.toString().replace(/[0123456789]/g, "");
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Build error object array
        * @param data uses the object built in the buildJSON structure to generate the erroneous data structure to be consumed for xl generation
        * @return Returns the dataStructure with the form {header, columns:}
        */
        buildErrorObjectArray : function (data){
            var headers = data.headers,
                unmatchedHeaders = data.unmatchedHeaders;
            var erroneousDataArray = [],
                erroneousHeaders = [];
            
            for(var key in headers){
                if(headers[key].errorCount > 0){
                    erroneousHeaders.push(headers[key].header.v);
                    erroneousDataArray.push(headers[key].erroneousCellArray);
                }
            }
            
            var dataStructure = {header: erroneousHeaders, columns: erroneousDataArray};
            
            console.log(' Error Error on the wall, who is the most erroneous of all >>', dataStructure);
            return dataStructure;
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Builds a matrix style JSON array structure
        * an Array of Array of JSONS for the csv to iterate through and build the final version of the data
        * @param dataStructure makes use of the data from the buildErrorObjectArray to make an arry of strings to be used for XLS/CSV
        * @return returns the table structure needed for csv/xls generation
        */
        buildMatrix: function(dataStructure){
            var longestArraylength = 0,
                columnArray = dataStructure.columns,
                headerArray = dataStructure.header,
                localIndex =0;
            
            for(var key in columnArray){
                if(utils.countJSON(columnArray[key]) > longestArraylength){
                    longestArraylength = utils.countJSON(columnArray[key]);
                }
            }
            
            var columns = [];
            console.log('These are the keys >> ', Object.keys(columnArray[0]));
            
            for(localIndex=0; localIndex<columnArray.length; localIndex++){
                columns[localIndex] = [];
                for(var internalIndex = 0; internalIndex<longestArraylength; internalIndex++){
                    columns[localIndex].push('');
                }
                
                for(var key in columnArray[localIndex]){
                    var index = (key.toString().replace(/[A-Z]/g, '') || 0) - 2;
                    console.log('key, index', key, index);
                    columns[localIndex][index] = columnArray[localIndex][key].v;
                }
            }
            
            console.log(' Columns >> ', columns);
            
            var table = [],
                tableHeader = dataStructure.header,
                tableBody = [];
            
            for(var outerIndex =0; outerIndex < longestArraylength; outerIndex++){
                var tableRow = '';
                for(var innerIndex =0; innerIndex<columns.length; innerIndex++){
                    tableRow += columns[innerIndex][outerIndex] + ' ,';
                }
                tableRow += '\n';
                tableBody += tableRow;
                console.log(' Table body >> ', tableBody);
            }
            
            table += tableHeader + '\n';
            table += tableBody;
            
            console.log(' Table >> ', table);
            
            return table;
        },
        
        /*
        * Author: Jehanzeb
        * Date: 2017-10-04
        * Modifies the importobject for use in the insert/update queries
        * @param importObject The object produced after comparisons and analysis
        * @return the [{key, value[]},{key, value[]}] to be used for insertion
        */
        getInsertObject : function(importObject){
            var insertObject = [];
            var json = importObject.headers;
            for(var key in json){
                var values= [],
                column = json[key].column;
                for(var index=0; index<column.length;index++){
                    values.push(column[index].v);
                }
                insertObject.push({
                    key: key,
                    values: values
                });
            }
            return insertObject;
        }
    }
});