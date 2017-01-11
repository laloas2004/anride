angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'ngCordova','ngSails'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$sailsProvider', function ($sailsProvider) {

    $sailsProvider.url = 'http://localhost:1337';
    
}])
