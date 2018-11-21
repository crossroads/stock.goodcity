import AuthorizeRoute from './authorize';

export default AuthorizeRoute.extend({
  deactivate(){
    let controller = this.controllerFor("orderFilters");
    let queryParams = controller.get("queryParams");
    queryParams.forEach( queryParam => controller.set(queryParam, null) );
  }
});
