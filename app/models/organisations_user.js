import attr from 'ember-data/attr';
import Model from 'ember-data/model';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  position: attr('string'),
  organisationId: attr('number'),

  gcOrganisation: belongsTo('gcOrganisation', { async: false }),
  organisation: belongsTo('organisation', { async: false }),
  user: belongsTo('user', { async: false })
});
