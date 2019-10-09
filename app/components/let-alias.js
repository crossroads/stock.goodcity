import Ember from "ember";

const AliasComponent = Ember.Component.extend();

AliasComponent.reopenClass({
  positionalParams: ["value"]
});

export default AliasComponent;
