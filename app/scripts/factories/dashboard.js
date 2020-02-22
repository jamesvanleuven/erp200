'use strict';

/**
 * GENERAL JSON OBJECT BUTTON EVENT
 */

angular.module('clientApp').factory('dashboard', function(){
    
    return {
        //widget wrapper
        widget  :   function(title,str){
            var wrapper     =   '',
                controls    =   '<div data-ng-include="\'views/modules/_partials/_dashboard/_widgetControls.html\'"/>';
            
            wrapper +=   '<div class="panel panel-default widget">';
            wrapper +=       '<div class="panel-heading clearfix">';
            wrapper +=           '<h3 class="panel-title pull-left">'+title+'</h3>';
            wrapper +=           '<span class="pull-right">'+controls+'</span>';
            wrapper +=       '</div>';
            wrapper +=       '<div class="panel-body">'+str+'</div>';
            //wrapper +=       '<div class="panel-footer">'+footer+'</div>';
            wrapper +=   '</div>';
            
            return wrapper;
        },
        //Chart Options
        chartOptions    :   function(type){
            return {
                chart: {
                    type: type,
                    height: 500,
                    x: function(d){return d.key;},
                    y: function(d){return d.y;},
                    showLabels: true,
                    duration: 500,
                    labelThreshold: 0.01,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
                }
            };
        }
        
    };

});
