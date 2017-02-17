angular.module('app.controllers', ['ngSails', 'ngCordova'])
        .controller('AppCtrl', function($scope, $rootScope, $ionicModal, $timeout, AuthService, $state) {




            $scope.platform = ionic.Platform.platform();
            // With the new view caching in Ionic, Controllers are only called
            // when they are recreated or on app start, instead of every page change.
            // To listen for when this page is active (for example, to refresh data),
            // listen for the $ionicView.enter event:
            //$scope.$on('$ionicView.enter', function(e) {
            //});

            //$state.go('app.login', {});

            AuthService.isAuthenticated().then(function(response) {
                $state.go('app.main', {});

            }, function(err) {

                $state.go('app.login', {});

            });


        })
        .controller('MainCtrl', function($scope,
                $rootScope,
                $sails,
                $stateParams,
                $state,
                $ionicLoading,
                $http,
                $cordovaGeolocation,
                $ionicScrollDelegate,
                $ionicSideMenuDelegate,
                $ionicNavBarDelegate,
                $ionicPlatform,
                AuthService,
                choferService,
                $q,
                $ionicPopup,
                $ionicModal,
                $localStorage,
                $sessionStorage) {


            $scope.closeModal = function() {
                $scope.modal_solicitud.hide();
            };

            $scope.selectJob = function() {
                // close modal first
                $scope.closeModal();

                alert('se selcciono el trabajo');

            }
            $sails.on('solicitud', function(data) {

                $scope.solicitud = data;


                $ionicModal.fromTemplateUrl('templates/modal_solicitud.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.modal_solicitud = modal;

                });

                debugger;

                $scope.modal_solicitud.show();

            });

            $sails.on('connect', function(data) {


            });
            $sails.on('disconnect', function(data) {


                alert('Upps, no nos podemos comunicar con nuestro servidor, revisa la conexion a internet e intentalo nuevamente.');
            });

            $scope.$storage = $localStorage;
            $scope.driver = {
                id: 1,
                name: "Edward Thomas",
                plate: "29A567.89",
                brand: "Kia Morning",
                ref_code: "486969",
                rating: 4,
                balance: "580",
                balance_pending: 0
            };
            $ionicNavBarDelegate.showBackButton(false);

            document.addEventListener("deviceready", function() {

                cordova.plugins.backgroundMode.setEnabled(true);



                cordova.plugins.backgroundMode.onactivate = function() {
                    console.log('BG activated');
                    var watchOptions = {
                        timeout: 30000,
                        maximumAge: 30000,
                        enableHighAccuracy: true // may cause errors if true
                    };

                    var watch = $cordovaGeolocation.watchPosition(watchOptions);

                    watch.then(
                            null,
                            function(err) {
                                // error
                            },
                            function(position) {
                                var lat = position.coords.latitude
                                var long = position.coords.longitude
                                $scope.$storage.position = {};

                                if ($scope.$storage.position.lon != position.coords.longitude || $scope.$storage.position.lon != position.coords.latitude) {

                                    $scope.$storage.position.lon = position.coords.longitude;
                                    $scope.$storage.position.lon = position.coords.latitude;

                                    choferService.updatePosition(position).then(function(response) {

                                        console.log("Se actualizo posicion con watch" + response);
                                    })



                                }


                            });

                    $rootScope.watch = watch;
                };

                cordova.plugins.backgroundMode.ondeactivate = function() {
                    console.log('BG deactivated');
                };

                cordova.plugins.backgroundMode.onfailure = function(errorCode) {
                    console.log('BG failure');
                };



            }, false);

            $scope.watchposition = function() {
                var watchOptions = {
                    timeout: 30000,
                    maximumAge: 5000,
                    enableHighAccuracy: true // may cause errors if true
                };

                var watch = $cordovaGeolocation.watchPosition(watchOptions);

                watch.then(
                        null,
                        function(err) {
                            // error
                        },
                        function(position) {
                            var lat = position.coords.latitude
                            var long = position.coords.longitude

                            if ($scope.$storage.position.lon != position.coords.longitude || $scope.$storage.position.lon != position.coords.latitude) {

                                $scope.$storage.position.lon = position.coords.longitude;
                                $scope.$storage.position.lon = position.coords.latitude;

                                choferService.updatePosition(position).then(function(response) {

                                    console.log("Se actualizo posicion" + response);
                                })



                            }


                        });
            };


            $scope.updatePosition = function() {

                var posOptions = {timeout: 100000, enableHighAccuracy: true};

                $cordovaGeolocation
                        .getCurrentPosition(posOptions)
                        .then(function(position) {
                            var lat = position.coords.latitude
                            var long = position.coords.longitude

                            choferService.updatePosition(position).then(function(response) {

                                console.log("Se actualizo posicion" + response);
                            })


                        }, function(err) {
                            console.log(err);
                        });
            }

            $scope.updatePosition();

        })
        .controller('SideMenuCtrl', function($scope, $ionicHistory) {



            $scope.theme = 'ionic-sidemenu-dark';
            $scope.tree1 = [];
            $scope.tree = [{
                    id: 1,
                    name: 'Inicio',
                    icon: "",
                    level: 0,
                    state: 'app.main'
                }, {
                    id: 2,
                    name: 'Cartera',
                    level: 0,
                    icon: '',
                    state: 'app.cartera'
                }, {
                    id: 3,
                    name: 'Historial de Viajes',
                    level: 0,
                    icon: '',
                    state: 'app.historial'
                }, {
                    id: 4,
                    name: 'Configuracion',
                    level: 0,
                    icon: '',
                    state: 'app.configuracion'
                },
                {
                    id: 4,
                    name: 'Ayuda',
                    level: 0,
                    icon: '',
                    state: 'app.ayuda'
                },
                {
                    id: 5,
                    name: 'Salir',
                    level: 0,
                    icon: '',
                    state: 'app.salir'
                }

            ];

            $scope.myGoBack = function() {
                $ionicHistory.goBack();
            };

        })

        .controller('CarteraCtrl', function($scope) {


        })
        .controller('HistorialCtrl', function($scope, $rootScope, $ionicSideMenuDelegate, clienteService, $state) {


        })
        .controller('ConfirmaCtrl', function($scope, $ionicHistory) {



        })
        .controller('HistorialCtrl', function($scope, $ionicHistory) {



        })
        .controller('ConfiguracionCtrl', function($scope, $ionicHistory) {



        })
        .controller('AyudaCtrl', function($scope, $ionicHistory) {



        })
        .controller('LogOutCtrl', function($scope, $rootScope, $ionicHistory, AuthService, $state) {

            AuthService.logout().then(function() {
                $rootScope.watch.clearWatch();
                $state.go('app.login', {});
            });

        })
        .controller('LoginCtrl', function($scope, $ionicHistory, $ionicSideMenuDelegate, $ionicPlatform, AuthService, $localStorage, $state) {

            $scope.$storage = $localStorage;

            $ionicSideMenuDelegate.canDragContent(false);

            $ionicPlatform.registerBackButtonAction(function(event) {
                event.preventDefault();
                ionic.Platform.exitApp();
            }, 100);
            $scope.validate = function() {
                $scope.login();
            };
            $scope.login = function() {

                AuthService.login($scope.email, $scope.password).then(function(response) {


                    $ionicSideMenuDelegate.canDragContent(true);

                    AuthService.suscribe().then(function(response) {


                        $state.go('app.main', {});
                    }, function(err) {
                        alert(err);
                    });

                }, function(err) {

                    alert(err);
                })

            };
            $scope.onOlvidastePass = function() {

            };
            $scope.onRegistrate = function() {

            }

        })

        .controller('JobModalController', function($scope, $ionicHistory) {
            console.log('se ejecuto JobModalController');
            $scope.remainingTime = 20;

            function countDown() {
                $scope.remainingTime = 20;

                // countdown time
                var interval = setInterval(function() {
                    $scope.remainingTime--;
                    // apply scope
                    $scope.$apply();

                    // if time is over
                    if ($scope.remainingTime == 0) {
                        // stop interval
                        clearInterval(interval);

                        // close modal
//                        $scope.closeModal();


//                        alert('se acabo el timpo');


                    }
                }, 1000);

            }

            countDown();

        })