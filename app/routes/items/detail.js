import AuthorizeRoute from "../authorize";
import Ember from "ember";
import _ from "lodash";

export default AuthorizeRoute.extend({
  itemBackLinkPath: Ember.computed.localStorage(),
  transition: null,
  messageBox: Ember.inject.service(),
  i18n: Ember.inject.service(),

  queryParams: {
    showDispatchOverlay: false
  },

  async model({ item_id }) {
    // Load selected package
    const model = await this.loadItemWithImages(item_id);

    if (model.get("isSet")) {
      // Load the other items of the set
      const promises = model
        .get("siblings")
        .mapBy("id")
        .map(id => this.loadItemWithImages(id));

      await Ember.RSVP.all(promises);
    }

    let detail_type = model.get("detailType");
    let detail_id = model.get("detailId");
    if (detail_type) {
      await this.preLoadDetail(detail_type, detail_id);
      // await this.preloadAllDetails(detail_type);
    }
    return model;
  },

  afterModel(model) {
    if (!model.get("inventoryNumber")) {
      this.get("transition").abort();
      this.get("messageBox").alert(
        this.get("i18n").t("item_details.not_inventorized_or_missing"),
        () => {
          this.transitionTo("items.index");
        }
      );
    }
  },

  beforeModel(transition) {
    this._super(...arguments);
    this.set("transition", transition);
    var previousRoutes = this.router.router.currentHandlerInfos;
    var previousRoute = previousRoutes && previousRoutes.pop();
    var path = "items.index";

    if (previousRoute) {
      var routeName = previousRoute.name;
      if (routeName.indexOf("items") === 0) {
        path = this.get("itemBackLinkPath") || path;
      } else if (
        routeName.indexOf("items") > -1 ||
        routeName === "orders.detail"
      ) {
        path = routeName;
      }
    }
    this.set("itemBackLinkPath", path);
  },

  setupController(controller, model) {
    this._super(controller, model);
    controller.set("showSetList", false);
    controller.set("callOrderObserver", false);
    controller.set("backLinkPath", this.get("itemBackLinkPath"));
    controller.set("active", true);
  },

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set("active", false);
    }
  },

  // --- Helpers

  /**
   * Loads all the images of an item (cached)
   *
   * @param {Item} item the selected item
   */
  preloadImages(item) {
    const ids = item.getWithDefault("imageIds", []);
    return Ember.RSVP.all(ids.map(id => this.loadImage(id)));
  },

  async preLoadDetail(detail_type, detail_id) {
    if (detail_type) {
      return (
        this.store.peekRecord(
          _.snakeCase(detail_type).toLowerCase(),
          detail_id
        ) ||
        this.store.findRecord(
          _.snakeCase(detail_type).toLowerCase(),
          detail_id,
          {
            reload: true
          }
        )
      );
    }
  },

  // async preloadAllDetails(detail_type) {
  //   if (detail_type) {
  //     return await this.store.findAll(detail_type.toLowerCase(), {
  //       reload: true
  //     });
  //   }
  // },

  /**
   * Loads an image if not available
   *
   * @param {String} id the image id
   * @returns {Image} the image record
   */
  async loadImage(id) {
    const cachedImg = this.store.peekRecord("image", id);
    if (cachedImg) {
      return cachedImg;
    }
    return this.store.findRecord("image", id, {
      reload: true
    });
  },

  /**
   * Loads an item with its images
   * Shorthand for loadItem(id, { loadImages: true })
   *
   * @param {String} id the item id
   * @returns {Item} the item record
   */
  loadItemWithImages(id) {
    return this.loadItem(id, {
      loadImages: true
    });
  },

  /**
   * Loads an item
   * Uses the reload:false option to prevent background loads
   *
   * @param {String} id the item id
   * @param {Object} opts load options
   * @param {Boolean} opts.loadImages if set to true, will also load the images
   * @returns {Item} the item record
   */
  async loadItem(id, opts = {}) {
    const { loadImages = false } = opts;

    const item = await this.store.findRecord("item", id, {
      reload: true
    });
    if (loadImages) {
      await this.preloadImages(item);
    }
    return item;
  }
});
