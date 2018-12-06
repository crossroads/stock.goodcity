import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  day:      attr('number'),
  hours:    attr('number'),
  minutes:  attr('number'),
  quota:    attr('number')
});
