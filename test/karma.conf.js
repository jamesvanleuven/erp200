// Karma configuration
// http://karma-runner.github.io/0.12/config/configuration-file.html
// Generated on 2015-09-28 using
// generator-karma 1.0.0

module.exports = function(config) {
  'use strict';

  config.set({
    mime: { 'text/x-typescript': ['ts','tsx'] },
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      "jasmine"
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-aria/angular-aria.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-messages/angular-messages.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/moment/moment.js',
      'bower_components/angular-moment/angular-moment.js',
      'bower_components/d3/d3.js',
      'bower_components/nvd3/build/nv.d3.js',
      'bower_components/angular-nvd3/dist/angular-nvd3.js',
      'bower_components/angular-growl-v2/build/angular-growl.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/affix.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/alert.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/button.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/carousel.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/collapse.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/dropdown.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tab.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/transition.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/scrollspy.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/modal.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/tooltip.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap/popover.js',
      'bower_components/jszip/dist/jszip.js',
      'bower_components/js-xls/dist/xls.js',
      'bower_components/js-xlsx/dist/xlsx.core.min.js',
      'bower_components/es6-promise/promise.js',
      'bower_components/alasql/dist/alasql.min.js',
      'bower_components/file-saver/FileSaver.js',
      'bower_components/bower-pdfkit/pdfkit-0.7.1.js',
      'bower_components/bower-pdfkit/blob-stream-v0.1.3.js',
      'bower_components/pdfmake/build/pdfmake.js',
      'bower_components/pdfmake/build/vfs_fonts.js',
      'bower_components/jspdf/dist/jspdf.debug.js',
      'bower_components/html2canvas/build/html2canvas.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/bootstrap-daterangepicker/daterangepicker.js',
      'bower_components/angular-daterangepicker/js/angular-daterangepicker.js',
      'bower_components/angular-strap/dist/angular-strap.js',
      'bower_components/angular-strap/dist/angular-strap.tpl.js',
      'bower_components/ng-tags-input/ng-tags-input.js',
      'bower_components/angular-moment-picker/dist/angular-moment-picker.min.js',
      'bower_components/angular-js-xlsx/angular-js-xlsx.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      "app/scripts/**/*.js",
      "test/mock/**/*.js",
      "test/spec/**/*.js"
    ],

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      "PhantomJS"
      // "Chrome"
    ],

    // Which plugins to enable
    plugins: [
      "karma-chrome-launcher",
      "karma-phantomjs-launcher",
      "karma-jasmine"
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // Uncomment the following lines if you are using grunt's server to run the tests
    proxies: {
     '/': 'http://localhost:9000/'
    },
    // URL root prevent conflicts with the site root
    urlRoot: '_karma_'
  });
};
