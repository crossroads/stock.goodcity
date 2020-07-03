export default {
  get overdue() {
    return {
      before: moment().toDate(),
      after: null
    };
  },

  get today() {
    return {
      after: moment()
        .startOf("day")
        .toDate(),
      before: moment()
        .endOf("day")
        .toDate()
    };
  },

  get tomorrow() {
    return {
      after: moment()
        .add(1, "days")
        .startOf("day")
        .toDate(),
      before: moment()
        .add(1, "days")
        .endOf("day")
        .toDate()
    };
  },

  get week() {
    return {
      after: moment()
        .startOf("week")
        .isoWeekday(2)
        .toDate(),
      before: moment()
        .endOf("week")
        .isoWeekday(2)
        .toDate()
    };
  },

  get next_week() {
    return {
      after: moment()
        .add(1, "weeks")
        .startOf("week")
        .isoWeekday(2)
        .toDate(),
      before: moment()
        .add(1, "weeks")
        .endOf("week")
        .isoWeekday(2)
        .toDate()
    };
  },

  get month() {
    return {
      after: moment()
        .startOf("month")
        .toDate(),
      before: moment()
        .endOf("month")
        .toDate()
    };
  },

  get next_month() {
    return {
      after: moment()
        .add(1, "months")
        .startOf("month")
        .toDate(),
      before: moment()
        .add(1, "months")
        .endOf("month")
        .toDate()
    };
  }
};
