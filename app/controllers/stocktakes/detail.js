import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { queued } from "../../utils/helpers";
import { ERROR_STRATEGIES } from "../../mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  // ----------------------
  // Dependencies
  // ----------------------

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  packageService: Ember.inject.service(),

  // ----------------------
  // Properties
  // ----------------------

  modes: {
    count: "count",
    review: "review"
  },

  tabs: Ember.computed.alias("modes"),
  selectedTab: Ember.computed.alias("mode"),

  revisions: Ember.computed.alias("stocktake.revisions"),

  filteredRevisions: Ember.computed(
    "mode",
    "stocktake",
    "revisions.length",
    "revisions.@each.{quantity,dirty,createdAt}",
    function() {
      return this.get("revisions")
        .filter(rev => {
          if (this.get("mode") !== this.get("modes.count")) {
            return true;
          }
          // In count mode, we only show the ones that have been counted
          return rev.get("quantity") > 0;
        })
        .sort((r1, r2) => {
          if (!r1.get("createdAt")) return -1; // unsaved record at the top
          return r1.get("createdAt") > r2.get("createdAt") ? -1 : 1;
        });
    }
  ),

  // ----------------------
  // Lifecycle
  // ----------------------

  on() {
    this.set("mode", this.get("modes.review"));
  },

  off() {},

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
      return rev.get("hasDirtyAttributes") && rev.get("isValid");
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
      this.send("updateQuantity", revision, revision.get("quantity") + 1);
    },

    decrementCount(revision) {
      this.send("updateQuantity", revision, revision.get("quantity") - 1);
    },

    updateQuantity(revision, input) {
      const num = input.target ? Number(input.target.value) : Number(input);

      revision.set("quantity", _.clamp(num || 0, 0, 9999));
      this.onRevisionsChange();
    },

    confirmCount(revision) {
      revision.set("dirty", false);
      this.onRevisionsChange();
    },

    saveChanges() {
      this.saveChanges();
    },

    async addItem() {
      const pkg = await this.get("packageService").userPickPackage();

      if (!pkg) return;

      const existing = this.get("revisions").findBy("item", pkg);
      const revision =
        existing ||
        this.get("store").createRecord("stocktake_revision", {
          item: pkg,
          dirty: false,
          quantity: 0,
          stocktake: this.get("stocktake"),
          state: "pending"
        });

      this.send("incrementCount", revision);
    }
  }
});
