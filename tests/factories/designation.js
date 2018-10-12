import FactoryGuy from 'ember-data-factory-guy';
import './item';

FactoryGuy.define('designation', {
  sequences: {
    id: function(num) {
      return num;
    },
    code: function(num) {
      var code = 24400 + num;
      return "L" + code;
    }
  },
  default: {
    id:                 FactoryGuy.generate('id'),
    code:               FactoryGuy.generate('code'),
    detailType:         'StockitLocalOrder',
    status:             'Active',
    state:              'submitted',
    createdAt:          '12/07/2016',
    updatedAt:          '12/07/2016',
    purposeDescription: 'Test',
    gcOrganisationId:    '',
    gc_organisation:     FactoryGuy.belongsTo('gc_organisation'),
    submittedBy:         FactoryGuy.belongsTo('user'),
    orders_packages:     FactoryGuy.hasMany('orders_package'),
    orders_purposes:     FactoryGuy.hasMany('orders_purpose'),
    goodcity_requests:   FactoryGuy.hasMany('goodcity_request')
  },
  designation_with_item: {
    item: FactoryGuy.hasMany('item')
  }
});
