sap.ui.define([], function () {

    "use strict";

    return {

        fmFormatDate: function (date) {
            if (date !== "") {
                if (!date) return "";
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "dd-MM-yyyy"
                });
                return dateFormat.format(new Date(date));
            } else {
                return "";
            }
        },
        fmIconChange: function (color) {
            return color ? "sap-icon://color-fill" : "";
        }
    };

});