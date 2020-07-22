import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { queued } from "../../utils/async";
import { ERROR_STRATEGIES, ASYNC_BEHAVIOURS } from "../../mixins/async";

/**
 * @enum {function}
 * @readonly
 * @memberof Controllers/stocktakes/StocktakeDetailController
 * @static
 */
const SORTING = {
  BY_CREATION: (rev1, rev2) => {
    if (!rev1.get("createdAt")) {
      return -1; // Unsaved records at the top
    }
    return rev1.get("createdAt") > rev2.get("createdAt") ? -1 : 1;
  }
};

/**
 * @module Controllers/stocktakes/StocktakeDetailController
 * @augments ember/Controller
 */
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
    "onlyShowWarnings",
    "revisions.length",
    "revisions.@each.{quantity,createdAt}",
    function() {
      const modes = this.get("modes");
      const filters = {
        [modes.count]: [rev => rev.get("quantity") > 0],
        [modes.review]: [
          rev =>
            this.get("onlyShowVariances") ? rev.get("hasVariance") : true,
          rev => (this.get("onlyShowWarnings") ? rev.get("warning") : true)
        ]
      }[this.get("mode")];

      return this.get("revisions")
        .filter(_.overEvery(filters))
        .sort(SORTING.BY_CREATION);
    }
  ),

  // ----------------------
  // Lifecycle
  // ----------------------

  init() {
    this.set("mode", this.get("modes.count"));
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
     * Cancels the stocktake
     */
    async cancelStocktake() {
      const confirmed = await this.modalConfirm("stocktakes.confirm_cancel");

      if (!confirmed) return;

      this.runTask(() => {
        return this.get("stocktakeService").cancelStocktake(
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
