import $ from "jquery";
import { computed } from "@ember/object";
import { alias, equal } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import Controller from "@ember/controller";
import { getOwner } from "@ember/application";
import AjaxPromise from "stock/utils/ajax-promise";
import config from "../../config/environment";
import { task } from "ember-concurrency";

export default Controller.extend({
  queryParams: ["prevPath"],
  prevPath: null,
  isMobileApp: config.cordova.enabled,
  i18n: service(),
  order: alias("model.orderUserOrganisation.order"),
  beneficiary: alias("model.beneficiary"),
  purposes: alias("model.purposes"),

  firstName: computed("beneficiary", {
    get() {
      return this.returnBeneficaryType("firstName");
    },
    set(key, value) {
      return value;
    }
  }),

  lastName: computed("beneficiary", {
    get() {
      return this.returnBeneficaryType("lastName");
    },
    set(key, value) {
      return value;
    }
  }),

  identityNumber: computed("beneficiary", {
    get() {
      return this.returnBeneficaryType("identityNumber");
    },
    set(key, value) {
      return value;
    }
  }),

  returnBeneficaryType(type) {
    let beneficiary = this.get("beneficiary");
    return beneficiary && beneficiary.get(type);
  },

  mobilePhone: computed("beneficiary", {
    get() {
      let beneficiary = this.get("beneficiary");
      let phoneNumber = beneficiary && beneficiary.get("phoneNumber").slice(4);
      return phoneNumber;
    },
    set(key, value) {
      return value;
    }
  }),

  selectedId: computed("beneficiary.identityTypeId", {
    get() {
      let beneficiary = this.get("beneficiary");
      let selectedId =
        beneficiary && beneficiary.get("identityTypeId") === 2
          ? "abcl"
          : "hkId";
      return selectedId;
    },
    set(key, value) {
      return value;
    }
  }),

  selectedPurposeId: computed("order", {
    get() {
      let orderPurpose = this.get("order.ordersPurposes").get("firstObject");
      let prevPath = this.get("prevPath");
      return prevPath === "client_summary"
        ? "client"
        : (orderPurpose && orderPurpose.get("purpose.identifier")) ||
            "organisation";
    },
    set(key, value) {
      return value;
    }
  }),

  isClientSelected: equal("selectedPurposeId", "client"),
  isHkIdSelected: equal("selectedId", "hkId"),

  mobile: computed("mobilePhone", function() {
    return config.APP.HK_COUNTRY_CODE + this.get("mobilePhone");
  }),

  titles: computed(function() {
    let translation = this.get("i18n");
    let mr = translation.t("order.user_title.mr");
    let mrs = translation.t("order.user_title.mrs");
    let miss = translation.t("order.user_title.miss");
    let ms = translation.t("order.user_title.ms");

    return [
      { name: mr, id: "Mr" },
      { name: mrs, id: "Mrs" },
      { name: miss, id: "Miss" },
      { name: ms, id: "Ms" }
    ];
  }),

  beneficiaryParams() {
    let title = $("select#title option")
      .toArray()
      .filter(title => title.selected === true)[0].value;
    var beneficieryParams = {
      first_name: this.get("firstName"),
      last_name: this.get("lastName"),
      title: title,
      identity_number: this.get("identityNumber"),
      phone_number: this.get("mobile"),
      order_id: this.get("order.id"),
      identity_type_id: this.identityTypeId()
    };
    return beneficieryParams;
  },

  identityTypeId() {
    return this.get("selectedId") === "hkId" ? 1 : 2;
  },

  actionType(isOrganisation, beneficiaryId) {
    let actionType;
    if (isOrganisation && beneficiaryId) {
      actionType = "DELETE";
    } else if (!isOrganisation && beneficiaryId) {
      actionType = "PUT";
    } else if (!isOrganisation && !beneficiaryId) {
      actionType = "POST";
    } else {
      actionType = null;
    }
    return actionType;
  },

  editOrder: task(function*(orderParams, isOrganisation) {
    let orderId = this.get("order.id");
    let beneficiaryId = this.get("beneficiary.id");
    let store = this.store;
    let url = beneficiaryId
      ? "/beneficiaries/" + beneficiaryId
      : "/beneficiaries";
    let actionType = this.actionType(isOrganisation, beneficiaryId);
    let beneficiary =
      beneficiaryId && store.peekRecord("beneficiary", beneficiaryId);
    let loadingView = getOwner(this)
      .lookup("component:loading")
      .append();
    let beneficiaryParams =
      ["PUT", "POST"].indexOf(actionType) > -1
        ? { beneficiary: this.beneficiaryParams(), order_id: orderId }
        : {};
    var beneficiaryResponse;

    if (actionType) {
      beneficiaryResponse = yield new AjaxPromise(
        url,
        actionType,
        this.get("session.authToken"),
        beneficiaryParams
      );
      orderParams["beneficiary_id"] = beneficiaryResponse.beneficiary
        ? beneficiaryResponse.beneficiary.id
        : null;
    }

    let orderResponse = yield new AjaxPromise(
      "/orders/" + orderId,
      "PUT",
      this.get("session.authToken"),
      { order: orderParams }
    );
    store.pushPayload(orderResponse);

    if (beneficiary && actionType === "DELETE") {
      store.unloadRecord(beneficiary);
      this.send("redirectToGoodsDetails");
    } else {
      store.pushPayload(beneficiaryResponse);
      this.send("redirectToGoodsDetails");
    }
    loadingView.destroy();
  }),

  actions: {
    saveClientDetails() {
      let orderParams;
      let clientInfo = this.get("selectedPurposeId");
      let purposeId = this.get("purposes")
        .filterBy("identifier", clientInfo)
        .get("firstObject.id");

      const isForOrganisation = clientInfo === "organisation";
      orderParams = isForOrganisation
        ? {
            purpose_ids: [purposeId],
            beneficiary_id: null
          }
        : {
            purpose_ids: [purposeId]
          };
      this.get("editOrder").perform(orderParams, isForOrganisation);
    },

    redirectToGoodsDetails() {
      let orderId = this.get("order.id");
      const prevPath = this.get("prevPath");
      if (prevPath && prevPath === "client_summary") {
        this.send("redirectToClientSummary");
      } else {
        this.transitionToRoute("order.goods_details", orderId, {
          queryParams: { fromClientInformation: true }
        });
      }
    },

    redirectToClientSummary() {
      let orderId = this.get("order.id");
      this.transitionToRoute("orders.client_summary", orderId);
    }
  }
});
