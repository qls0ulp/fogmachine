// Auth token needed to interact with the admin API
var authToken = '';

var collections = [];

window.onload = function () {

  // Setup jQuery AJAX engine to use our authToken
  $.ajaxPrefilter(function (options) {
    options.beforeSend = function (xhr) {
      xhr.setRequestHeader('x-access-token', authToken);
    }
  });


  // Login Panel Vue Object
  var loginPanel = new Vue({
    el: '#login-overlay',
    data: {
      loginPending: false
    },
    methods: {
      submitCode: function (e) {
        // Store this for use in callbacks
        var that = this;

        // Get Code
        var username = $('#login-username').val();
        var password = $('#login-password').val();
        // Set pending flag
        this.loginPending = true;

        // Check Code Against Server
        var request = $.ajax({
          url: "login",
          type: "POST",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({ username: username, password: password })
        });

        request.done(function (msg) {
          that.loginPending = false;

          if (!msg.token) {
            that.loginError = 'Login Failed';

            iziToast.error({
              title: 'Login Failed',
              position: 'topCenter',
              timeout: 3500
            });
            return;
          }
          authToken = msg.token;
          localStorage.setItem("token", authToken);

          $('.login-overlay').fadeOut("slow");
          callOnStart();
        });

        request.fail(function (jqXHR, textStatus) {
          that.loginPending = false;
          iziToast.error({
            title: 'Login Failed',
            position: 'topCenter',
            timeout: 3500
          });
        });
      }
    }
  });

  // Function to test if the user is logged in with a valid token
  function testAuthToken(token) {
    if (token) {
      authToken = token;
    }

    var request = $.ajax({
      url: "ping",
      type: "GET",
      dataType: "json",
    });

    request.done(function (msg) {
      callOnStart();
    });

    request.fail(function (jqXHR, textStatus) {
      $('.login-overlay').fadeIn("slow");
      authToken = '';
    });
  }

  testAuthToken(localStorage.getItem("token"));

  function callOnStart() {
    getCollections();
  }

  function getCollections() {
    // var request = $.ajax({
    //   url: "ping",
    //   type: "GET",
    //   dataType: "json",
    // });

    // request.done(function (msg) {
    //   callOnStart();
    // });

    // request.fail(function (jqXHR, textStatus) {
    //   $('.login-overlay').fadeIn("slow");
    //   authToken = '';
    // });
  }

  var collectionsView = Vue.component('collections-list', {
    template: `<div>
        <form v-on:submit.prevent="addCollection($event)">
          <input id="new-collection-name" type="text">
          <input type="submit" value="Add Collection">
        </form>

        <div></div>
      </div>`,
      methods: {
        addCollection: function(e) {
          console.log('ADD ER ALL')
          var request = $.ajax({
            url: "/collection/create",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({ name: $('#new-collection-name').val() })
          });

          request.done(function (msg) {
            console.log(msg)
          });

          request.fail(function (jqXHR, textStatus) {
            iziToast.error({
              title: 'Failed to add collection',
              position: 'topCenter',
              timeout: 3500
            });
          });
        }
      }
  });

  var settingsView = Vue.component('admin-settings', {
    template: '<div>HELLO WORLD 2</div>'
  });

  var vm = new Vue({
    el: '#switcherMain',
    components: {
      'collections-list': collectionsView,
      'admin-settings': settingsView
    },
    data: {
      currentViewMain: false
    }
  });

  $('.form-collections').on('click', function () {
    $('.pure-menu-item').removeClass('pure-menu-selected');
    $(this).addClass('pure-menu-selected');
    vm.currentViewMain = 'collections-list'; // Because naming this details just fucking breaks vue. WTF???
  });

  $('.form-settings').on('click', function () {
    $('.pure-menu-item').removeClass('pure-menu-selected');
    $(this).addClass('pure-menu-selected');
    vm.currentViewMain = 'admin-settings';
  });
};