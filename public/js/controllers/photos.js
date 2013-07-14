function photos($scope, $http, $templateCache) {

  'use strict';

  $http({method: 'GET', url: '/photos/query', cache: $templateCache}).
    success(function(data, status) {
      $scope.photos = data.photos;
      $('#flimstrip').isotope({
			  itemSelector : '.pic',
			  layoutMode : 'fitRows'
			});
    }).
    error(function(data, status) {
      $scope.photos = data || "Request failed";
  });
 
  $scope.getPhotos = function() {
    $scope.code = null;
    $scope.response = null;
 
    $http({method: 'GET', url: '/photos/query', cache: $templateCache}).
      success(function(data, status) {
        $scope.data = data;
      }).
      error(function(data, status) {
        $scope.data = data || "Request failed";
    });
  };

}