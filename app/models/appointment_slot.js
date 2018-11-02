import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  timestamp: attr('date'),
  quota: attr('number'),
  note: attr('string')
});
