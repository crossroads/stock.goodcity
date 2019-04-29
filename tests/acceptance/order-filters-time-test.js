import Ember from "ember";
import _ from "lodash";
import { module, test } from "qunit";
import startApp from "../helpers/start-app";
import MockUtils from "../helpers/mock-utils";

var App, filterService;

module("Acceptance: Order time filters", {
  beforeEach: function() {
    App = startApp({}, 2);

    filterService = App.__container__.lookup("service:filterService");
    filterService.clearFilters();

    MockUtils.startSession();
    MockUtils.mockDefault();
    MockUtils.mockEmpty("order_transport");

    visit("/");

    andThen(function() {
      visit("/orders/");
    });

    andThen(function() {
      $("#order-time-filter").click();
    });
  },
  afterEach: function() {
    // Clear our ajax mocks
    MockUtils.closeSession();

    // Stop the app
    Ember.run(App, "destroy");
  }
});

// ------ Tests

test("Should allow to select preset time ranges", function(assert) {
  assert.expect(2);

  const presets = $(".row.preset");

  assert.equal(presets.length, 7);
  assert.deepEqual(_.map(presets, e => e.innerText), [
    "Overdue",
    "Today",
    "Tomorrow",
    "This week",
    "Next week",
    "This month",
    "Next month"
  ]);
});

_.each(
  {
    overdue: (timeRange, assert) => {
      assert.ok(timeRange.before <= new Date());
      assert.equal(timeRange.after, null);
    },
    today: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .endOf("day")
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .startOf("day")
          .toDate()
      );
    },
    tomorrow: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .add(1, "days")
          .endOf("day")
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .add(1, "days")
          .startOf("day")
          .toDate()
      );
    },
    week: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .endOf("week")
          .isoWeekday(2)
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .startOf("week")
          .isoWeekday(2)
          .toDate()
      );
    },
    next_week: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .add(1, "weeks")
          .endOf("week")
          .isoWeekday(2)
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .add(1, "weeks")
          .startOf("week")
          .isoWeekday(2)
          .toDate()
      );
    },
    month: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .endOf("month")
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .startOf("month")
          .toDate()
      );
    },
    next_month: (timeRange, assert) => {
      assert.deepEqual(
        timeRange.before,
        moment()
          .add(1, "months")
          .endOf("month")
          .toDate()
      );
      assert.deepEqual(
        timeRange.after,
        moment()
          .add(1, "months")
          .startOf("month")
          .toDate()
      );
    }
  },
  (assertTimeRange, preset) => {
    test(`Applying the "${preset}" preset sets the filter to the correct range`, function(assert) {
      assert.expect(3);

      $(`.row.preset.${preset}`).click();

      andThen(() => {
        $(".filter-btn.apply").click();
      });

      andThen(() => {
        const timeRange = filterService.get("orderTimeRange");
        assert.equal(timeRange.preset, preset);
        assertTimeRange(timeRange, assert);
      });
    });
  }
);

test("Selecting an after date manually sets the correct filter range", function(assert) {
  assert.expect(3);

  $("#selectedTimeRangeAfter").click();

  andThen(() => {
    $(
      "#selectedTimeRangeAfter_root.picker tbody > tr > td:first-child .picker__day"
    )
      .first()
      .click();
  });

  andThen(() => {
    $(".filter-btn.apply").click();
  });

  andThen(() => {
    const timeRange = filterService.get("orderTimeRange");
    assert.equal(timeRange.preset, null);
    assert.ok(timeRange.after);
    assert.ok(_.isDate(timeRange.after));
  });
});

test("Selecting a before date manually sets the correct filter range", function(assert) {
  assert.expect(3);

  $("#selectedTimeRangeBefore").click();

  andThen(() => {
    $(
      "#selectedTimeRangeBefore_root.picker tbody > tr > td:first-child .picker__day"
    )
      .first()
      .click();
  });

  andThen(() => {
    $(".filter-btn.apply").click();
  });

  andThen(() => {
    const timeRange = filterService.get("orderTimeRange");
    assert.equal(timeRange.preset, null);
    assert.ok(timeRange.before);
    assert.ok(_.isDate(timeRange.before));
  });
});

test("Upon returning to the order list, the list is updated with the selected dates", function(assert) {
  assert.expect(3);

  let apiCalled = false;

  MockUtils.mock({
    url: "/api/v1/designation*",
    type: "GET",
    status: 200,
    onAfterComplete: () => {
      apiCalled = true;
    },
    response: function(req) {
      assert.equal(
        req.data.after,
        moment()
          .startOf("day")
          .toDate()
          .getTime()
      );
      assert.equal(
        req.data.before,
        moment()
          .endOf("day")
          .toDate()
          .getTime()
      );
      this.responseText = { designations: [] };
    }
  });

  $(`.row.preset.today`).click();

  andThen(() => {
    $(".filter-btn.apply").click();
  });

  Ember.run.later(() => {
    andThen(() => {
      assert.ok(apiCalled);
    });
  }, 500);
});
