import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  baseURL: config.rootURL
});

Router.map(function() {

  this.route('logout', { path: '/logout' });
  this.route('login');
  this.route('authenticate');
  this.route('search_code');
  this.route('select_location');
  this.route('search_organisation');
  this.route('app_menu_list');
  this.route('appointments');
  this.route('order_filters');
  this.route('item_filters');

  this.route("items", function() {
    this.route("new");

    this.route("detail", { path: "/:item_id" });
    this.route("history", { path: "/:item_id/history" } );
    this.route("edit_images", { path: "/:item_id/edit_images" });
    this.route("search_location", { path: "/:item_id/search_location" });
    this.route("search_order", { path: "/:item_id/search_order" });
    this.route("search_code", { path: "/:item_id/search_code" });
    this.route("partial_designate", { path: "/:item_id/partial_designate" });
    this.route("partial_undesignate", { path: "/:item_id/partial_undesignate" });
    this.route("modify_designation", { path: "/:item_id/modify_designation" });
    this.route("partial_dispatch", { path: "/:item_id/partial_dispatch" });
    this.route("partial_move", { path: "/:item_id/partial_move" });
  });

  this.route("orders", function() {
    this.route('detail', { path: '/:order_id' });
    this.route('summary', { path: '/:order_id/summary' });
    this.route("add_request", { path: '/:order_id/add_request' });
    this.route('search_code', { path: '/:order_id/search_code' });
    this.route('request_items', { path: '/:order_id/request_items' });
    this.route('items_list', { path: '/:order_id/items_list' });
    this.route('active_items', { path: '/:order_id/active_items' });
    this.route('requested_items', { path: '/:order_id/requested_items' });
    this.route('conversation', { path: '/:order_id/conversation' });
    this.route('order_types', { path: '/:order_id/order_types' });
    this.route("items", { path: "/:order_id/items" });
    this.route("contact", { path: "/:order_id/contact" });
    this.route("order_transport", { path: "/:order_id/transport" });
    this.route("purposes", { path: "/:order_id/purposes" });
    this.route("client", { path: "/:order_id/client" });
    this.route("info", { path: "/:order_id/info" });
  });

  this.route('order', function() {
    this.route('search_users', { path: '/:order_id/search_users' });
    this.route('request_purpose', { path: '/:order_id/request_purpose' });
    this.route('client_information', { path: '/:order_id/client_information' });
    this.route('goods_details', { path: '/:order_id/goods_details' });
    this.route('search_code', { path: '/:order_id/search_code' });
    this.route('appointment_details', { path: '/:order_id/appointment_details' });
    this.route('confirm_booking', { path: '/:order_id/confirm_booking' });
    this.route('booking_success', { path: '/:order_id/booking_success' });
  });

  this.route("organisations", function(){
    this.route("detail", { path: "/:organisation_id" });
    this.route("users", { path: "/:organisation_id/users"});
    this.route("orders", {path: "/:organisation_id/orders"});
  });

  this.route("users", { resetNamespace: true, path: "/organisation/" } ,function(){
    this.route('new', { path: "/:organisation_id/users/new" });
  });
});

export default Router;
