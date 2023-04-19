sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, Dialog, DialogType, Button, ButtonType, Text, FilterOperator, MessageToast, Fragment, formatter) {
        "use strict";

        const oAppController = Controller.extend("it.orogel.zcruscottodocfinance.controller.View1", {
            formatter: formatter,
            onInit: function () {
                this.oComponent = this.getOwnerComponent();
                this.oGlobalBusyDialog = new sap.m.BusyDialog();
            },
            onRicerca: function () {
                this.oComponent.busy(true);
                this.SocietaInput = this.getView().byId("idSocieta").getValue();
                const oFinalFilter = new Filter({
                    filters: [],
                    and: true
                });
                if (this.SocietaInput !== undefined && this.SocietaInput !== "") {
                    let aSocietaFilter = [];
                    aSocietaFilter.push(new Filter("Azienda", FilterOperator.EQ, this.SocietaInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aSocietaFilter,
                        and: false
                    }));
                };
                let aStatusFilter = [];
                aStatusFilter.push(new Filter("Status", FilterOperator.EQ, ""));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aStatusFilter,
                    and: false
                }));
                if (this.DataDaInput !== undefined && this.DataDaInput !== "" && !(isNaN(this.DataDaInput))) {
                    let aDataDaInputFilter = [];
                    aDataDaInputFilter.push(new Filter("Data_Operazione", FilterOperator.GE, this.DataDaInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aDataDaInputFilter,
                        and: false
                    }));
                };
                if (this.DataAInput !== undefined && this.DataAInput !== "" && !(isNaN(this.DataAInput))) {
                    let aDataAInputFilter = [];
                    aDataAInputFilter.push(new Filter("Data_Operazione", FilterOperator.LE, this.DataAInput));
                    oFinalFilter.aFilters.push(new Filter({
                        filters: aDataAInputFilter,
                        and: false
                    }));
                };
                const oPromiseDocumento = new Promise((resolve, reject) => {
                    this.getView().getModel("MainModel").read("/HEADERPOSSet", {
                        filters: [oFinalFilter],
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject();
                        }
                    });
                });
                oPromiseDocumento.then((aResult) => {
                    this.oComponent.resetAllBusy();
                    aResult.forEach(x => {
                        x.Selected = false;
                        x.Editable = false;
                        x.enableNote = false;
                        x.Conto_Coge2 = x.Conto_Coge;
                    })
                    this._setTableModel(aResult);
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.zcruscottodocfinance.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onSelezionaTutte: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                AllRows.forEach(x => {
                    x.Selected = true;
                });
                oAppModel.refresh(true);
            },
            onDeselezionaTutte: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                AllRows.forEach(x => {
                    x.Selected = false;
                });
                oAppModel.refresh(true);
            },
            onSeleziona: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var AllRowsLength = AllRows.length;
                for (var i = 0; i < AllRowsLength; i++) {
                    var oSelected = AllRows[i];
                    if (oSelected.Selected === true) {
                        for (var j = 0; j < AllRowsLength; j++) {
                            var oToBeSelect = AllRows[j];
                            if (oToBeSelect.Azienda === oSelected.Azienda && oToBeSelect.Numeratore === oSelected.Numeratore && oToBeSelect.Anno === oSelected.Anno && oToBeSelect.Movimento === oSelected.Movimento && oToBeSelect.N_progr_per_anno_e_numero_ritorno_co_ge === oSelected.N_progr_per_anno_e_numero_ritorno_co_ge) {
                                oToBeSelect.Selected = true;
                            }
                        }
                    }
                }
                oAppModel.refresh(true);
            },
            onSalvare: function () {
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                const oMainModel = this.getView().getModel("MainModel");
                var Rows = oAppModel.getProperty("/rows");
                var RowsCBO = oAppModel.getProperty("/rowsCBO");
                var Modificati = [];
                var NuovoInserimento = [];
                var Selected = Rows.filter(x => x.Editable === true && !x.Send);
                Selected.forEach(x => {
                    var Find = RowsCBO.find(y => x.Azienda === y.Azienda && x.Numeratore === y.Numeratore && x.Anno === y.Anno && x.Movimento === y.Movimento && x.N_progr_per_anno_e_numero_ritorno_co_ge === y.N_progr_per_anno_e_numero_ritorno_co_ge
                        && x.Controvalore === y.Controvalore && x.Conto_Coge2 === y.Conto_Coge && x.Chiave_coge === y.Chiave_coge);
                    if (Find) {
                        var datascadenza = new Date(Find.Data_scadenza);
                        if (x.Conto_Coge !== Find.Conto_Coge) {
                            NuovoInserimento.push(JSON.parse(JSON.stringify(x)));
                        }
                        else if (x.Note !== Find.Note) {
                            Modificati.push(JSON.parse(JSON.stringify(x)));
                        } else if (x.Conto_Coge !== Find.Conto_Coge) {
                            Modificati.push(JSON.parse(JSON.stringify(x)));
                        } else if (x.Data_scadenza.getTime() !== datascadenza.getTime()) {
                            Modificati.push(JSON.parse(JSON.stringify(x)));
                        } else if (x.Descrizione_operazione !== Find.Descrizione_operazione) {
                            Modificati.push(JSON.parse(JSON.stringify(x)));
                        } else if (x.Nome_conto !== Find.Nome_conto) {
                            Modificati.push(JSON.parse(JSON.stringify(x)));
                        }
                    } else {

                    }
                });
                const oPromise = new Promise((resolve, reject) => {
                    this._callModifica(resolve, reject, Modificati);
                });
                const oPromise2 = new Promise((resolve, reject) => {
                    this._callInserisci(resolve, reject, NuovoInserimento);
                });
                Promise.all([oPromise, oPromise2]).then(() => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.success.api.modifica"));
                    this.oComponent.resetAllBusy();
                    this.onRicerca();
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.api.modifica"));
                    this.oComponent.resetAllBusy();
                });
                oAppModel.setProperty("/rowsCBO", JSON.parse(JSON.stringify(Rows)));
            },
            _callModifica: function (resolve, reject, Modificati) {
                var batchChanges = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZCRUSCOTTODOCFINANCE_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (Modificati.length === 0) {
                    resolve();
                } else {
                    Modificati.forEach(x => {
                        delete x.Editable;
                        delete x.Selected;
                        delete x.enableNote;
                        delete x.NoteServizio;
                        delete x.EsitoTest;
                        delete x.Conto_Coge2;
                        if (x.Data_Operazione !== null) {
                            x.Data_Operazione = new Date(x.Data_Operazione);
                            x.Data_Operazione.setHours(x.Data_Operazione.getHours() - x.Data_Operazione.getTimezoneOffset() / 60);
                        } else {
                            x.Data_Operazione = null;
                        }
                        if (x.Data_registrazione_tesoreria !== null) {
                            x.Data_registrazione_tesoreria = new Date(x.Data_registrazione_tesoreria);
                            x.Data_registrazione_tesoreria.setHours(x.Data_registrazione_tesoreria.getHours() - x.Data_registrazione_tesoreria.getTimezoneOffset() / 60);
                        } else {
                            x.Data_registrazione_tesoreria = null;
                        }
                        if (x.Data_valuta !== null) {
                            x.Data_valuta = new Date(x.Data_valuta);
                            x.Data_valuta.setHours(x.Data_valuta.getHours() - x.Data_valuta.getTimezoneOffset() / 60);
                        } else {
                            x.Data_valuta = null;
                        }
                        if (x.Data_scadenza !== null) {
                            x.Data_scadenza = new Date(x.Data_scadenza);
                            x.Data_scadenza.setHours(x.Data_scadenza.getHours() - x.Data_scadenza.getTimezoneOffset() / 60);
                        } else {
                            x.Data_scadenza = null;
                        }
                        if (x.Data_documento_origine !== null) {
                            x.Data_documento_origine = new Date(x.Data_documento_origine);
                            x.Data_documento_origine.setHours(x.Data_documento_origine.getHours() - x.Data_documento_origine.getTimezoneOffset() / 60);
                        } else {
                            x.Data_documento_origine = null;
                        }
                        var ModifyString = "HEADERPOSSet(Azienda='" + x.Azienda + "',Numeratore='" + x.Numeratore + "',Anno='" + x.Anno + "',Movimento='" + x.Movimento + "',N_progr_per_anno_e_numero_ritorno_co_ge='" + x.N_progr_per_anno_e_numero_ritorno_co_ge + "',Controvalore=" + x.Controvalore + "m,Conto_Coge='" + x.Conto_Coge + "',Chiave_coge='" + x.Chiave_coge + "')";
                        batchChanges.push(oDataModel.createBatchOperation(encodeURIComponent(ModifyString), "PATCH", x));
                    });
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.submitBatch(function (data, responseProcess) {
                        resolve();
                    }.bind(this),
                        function (err) {
                            reject();
                        });
                }
            },
            _callInserisci: function (resolve, reject, Inseriti) {
                var batchChanges = [];
                var batchInsert = [];
                var sServiceUrl = "/sap/opu/odata/sap/ZCRUSCOTTODOCFINANCE_SRV/";
                var oDataModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
                if (Inseriti.length === 0) {
                    resolve();
                } else {
                    Inseriti.forEach(x => {
                        delete x.Editable;
                        delete x.Selected;
                        delete x.enableNote;
                        delete x.NoteServizio;
                        delete x.EsitoTest;
                        if (x.Data_Operazione !== null) {
                            x.Data_Operazione = new Date(x.Data_Operazione);
                            x.Data_Operazione.setHours(x.Data_Operazione.getHours() - x.Data_Operazione.getTimezoneOffset() / 60);
                        } else {
                            x.Data_Operazione = null;
                        }
                        if (x.Data_registrazione_tesoreria !== null) {
                            x.Data_registrazione_tesoreria = new Date(x.Data_registrazione_tesoreria);
                            x.Data_registrazione_tesoreria.setHours(x.Data_registrazione_tesoreria.getHours() - x.Data_registrazione_tesoreria.getTimezoneOffset() / 60);
                        } else {
                            x.Data_registrazione_tesoreria = "";
                        }
                        if (x.Data_valuta !== null) {
                            x.Data_valuta = new Date(x.Data_valuta);
                            x.Data_valuta.setHours(x.Data_valuta.getHours() - x.Data_valuta.getTimezoneOffset() / 60);
                        } else {
                            x.Data_valuta = null;
                        }
                        if (x.Data_scadenza !== null) {
                            x.Data_scadenza = new Date(x.Data_scadenza);
                            x.Data_scadenza.setHours(x.Data_scadenza.getHours() - x.Data_scadenza.getTimezoneOffset() / 60);
                        } else {
                            x.Data_scadenza = null;
                        }
                        if (x.Data_documento_origine !== null) {
                            x.Data_documento_origine = new Date(x.Data_documento_origine);
                            x.Data_documento_origine.setHours(x.Data_documento_origine.getHours() - x.Data_documento_origine.getTimezoneOffset() / 60);
                        } else {
                            x.Data_documento_origine = null;
                        }
                        var ModifyString = "HEADERPOSSet(Azienda='" + x.Azienda + "',Numeratore='" + x.Numeratore + "',Anno='" + x.Anno + "',Movimento='" + x.Movimento + "',N_progr_per_anno_e_numero_ritorno_co_ge='" + x.N_progr_per_anno_e_numero_ritorno_co_ge + "',Controvalore=" + x.Controvalore + "m,Conto_Coge='" + x.Conto_Coge2 + "',Chiave_coge='" + x.Chiave_coge + "')";
                        batchChanges.push(oDataModel.createBatchOperation(encodeURIComponent(ModifyString), "DELETE"));
                        delete x.Conto_Coge2;
                        var ModifyString = "HEADERPOSSet";
                        batchInsert.push(oDataModel.createBatchOperation(encodeURIComponent(ModifyString), "POST", x));
                    });
                    oDataModel.addBatchChangeOperations(batchChanges);
                    oDataModel.addBatchChangeOperations(batchInsert);
                    oDataModel.submitBatch(function (data, responseProcess) {
                        resolve();
                    }.bind(this),
                        function (err) {
                            reject();
                        });
                }
            },
            onModificare: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var Selected = AllRows.filter(x => x.Selected === true && !x.Send);
                Selected.forEach(x => {
                    x.Editable = true;
                });
                oAppModel.refresh(true);
            },
            /*onDeclinare: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var Selected = AllRows.filter(x => x.Selected === true);
                Selected.forEach(x => {
                    x.EsitoTest = "Declinato";
                });
                oAppModel.refresh(true);
            },*/
            onDeclinare: function () {
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var AllRowsLength = AllRows.length;
                for (var i = 0; i < AllRowsLength; i++) {
                    var oSelected = AllRows[i];
                    if (oSelected.Selected === true) {
                        for (var j = 0; j < AllRowsLength; j++) {
                            var oToBeSelect = AllRows[j];
                            if (oToBeSelect.Azienda === oSelected.Azienda && oToBeSelect.Numeratore === oSelected.Numeratore && oToBeSelect.Anno === oSelected.Anno && oToBeSelect.Movimento === oSelected.Movimento && oToBeSelect.N_progr_per_anno_e_numero_ritorno_co_ge === oSelected.N_progr_per_anno_e_numero_ritorno_co_ge) {
                                oToBeSelect.EsitoTest = "Declinato";
                            }
                        }
                    }
                }
                oAppModel.refresh(true);
            },
            DataDaChange: function (oEvent) {
                this.DataDaInput = this.getView().byId("DataDaInput").getValue();
                var dateParts = this.DataDaInput.split(".");
                var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                this.DataDaInput = new Date(date);
                let timezone = this.DataDaInput.getTimezoneOffset() / 60;
                this.DataDaInput.setHours(this.DataDaInput.getHours() - timezone);
            },
            DataAChange: function (oEvent) {
                this.DataAInput = this.getView().byId("DataAInput").getValue();
                var dateParts = this.DataAInput.split(".");
                var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
                this.DataAInput = new Date(date);
                let timezone = this.DataAInput.getTimezoneOffset() / 60;
                this.DataAInput.setHours(this.DataAInput.getHours() - timezone);
            },
            onSimulare: function () {
                //this.oGlobalBusyDialog.open();
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var Selected = AllRows.filter(x => x.Selected === true && !x.Send);
                var aPayload = [];
                Selected.forEach(x => {
                    if (x.Data_Operazione !== null) {
                        x.Data_Operazione.setHours(x.Data_Operazione.getHours() - x.Data_Operazione.getTimezoneOffset() / 60);
                    }
                    if (x.Data_registrazione_tesoreria !== null) {
                        x.Data_registrazione_tesoreria.setHours(x.Data_registrazione_tesoreria.getHours() - x.Data_registrazione_tesoreria.getTimezoneOffset() / 60);
                    }
                    if (x.Data_valuta !== null) {
                        x.Data_valuta.setHours(x.Data_valuta.getHours() - x.Data_valuta.getTimezoneOffset() / 60);
                    }
                    if (x.Data_scadenza !== null) {
                        x.Data_scadenza.setHours(x.Data_scadenza.getHours() - x.Data_scadenza.getTimezoneOffset() / 60);
                    }
                    if (x.Data_documento_origine !== null) {
                        x.Data_documento_origine.setHours(x.Data_documento_origine.getHours() - x.Data_documento_origine.getTimezoneOffset() / 60);
                    }
                    if (aPayload.filter(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge).length === 0) {
                        var Header = {
                            "Numeratore": x.Numeratore,
                            "Anno": x.Anno,
                            "Movimento": x.Movimento,
                            "N_progr_per_anno_e_numero_ritorno_co_ge": x.N_progr_per_anno_e_numero_ritorno_co_ge,
                            "Operazione": "S",
                            "Comp_Code": x.Azienda,
                            "Doc_Date": x.Data_Operazione,
                            "Pstng_Date": x.Data_Operazione,
                            "Doc_Type": x.Causale_Coge,
                            "Fis_Period": (x.Data_Operazione.getMonth() + 1).toString(),
                            "HEADERTOPOS": []
                        };
                        var oItem = {
                            "Numeratore": x.Numeratore,
                            "Itemno_Acc": x.Nrpos,
                            "Gl_Account": x.Conto_Coge,
                            "Value_Date": x.Data_valuta,
                            "HouseBankId": x.Banca,
                            "HouseBankAcctId": x.RBN,
                            "Fisc_Year": x.Anno_Coge,
                            "Currency": x.Divisa_azienda,
                            "Amt_Docurr": x.Importo_in_divisa,
                            "AccountType": x.AccountType,
                            "AssignmentReference": x.AssignmentReference
                        };
                        Header.HEADERTOPOS.push(oItem);
                        aPayload.push(Header);
                    } else {
                        var oItem = {
                            "Numeratore": x.Numeratore,
                            "Itemno_Acc": x.Nrpos,
                            "Gl_Account": x.Conto_Coge,
                            "Value_Date": x.Data_valuta,
                            "HouseBankId": x.Banca,
                            "HouseBankAcctId": x.RBN,
                            "Fisc_Year": x.Anno_Coge,
                            "Currency": x.Divisa_azienda,
                            "Amt_Docurr": x.Importo_in_divisa,
                            "AccountType": x.AccountType,
                            "AssignmentReference": x.AssignmentReference
                        };
                        aPayload.find(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge).HEADERTOPOS.push(oItem);
                    }
                });
                var aResultsSimulazione = [];
                let oPromiseSimulazione = Promise.resolve();
                aPayload.forEach(x => {
                    oPromiseSimulazione = oPromiseSimulazione.then(() => {
                        return this._callSimulazione(x, aResultsSimulazione);
                    })
                });
                oPromiseSimulazione.then(() => {
                    Selected.forEach(x => {
                        var Find = aResultsSimulazione.find(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge);
                        if (Find) {
                            x.NoteServizio = Find.ReturnMessage;
                            if (x.NoteServizio !== "") {
                                x.enableNote = true;
                                x.EsitoTest = "Error";
                            } else {
                                x.enableNote = false;
                                x.EsitoTest = "Success";
                            }
                        }
                    });
                    this.onDeselezionaTutte();
                    this.oComponent.resetAllBusy();
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.simulazione.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onRegistrare: function () {
                this.oComponent.busy(true);
                const oAppModel = this.getView().getModel("appModel");
                var AllRows = oAppModel.getProperty("/rows");
                var Selected = AllRows.filter(x => x.Selected === true && (x.EsitoTest === "" || x.EsitoTest === "Success") && !x.Send);
                var aPayload = [];
                Selected.forEach(x => {
                    if (x.Data_Operazione !== null) {
                        x.Data_Operazione.setHours(x.Data_Operazione.getHours() - x.Data_Operazione.getTimezoneOffset() / 60);
                    }
                    if (x.Data_registrazione_tesoreria !== null) {
                        x.Data_registrazione_tesoreria.setHours(x.Data_registrazione_tesoreria.getHours() - x.Data_registrazione_tesoreria.getTimezoneOffset() / 60);
                    }
                    if (x.Data_valuta !== null) {
                        x.Data_valuta.setHours(x.Data_valuta.getHours() - x.Data_valuta.getTimezoneOffset() / 60);
                    }
                    if (x.Data_scadenza !== null) {
                        x.Data_scadenza.setHours(x.Data_scadenza.getHours() - x.Data_scadenza.getTimezoneOffset() / 60);
                    }
                    if (x.Data_documento_origine !== null) {
                        x.Data_documento_origine.setHours(x.Data_documento_origine.getHours() - x.Data_documento_origine.getTimezoneOffset() / 60);
                    }
                    if (aPayload.filter(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge).length === 0) {
                        var Header = {
                            "Numeratore": x.Numeratore,
                            "Anno": x.Anno,
                            "Movimento": x.Movimento,
                            "N_progr_per_anno_e_numero_ritorno_co_ge": x.N_progr_per_anno_e_numero_ritorno_co_ge,
                            "Operazione": "R",
                            "Comp_Code": x.Azienda,
                            "Doc_Date": x.Data_Operazione,
                            "Doc_Number": x.Data_Operazione,
                            "Pstng_Date": x.Data_Operazione,
                            "Doc_Type": x.Causale_Coge,
                            "Fis_Period": (x.Data_Operazione.getMonth() + 1).toString(),
                            "HEADERTOPOS": []
                        };
                        var oItem = {
                            "Numeratore": x.Numeratore,
                            "Itemno_Acc": x.Nrpos,
                            "Gl_Account": x.Conto_Coge,
                            "Value_Date": x.Data_valuta,
                            "HouseBankId": x.Banca,
                            "HouseBankAcctId": x.RBN,
                            "Fisc_Year": x.Anno_Coge,
                            "Currency": x.Divisa_azienda,
                            "Amt_Docurr": x.Importo_in_divisa,
                            "AccountType": x.AccountType,
                            "AssignmentReference": x.AssignmentReference
                        };
                        Header.HEADERTOPOS.push(oItem);
                        aPayload.push(Header);
                    } else {
                        var oItem = {
                            "Numeratore": x.Numeratore,
                            "Itemno_Acc": x.Nrpos,
                            "Gl_Account": x.Conto_Coge,
                            "Value_Date": x.Data_valuta,
                            "HouseBankId": x.Banca,
                            "HouseBankAcctId": x.RBN,
                            "Fisc_Year": x.Anno_Coge,
                            "Currency": x.Divisa_azienda,
                            "Amt_Docurr": x.Importo_in_divisa,
                            "AccountType": x.AccountType,
                            "AssignmentReference": x.AssignmentReference
                        };
                        aPayload.find(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge).HEADERTOPOS.push(oItem);
                    }
                });
                var aResultsRegistrazione = [];
                let oPromiseRegistrazione = Promise.resolve();
                aPayload.forEach(x => {
                    oPromiseRegistrazione = oPromiseRegistrazione.then(() => {
                        return this._callRegistrazione(x, aResultsRegistrazione);
                    })
                });
                oPromiseRegistrazione.then(() => {
                    Selected.forEach(x => {
                        var Find = aResultsRegistrazione.find(y => y.Numeratore === x.Numeratore && y.Comp_Code === x.Azienda && y.Movimento === x.Movimento && y.Anno === x.Anno && y.N_progr_per_anno_e_numero_ritorno_co_ge === x.N_progr_per_anno_e_numero_ritorno_co_ge);
                        if (Find) {
                            x.NoteServizio = Find.ReturnMessage;
                            if (x.NoteServizio !== "") {
                                x.enableNote = true;
                                x.EsitoTest = "Error";
                            } else {
                                x.NoteServizio = Find.ReturnSuccessMessage;
                                x.enableNote = true;
                                x.Send = true;
                                x.EsitoTest = "Success";
                            }
                        }
                    });
                    this.onDeselezionaTutte();
                    this.oComponent.resetAllBusy();
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.registrazione.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onNote: function (oEvent) {
                //this.oComponent.busy(true);
                var Document = oEvent.getSource().getBindingContext().getObject();
                this.oDefaultMessageDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Note",
                    content: new Text({
                        text: Document.NoteServizio
                    }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: "OK",
                        press: function () {
                            this.oDefaultMessageDialog.close();
                        }.bind(this)
                    })
                });
                this.oDefaultMessageDialog.open();
                //this.oComponent.resetAllBusy();
            },
            onNewkoVHRequest: function (oEvent) {
                var sInputValue = oEvent.getSource().getValue(),
                    oView = this.getView();
                this.IndiceValueHelp = oEvent.getSource().getParent().getIndex();
                var Selected = this.getView().byId("AccountingDocument").getContextByIndex(this.IndiceValueHelp).getObject();
                var aNewko = [];
                const oFinalFilter = new Filter({
                    filters: [],
                    and: false
                });
                let aBukrsFilter = [];
                aBukrsFilter.push(new Filter("Bukrs", FilterOperator.EQ, Selected.Bukrs));
                oFinalFilter.aFilters.push(new Filter({
                    filters: aBukrsFilter,
                    and: true
                }));
                const oPromiseNewko = new Promise((resolve, reject) => {
                    this.getView().getModel("MainModel").read("/Skb1Set", {
                        filters: [oFinalFilter],
                        success: (aData) => {
                            resolve(aData.results);
                        },
                        error: (oError) => {
                            reject;
                        }
                    });
                });
                oPromiseNewko.then((aResult) => {
                    aResult.forEach(x => {
                        var oNewko = {
                            "Value": x.Saknr
                        }
                        aNewko.push(oNewko);
                    });
                    const oAppModel = this.getView().getModel("appModel");
                    oAppModel.setProperty("/Newko", aNewko);
                    // create value help dialog
                    this._pValueHelpDialog = Fragment.load({
                        id: "Newko",
                        name: "it.orogel.zcruscottoeleagol.view.VHDialogNewko",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                    this._pValueHelpDialog.then(function (oValueHelpDialog) {
                        oValueHelpDialog.open(sInputValue);
                    });
                }, oError => {
                    MessageToast.show(this.oComponent.i18n().getText("msg.error.Newko.text"));
                    this.oComponent.resetAllBusy();
                });
            },
            onSearchNewko: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter({
                    filters: [
                        new Filter("Value", FilterOperator.Contains, sValue),
                    ],
                    and: false
                });
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            }, onVHDialogNewkoClose: function (oEvent) {
                var aSelectedItems = oEvent.getParameter("selectedItems");
                const oAppModel = this.getView().getModel("appModel");
                if (aSelectedItems && aSelectedItems.length > 0) {
                    var oSelected = this.getView().byId("AccountingDocument").getContextByIndex(this.IndiceValueHelp).getObject();
                    var Newko = oEvent.getParameter("selectedContexts").map(function (oContext) { return oContext.getObject().Value; })[0];
                    oSelected.Newko = Newko;
                }
                oAppModel.refresh(true);
            },
        });
        /**
        * Set table model 
        * ---------------
        * @param aProducts - products
        * @private
        */
        oAppController.prototype._setTableModel = function (aResults) {
            //set model: concat new batch of data to previous model
            const oAppModel = this.getView().getModel("appModel");
            const oTable = this.getView().byId("AccountingDocument");
            oAppModel.setProperty("/rows", aResults);
            oAppModel.setProperty("/rowsCBO", JSON.parse(JSON.stringify(aResults)));
            oTable.setModel(oAppModel);
            oTable.bindRows("/rows");
            oTable.sort(oTable.getColumns()[2]);
            oAppModel.refresh(true);
        };
        oAppController.prototype._callSimulazione = function (x, aResultsSimulazione) {
            return new Promise((resolve, reject) => {
                this.getView().getModel("MainModel").create("/HEADERSet", x, {
                    success: (aData) => {
                        aResultsSimulazione.push(aData);
                        resolve();
                    },
                    error: (oError) => {
                        reject;
                    }
                });
            });
        };
        oAppController.prototype._callRegistrazione = function (x, aResultsRegistrazione) {
            return new Promise((resolve, reject) => {
                this.getView().getModel("MainModel").create("/HEADERSet", x, {
                    success: (aData) => {
                        aResultsRegistrazione.push(aData);
                        resolve();
                    },
                    error: (oError) => {
                        reject;
                    }
                });
            });
        };
        return oAppController;
    });
