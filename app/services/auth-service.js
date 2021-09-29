import ApiBaseService from "./api-base-service";

export default ApiBaseService.extend({
  opts: {
    authorizedRequest: false
  },

  verify(pin, otpAuthKey) {
    return this.POST(
      "/auth/verify",
      {
        pin: pin,
        otp_auth_key: otpAuthKey
      },
      this.get("opts")
    );
  },

  sendPin(mobile) {
    return this.POST("/auth/signup_and_send_pin", { mobile }, this.get("opts"));
  }
});
