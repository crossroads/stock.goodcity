import AuthorizeRoute from '../authorize';

export default AuthorizeRoute.extend({
  model({ location_id }) {
    return this.store.peekRecord('location', location_id);
  },

  setupController(controller, destination) {
    controller.set('destination', destination);
    controller.on();
  },

  resetController(controller) {
    controller.off();
  },
});
