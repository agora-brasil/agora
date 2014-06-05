(function () {
  'use strict';

  process.env.NODE_ENV = 'tests';

  var baseUrl = process.env.SNAP_CI ? 'http://tests.deliberare.com.br/' : 'http://local.deliberare.com.br:8000/',
    ScreenshotReporter = require('./spec/e2e/reporters/ScreenshotReporter.js'),
    Db = require('./db/db'),
    Home = require('./spec/e2e/page_objects/home.js'),
    lodash = require('lodash');

  function cleanDb() {
    var finish = false;

    runs(function () {
      Db.cleanDb(function () {
        finish = true;
      });
    });

    waitsFor(function () {
      return finish;
    });
  }

  function create(amount) {
    var finish = false;

    return {
      communities: function (callback) {
        runs(function () {
          Db.create(amount).communities(function () {
            finish = true;
          });
        });

        waitsFor(function () {
          return finish;
        });

        runs(function () {
          if (callback) {
            callback();
          }
        });
      }
    };
  }

  function waitForUrl(urlRegex) {
    var currentUrl, now;

    return browser.getCurrentUrl().then(function storeCurrentUrl(url) {
        now = new Date().getTime();
        currentUrl = url;
      })
      .then(function () {
        return browser.wait(function () {
          return browser.getCurrentUrl().then(function (url) {
            return element(by.css('#loading')).isDisplayed().then(function (visible) {
              var timeout = !!(new Date().getTime() >= now + 500);

              return urlRegex.test(url) && visible === false && timeout;
            });
          });
        });
      });
  }

  function waitAsyncCalls() {
    return element(by.css('#loading')).isDisplayed().then(function (visible) {
        return browser.wait(function () {
          return element(by.css('#loading')).isDisplayed().then(function (visible) {
            return visible === false;
          });
        });
      })
      .then(function () {
        return browser.wait(function () {
          return element(by.css('#loading')).isDisplayed().then(function (visible) {
            return visible === false;
          });
        });
      });
  }

  exports.config = {
    specs: ['spec/e2e/features/**/*_spec.js'],
    chromeOnly: true,
    chromeDriver: '/usr/local/bin/chromedriver',
    capabilities: {
      browserName: 'chrome',
      chromeOptions: {
        args: ['no-sandbox']
      }
    },
    baseUrl: baseUrl,

    onPrepare: function () {
      beforeEach(function () {
        cleanDb();
      });

      global.create = create;
      global.baseUrl = baseUrl;
      global._ = lodash;
      global.waitForUrl = waitForUrl;
      global.waitAsyncCalls = waitAsyncCalls;

      browser.driver.manage().window().setSize(1280, 800);
      jasmine.getEnv().addReporter(new ScreenshotReporter("./tmp/agora/screenshots"));

      var home = new Home();
      home.visit();
      home.loginButton.click();
      home.logIn();
    }
  };

}());
