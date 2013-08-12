'use strict';
var app = angular.module('acsBlog', ['ngSanitize', 'filters', 'infinite-scroll']);

app.controller('UsersCtrl', function UsersCtrl($scope, $timeout, acsService, clearForms, dataset) {
  $scope.user = null;
  $scope.checkLoginStatus = function() {
    acsService.showMe().then(function(data) {
      $scope.user = dataset.user = data;
    });
  };

  $scope.login = function() {
    acsService.login(this.loginData).then(function(data) {
      if (data.meta && data.meta.code === 200) {
        $scope.user = dataset.user = data.users[0];
        clearForms.clearUserForm($scope);
      } else {
        // flash!
        console.log('wrong');
      }
    });
  };

  $scope.logout = function() {
    acsService.logout().then(function(data) {
      if (data.meta && data.meta.code === 200) {
        $scope.user = dataset.user = null;
      } else {
        // flash!
        console.log('wrong');
      }
    });
  };

  $scope.signup = function() {
    acsService.signup(this.signupData).then(function(data) {
      if (data.meta && data.meta.code === 200) {
        $scope.user = data.users[0];
        clearForms.clearUserForm($scope);
      } else {
        // flash!
        console.log('wrong');
      }
    });
  };

  $scope.checkLoginStatus();
});

app.controller('PostsCtrl', function PostsCtrl($scope, $timeout, acsService, clearForms, dataset, $compile) {
  $scope.page = 1;
  $scope.posts = [];
  $scope.loaderImages = [];
  $scope.postsLoading = false;
  $scope.allDisplayed = false;
  $scope.query = function(params) {
    // if all pages are displayed, return.
    if ($scope.allDisplayed) {
      return;
    }

    $scope.postsLoading = true;
    acsService.queryPosts(params).then(function(data) {
      $scope.posts = $scope.posts.concat(data.posts);

      // if page hits total_page, shouldn't be displaying anymore
      if (data.meta.total_pages === $scope.page) {
        $scope.allDisplayed = true;
      }

      $scope.postsLoading = false;
    });
  };

  $scope.deletePost = function(post) {
    $scope.postForm = {
      id: post.id
    }
    acsService.deletePost($scope.postForm).then(function(data) {
      if (data.meta && data.meta.code === 200) {
        angular.forEach($scope.posts, function(value, key) {
          if(value.id === $scope.postForm.id) {
            $scope.posts.splice(key, 1);
            delete $scope.thePost;
          }
        });
      }  else {
        console.log(data);
      }
    });
  };

  $scope.editPost = function(post) {
    $scope.postForm = {
      method: 'put',
      id: post.id,
      title: post.title,
      tags: post.tags,
      content: $scope.postContent.composer.setValue(post.content)
    }
    $('#post-form').removeClass('bounceOutRight').addClass('bounceInRight');
  };

  $scope.submitPost = function() {
    // wygihtml5 manipulates textarea to iframe which doesn't seems to work, jquery hack
    $scope.postForm.content = $scope.postContent.composer.getValue();
    if($scope.postForm && $scope.postForm.method === 'put') {
      acsService.updatePost($scope.postForm).then(function(data) {
        if (data.meta && data.meta.code === 200) {
          angular.forEach($scope.posts, function(value, key) {
            if(value.id === data.posts[0].id) {
              $scope.posts[key] = $scope.thePost = data.posts[0];
            }
          });
          data.posts[0];
          clearForms.clearPostForm($scope);
          $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
        } else {
          $scope.flash = data.message;
        }
      });
    } else {
      acsService.createPost($scope.postForm).then(function(data) {
        if (data.meta && data.meta.code === 200) {
          $scope.posts.unshift(data.posts[0]);
          clearForms.clearPostForm($scope);
          $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
        } else {
          $scope.flash = data.message;
        }
      });
    }
  };

  $scope.closePostForm = function() {
    clearForms.clearPostForm($scope);
    $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
  }

  // sets post as thePost
  $scope.postClicked = function(post) {
    $scope.isOwner = (dataset.user.id === post.user.id) ? true : false;
    $scope.thePost = post;

    // bounce in forms.
    if ($('#user-form').hasClass('bounceInRight')) {
      $('#user-form').removeClass('bounceInRight').addClass('bounceOutRight');
    }else if ($('#post-form').hasClass('bounceInRight')) {
      $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
    }
  };

  // sets thePost as active
  $scope.isPostSelected = function(post) {
    return $scope.thePost === post;
  };

  // sets thePost as active
  $scope.loadMorePosts = function() {
    if ($scope.postsLoading) return;
    $scope.page++;
    $scope.query({page: $scope.page});
  };

  $scope.imageLoader = function() {;
    if (!$scope.loaderImages || $scope.loaderImages.length < 1) {
      acsService.queryPhotos({per_page: 30}).then(function(data) {
        $scope.loaderImages = $scope.loaderImages.concat(data.photos);
      });
      $('#imageLoader .modal-body').append('<div ng-repeat="photo in loaderImages" class="col-lg-3""><a href="#" class="thumbnail dropdown-toggle" data-toggle="dropdown"><img class="imageLoaderImage" src="{{photo.urls.thumb_100}}" width="100" height="100px" /></a><ul class="dropdown-menu"><li ng-repeat="url in photo.urls"><a href="#" ng-click="imageLoaderInsert(url)">{{url}}</a></li></ul></div>');
      $compile($('#imageLoader').contents())($scope);
    }
    $('#imageLoader').modal('show');
  }

  $scope.imageLoaderInsert = function(url) {
    $('#wysihtml5ImageLink').val(url);
    $('#imageLoader').modal('hide');
  }

  $scope.query({page: $scope.page});

});

