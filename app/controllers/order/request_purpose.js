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
  districts: Ember.computed(function(){
    return this.get("model.districts").sortBy("name");
  }),

  peopleHelped: Ember.computed('order', {
    get() {
      return this.get('order.peopleHelped') || '';
    },
    set(key, value) {
      this.set('order.peopleHelped', value);
      return value;
    }
  }),

  selectedDistrict: Ember.computed('order.districtId', {
    get() {
      let districtId = this.get('order.districtId');
      return districtId ? this.store.peekRecord('district', districtId) : null;
    },
    set(key, value) {
      let districtId = value.id;
      return districtId ? this.store.peekRecord('district', districtId) : null;
    }
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

      let user_organisation_id;
      if(user && user.get('organisationsUsers').length){
        user_organisation_id = user.get('organisationsUsers.firstObject.organisationId');
      }

      let orderParams = {
        organisation_id: user_organisation_id,
        purpose_description: this.get('order.purposeDescription'),
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
          if(isOrganisationPuropose) {
            this.transitionToRoute('order.goods_details', orderId);
          } else {
            this.transitionToRoute("order.client_information", orderId);
          }
        }).finally( () => loadingView.destroy());
    }
  }
});

