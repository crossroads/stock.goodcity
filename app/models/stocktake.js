import Model from "ember-data/model";
import attr from "ember-data/attr";
import { belongsTo, hasMany } from "ember-data/relationships";

export default Model.extend({
  createdAt: attr("date"),
  updatedAt: attr("date"),
  name: attr("string"),
  state: attr("string"),
  comment: attr("string"),
  gains: attr("number"),
  losses: attr("number"),
  counts: attr("number"),
  warnings: attr("number"),
  locationId: attr("number"),
  location: belongsTo("location", { async: false }),
  stocktakeRevisions: hasMany("stocktake_revisions", { async: false }),
  revisions: Ember.computed.alias("stocktakeRevisions"),
  createdBy: belongsTo("user", { async: true }),

  isOpen: Ember.computed.equal("state", "open"),
  isClosed: Ember.computed.equal("state", "closed"),
  isProcessing: Ember.computed.equal("state", "processing"),
  isAwaitingProcess: Ember.computed.equal("state", "awaiting_process"),

  dirtyRevisions: Ember.computed.filterBy("revisions", "dirty", true),
  cleanRevisions: Ember.computed.filterBy("revisions", "dirty", false),
  revisionsWithWarnings: Ember.computed.filterBy("revisions", "warning"),
  gainRevisions: Ember.computed.filterBy("revisions", "isGain"),
  lossRevisions: Ember.computed.filterBy("revisions", "isLoss"),

  cannotCommit: Ember.computed.not("canCommit"),
  canCommit: Ember.computed(
    "revisions.[]",
    "revisions.@each.hasDirtyAttributes",
    "dirtyRevisions.length",
    "isOpen",
    function() {
      return (
        this.get("isOpen") &&
        this.get("dirtyRevisions.length") === 0 &&
        !this.get("revisions").findBy("hasDirtyAttributes")
      );
    }
  )
});
