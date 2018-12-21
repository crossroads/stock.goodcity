export default {
  name: 'session',
  initialize: function(application) {
    application.inject('controller', 'session', 'service:session');
    application.inject('route', 'session', 'service:session');
    application.inject('component', 'session', 'service:session');
    application.inject('component', 'router', 'router:main');
    application.inject('component', 'filterService', 'service:filterService')
  }
};
