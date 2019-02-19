import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('identity_type',{
  sequences: {
    id: function(num) {
      return num + 100;
    },
  },
  default: {
    id:        FactoryGuy.generate('id'),
    name: 'Hong Kong Identity Card'
  },
});
export default {};
