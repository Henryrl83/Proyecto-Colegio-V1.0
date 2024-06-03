/*
Class:
    df.WebMenuColumnRestorer
Extends:
    df.WebMenuColumnBase

This class provides basic behaviour for restoring a columnlayout on click.
It is only supposed to be used in context with a cWeblist.
    
Revision:
    2023/01/31  (BN, DAW) 
        Initial version.
*/
/* global df */
df.WebMenuColumnRestorer = function WebMenuColumnRestorer(sName, oParent) {
    df.WebMenuColumnRestorer.base.constructor.call(this, sName, oParent);
};
df.defineClass("df.WebMenuColumnRestorer", "df.WebMenuColumnBase", {

    /* 
    Initializes the modules that make the WebList component.
    */
    afterRender: function () {
        df.WebMenuColumnList.base.afterRender.call(this, arguments);

        let oL = this.getList();
        if (!oL) {
            throw new df.Error(999, "WebMenuColumnRestorer could not find it's WebList.", this);
        }
        oL._oHeader?.registerMenuColumnRestorer(this);
    },

    itemClick: function (tItem, fReturn, oEnv) {
        let oL = this.getList();
        if (!oL) {
            throw new df.Error(999, "WebMenuColumnList could not find it's WebList.", this);
        }
        oL.triggerRestoreColumnLayout(this);
        return df.WebMenuColumnRestorer.base.itemClick.call(this, tItem, fReturn, oEnv);
    },

    addChild: function () {
        throw new df.Error(999, "a cWebMenuColumnRestorer is not supposed to have children.", this);
    },

});