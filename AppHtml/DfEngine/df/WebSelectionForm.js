/*
Class:
    df.WebSelectionForm
Extends:
    df.WebBaseSelectionForm

Implementation of the web suggestion form that is capable of showing a list of suggestions while 
typing. These suggestions can come from a variety of sources which is mainly determined on the 
server.

Revision:
    2020/09/25  (HW, DAW)
        Initial version.
*/
df.WebSelectionForm = function WebSelectionForm(sName, oParent) {
    df.WebSelectionForm.base.constructor.call(this, sName, oParent);

    this.event("OnSelect", df.cCallModeDefault, "privateOnSelect");
};
df.defineClass("df.WebSelectionForm", "df.WebBaseSelectionForm", {

    openHtml: function (aHtml) {
        // OpenHtml of the WebBaseSelectionForm.
        df.WebSelectionForm.base.openHtml.call(this, aHtml);
    },

    afterRender: function () {
        // AfterRender of the WebBaseSelectionForm.
        df.WebSelectionForm.base.afterRender.call(this);
    },

    suggestSelect: function () {
        if (this._oSelectedSuggestion && !this._oSelectedSuggestion.control) {
            let tRow = this.findSuggestionByValue(this._oSelectedSuggestion.aValues[0]);
            if (tRow) {
                this.set_psValue(tRow.aValues[0]);
                this.fireEx({
                    sEvent: "OnSelect",
                    tActionData: [tRow],
                    oEnv: this
                });
                this.suggestHide();
                return;
            }
        }
        df.WebTagsForm.base.suggestSelect.call(this);
    }

});