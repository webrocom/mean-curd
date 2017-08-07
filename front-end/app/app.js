var vidzy = angular.module('vidzy',['ngRoute','ngResource', 'checklist-model']);



vidzy.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'view/home.html',
            controller: 'listController'
        })
        .when('/create', {
            templateUrl: 'view/create.html',
            controller: 'createController'
        })
        .when('/video/:id', {
            templateUrl: 'view/edit1.html',
            controller: 'editController'
        })
        .when('/video/delete/:id', {
            templateUrl: 'view/delete.html',
            controller: 'deleteController'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);



vidzy.controller('listController', function ($http, $scope){
    
    $scope.load = function (){
        $(".cssload-container").show();
        $http.get('http://localhost:3000/api/videos')
                .then(function (response){
                    $scope.videos = response.data;
                    $(".cssload-container").hide();
                },function (error){
                    alert('Unexpected error');
        });
        
    };
    
    $scope.load();
    
    $scope.toggleSelect = function (status){
        if(! status)
            $scope.batchArray=[];
    };
    
    $scope.batchDelete = function(){
        $scope.batchArray=[];
        $.each($(".chkvideo"), function (i ,e){
            if($(e).prop('checked')){
                $scope.batchArray.push($(e).val());
            }
        });
    if($scope.batchArray.length){
        if(confirm('Are you sure about perform this operation ? ')){
            $http.post('http://localhost:3000/api/videos/batchDelete', {batch: $scope.batchArray })
             .then(function (response){
                 $scope.load();
             }), function (error){
                alert('Unexpected error');
             };
        }
    }
        
    };
});


vidzy.controller('createController', function ($http, $resource, $scope, $location){
    
    $http.get('http://localhost:3000/api/videos/categories')
            .then(function (response){
                $scope.catgories = {
                   availableOptions: response.data,
                   selectedOption: { id : '3', name : 'Option C'}
                };
    });
    
    $scope.toggle = function (){
      $scope.catoggle = !  $scope.catoggle;
    };
    
    
    $scope.saveCategory = function (){
        $.post('http://localhost:3000/api/videos/category', {category : $scope.category})
                .then(function (response){
                    console.log(response);
                    $scope.category = '';
                },
                function (error){

                });
    };
    
    var poster = $("#poster");
    
    /* Initialize file reader */
    
    var reader = new FileReader();
    
    poster.on('change', function (e){
        reader.readAsDataURL(poster[0].files[0]);
        return false;
    });
    
    reader.onload = function (e) {
        var size = poster[0].files[0].size/1024;
        if(size > 256){
            $(".preview").remove();
            $(".poster-alter").remove();
            poster.after('<span class="poster-alter" style="color:red"><small>Poster size is too big ! please choose lesser the 256kb</small></span>');
            $("#submit").prop('disabled', true);
        }
        else{
            $(".preview").remove();
            $(".poster-alter").remove();
            poster.after('<div class="preview" style="width:100px; padding-top:5px;"><img class="img-thumbnail" src="'+e.target.result+'" style="width:100%"></div>');
            $("#submit").prop('disabled', false);
            $scope.getPoster = function (){
                return e.target.result;
            };
        }
        
    };
    

    $('#form_video_create').ajaxForm({
        success : function(){
            window.location.href = "#/"
        },
        error : function(){
            alert('Unexpected error');
        }
    });

});

vidzy.controller('editController', function ($http, $routeParams, $scope, $route, $location){
    
    $scope.toggle = function (){
      $scope.catoggle = !  $scope.catoggle;
    };
    
    $scope.saveCategory = function (){
        $.post('http://localhost:3000/api/videos/category', {category : $scope.category})
                .then(function (response){
                    $route.reload();
                },
                function (error){

                });
    };
    
    $http.get('http://localhost:3000/api/videos/'+$routeParams.id+'')
            .then(function (response){
             $scope.video = [];
             $scope.video.title = response.data[0].title;
             $scope.video.description = response.data[0].description;
             $scope.video.genre = response.data[0].genre;
             $scope.video.poster = response.data[0].poster;
            }, function (error){
               alert('Unexpected error');
               
            });
    $http.get('http://localhost:3000/api/videos/categories')
            .then(function (response){
                $scope.catgories = {
                   availableOptions: response.data,
                    selectedOption: {id: '3', name: 'Option C'}
                };
    });
            
            
            
    var poster = $("#poster");
    
    /* Initialize file reader */
    
    var reader = new FileReader();    
    
    poster.on('change', function (e){
        poster.addClass('newPoster');
        reader.readAsDataURL(poster[0].files[0]);
        return false;
    });
    
    
    
    reader.onload = function (e) {
        var size = poster[0].files[0].size/1024;
        if(size > 256){
            $(".preview").remove();
            $(".poster-alter").remove();
            poster.after('<span class="poster-alter" style="color:red"><small>Poster size is too big ! please choose lesser the 256kb</small></span>');
            $("#submit").prop('disabled', true);
        }
        else{
            $(".preview").remove();
            $(".poster-alter").remove();
            poster.after('<div class="preview" style="width:100px; padding-top:5px;"><img class="img-thumbnail" src="'+e.target.result+'" style="width:100%"></div>');
            $("#submit").prop('disabled', false);
            $scope.getPoster = function (){
                return e.target.result;
            };
        }
        
    };
            
    

    $('#form_video_create').ajaxForm({
        type:'PUT',
        url : 'http://localhost:3000/api/videos/'+$routeParams.id+'',
        success : function(response){
            window.location.href = "#/";
        },
        error : function(error){
            alert('Unexpected error');
        }
    });
    
});

vidzy.controller('deleteController', function($scope, $http, $resource, $location, $routeParams){
        $http.get('http://localhost:3000/api/videos/'+$routeParams.id+' ').then(function (response){
            $scope.video = response.data[0];
        });
        
        $scope.delete = function(){
            $http.delete('http://localhost:3000/api/videos/'+$routeParams.id+' ')
                    .then(function (response){
                        $location.path('/');
                    }, function (error){
                        alert('Unexpected error');
                    });
               
        };
});



//function for remove value for array by value
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


