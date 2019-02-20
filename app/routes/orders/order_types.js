// jshint ignore: start

import detail from './detail';
import Cache from '../../utils/cache'
import Ember from 'ember';

export default detail.extend({

  loadDependencies: Cache.once(function () {
    const load = (modelName) => {
      return this.store
        .findAll(modelName)
        .then((data) => this.store.pushPayload(data));
    };

    // Load dependent lookup tables
    return Ember.RSVP.all([
      'district',
      'gogovan_transport',
      'booking_type'
    ].map(load));
  }),

  async afterModel() {
    await this._super(...arguments);
    await this.loadDependencies();
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('stickyNote.showCallToAction', true);
    controller.set('stickyNote.showSaveButton', false);
  }
});
