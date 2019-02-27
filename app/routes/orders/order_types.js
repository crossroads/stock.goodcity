// jshint ignore: start

import detail from './detail';
import Cache from '../../utils/cache'
import Ember from 'ember';

export default detail.extend({
  processingChecklist: Ember.inject.service(),

  loadLookups: Cache.once(function () {
    const load = (modelName) => {
      return this.store
        .findAll(modelName)
        .then((data) => this.store.pushPayload(data));
    };

    // Load dependent lookup tables
    return Ember.RSVP.all([
      'district',
      'gogovan_transport',
      'booking_type',
      'process_checklist'
    ].map(load));
  }),

  loadDependencies(order) {
    return Ember.RSVP.all(
      order
        .getWithDefault('ordersProcessChecklistIds', [])
        .map(id => this.loadIfAbsent('orders_process_checklist', id))
    )
  },

  async afterModel(model) {
    await this._super(...arguments);
    await Ember.RSVP.all([ 
      this.loadLookups(),
      this.loadDependencies(model)
    ]);
  },

  setupController(controller, model){
    this._super(controller, model);
    controller.set('stickyNote.showCallToAction', true);
    controller.set('stickyNote.showSaveButton', false);
  }
});
