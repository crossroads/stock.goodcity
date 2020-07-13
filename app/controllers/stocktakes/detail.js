import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { queued } from "../../utils/helpers";

export default Ember.Controller.extend(AsyncMixin, {
  // ----------------------
  // Dependencies
  // ----------------------

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  // ----------------------
  // Properties
  // ----------------------

  modes: {
    count: "count",
    review: "review"
  },

  tabs: Ember.computed.alias("modes"),
  selectedTab: Ember.computed.alias("mode"),

  revisions: Ember.computed(
    "mode",
    "stocktake",
    "stocktake.revisions.[]",
    "stocktake.revisions.@each.{quantity,dirty}",
    function() {
      return this.get("stocktake.revisions").filter(rev => {
        if (this.get("mode") !== this.get("modes.count")) {
          return true;
        }
        // In count mode, we only show the ones that have been counted
        return rev.get("quantity") > 0;
      });
    }
  ),

  // ----------------------
  // Lifecycle
  // ----------------------

  on() {
    this.set("mode", this.get("modes.review"));
    this.addObserver("revisions.@each.quantity", this, "onRevisionsChange");
  },

  off() {
    this.removeObserver("revisions.@each.quantity", this, "onRevisionsChange");
  },

  // ----------------------
  // Callbacks
  // ----------------------

  onRevisionsChange() {
    Ember.run.debounce(this, this.saveChanges, 1000);
  },

  onRevisionSaveError() {
    this.set("saveError", true);
  },

  // ----------------------
  // Methods
  // ----------------------

  async trySave(revision) {
    try {
      revision.set("dirty", false);
      await revision.save();
      return true;
    } catch (e) {
      revision.rollbackAttributes();
      this.onRevisionSaveError();
      return false;
    }
  },

  async trySaveAll(revisions) {
    this.set("saveError", false);
    this.set("saving", true);
    await Ember.RSVP.all(revisions.map(r => this.trySave(r)));
    this.set("saving", false);
  },

  getChangedRevisions() {
    return this.get("revisions").filter(rev => {
      const attrs = rev.changedAttributes();
      const changed = _.has(attrs, "quantity") || _.has(attrs, "dirty");
      return changed && rev.get("isValid");
    });
  },

  saveChanges: queued(async function() {
    const revisions = this.getChangedRevisions();

    if (revisions.get("length")) {
      await this.trySaveAll(revisions);
    }
  }),

  // ----------------------
  // Actions
  // ----------------------

  actions: {
    incrementCount(revision) {
      let qty = _.clamp(revision.get("quantity") + 1, 0, 9999);
      revision.set("quantity", qty);
    },

    decrementCount(revision) {
      let qty = _.clamp(revision.get("quantity") - 1, 0, 9999);
      revision.set("quantity", qty);
    },

    updateQuantity(revision, event) {
      let value = Number(event.target.value) || 0;
      revision.set("quantity", _.clamp(value, 0, 9999));
    },

    confirmCount(revision) {
      revision.set("dirty", false);
    }
  }
});
