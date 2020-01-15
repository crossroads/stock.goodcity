import { helper as buildHelper } from "@ember/component/helper";
import { STATE_FILTERS } from "../services/filter-service";

const {
  PRIORITY,
  SUBMITTED,
  PROCESSING,
  SCHEDULED,
  DISPATCHING,
  CLOSED,
  CANCELLED
} = STATE_FILTERS;

export default buildHelper(function(state) {
  switch (state[0]) {
    case PRIORITY:
      return "exclamation-triangle";
    case SUBMITTED:
      return "envelope";
    case PROCESSING:
      return "list";
    case SCHEDULED:
      return "clock";
    case DISPATCHING:
      return "paper-plane";
    case CLOSED:
      return "thumbs-up";
    case CANCELLED:
      return "thumbs-down";
    default:
      return "";
  }
});
