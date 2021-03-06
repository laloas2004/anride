angular.module('app.directives', [])

.directive('map', function() {
    
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
        
      function initialize() {
          
        var mapOptions = {
          center: new google.maps.LatLng(25.6487281, -100.4431818),
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          streetViewControl: false
       
        };
        
        var map = new google.maps.Map($element[0], mapOptions);
        
            map.setClickableIcons(false);
            
        $scope.onCreate({ map: map });

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }

      if (document.readyState === "complete") {
          
        initialize();
        
      } else {
          
        google.maps.event.addDomListener(window, 'load', initialize);
      }
    }
  }
});
