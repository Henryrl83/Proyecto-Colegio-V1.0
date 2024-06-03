/*
Class:
    df.WebBaseForm
Extends:
    df.WebBaseDEO

Base class for text input data entry objects like WebForm and WebEdit. It implements the pbReadOnly 
property.
    
Revision:
    2011/08/26  (HW, DAW) 
        Initial version.
    2020/06/08  (HR, DAE) 
        Added floating labels
*/
/* global df */
df.WebBaseForm = function WebBaseForm(sName, oParent){
    df.WebBaseForm.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbReadOnly", false);
    this.prop(df.tString, "psAutoComplete", "off");

    this.event("OnKey", df.cCallModeDefault);
    this.event("OnInput", df.cCallModeDefault);
};
df.defineClass("df.WebBaseForm", "df.WebBaseDEO",{

/* 
Augment the afterRender to execute setters.

@private
*/
afterRender : function(){
    df.WebBaseForm.base.afterRender.apply(this, arguments);
    
    this.set_pbReadOnly(this.pbReadOnly);

    df.dom.on("keydown", this._eControl, this.onKeyDownSrv, this);
    df.dom.on("input", this._eControl, this.onInputSrv, this);

    if(this._eLbl && this.peLabelPosition === df.ciLabelFloat) {
        this.floatLabel(false);
        df.dom.on("click", this._eLbl, this.onFocus, this);

        this.checkAutoFill();
    } 
},

/*
Augment to set the maxlength html attribute limiting the amount of characters that can be entered.

@private
*/
initMask : function(){
    df.WebBaseForm.base.initMask.call(this);

    if(this._eControl){
        if(this.peDataType === df.ciTypeText && !this.psMask){
            this._eControl.maxLength = (this.piMaxLength > 0 ? this.piMaxLength : 0);
        }else{
            this._eControl.maxLength = 1048576;
        }
    }
},

/* 
Implementation of the pbReadOnly property which maps to the DOM readOnly property and sets / removes
the Web_ReadOnly property.

@param  bVal    New value.
*/
set_pbReadOnly : function(bVal){
    if(this._eControl){
        this._eControl.readOnly = bVal;
        
        df.dom.toggleClass(this._eElem, "Web_ReadOnly", bVal);
    }
},

/*
Setter for piMaxLength that sets the maximum field length to the input control.

@param  iVal    New value.
*/
set_piMaxLength : function(iVal){
    this.piMaxLength = iVal;
    this.initMask();
},

/*
Setter for psAutoComplete that directly updates the DOM attribute.

@param  sVal    New value.
*/
set_psAutoComplete : function(sVal){
    if(this._eControl){
        this._eControl.autocomplete = sVal;
    }
},

/* Setter for peLabelPosition that triggers a float / unfloat and adds / removes handlers if needed

@param  iVal    New value.
*/
set_peLabelPosition : function(iVal) {
    this.peLabelPosition = iVal;

    this.posLabel(false);
    
    if (this._eLbl) {
        // Always remove handler first
        df.dom.off("click", this._eLbl, this.onFocus, this);

        if (iVal === df.ciLabelFloat) {
            df.dom.on("click", this._eLbl, this.onFocus, this);
            this.floatLabel(false);
        }
    }
},

/*
Transform the KeyDown into the server OnKey event.

@param  oEv     Event object.
@private
*/
onKeyDownSrv : function(oEv){
    this.fire("OnKey", [ df.fromBool(oEv.isKeyPrintable()), oEv.key() ]);
},

/*
Transform the Input into the server OnInput event.

@param  oEv     Event object.
@private
*/
onInputSrv : function(oEv){
    this.fire("OnInput", [ oEv.inputIsInsert(), oEv.e.inputType || "Undefined" ]);
},

updateFocus : function(bFocus){
    df.WebBaseForm.base.updateFocus.call(this, bFocus);

    if(this.peLabelPosition === df.ciLabelFloat) {
        this.floatLabel(bFocus);
    }
},

floatLabel : function(bFocus) {
    if (this.getControlValue() != '' || (bFocus & this.isEnabled()) || this.matchSelector(this._eControl, ":-webkit-autofill")) {
        if (this._eLbl != null) {
            df.dom.addClass(this._eLbl, "WebCon_Float");
            df.dom.removeClass(this._eLbl, "WebCon_Unfloat");
        }
    }
    else {
        if (this._eLbl != null) {
            df.dom.addClass(this._eLbl, "WebCon_Unfloat");
            df.dom.removeClass(this._eLbl, "WebCon_Float");
        }
    }
},

setControlValue : function(sVal){
    df.WebBaseForm.base.setControlValue.call(this, sVal);

    if (this._eControl) {
        if (this.peLabelPosition === df.ciLabelFloat) {
            this.floatLabel(this._bHasFocus);
        } 
    }
},

checkAutoFill : function() {
    var that = this, iTries = 20;

    function doCheckAutoFill(){
        iTries--;
        if (that._eControl && that.matchSelector(that._eControl, ":-webkit-autofill")) {
            that.floatLabel(false);
        }else if(iTries > 0){
            setTimeout(doCheckAutoFill, 100);
        }
    }
    
    doCheckAutoFill();
},

matchSelector : function(el, selector) {
    // For now, we can only really check this in Chrome, while waiting for an actual OnAutoComplete event across browsers...
    if (df.sys.isChrome) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
    }

    return false;
}



});