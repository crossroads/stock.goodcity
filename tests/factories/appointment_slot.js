import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('appointment_slot',{
  sequences: {
    id: function() {
      return Math.floor(Math.random() * 100);
    }
  },
  default: {
    id                      : FactoryGuy.generate('id'),
    timestamp               : new Date(),
    quota                   : 3
  }
});
export default { };

