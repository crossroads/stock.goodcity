import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
import config from '../../config/environment';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ["prevPath"],
  prevPath: null,
  isMobileApp: config.cordova.enabled,
  i18n: Ember.inject.service(),
  order: Ember.computed.alias("model.orderUserOrganisation.order"),
  beneficiary: Ember.computed.alias("model.beneficiary"),
  purposes: Ember.computed.alias("model.purposes"),

  firstName: Ember.computed("beneficiary", {
    get() {
      return this.returnBeneficaryType('firstName');
    },
    set(key, value) {
      return value;
    }
  }),

  lastName: Ember.computed("beneficiary", {
    get() {
      return this.returnBeneficaryType('lastName');
    },
    set(key, value) {
      return value;
    }
  }),

  identityNumber: Ember.computed("beneficiary", {
    get() {
      return this.returnBeneficaryType('identityNumber');
    },
    set(key, value) {
      return value;
    }
  }),

  returnBeneficaryType(type) {
    let beneficiary = this.get('beneficiary');
    return beneficiary && beneficiary.get(type);
  },

  mobilePhone: Ember.computed("beneficiary", {
    get() {
      let beneficiary = this.get('beneficiary');
      let phoneNumber = beneficiary && beneficiary.get('phoneNumber').slice(4);
      return phoneNumber;
    },
    set(key, value) {
      return value;
    }
  }),

  selectedId: Ember.computed('beneficiary.identityTypeId', {
    get() {
      let beneficiary = this.get('beneficiary');
      let selectedId = beneficiary && beneficiary.get('identityTypeId') === 2 ? "abcl" : "hkId";
      return selectedId;
    },
    set(key, value) {
      return value;
    }
  }),

  selectedPurposeId: Ember.computed('order', {
    get() {
      let orderPurpose = this.get('order.ordersPurposes').get('firstObject');
      let prevPath = this.get('prevPath');
      let previousPathPurpose = prevPath === "client_summary" ? "client" : "organisation";
      return (orderPurpose && orderPurpose.get('purpose.identifier')) || previousPathPurpose ;
    },
    set(key, value) {
      return value;
    }
  }),

  isClientSelected: Ember.computed.equal("selectedPurposeId", "client"),
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
      let orderId = this.get('order.id');
      let beneficiaryId = this.get('beneficiary.id');
      let store = this.store;
      let url = beneficiaryId ? "/beneficiaries/" + beneficiaryId : "/beneficiaries";
      let actionType = this.actionType(isOrganisation, beneficiaryId);
      let beneficiary = beneficiaryId && store.peekRecord('beneficiary', beneficiaryId);
      let loadingView = getOwner(this).lookup('component:loading').append();
      let beneficiaryParams = (["PUT", "POST"].indexOf(actionType) > -1) ?  { beneficiary: this.beneficiaryParams(), order_id: orderId } : {};

      return new AjaxPromise('/orders/' + orderId, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(data => {
          store.pushPayload(data);
          if (actionType) {
            return new AjaxPromise(url, actionType, this.get('session.authToken'), beneficiaryParams)
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
      const prevPath = this.get("prevPath");
      if(prevPath && prevPath === "client_summary") {
        this.send("redirectToClientSummary");
      } else {
        this.transitionToRoute('order.goods_details', orderId, { queryParams: { fromClientInformation: true }});
      }
    },

    redirectToClientSummary() {
      let orderId = this.get("order.id");
      this.transitionToRoute('orders.client_summary', orderId);
    }
  }
});
