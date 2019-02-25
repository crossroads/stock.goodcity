import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
import config from '../../config/environment';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["prevPath"],
  prevPath: null,
  i18n: Ember.inject.service(),
  firstName: null,
  lastName: null,
  mobilePhone: null,
  selectedId: null,
  identityNumber: null,
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  beneficiary: Ember.computed.alias("model.beneficiary"),
  purposes: Ember.computed.alias("model.purposes"),

  selectedPurposeId: Ember.computed('order',  function() {
    let orderPurpose = this.get('order.ordersPurposes').get('firstObject');
    return (orderPurpose && orderPurpose.get('purpose.identifier')) || 'organisation';
  }),

  isOrganisationSelected: Ember.computed.equal("selectedPurposeId", "organisation"),
  isHkIdSelected: Ember.computed.equal("selectedId", "hkId"),

  mobile: Ember.computed('mobilePhone', function(){
    return config.APP.HK_COUNTRY_CODE + this.get('mobilePhone');
  }),

  titles: Ember.computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("order.user_title.mr");
    let mrs = translation.t("order.user_title.mrs");
    let miss = translation.t("order.user_title.miss");
    let ms = translation.t("order.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  beneficiaryParams(){
    let title = Ember.$("select#title option").toArray().filter((title) => title.selected === true)[0].value;
    var beneficieryParams = {
      first_name: this.get('firstName'),
      last_name: this.get('lastName'),
      title: title,
      identity_number: this.get('identityNumber'),
      phone_number: this.get('mobile'),
      order_id: this.get('order.id'),
      identity_type_id: this.identityTypeId(),
    };
    return beneficieryParams;
  },

  identityTypeId(){
    return this.get('selectedId') === 'hkId' ? 1 : 2;
  },

  actionType(isOrganisation, beneficiaryId) {
    let actionType;
    if (isOrganisation && beneficiaryId) {
      actionType = 'DELETE';
    } else if (!isOrganisation && beneficiaryId) {
      actionType = 'PUT';
    } else if (!isOrganisation && !beneficiaryId) {
      actionType = 'POST';
    } else {
      actionType = null;
    }
    return actionType;
  },

  actions: {
    saveClientDetails(){
      let orderParams;
      let clientInfo = this.get('selectedPurposeId');
      let purposeId = this.get('purposes').filterBy('identifier', clientInfo).get('firstObject.id');

      const isForOrganisation = clientInfo === 'organisation';
      orderParams = isForOrganisation ? {
          'purpose_ids': [purposeId],
          'beneficiary_id': null
        } : {
          'purpose_ids': [purposeId]
        };

      this.send('editOrder', orderParams, isForOrganisation);
    },

    editOrder(orderParams, isOrganisation) {
      let order = this.get('order');
      let orderId = order.id;
      let beneficiaryId = this.get('beneficiary.id');
      let store = this.store;

      let url = beneficiaryId ? "/beneficiaries/" + beneficiaryId : "/beneficiaries";

      let actionType = this.actionType(isOrganisation, beneficiaryId);

      let beneficiary = beneficiaryId && store.peekRecord('beneficiary', beneficiaryId);
      let loadingView = getOwner(this).lookup('component:loading').append();

      let beneficiaryParams = (["PUT", "POST"].indexOf(actionType) > -1) ?  { beneficiary: this.beneficiaryParams(), order_id: orderId } : {};
      new AjaxPromise('/orders/' + orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(data => {
          store.pushPayload(data);
          if (actionType) {
            new AjaxPromise(url, actionType, this.get('session.authToken'), beneficiaryParams)
              .then((beneficiaryData) => {
                if(beneficiary && actionType === "DELETE") {
                  store.unloadRecord(beneficiary);
                  this.send('redirectToGoodsDetails');
                } else {
                  store.pushPayload(beneficiaryData);
                  this.send('redirectToGoodsDetails');
                }
              });
          } else {
            this.send('redirectToGoodsDetails');
          }
        })
        .finally(() => {
          loadingView.destroy();
        });
    },

    redirectToGoodsDetails() {
      let orderId = this.get("order.id");
      this.transitionToRoute('order.goods_details', orderId, { queryParams: { fromClientInformation: true }});
    }
  }
});
