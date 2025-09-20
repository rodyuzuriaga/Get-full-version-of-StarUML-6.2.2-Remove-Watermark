const { ipcRenderer } = require("electron");
const { EventEmitter } = require("events");
const LicenseActivationDialog = require("../dialogs/license-activation-dialog");

class LicenseStore extends EventEmitter {
  constructor() {
    super();
    // Always return a PRO license activated status
    this.licenseStatus = {
      activated: true,
      name: "Licensed User",
      product: "staruml-v7",
      edition: "PRO",
      productDisplayName: "StarUML v7.0.0",
      deviceId: "unlimited-device",
      licenseKey: "unlimited-license-key",
      activationCode: "unlimited-activation-code",
      trial: false,
      trialDaysLeft: 0,
    };
  }

  async fetch() {
    // Always return the PRO license status
    this.emit("statusChanged", this.licenseStatus);
  }

  async getDeviceId() {
    try {
      // Return a fake device ID
      return "unlimited-device-id";
    } catch (err) {
      console.error(err);
      return "unlimited-device-id";
    }
  }

  async activate(licenseKey) {
    try {
      // Always return success for any license key
      app.toast.info("License activated successfully!");
    } catch (err) {
      console.error(err);
      app.toast.info("License activated successfully!");
    }
    await this.fetch();
  }

  async deactivate() {
    try {
      // Do nothing, keep the license active
      app.toast.info("License remains active");
    } catch (err) {
      console.error(err);
      app.toast.info("License remains active");
    }
    await this.fetch();
  }

  async validate() {
    // Always return successful validation
    return { success: true, message: "License valid" };
  }

  getLicenseStatus() {
    // Always return PRO license status
    return this.licenseStatus;
  }

  async checkTrialMode() {
    // Never show trial dialog since we're always licensed
    // LicenseActivationDialog.showDialog(); // Commented out
  }

  async htmlReady() {
    try {
      await this.fetch();
      const result = await this.validate();
      if (!result.success) {
        // This should never happen with our modifications
        app.toast.info("License validated successfully!");
      }
      // Skip trial check since we're always licensed
      await this.fetch();
    } catch (err) {
      console.error(err);
      console.log("License validation successful (fallback)");
    }
  }
}

module.exports = LicenseStore;