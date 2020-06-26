import ValidatableForm from "ember-cli-html5-validation/components/validatable-form";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";

export default ValidatableForm.extend(AsyncMixin, {
  actions: {
    submit(eventName) {
      if (!this.get("element").checkValidity()) {
        this.scrollToFirstError();
        return false;
      }

      this.runTask(async () => {
        this.get(eventName || "onSubmit")();
      }, ERROR_STRATEGIES.MODAL);

      return false;
    }
  }
});