app.service('dataset', function($http) {
  return {
    user: null
  }
});

app.service('clearForms', function() {
  return {
    clearPostForm: function(scope) {
      scope.postForm = null;
      scope.postContent.composer.setValue('');
      // scope.form.$setPristine(); ???
    },

    clearUserForm: function(scope) {
      scope.loginData = null;
      scope.signupData = null;
      // scope.form.$setPristine(); ???
    }
  }
});

app.service('acsService', function($http, $templateCache) {
  return {
    queryPosts: function(params) {
      var posts = $http({method: 'GET', params: params, url: '/posts/query', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return posts;
    },

    getPost: function(_id) {
      var post = $http({method: 'GET', params: {id: _id}, url: '/posts/show', cache: $templateCache}).then(function(resp){
        return resp.data.posts[0];
      });

      return post;
    },

    createPost: function(params) {
      var post = $http({method: 'POST', data: params, url: '/posts/create', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return post;
    },

    updatePost: function(params) {
      var post = $http({method: 'PUT', data: params, url: '/posts/update', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return post;
    },

    deletePost: function(params) {
      var post = $http({method: 'DELETE', params: params, url: '/posts/delete', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return post;
    },

    getReviews: function(data) {
      var review = $http({method: 'GET', url: '/reviews/query', cache: $templateCache}).then(function(resp){
        return resp.data.reviews[0];
      });

      return review;
    },

    queryPhotos: function(params) {
      var photos = $http({method: 'GET', params: params, url: '/photos/query', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return photos;
    },

    login: function(data) {
      var userSession = $http({method: 'POST', url: '/login', data: data, cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return userSession;
    },

    logout: function(data) {
      var userSession = $http({method: 'GET', url: '/logout', cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return userSession;
    },

    signup: function(data) {
      var userSession = $http({method: 'POST', url: '/signup', data: data, cache: $templateCache}).then(function(resp){
        return resp.data;
      });

      return userSession;
    },

    showMe: function() {
      var user = $http({method: 'GET', url: '/showme', cache: $templateCache}).then(function(resp){
        if (resp.data.meta && resp.data.meta.code === 200) {
          return resp.data.users[0];
        } else {
          return null;
        }
      });

      return user;
    }

  };
});

// string truncate module, by https://gist.github.com/danielcsgomes/2478654
angular.module('filters', []).filter('truncate', function() {
  return function(text, length, removeHtmlTags, end) {
    var str = (removeHtmlTags) ? text.replace(/(<([^>]+)>)/ig,'') : text;

    if (isNaN(length)) {
      length = 10;
    }

    if (end === undefined) {
      end = '...';
    }

    if (str.length <= length || str.length - end.length <= length) {
      return str;
    } else {
      return String(str).substring(0, length-end.length) + end;
    }
  };
});

app.directive('navHeader', function(dataset, $compile) {
  return {
    restrict: 'E',
    transclude: true,
    template: '<div id="nav-header">' +
                '<span id="nav-title">acs.posts</span>' +
                '<div id="nav-buttons">' +
                  '<i id="login" class="icon-user" ng-click="openUserModal()"></i>' +
                  '<i id="new" class="icon-pencil" ng-click="openPostModal()"></i>' +
                '</div>' +
                '<div class="clr"></div>' +
              '</div>',
    controller: function($scope) {
      $scope.openUserModal = function() {
        if ($('#user-form').hasClass('bounceInRight')) {
          $('#user-form').removeClass('bounceInRight').addClass('bounceOutRight');
        } else {
          if ($('#post-form').hasClass('bounceInRight')) {
            $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
          }
          $('#user-form').removeClass('bounceOutRight').addClass('bounceInRight');
        }
      };
      $scope.openPostModal = function() {
        if (dataset.user) {
          if ($('#post-form').hasClass('bounceInRight')) {
            $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
          } else {
            if ($('#user-form').hasClass('bounceInRight')) {
              $('#user-form').removeClass('bounceInRight').addClass('bounceOutRight');
            }
            $('#post-form').removeClass('bounceOutRight').addClass('bounceInRight');
          }
        } else {
          if ($('#user-form').hasClass('bounceInRight')) {
            $('#user-form').removeClass('bounceInRight').addClass('bounceOutRight');
          } else {
            if ($('#post-form').hasClass('bounceInRight')) {
              $('#post-form').removeClass('bounceInRight').addClass('bounceOutRight');
            }
            $('#user-form').removeClass('bounceOutRight').addClass('bounceInRight');
          }
        }
      }
    },
    link: function(scope, element) {
    }
  }
});

app.directive('user', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'views/user.html',
    link: function(scope) {
    }
  }
});

app.directive('postForm', function() {
  return {
    restrict: 'E',
    transclude: true,
    templateUrl: 'views/post-form.html',
    link: function(scope, element) {
    }
  }
});

app.directive('wysiwyg', function() {
  return {
    restrict: 'E',
    transclude: true,
    template: '<textarea name="content" cols="80" id="postForm-content-editor" ng-model="postForm.content" class="form-control"></textarea>',
    link: function(scope, element) {
      scope.postContent = new wysihtml5.Editor(element.find('textarea').attr('id'), {
        toolbar: 'wysihtml5-toolbar',
        parserRules: wysihtml5ParserRules
      });
    }
  }
});

//  modules
/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
var mod;mod=angular.module("infinite-scroll",[]),mod.directive("infiniteScroll",["$rootScope","$window","$timeout",function(i,n,e){return{link:function(t,l,o){var r,c,f,a;return n=angular.element(n),f=0,null!=o.infiniteScrollDistance&&t.$watch(o.infiniteScrollDistance,function(i){return f=parseInt(i,10)}),a=!0,r=!1,null!=o.infiniteScrollDisabled&&t.$watch(o.infiniteScrollDisabled,function(i){return a=!i,a&&r?(r=!1,c()):void 0}),c=function(){var e,c,u,d;return d=n.height()+n.scrollTop(),e=l.offset().top+l.height(),c=e-d,u=n.height()*f>=c,u&&a?i.$$phase?t.$eval(o.infiniteScroll):t.$apply(o.infiniteScroll):u?r=!0:void 0},n.on("scroll",c),t.$on("$destroy",function(){return n.off("scroll",c)}),e(function(){return o.infiniteScrollImmediateCheck?t.$eval(o.infiniteScrollImmediateCheck)?c():void 0:c()},0)}}}]);
/*
 AngularJS v1.1.5
 (c) 2010-2012 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(I,h){'use strict';function i(a){var d={},a=a.split(","),c;for(c=0;c<a.length;c++)d[a[c]]=!0;return d}function z(a,d){function c(a,b,c,f){b=h.lowercase(b);if(m[b])for(;e.last()&&n[e.last()];)g("",e.last());o[b]&&e.last()==b&&g("",b);(f=p[b]||!!f)||e.push(b);var j={};c.replace(A,function(a,b,d,c,g){j[b]=k(d||c||g||"")});d.start&&d.start(b,j,f)}function g(a,b){var c=0,g;if(b=h.lowercase(b))for(c=e.length-1;c>=0;c--)if(e[c]==b)break;if(c>=0){for(g=e.length-1;g>=c;g--)d.end&&d.end(e[g]);e.length=
c}}var b,f,e=[],j=a;for(e.last=function(){return e[e.length-1]};a;){f=!0;if(!e.last()||!q[e.last()]){if(a.indexOf("<\!--")===0)b=a.indexOf("--\>"),b>=0&&(d.comment&&d.comment(a.substring(4,b)),a=a.substring(b+3),f=!1);else if(B.test(a)){if(b=a.match(r))a=a.substring(b[0].length),b[0].replace(r,g),f=!1}else if(C.test(a)&&(b=a.match(s)))a=a.substring(b[0].length),b[0].replace(s,c),f=!1;f&&(b=a.indexOf("<"),f=b<0?a:a.substring(0,b),a=b<0?"":a.substring(b),d.chars&&d.chars(k(f)))}else a=a.replace(RegExp("(.*)<\\s*\\/\\s*"+
e.last()+"[^>]*>","i"),function(a,b){b=b.replace(D,"$1").replace(E,"$1");d.chars&&d.chars(k(b));return""}),g("",e.last());if(a==j)throw"Parse Error: "+a;j=a}g()}function k(a){l.innerHTML=a.replace(/</g,"&lt;");return l.innerText||l.textContent||""}function t(a){return a.replace(/&/g,"&amp;").replace(F,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function u(a){var d=!1,c=h.bind(a,a.push);return{start:function(a,b,f){a=h.lowercase(a);!d&&q[a]&&(d=a);!d&&v[a]==
!0&&(c("<"),c(a),h.forEach(b,function(a,b){var d=h.lowercase(b);if(G[d]==!0&&(w[d]!==!0||a.match(H)))c(" "),c(b),c('="'),c(t(a)),c('"')}),c(f?"/>":">"))},end:function(a){a=h.lowercase(a);!d&&v[a]==!0&&(c("</"),c(a),c(">"));a==d&&(d=!1)},chars:function(a){d||c(t(a))}}}var s=/^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,r=/^<\s*\/\s*([\w:-]+)[^>]*>/,A=/([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,C=/^</,B=/^<\s*\//,D=/<\!--(.*?)--\>/g,
E=/<!\[CDATA\[(.*?)]]\>/g,H=/^((ftp|https?):\/\/|mailto:|tel:|#)/,F=/([^\#-~| |!])/g,p=i("area,br,col,hr,img,wbr"),x=i("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),y=i("rp,rt"),o=h.extend({},y,x),m=h.extend({},x,i("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")),n=h.extend({},y,i("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
q=i("script,style"),v=h.extend({},p,m,n,o),w=i("background,cite,href,longdesc,src,usemap"),G=h.extend({},w,i("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,span,start,summary,target,title,type,valign,value,vspace,width")),l=document.createElement("pre");h.module("ngSanitize",[]).value("$sanitize",function(a){var d=[];
z(a,u(d));return d.join("")});h.module("ngSanitize").directive("ngBindHtml",["$sanitize",function(a){return function(d,c,g){c.addClass("ng-binding").data("$binding",g.ngBindHtml);d.$watch(g.ngBindHtml,function(b){b=a(b);c.html(b||"")})}}]);h.module("ngSanitize").filter("linky",function(){var a=/((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s\.\;\,\(\)\{\}\<\>]/,d=/^mailto:/;return function(c,g){if(!c)return c;var b,f=c,e=[],j=u(e),i,k,l={};if(h.isDefined(g))l.target=g;for(;b=f.match(a);)i=
b[0],b[2]==b[3]&&(i="mailto:"+i),k=b.index,j.chars(f.substr(0,k)),l.href=i,j.start("a",l),j.chars(b[0].replace(d,"")),j.end("a"),f=f.substring(k+b[0].length);j.chars(f);return e.join("")}})})(window,window.angular);