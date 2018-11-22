import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('appointment_slot_preset',{
  sequences: {
    id: function() {
      return Math.floor(Math.random() * 100);
    }
  },
  default: {
    id                      : FactoryGuy.generate('id'),
    day                     : 1,
    hours                   : 14,
    minutes                 : 30,
    quota                   : 3
  }
});
export default { };

