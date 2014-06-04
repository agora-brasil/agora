'use strict';

var Home = require('./../../page_objects/home.js');

describe('Home', function () {
  var home = new Home();

  beforeEach(function () {
    home.visit();
  });

  it('should logout', function () {
    home.logoutButton.click();

    expect(home.loginButton.getText()).toEqual('Entrar');
  });

  it('should login with facebook', function () {
    home.loginButton.click();
    browser.sleep(2000);
    expect(home.logoutButton.getText()).toEqual('Sair');
  });

  it('should have a link to user edit page', function () {
    expect(home.userEditLink.isDisplayed()).toBeTruthy();
  });

  it('should have a link to communities page', function () {
    expect(home.communitiesLink.isDisplayed()).toBeTruthy();
  });
});
