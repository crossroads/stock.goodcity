import detail from './detail';
import Ember from 'ember';
import _ from 'lodash';
import AsyncMixin, { ERROR_STRATEGIES } from 'stock/mixins/async';

export default detail.extend(AsyncMixin, {
  showBeneficiaryModal: false,
  selectedDistrict: null,
  noPurposeDescription: Ember.computed.not('model.purposeDescription'),
  isInvalidPeopleCount: Ember.computed('model.peopleHelped', function() {
    return isNaN(this.get('model.peopleHelped'));
  }),
  designationService: Ember.inject.service(),
  orderService: Ember.inject.service(),

  titles: Ember.computed(function() {
    return [
      { name: 'Mr', id: 'Mr' },
      { name: 'Mrs', id: 'Mrs' },
      { name: 'Miss', id: 'Miss' },
      { name: 'Ms', id: 'Ms' },
    ];
  }),

  identityTypes: Ember.computed(function() {
    return this.get('store').peekAll('identity_type');
  }),

  districts: Ember.computed(function() {
    return this.get('store').peekAll('district');
  }),

  isErrorPresent() {
    if (this.get('isInvalidPeopleCount') || this.get('noPurposeDescription')) {
      this.get('model').rollbackAttributes();
      return true;
    }
  },

  actions: {
    removeBeneficiaryModal() {
      this.toggleProperty('showBeneficiaryModal');
    },

    updateBeneficiary(field, value) {
      const beneficiary = this.get('model.beneficiary');
      const phoneNumber = field === 'phone_number' ? '+852' + value : value;
      this.runTask(
        this.get('designationService').updateBeneficiary(beneficiary.id, {
          beneficiary: {
            [field]: phoneNumber,
          },
        })
      );
    },

    async updateDistrict(district) {
      await this.runTask(async () => {
        const order = this.get('model');
        order.set('district', district);
        await order.save();
      });
    },

    updateOrder(field, value) {
      const order = this.get('model');
      if (this.isErrorPresent() || !_.keys(order.changedAttributes()).length) {
        return;
      }
      this.updateRecord(order, { [field]: value });
    },

    updatePeopleHelped(e) {
      const value = parseInt(e.target.value);
      this.set('order.peopleHelped', value);
      this.send('updateOrder', e.target.name, value);
    },

    updatePurposeDescription(e) {
      this.send('updateOrder', e.target.name, e.target.value);
    },

    deleteBeneficiary() {
      const order = this.get('model');

      this.runTask(() => {
        return this.get('orderService').deleteBeneficiaryOf(order);
      }, ERROR_STRATEGIES.MODAL);
    },
  },
});
