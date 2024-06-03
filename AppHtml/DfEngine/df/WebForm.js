/*
Class:
    df.WebForm
Extends:
    df.WebBaseForm

This is the client-side representation of the WebForm class. It generates the HTML for the input 
element and possibly a prompt button.
    
Revision:
    2011/08/01  (HW, DAW) 
        Initial version.
*/
/* global df */
df.WebForm = function WebForm(sName, oParent){
    df.WebForm.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbPromptButton", false);
    this.prop(df.tBool, "pbPassword", false);
    this.prop(df.tString, "psPlaceHolder", "");
    this.prop(df.tBool, "pbAutoTab", false);
    this.prop(df.tString, "psInputMode", "");

    //  Events
    this.event("OnPrompt", df.cCallModeWait);
        
       // @privates
    this._eWrap = null;
    this._ePrompt = null;
    this._bAutoTabOnUp = false;
    
    //  Configure super classes
    this._sControlClass = "WebForm";
    this._bJSSizing = false;
};
/*
This class is the implementation of the client-side part of the WebForm data entry object. It can 
render itself to HTML and implements the published properties from the server. It has special prompt 
button functionality.
*/
df.defineClass("df.WebForm", "df.WebBaseForm",{

/*
This method generates the HTML for input element. The input element has two wrappers for styling it 
and making space for the prompt button. The HTML for the prompt button is available by default and 
is made visible when needed.

@param  aHtml   String builder array to which HTML can be added.

@private
*/
openHtml : function(aHtml){
    df.WebForm.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebFrm_Wrapper"><span class="WebFrm_Prompt"></span><div class="WebFrm_PromptSpacer">', 
            '<input type="', (this.pbPassword ? 'password' : 'text'), '"',
            ' name="', this._sName, '"',
            ' value="" id="', this._sControlId, '"');
    
    if(this.psInputMode){
        aHtml.push(' inputmode="', this.psInputMode, '"');
    }
            
    aHtml.push((this.peLabelPosition != df.ciLabelFloat ? (' placeholder="' + df.dom.encodeAttr(this.psPlaceHolder) + '"') : ''),
            ' autocomplete="', df.dom.encodeAttr(this.psAutoComplete), '"', 
            (!this.isEnabled() ? ' disabled="disabled" tabindex="-1"' : ''),
            '>'); 
},

/*
This method generates the closing HTML closing the tags opened by the openHtml. This allows 
subclasses to insert HTML inside the WebFrm_PromptSpacer div.

@param  aHtml   String builder array to which HTML can be added.

@private
*/
closeHtml : function(aHtml){
    aHtml.push('</div></div>'); 
    
    df.WebForm.base.closeHtml.call(this, aHtml);
},

/*
This method is called after rendering and gets references, attaches event handlers and sets property 
values.

@private
*/
afterRender : function(){
    //  Get references
    this._eControl = df.dom.query(this._eElem, "div.WebFrm_Wrapper input");
    this._ePrompt = df.dom.query(this._eElem, "div.WebFrm_Wrapper span.WebFrm_Prompt");
    this._eWrap = df.dom.query(this._eElem, "div.WebFrm_Wrapper");
    
    df.WebForm.base.afterRender.call(this);
    
    //  Attach event handlers
    df.dom.on("click", this._ePrompt, this.onPromptClick, this);
    
    //  Set properties
    this.set_pbPromptButton(this.pbPromptButton);
},

/*
This setter switches the field between an input type=password and a input type=text field.

@param  bVal    The new value.
@private
*/
set_pbPassword : function(bVal){
    if(this._eControl){
        if(df.sys.isIE && df.sys.iVersion < 9){   // For IE8 and older we need to clone the DOM element before we can switch it
            var eNew = this._eControl.cloneNode(false);
            eNew.type = (bVal ? 'password' : 'text');
            this._eControl.parentNode.replaceChild(eNew,this._eControl);
            this._eControl = eNew;
        }else{  //  Modern browser support simply setting the type
            this._eControl.type = (bVal ? 'password' : 'text');
        }
    }
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
This setter hides / shows the prompt button. That is done by removing / setting setting the 
"WebFrm_HasPrompt" CSS class on the wrapper div element.

@param  bVal    The new value.
*/
set_pbPromptButton : function(bVal){
    if(this._eWrap && this._ePrompt){
        df.dom.toggleClass(this._eWrap, "WebFrm_HasPrompt", bVal);
    }
},

/* 
Sets the placeholder using the HTML5 placeholder attribute (only works on IE10 and higher).

@param  sVal    The new value.
*/
set_psPlaceHolder : function(sVal){
    if(this._eControl && this.peLabelPosition != df.ciLabelFloat){
        this._eControl.placeholder = sVal;
    }
},

/*
Sets the inputmode HTML5 attribute.

@param  sVal    The new value.
*/
set_psInputMode : function(sVal){
    if(this._eControl){
        this._eControl.inputMode = sVal;
    }
},

/*
This method handles the onclick event of the prompt button DOM element and fires the OnPrompt event.

@param  oEvent  The event object (see df.events.DOMEvent).
@private
*/
onPromptClick : function(oEvent){
    if(this.isEnabled()){
        //  Tell webapp object that we have the focus but do not give ourselve the actual focus (prevent Mobile Keyboard flashing)
        this.objFocus();
        
        if(this.firePrompt()){
            oEvent.stopPropagation();
        }else{
            //  If the prompt button doesn't do anything we still need to give ourself the real focus
            this.focus();
        }
    }
},

/*
We override this method because the form has an extra wrapper of which the Box Difference needs to 
be taken into account.

@private
*/
getVertHeightDiff : function(){
    var iResult = df.WebForm.base.getVertHeightDiff.call(this);
    iResult += df.sys.gui.getVertBoxDiff(this._eWrap);
    return iResult;
},



/*
This method augments the onKey event handler to add support for the prompt key. 

@param  oEvent  Event object.
*/
onKey : function(oEvent){
    df.WebForm.base.onKey.call(this, oEvent);

    if(oEvent.matchKey(df.settings.formKeys.prompt)){ 
        if(this.firePrompt()){      // F4:  lookup
            oEvent.stop();
        }
    }
},

/*
Fires the OnPrompt event.

@return True if handled.
@private
*/
firePrompt : function(){
    if(this.pbPromptButton){
        return this.fire("OnPrompt");
    }
},

/*
Override the focus function to add text selection.

@param  bOptSelect   If true the text will be selected.
*/
focus : function(bOptSelect){
    if(this._bFocusAble && this.isEnabled() && this._eControl && this._eControl.focus){
        try{ // FIX: Catch errors that occur in Internet Explorer 8
            this._eControl.focus();
            
            //  Select the text when bOptSelect is true
            if(bOptSelect){
                this._eControl.select();
            }
        }catch(oErr){
        
        }
        
        this.objFocus();
        
        return true;
    }
    
    return false;
},

/*
Augments the onFocus event with functionality that remembers the caret position determined by the 
browser and sets it again if it has changed during the event (which might happen on masked fields).

@param  oEvent  The event object.
@private
*/
onFocus : function(oEvent){
    var iCarPos, iNewCarPos, iRight, iSelection, bSelectAll;
    
    //  Determine initial values
    iCarPos = df.dom.getCaretPosition(this._eControl);
    iRight = this._eControl.value.length - iCarPos;
    
    iSelection = df.dom.getSelectionLength(this._eControl);
    bSelectAll = iSelection >= this._eControl.value.length; 
    
    //  Perform onFocus
    df.WebForm.base.onFocus.call(this, oEvent);
    
    //  Determine new situation
    iNewCarPos = df.dom.getCaretPosition(this._eControl);
    
    if(iCarPos !== iNewCarPos){    
        //  For numeric fields we count from the right
        if(this.peDataType === df.ciTypeBCD){
            iCarPos = this._eControl.value.length - iRight;
        }
        
        // Update if changed
        df.dom.setCaretPosition(this._eControl, iCarPos);
        
    }
    
    //  Reselect if all text was selected
    if(bSelectAll){
        this._eControl.select();
    }
},

/*
Performs the autotab (focusNext) if the following conditions are met:
- Value length reached maximum field length determined by maxLength()
- There is no activate text selection
- The cursor is at the end of the field

@return True if the autotab is performed.
@private
*/
autoTab : function(){
    var iMax = this.maxLength();
    if (this._eControl.value.length == iMax){
        var oSel = df.dom.getSelection(this._eControl);
        if(oSel.length == 0 && oSel.start == iMax){
            this.focusNext(true);
            return true;
        }
    }
    return false;
},

/*
Handles the keypress event if pbAutoTab is true. Keypress should only trigger if the value changes 
by the key event, but the value didn't update yet, so it sets _bAutoTabOnUp to true so that KeyUp 
knows it should autotab.

@param  oEv     Event object.
@private
*/
onKeyPressAutoTab : function(oEv){
    this._bAutoTabOnUp = !this.autoTab();
},

/*
Handles the keyup event if pbAutoTab is true. If keypress ahs occurred and the value has reached 
maxlength we perform the autotab (focusNext).

@param  oEv     Event object.
@private
*/
onKeyUpAutoTab : function(oEv){
    if (this._bAutoTabOnUp){
        this.autoTab();
        this._bAutoTabOnUp = false;
    }

},

/*
Determines the maximum lenght of a form value based on peDataType, regional settings and optionaly psMask.
Used by pbAutoTab logic.

@return Number of characters that can be entered.
*/
maxLength : function(){
    if(this.peDataType === df.ciTypeBCD){   //  Plain number
        return this.piMaxLength + (this.piPrecision ? this.decSep().length : 0);
    }else if(this.peDataType === df.ciTypeDate){   //  Plain date
        return df.sys.data.dateToString(new Date(2020, 10, 10, 10, 10, 10, 10), this.dateFormat(), this.dateSep(), this.timeSep()).length;
    }else if(this.peDataType === df.ciTypeDateTime){   //  Plain date time
        return df.sys.data.dateToString(new Date(2020, 10, 10, 10, 10, 10, 10), this.dateTimeFormat(), this.dateSep(), this.timeSep()).length;
    }else if(this.peDataType === df.ciTypeTime){   //  Plain time
        return df.sys.data.dateToString(new Date(2020, 10, 10, 10, 10, 10, 10), this.timeFormat(), this.dateSep(), this.timeSep()).length;
    }else{
        return (this.psMask ? this.psMask.length : this.piMaxLength);
    }
},

/*
Augment initMask to attach autotab key listeners (in the right order).

@private
*/
initMask : function(){
    if(this._eControl){
       df.dom.off("keypress", this._eControl, this.onKeyPressAutoTab, this);
        df.dom.off("keyup", this._eControl, this.onKeyUpAutoTab, this);
    }

    df.WebForm.base.initMask.call(this);

    if(this._eControl && this.pbAutoTab){
        df.dom.on("keypress", this._eControl, this.onKeyPressAutoTab, this);
        df.dom.on("keyup", this._eControl, this.onKeyUpAutoTab, this);
    }
},

/*
Setter for pbAutoTab. It triggers the initMask which will add / remove key handlers.

@param  bVal    New value.
*/
set_pbAutoTab : function(bVal){
    if(this._eControl){
        this.pbAutoTab = bVal;
        this.initMask();
    }
}

});