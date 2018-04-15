var twitterApp = angular.module ('twitterApp', []);

twitterApp.controller ('LoginController', function ($scope, $http, $location) {
  $scope.links = [
    { link: '/', title: 'Home' },
    { link: '/login', title: 'Login' },
    { link: '/signup', title: 'Sign Up' }
  ];
});
