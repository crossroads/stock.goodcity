import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('beneficiary',{
  sequences: {
    id: function(num) {
      return num + 100;
    },
  },
  default: {
    id:        FactoryGuy.generate('id'),
    firstName: 'Freddy',
    lastName: 'Mercury',
    identityNumber: '1234',
    title: 'Mr',
    phoneNumber: '654321',
    identityTypeId: '1',
    identity_type:      FactoryGuy.belongsTo('identity_type'),
  },
});
export default {};
