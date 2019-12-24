import Component from "@ember/component";

/**
 * Small helper component allowing to rename variables within the .hbs file
 *
 * Usage:
 *
 * {{#let-alias model.someReallyLongPropertyName as |short| }}
 *    <div> This is {{short}} </div>
 *    <div> I can use {{short}} many times {{short}} </div>
 *    <div> because it's very {{short}} </div
 * {{/let-alias}}
 */
const AliasComponent = Component.extend();

AliasComponent.reopenClass({
  positionalParams: ["value"]
});

export default AliasComponent;
