import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  previousPath: null,

  queryParams: {
    backToNewItem: false
  },

  model() {
    return this.store.query('code', { stock: true });
  },

  beforeModel(transition) {
    this._super(...arguments);
    let previousRoutes = this.router.router.currentHandlerInfos;
    let previousRoute = previousRoutes && previousRoutes.pop();
    let path = previousRoute && previousRoute.name;
    this.set("previousPath", path);
  },

  setupController(controller, model){
    this._super(controller, model);
    let previousPath = this.get('previousPath');
    controller.set('searchText', "");
    controller.set("previousPath", previousPath);
  }
});
