var twitterApp = angular.module ('twitterApp', []);

twitterApp.controller ('LoginController', function ($scope, $http, $window) {
  $scope.links = [
    { link: '/', title: 'Home' },
    { link: '/login', title: 'Login' },
    { link: '/signup', title: 'Sign Up' }
  ];

  $scope.submitForm = function () {
    $http({
      method: 'POST',
      url: '/login',
      data: {
        username: $scope.username,
        password: $scope.password
      }
    }).then (function (response) {
      console.log (response.data);
    });
  };
});
