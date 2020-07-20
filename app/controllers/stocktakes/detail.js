import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { queued } from "../../utils/helpers";
import { ERROR_STRATEGIES, ASYNC_BEHAVIOURS } from "../../mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  // ----------------------
  // Dependencies
  // ----------------------

  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  barcodeService: Ember.inject.service(),
  packageService: Ember.inject.service(),
  stocktakeService: Ember.inject.service(),

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
    "onlyShowVariances",
    "revisions.length",
    "revisions.@each.{quantity,dirty,createdAt}",
    function() {
      return this.get("revisions")
        .filter(rev => {
          if (this.get("mode") === this.get("modes.count")) {
            // In count mode, we only show the ones that have been counted
            return rev.get("quantity") > 0;
          }

          if (this.get("mode") === this.get("modes.review")) {
            return this.get("onlyShowVariances")
              ? rev.get("hasVariance")
              : true;
          }

          return true;
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

  init() {
    this.set("mode", this.get("modes.count"));
  },

  on() {},

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

    /**
     * Will increment the revision for this pacakge by 1, or create it
     *
     * @param {Package} pkg
     */
    async addItem(pkg) {
      pkg = pkg || (await this.get("packageService").userPickPackage());

      if (!pkg) return;

      const revision =
        this.get("revisions").findBy("item", pkg) ||
        this.get("store").createRecord("stocktake_revision", {
          item: pkg,
          dirty: false,
          quantity: 0,
          stocktake: this.get("stocktake"),
          state: "pending"
        });

      this.send("incrementCount", revision);
    },

    /**
     * Will try to process the Stocktake
     */
    commit() {
      this.runTask(() => {
        return this.get("stocktakeService").commitStocktake(
          this.get("stocktake")
        );
      }, ERROR_STRATEGIES.MODAL);
    },

    /**
     * Counts a package by scanning a barcode
     */
    scanPackage() {
      this.runTask(async () => {
        const pkg = await this.get("barcodeService").scanPackage();

        if (pkg) {
          this.send("addItem", pkg);
        }
      }, ASYNC_BEHAVIOURS.DISCREET);
    }
  }
});
