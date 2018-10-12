import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('goodcity_request',{
  sequences: {
    id: function() {
      return Math.floor(Math.random() * 100);
    }
  },
  default: {
    id                      : FactoryGuy.generate('id'),
    quantity                : 1,
    codeId                  : 1,
    description             : "Test",
    designation             : FactoryGuy.belongsTo('designation'),
    code                    : FactoryGuy.belongsTo('code'),
  }
});
export default { };

