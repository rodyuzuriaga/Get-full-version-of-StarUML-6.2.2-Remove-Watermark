/*
 * Copyright (c) 2013-2014 Minkyu Lee. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains the
 * property of Minkyu Lee. The intellectual and technical concepts
 * contained herein are proprietary to Minkyu Lee and may be covered
 * by Republic of Korea and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Minkyu Lee (niklaus.lee@gmail.com).
 *
 */

const { shell, clipboard } = require("electron");
const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");
const Strings = require("../strings");

const licenseActivationDialogTemplate = fs.readFileSync(
  path.join(
    __dirname,
    "../static/html-contents/license-activation-dialog.html",
  ),
  "utf8",
);

async function updateDialog($dlg) {
  // Always use our fake PRO license status
  const licenseStatus = {
    trial: false,
    trialDaysLeft: 0,
    activated: true,
    productDisplayName: "StarUML v7.0.0 PRO",
    name: "Licensed User",
    deviceId: "unlimited-device",
  };

  const $sectionTrialNotExpired = $dlg.find(".trial-not-expired");
  const $sectionTrialExpired = $dlg.find(".trial-expired");
  const $sectionLicenseActivated = $dlg.find(".license-activated");
  const $sectionLicenseNotActivated = $dlg.find(".license-not-activated");
  const $trialDaysLeft = $dlg.find(".trial-days-left");
  const $activeStatus = $dlg.find(".active-status");
  const $productDisplayName = $dlg.find(".product-display-name");
  const $licenseHolderName = $dlg.find(".license-holder-name");
  const $deviceId = $dlg.find(".device-id");

  // Hide all trial sections
  $sectionTrialNotExpired.hide();
  $sectionTrialExpired.hide();
  $sectionLicenseNotActivated.hide();
  
  // Always show license activated
  $sectionLicenseActivated.show();

  $trialDaysLeft.text("0");
  $activeStatus.text("Activated (PRO License)");
  $productDisplayName.text(licenseStatus.productDisplayName);
  $licenseHolderName.text(licenseStatus.name);
  $deviceId.text("unlimited");
}

/**
 * Show License Activation Dialog
 * @private
 * @return {Dialog}
 */
async function showDialog() {
  // Don't fetch from store, use our static values
  const context = {
    Strings: Strings,
    metadata: global.app.metadata,
  };
  const dialog = app.dialogs.showModalDialogUsingTemplate(
    Mustache.render(licenseActivationDialogTemplate, context),
  );

  const $dlg = dialog.getElement();
  const $buyButton = $dlg.find(".buy-button");
  const $licenseKey = $dlg.find(".license-key");
  const $activateButton = $dlg.find(".activate-button");
  const $deactivateButton = $dlg.find(".deactivate-button");
  const $copyDeviceIdButton = $dlg.find(".copy-device-id-button");
  const $licenseManagerButton = $dlg.find(".license-manager-button");
  await updateDialog($dlg);

  $activateButton.click(async function () {
    // Always show success
    app.toast.info("License already activated!");
    setTimeout(async () => {
      await updateDialog($dlg);
    }, 0);
  });

  $deactivateButton.click(async function () {
    // Prevent deactivation
    app.toast.info("License remains active");
    setTimeout(async () => {
      await updateDialog($dlg);
    }, 0);
  });

  $buyButton.click(function () {
    // Optional: still allow opening purchase page
    shell.openExternal(app.config.purchase_url);
  });

  $copyDeviceIdButton.click(async function () {
    clipboard.writeText("unlimited-device-id");
    app.toast.info("Device ID copied to clipboard.");
  });

  $licenseManagerButton.click(function () {
    shell.openExternal(app.config.license_manager_url);
  });

  dialog.then(function ({ buttonId }) {
    // Never set readonly mode - always allow full access
    app.repository._readonly = false;
    app.diagrams.diagramEditor._readonly = false;
    app.propertyEditorView._readonly = false;
  });

  return dialog;
}

exports.showDialog = showDialog;