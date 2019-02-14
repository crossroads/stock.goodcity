import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import Ember from 'ember';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  gogovanOrderId:       attr('number'),
  gogovanTransportId:   attr('number'),
  timeslot:             attr('string'),
  transportType:        attr('string'),
  vehicleType:          attr('string'),
  scheduledAt:          attr('string'),
  orderId:              attr('string'),
  contact:              belongsTo('contact', { async: false }),
  designation:          belongsTo('designation', { async: false }),
  needEnglish:          attr("boolean"),
  needCart:             attr("boolean"),
  needCarry:            attr("boolean"),
  gogovanTransport:     belongsTo('gogovan_transport', { async: false }),

  scheduledDate: Ember.computed('scheduledAt', function() {
    return moment(this.get('scheduledAt')).format("D MMMM YYYY");
  }),

  type: Ember.computed('transportType', function(){
    var type = this.get('transportType');
    if(type === "ggv"){
      return type.toUpperCase();
    } else if(type === "self"){
      return type.charAt(0).toUpperCase() + type.slice(1);
    } else {
      return "";
    }
  }),
});
