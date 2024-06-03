/*
Class:
    df.WebColumnCombo
Mixin:
    df.WebColumn_mixin (df.WebColumnComboBase)
Extends:
    df.WebCombo


    
Revision:
    2012/01/18  (HW, DAW) 
        Initial version.
*/
/* global df */

//  Generate new base class using mixin and WebCombo
df.WebColumnComboBase = df.mixin("df.WebColumn_mixin", "df.WebCombo");

df.WebColumnCombo = function WebColumnCombo(sName, oParent){
    df.WebColumnCombo.base.constructor.call(this, sName, oParent);
    
    //  Configure super class
    this._sCellClass = "WebColCombo";
};
df.defineClass("df.WebColumnCombo", "df.WebColumnComboBase",{


/*
Triggered after rendering and attached event handles to the DOM.

@private
*/
afterRender : function(){
    df.WebColumnCombo.base.afterRender.call(this);
},



/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/
cellHtml : function(sRowId, tCell){
    var i, sVal = tCell.sValue, tVal;
    
    if(this._aValues){
        for(i = 0; i < this._aValues.length; i++){
            if(this._aValues[i].sValue === sVal){
                return (!this.pbAllowHtml ? df.dom.encodeHtml(this._aValues[i].sDescription) : this._aValues[i].sDescription);
            }
        }
    }
    
    tVal = df.sys.data.serverToType(sVal, this.peDataType);
    sVal = this.typeToDisplay(tVal);
    
    if(!this.pbAllowHtml){
        sVal = df.dom.encodeHtml(sVal);
    }
    
    return (sVal !== '' ? sVal : '&nbsp;');
},

/*
Augments the key handler and makes sure that in firefox the combo doesn't change when changing rows.

@param  oEvent  The event object.
@return True.
@private
*/
onKey : function(oEvent){
    var that = this;
    
    df.WebColumnCombo.base.onKey.apply(this, arguments);
    
    //  Fix for FireFox where we temporary disable the control to make sure that the value does not change when changing rows.
    if(df.sys.isMoz){
        if(oEvent.matchKey(df.settings.listKeys.scrollUp) || oEvent.matchKey(df.settings.listKeys.scrollDown)){
            this._eControl.disabled = true;
            
            setTimeout(function(){
                that._eControl.disabled = !that.isEnabled();
            }, 20);
        }
    }
}

});