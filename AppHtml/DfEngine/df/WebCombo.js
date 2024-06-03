/*
Class:
    df.WebCombo
Extends:
    df.WebBaseDEO

This is the client-side representation of the WebCombo class. It displays a combo form data entry 
object. The CSS (class: WebCombo) defines the looks. The combo form is wrapped in an extra wrapper 
div that allows a custom border to be added.
    
Revision:
    2011/10/06  (HW, DAW) 
        Initial version.
*/

df.tWebComboItem = {
    sValue : df.tString,
    sDescription : df.tString
};


df.WebCombo = function WebCombo(sName, oParent){
    df.WebCombo.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "peSortItems" , df.csUnsorted);
    
    // @privates
    this._bFilled = false;
    this._sControlClass = "WebCombo";
    this._aValues = null;
    
    this._bDeferedSet = false;  //  Set to true if the value is set to an item unavailable in the list indicating that OnFill should try to select the orrigional psValue. This fixes the issue where WebSet psValue overtakes a Refill.
};
/*
Use this class to display a combo form on a view. 
*/
df.defineClass("df.WebCombo", "df.WebBaseDEO", {

/*
This method generates the html for the combo and the wrapper div.

@param  aHtml   Stringbuilder array to which the HTML can be added.
@private
*/
openHtml : function(aHtml){
    df.WebCombo.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebFrm_Wrapper"><select name="', this._sName, '" id="', this._sControlId, '"', (!this.isEnabled() ? ' disabled="disabled" tabindex="-1"' : ''), '></select></div>');
},

/*
This method gathers references to the HTML elements.

@private
*/
afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "div.WebFrm_Wrapper > select");
    this._eWrap = df.dom.query(this._eElem, "div.WebFrm_Wrapper");

    df.WebCombo.base.afterRender.call(this);
    
    df.dom.on("click", this._eControl, this.onClick, this);
    
    this.updateList(this.psValue);
},

/* 
Generates a deserializer function that deserializes a value tree in an array of combo items with 
optimal performance.

@param  tVT     Value tree with data.
@return Array of combo item objects.
*/
deserializeVT : df.sys.vt.generateDeserializer([ df.tWebComboItem ]),

/*
This method fills the list of items with the items received as action data. It has to decode the 
action data from the array of rows with values into value & description objects. Then it will update 
the rendered list with this new data.

@client-action
*/
fill : function(){
    var tVT = this._tActionData;
    
    //  Update the values list
    this._aValues = this.deserializeVT(tVT);
    
    this.sortList();
    this.updateList(this._sPrevChangeVal);  //  We use _sPrevChangeVal because it is updated by OnChange and set_psValue, so it always has the right value
},

/* 
Sorts the list of combo items based on the peSortItems property which determines if the sorting is 
performed on the value or on the description. If sorting on the value the peDataType is used to 
determine the right comparison mode.

@private
*/
sortList : function(){
    var fCompare;
    
    if(this.peSortItems === df.csValue){
        //  Sort on value, use the proper comparison function based on the data type
        fCompare = df.sys.data.compareFunction(this.peDataType);
        this._aValues.sort(function(a, b){
            return fCompare(a.sValue, b.sValue);
        });
    }else if(this.peSortItems === df.csDescription){
        //  Sort on the description
        this._aValues.sort(function(a, b){
            return df.sys.data.compareText(a.sDescription, b.sDescription);
        });
    }
},

/*
This method refills the list according to the this._aValues array of items.

@private
*/
updateList : function(sValue){
    var eOpt, i, aValues = this._aValues;

    if(this._eControl && aValues){
        //df.debug(this._sName + " updateList with " + aValues.length + " items!");
        
        
        //  Clear the list
        while(this._eControl.options.length > 0){
            this._eControl.remove(0);
        }
        
        //  Fill the list
        for(i = 0; i < aValues.length; i++){
            eOpt = new Option(aValues[i].sDescription, aValues[i].sValue);
            this._eControl.options[this._eControl.options.length] = eOpt; //.add(eOpt);
            
            //  Set as selected if needed
            if(aValues[i].sValue === sValue){
                eOpt.selected = true;
            }
        }
        
        //  Remember that we filled
        this._bFilled = true;
    }
},

/*
This method overrides the getter of the psValue property and makes sure that the control value is 
not used when the combo doesn't have its items yet.

@private
*/
getControlValue : function(){
    if(this._eControl && this._bFilled){
        return this._eControl.value;
    }
    
    return this.psValue;
},

/* 
Overrides the setControlValue of WebBaseDEO and updates the _bDeferedSet indicator if we could not 
set the value (it was not in the list) indicating that a refill should update to the psValue.

@param  sVal    New value to display.
@private
*/
setControlValue : function(sVal){
    if(this._eControl && this._bFilled){
        this._eControl.value = sVal;
        
        this._bDeferedSet = this._eControl.value !== sVal;
    }else{
        this._bDeferedSet = true;
    }
},

/* 
Augment the fireChange to set the _bDeferedSet indicator back to false as the value is now change 
by the user.

@private
*/
fireChange : function(){
    this._bDeferedSet = false;
    
    df.WebCombo.base.fireChange.call(this);
},

/*
Override the default pbCapslock functionallity which sets the CSS text transform. We don't want that 
for the combo.
*/
set_pbCapslock : function(bVal){

},

/*
This setter sets the background color of the field. The background color is applied to the wrapper 
div element.

@param  sVal    The bew value.
@private
*/
set_psBackgroundColor : function(sVal){
    if(this._eWrap){
        this._eWrap.style.background = sVal || '';
    }
},

/*
Event handler for the click event that triggers the check for the onchange event.

@param  oEvent  Event details object.
@private
*/    
onClick : function(oEvent){
    this.fireChange();
},

/*
Augments the event handler for the keypress event and triggers the check for the onchange event.

@param  oEvent  Event details object.
@private
*/    
onKey : function(oEvent){
    var that = this;

    df.WebCombo.base.onKey.call(this, oEvent);
    
    //  TODO: Find a cleaner way to trigger onChange..
    setTimeout(function(){
        that.fireChange();
    }, 10);
}

});