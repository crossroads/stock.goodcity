import AuthorizeRoute from "./authorize";

export default AuthorizeRoute.extend({
  queryParams: {
    destination: "",
    id: ""
  }
});
