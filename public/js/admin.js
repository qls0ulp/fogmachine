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
      url: "/ping",
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
    var request = $.ajax({
      url: "/api/admin/v1/collections",
      type: "GET",
      dataType: "json",
    });

    request.done(function (msg) {
      collectionsArray.length = 0;
      for (var property of msg) {
        collectionsArray.push(property);
      }
    });

    request.fail(function (jqXHR, textStatus) {
      $('.login-overlay').fadeIn("slow");
      authToken = '';
    });
  }

  var collectionsArray = [{name: 'rgreg'},{name: 'eth'},{name: 'rger wrgreg'},{name: 'er wg reg'}];

  var collectionsView = Vue.component('collections-list', {
    template: `<div>
        <form v-on:submit.prevent="addCollection($event)">
          <input id="new-collection-name" type="text">
          <input type="submit" value="Add Collection">
        </form>
        <draggable :options="{handle:'.drag-handle'}" @update="checkMove" :list="collections" id="collections-list">
          <div v-for="(data, index) in collections" is="collection-item" :key="index" :index="index" :data="data">
          </div>
        </draggable>
      </div>`,
    data: function() {
      return { collections: collectionsArray };
    },
    methods: {
      checkMove: function (event) {
        // TODO: Re-order
        console.log('Order')
      },
      addCollection: function(e) {
        var request = $.ajax({
          url: "/collection/create",
          type: "POST",
          dataType: "json",
          data: { name: $('#new-collection-name').val() }
        });

        request.done(function (msg) {
          collectionsArray.length = 0;
          for (var property of msg) {
            collectionsArray.push(property);
          }
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

  Vue.component('collection-item', {
    // template: '\
    // <div class="event-item max6" >\
    //   <div class="drag-handle"><img class="drag-handle-img" src="/public/img/drag-handle.svg"></div>\
    //   <div class="event-item-main">\
    //     <button v-on:click="removeItem($event)"  class="event-item-x" type="button" aria-label="Close popup">×</button>\
    //     <div><label>Name:</label><input required v-model=""></div>\
    //   </div>\
    // </div>',
    template: '\
    <div v-on:click="wooHoo()" class="collection-item" >\
      <div class="drag-handle"><img class="drag-handle-img" src="/public/img/drag-handle.svg"></div>\
      <span>{{data.name}}</span>\
    </div>',
    props: ['index', 'data'],
    methods: {
      removeItem: function (event) {
        // TODO: 
        console.log('REMOVE')
        // eventCurrentItems.splice(this.index, 1);
      },
      wooHoo: function () {
        console.log('CLICK')
      },
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