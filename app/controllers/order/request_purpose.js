import Ember from "ember";
import AjaxPromise from 'stock/utils/ajax-promise';
const { getOwner } = Ember;

export default Ember.Controller.extend({
  queryParams: ['userId'],
  messageBox: Ember.inject.service(),
  orderId: null,
  peopleCount: null,
  description: "",
  user: Ember.computed.alias('model.orderUserOrganisation.user'),
  order: Ember.computed.alias('model.orderUserOrganisation.order'),
  districts: Ember.computed.alias('model.districts'),
  selectedId: Ember.computed('order',  function() {
    return this.get('order.purposeId') || "Organisation";
  }),

  peopleHelped: Ember.computed('order', function() {
    return this.get('order.peopleHelped') || undefined;
  }),

  selectedDistrict: Ember.computed('order.districtId', function() {
    let districtId = this.get('order.districtId');
    return districtId ? this.store.peekRecord('district', districtId) : null;
  }),

  actions: {
    clearDescription() {
      this.set('order.purposeDescription', "");
    },

    deleteOrder() {
      this.get("messageBox").custom(
      "Cancel this Request?",
      "Not Now", null,
      "Cancel Request", () => this.send("removeOrder"));
    },

    removeOrder() {
      let loadingView = getOwner(this).lookup('component:loading').append();

      this.get('model.order').destroyRecord().then(()=> {
        this.transitionToRoute('app_menu_list');
      }).finally( () => loadingView.destroy());
    },

    createOrderWithRequestPuropose(){
      let user = this.get('user');
      let purposeIds = [];
      if(this.get('selectedId') === 'Organisation'){
        purposeIds.push(1);
      } else if(this.get('selectedId') === 'Client'){
        purposeIds.push(2);
      }

      let user_organisation_id;
      if(user && user.get('organisationsUsers').length){
        user_organisation_id = user.get('organisationsUsers.firstObject.organisationId');
      }

      let orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get('order.purposeDescription'),
        purpose_ids: purposeIds,
        people_helped: this.get('peopleHelped'),
        district_id: this.get('selectedDistrict.id')
      };

      const orderId = this.get("order.id");
      let url = "/orders/" + orderId;

      var loadingView = getOwner(this).lookup('component:loading').append();

      var isOrganisationPuropose = false;

      new AjaxPromise(url, 'PUT', this.get('session.authToken'), { order: orderParams })
        .then(data => {
          this.get("store").pushPayload(data);
          var orderId = data.designation.id;
          var purpose_ids = data.orders_purposes.filterBy("order_id", orderId).getEach("purpose_id");
          isOrganisationPuropose = purpose_ids.get('length') === 1 && purpose_ids.indexOf(1) >= 0;
          loadingView.destroy();
          if(isOrganisationPuropose) {
            this.transitionToRoute('order.goods_details', orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        });
    }
  }
});

