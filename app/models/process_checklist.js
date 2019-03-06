import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  bookingType:        belongsTo('booking_type', { async: false }),
  bookingTypeId:      attr('number'),
  text:               attr('string')
});
