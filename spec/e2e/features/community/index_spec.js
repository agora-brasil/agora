'use strict';

var Community = require('../../page_objects/community.js');

describe('Community', function () {
  var communityPage = new Community(),
    count = 2;

  beforeEach(function () {
    global.create(count).communities(function () {
      communityPage.visit();
    });
  });

  it('should list all communities', function () {
    waitForAsyncCalls().then(function () {
      expect(communityPage.communities.count()).toEqual(count);
    });
  });
});
