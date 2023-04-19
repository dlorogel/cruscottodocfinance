/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "it/orogel/zcruscottodocfinance/model/models"
],
    function (UIComponent, Device, models) {
        "use strict";

        const oAppComponent = UIComponent.extend("it.orogel.zcruscottodocfinance.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
        oAppComponent.prototype.i18n = function () {
            return this.getModel("i18n").getResourceBundle();
        };
        /**
         * Control busy indicators holder
         * ------------------------------
         */
        oAppComponent.prototype._oBusyControl = {};

        /**
         * Handler for busy indicators
         * ---------------------------
         */
        oAppComponent.prototype.busy = function (bState, oControl) {
            if (oControl) {
                if (!this._oBusyControl[oControl.sId]) {
                    this._oBusyControl[oControl.sId] = oControl;
                }
                oControl.setBusy(bState);
            } else {
                (bState) ? sap.ui.core.BusyIndicator.show() : sap.ui.core.BusyIndicator.hide();
            }
        };

        /**
         * Reset all active busy indicators
         * --------------------------------
         */
        oAppComponent.prototype.resetAllBusy = function () {
            Object.keys(this._oBusyControl).forEach((sId) => {
                const oControl = sap.ui.getCore().byId(sId);
                if (oControl && oControl.isBusy()) {
                    oControl.setBusy(false);
                }
            });

            sap.ui.core.BusyIndicator.hide();
        };
        return oAppComponent;
    });