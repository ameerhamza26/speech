// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaNativeAudio) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        try {
            $cordovaNativeAudio
                .preloadSimple('click', 'alarm.mp3')
                .then(function(msg) {
                    console.log(msg);
                }, function(error) {
                    alert(error);
                });
        } catch (err) {

        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
        })

    .state('station', {
        url: '/station',
        templateUrl: 'templates/station.html',
        controller: 'StationCtrl'
    })

    .state('waiting', {
        url: '/waiting',
        templateUrl: 'templates/waiting.html',
        controller: 'WatingCtrl'
    })

    .state('alarm', {
        url: '/alarm',
        templateUrl: 'templates/alarm.html',
    })

    $urlRouterProvider.otherwise('/home')

})

.controller('HomeCtrl', function($scope, $state) {
    $scope.navigate = function() {
        $state.go('station');
    }
})

.controller('StationCtrl', function($scope, $rootScope, $state, $cordovaMedia, $ionicLoading, $cordovaNativeAudio, $interval, $timeout) {
    var src = "/alarm.mp3";
    $scope.clientSideList = [
        { text: "Stratford", value: "Stratford" },
        { text: "Liverpool Street", value: "Liverpool Street" },
        { text: "Oxford Circus", value: "Oxford Circus" }
    ];

    $scope.data = {
        clientSide: 'Stratford'
    };


    $rootScope.recognizedText = "";

    var stop = false;
    $scope.navigate = function() {
        console.log("in media", $scope.data)
        $rootScope.station = $scope.data.clientSide;
       // $rootScope.station = $rootScope.station.toLowerCase();
        var recognition = new SpeechRecognition();
        // recognition.continuous = true;

        recognition.onresult = function(event) {
            console.log("en results", event)
            if (event.results.length > 0) {
                for (var i = 0; i < event.results.length; i++) {
                    $rootScope.recognizedText += event.results[i][0].transcript + " ";
                    console.log($rootScope.recognizedText)
                    if ($rootScope.recognizedText.includes($rootScope.station) || $rootScope.recognizedText.includes($rootScope.station.toLowerCase()) ) {
                        console.log("in true")

                        $scope.$apply()
                        $cordovaNativeAudio.play('click');
                        stop = true;
                        $interval.cancel(promise);
                        $timeout(function() {
                            $cordovaNativeAudio.stop('click');
                            $rootScope.recognizedText = "";
                            //$cordovaNativeAudio.unload('click');
                            //$cordovaNativeAudio.unload('click');
                           
                            $state.go('home');
                        }, 10000);
                    } else {
                        recognition.start();
                    }
                }

            }
        };
        // recognition.onend = function() {
        //   console.log("in end")
        //     if (!stop) {
        //         console.log("in is stopping")
        //        recognition.start();
        //     }
        // };

        // promise = $interval(setRandomizedCollection, 1000);
        promise = $interval(function() {
             recognition.start();
        }, 200)

        recognition.start();

        $state.go('waiting');

    }
})

.controller('WatingCtrl', function($scope, $state, $interval, $timeout, $filter, ClockSrv, $cordovaMedia, $cordovaNativeAudio) {
    $scope.myTitle = 'Clock';

    var src = "alarm.mp3";
    var media = $cordovaMedia.newMedia(src);

    // $scope.clock = ClockSrv.clock();

    /*$scope.data = {
      tgl: "Memuat jam..."
    }
    var tickInterval = 1000; //ms

    var tick = function() {
      $scope.data.tgl = $filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss'); // get the current time
      $timeout(tick, tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, tickInterval);*/

})

.factory('ClockSrv', function($interval) {
    'use strict';
    var service = {
        clock: addClock,
        cancelClock: removeClock
    };

    var clockElts = [];
    var clockTimer = null;
    var cpt = 0;

    function addClock(fn) {
        var elt = {
            id: cpt++,
            fn: fn
        };
        clockElts.push(elt);
        if (clockElts.length === 1) {
            startClock();
        }
        return elt.id;
    }

    function removeClock(id) {
        for (var i in clockElts) {
            if (clockElts[i].id === id) {
                clockElts.splice(i, 1);
            }
        }
        if (clockElts.length === 0) {
            stopClock();
        }
    }

    function startClock() {
        if (clockTimer === null) {
            clockTimer = $interval(function() {
                for (var i in clockElts) {
                    clockElts[i].fn();
                }
            }, 1000);
        }
    }

    function stopClock() {
        if (clockTimer !== null) {
            $interval.cancel(clockTimer);
            clockTimer = null;
        }
    }

    return service;
})

.run(function($rootScope, $filter, ClockSrv) {
    ClockSrv.clock(function() {
        // console.log($filter('date')(Date.now(), 'yyyy-MM-dd HH:mm:ss')); 
        $rootScope.clock = $filter('date')(Date.now(), 'dd/MM/yyyy HH:mm:ss');
    });

})

.controller('AppCtrl', function($scope) {
    $scope.data = {
        speechText: ''
    };
    $scope.recognizedText = '';

    $scope.speakText = function() {
        TTS.speak({
            text: $scope.data.speechText,
            locale: 'en-GB',
            rate: 1.5
        }, function() {
            // Do Something after success
        }, function(reason) {
            // Handle the error case
        });
    };

    $scope.record = function() {
        var recognition = new SpeechRecognition();
        recognition.onresult = function(event) {
            console.log("en results", event)
            if (event.results.length > 0) {
                $scope.recognizedText = event.results[0][0].transcript;
                $scope.$apply()
            }
        };
        recognition.start();
    };
});
