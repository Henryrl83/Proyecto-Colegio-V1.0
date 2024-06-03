/*
Class:
    df.WebColumnCheckbox
Mixin:
    df.WebColumn_mixin (df.WebColumnCheckboxBase)
Extends:
    df.WebCheckbox

Class representing the checkbox column that renders a checkbox in each cell instead of the textual 
value.
    
Revision:
    2012/01/23  (HW, DAW) 
        Initial version.
    2013/08/15  (HW, DAW)
        Rewrote to use mixin.
*/

//  Generate new base class using mixin and WebCheckbox
df.WebColumnCheckboxBase = df.mixin("df.WebColumn_mixin", "df.WebCheckbox");

df.WebColumnCheckbox = function WebColumnCheckbox(sName, oParent){
    df.WebColumnCheckbox.base.constructor.call(this, sName, oParent);

    this._sTick = null;
    
    //  Configure super class
    this._sCellClass = "WebColCheckbox";
    this._sControlClass = "WebCheckbox WebCheckboxColumn";
};
df.defineClass("df.WebColumnCheckbox", "df.WebColumnCheckboxBase",{

/* 
Augments the cellClick to make sure that the checkbox will be ticked when it is selected shortly 
after this event. A timeout is used to reset the switch controlling this.

@param  oEvent  Event object.
@param  sRowId  RowId of the clicked row.
@param  sVal    Value of the clicked cell.

@param  True if this column handled the click and the list should ignore it (stops the ChangeCurrentRow).
*/
cellClickBefore : function(oEvent, sRowId, sVal){
    var eTarget = oEvent.getTarget();
    
    df.WebColumnCheckbox.base.cellClickBefore.call(this, oEvent, sRowId, sVal);
    
    //  Make sure that the checkbox gets ticked if we switch to edit mode within a second
    if(!df.dom.isParent(eTarget, this._eElem) && (eTarget.tagName === "INPUT" || eTarget.tagName === "SPAN")){
        this._sTick = sRowId;
    }
},

/* 
Augments the cellClickAfter and checks if the checkbox needs to be ticked (if this occurs shortly after 
cellClick). This needs to be done so that clicking checkboxes in rows that are not currently 
selected also works.
*/
cellClickAfter : function(oEv, sRowId, sColVal){
    df.WebColumnCheckbox.base.cellClickAfter.call(this, oEv, sRowId, sColVal);
    
    //  Tick the checkbox if it was just clicked
    if(this._sTick){
        
        //  We wait for the call to finish as this might called from the setter of psCurrentRowId and psValue might still get set afterwards (and we don't want that as it would revert the change)
        this.getWebApp().waitForCall(function(){
            this._bIgnoreOnChange = false;
            if(this._sTick === this._oParent.currentRowId()){
                this.tick();
                this._sTick = null;
            }
            this._bIgnoreOnChange = true;
        }, this);
    }
},

/*
This method determines the HTML that is displayed within a cell. It gets the value as a parameter 
and uses the column context properties (like masks) to generate the value to display. For default 
grid columns it simply displays the properly masked value.

@param  tCell   Data object reprecenting the cell data.
@return The HTML representing the display value.
*/
cellHtml : function(sRowId, tCell){
    var aHtml = [];
    
    aHtml.push('<div class="', this.genClass(), '"><div class="WebCon_Inner"><div><input type="checkbox"');

    if(tCell.sValue === this.psChecked){
        aHtml.push(' onclick="this.checked = true" checked="checked"');
    }else{
        aHtml.push(' onclick="this.checked = false"');
    }
    
    if(!this.isEnabled()){
        aHtml.push(' disabled="disabled"');
    }
    if(!(this._oParent instanceof df.WebGrid)){
        aHtml.push(' tabindex="-1"');
    }
    
    aHtml.push('><span class="WebCB_Fake"></span></div></div></div>');
    
    return aHtml.join('');
}

}); 