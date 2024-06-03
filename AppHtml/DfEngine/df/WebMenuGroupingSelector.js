import { WebListGroupSelector } from "./weblist/WebListGroupSelector.js"

/*
Class:
    df.WebMenuGroupingSelector
Extends:
    df.WebMenuColumnBase

This class represents a menu item that displays the weblist grouping selector. It uses the WebListGroupSelector to actually render its contents.
    
Revision:
    2023/02/23  (HW, DAW) 
        Initial version.
*/
/* global df */
df.WebMenuGroupingSelector = function WebMenuGroupingSelector(sName, oParent) {
    df.WebMenuGroupingSelector.base.constructor.call(this, sName, oParent);

    this._oGroupingSelector = null;
};
df.defineClass("df.WebMenuGroupingSelector", "df.WebMenuColumnBase", {

    /**
     * Initializes the WebListGroupSelector.
     */
    afterRender: function () {
        df.WebMenuGroupingSelector.base.afterRender.call(this, arguments);

        let oL = this.getList();
        if (!oL) {
            throw new df.Error(999, "WebMenuGroupingSelector could not find it's WebList.", this);
        }
        
        this._oGroupingSelector = new WebListGroupSelector(oL);
        this._oGroupingSelector.onSizeChanged.on(this.onSizeChange, this);

        oL._oGrouping.registerMenuGroupingSelector(this._oGroupingSelector);
    },

    /**
     * Handles a sizechange triggered by the WebListGroupSelector.
     * 
     * @param {df.JSevent} oEv 
     */
    onSizeChange : function(oEv){
        this.getProv()?._oMenu?.updateMenuSize();
    },

    /**
     * Override the itemClick to do nothing.
     * 
     * @param {Menu Item} tItem 
     * @param {Function} fReturn 
     * @param {Object} oEnv 
     */
    itemClick: function (tItem, fReturn, oEnv) {

    },

    /**
     * Override addChild to prevent child menu item from being created.
     */
    addChild: function () {
        throw new df.Error(999, "a WebMenuGroupingSelector is not supposed to have children.", this);
    },

    /**
     * Add extra CSS class to menu item.
     * 
     * @returns CSS classes to be added to the menu item.
     */
    cssClass : function(){
        return df.WebMenuGroupingSelector.base.cssClass.call(this) + " WebMenuGroupingSelector";
    },

    /**
     * This menu item will show if peGrouping is configured to be automatic.
     * 
     * @returns True if the menu item should be visible.
     */
    visible : function(){
        if(df.WebMenuGroupingSelector.base.visible.call(this)){
            const oL = this.getList();
            return oL.peGrouping == df.grpAutomatic;
        }
        return false;
    },

    /**
     * @returns True because this item does custom rendering.
     */
    customRender : function(){
        return true;
    },
    
    /**
     * Generates placeholder HTML that we'll fill with the selector after rendering.
     * 
     * @param {Array} aHtml Stringbuilder HTML array.
     */
    itemHtml : function(aHtml){
        aHtml.push(`<div class="WebMenuGrp_Placeholder"></div>`);
    },
    
    /**
     * Called when the menu item is rendered, we insert the grouping selector element.
     * 
     * @param {DOM Element} eElem 
     */
    itemRendered : function(eElem){
        if(this._oGroupingSelector && eElem){
            eElem.removeChild(eElem.firstChild);
            eElem.appendChild(this._oGroupingSelector.render());
        }
    },
    
    /**
     * Called when the menu item is hidden.
     */
    itemHidden : function(){
        
    },

});