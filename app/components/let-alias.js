import Ember from "ember";

/**
 * @module Components/let-alias
 * @description Small helper component allowing to rename variables within the .hbs file
 * @example
 *
 * {{#let-alias model.someReallyLongPropertyName as |short| }}
 *    <div> This is {{short}} </div>
 *    <div> I can use {{short}} many times {{short}} </div>
 *    <div> because it's very {{short}} </div
 * {{/let-alias}}
 */
const AliasComponent = Ember.Component.extend();

AliasComponent.reopenClass({
  positionalParams: ["value"]
});

export default AliasComponent;
