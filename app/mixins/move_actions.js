import Ember from 'ember';
import config from 'stock/config/environment';
import AsyncMixin, { ERROR_STRATEGIES } from './async';
import _ from 'lodash';

/**
 * Adds the following properties:
 *
 * - readyToMove (computed, true if other proerties are valid)
 * - moveQty
 * - moveTarget (the package to move)
 * - moveFrom
 * - moveTo
 * - editableQty
 *
 * Adds the following actions:
 *
 * - beginMove(package, [from], [to])
 * - completeMove()
 * - cancelMove()
 */
export default Ember.Mixin.create(AsyncMixin, {
  locationService: Ember.inject.service(),
  settings: Ember.inject.service(),

  editableQty: Ember.computed.alias('settings.allowPartialOperations'),

  moveQty: Ember.computed('_moveQty', {
    get(k) {
      return this.get('_moveQty');
    },
    set(k, value) {
      const allowPartial = this.get('settings.allowPartialOperations');
      const total = this.quantityAtSource();
      const qty = Number(value);

      if (!allowPartial && qty > 0 && qty !== total) {
        throw new Error('Partial quantity is not permitted');
      }

      this.set('_moveQty', qty);
      return qty;
    },
  }),

  async resolveLocation(loc, opts = {}) {
    const i18n = this.get('i18n');

    if (loc) {
      return loc;
    }
    const { queryText = '', presetLocations } = opts;
    const text = i18n.exists(queryText) ? i18n.t(queryText) : queryText;

    return this.get('locationService').userPickLocation({
      headerText: text,
      presetLocations: presetLocations,
    });
  },

  quantityAtSource() {
    const pkg = this.get('moveTarget');
    const source = this.get('moveFrom');

    if (!pkg) {
      return 0;
    }

    const pkgLoc = pkg.get('packagesLocations').findBy('location', source);

    return pkgLoc ? pkgLoc.get('quantity') : 0;
  },

  validMoveParams() {
    const target = this.get('moveTarget');
    const from = this.get('moveFrom');
    const to = this.get('moveTo');
    const qty = this.get('moveQty');

    return target && from && to && from !== to && qty > 0;
  },

  clearMoveParams() {
    this.set('readyToMove', false);
    this.set('moveQty', 0);
    this.set('moveTarget', null);
    this.set('moveFrom', null);
    this.set('moveTo', null);
  },

  actions: {
    async beginMove(pkg, from, to, callback = _.noop) {
      await (this.onBeginMove || _.noop).apply(this);

      from = await this.resolveLocation(from, {
        queryText: 'select_location.pick_from_location',
        presetLocations: pkg.get('locations'),
      });
      to = await this.resolveLocation(to, {
        queryText: 'select_location.pick_to_location',
      });

      if (!pkg || !to || !from) {
        return this.send('cancelMove');
      }

      this.set('moveTarget', pkg);
      this.set('moveFrom', from);
      this.set('moveTo', to);
      this.set('moveQty', this.quantityAtSource());

      if (this.validMoveParams()) {
        this.set('readyToMove', true);
      } else {
        this.send('cancelMove');
      }

      callback();
    },

    async completeMove() {
      this.runTask(async () => {
        const results = await this.get('locationService').movePackage(this.get('moveTarget'), {
          from: this.get('moveFrom'),
          to: this.get('moveTo'),
          quantity: this.get('moveQty'),
        });

        await (this.afterMove || _.noop).call(this, this.get('moveTarget'));

        return results;
      }, ERROR_STRATEGIES.MODAL).finally(() => {
        this.clearMoveParams();
      });
    },

    async cancelMove() {
      this.clearMoveParams();
    },
  },
});
