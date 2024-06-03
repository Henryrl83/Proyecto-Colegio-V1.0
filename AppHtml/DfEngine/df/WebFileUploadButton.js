/*
Class:
    df.WebFileUploadButton
Extends:
    df.WebBaseFileUpload

This class renders a button that can be used to upload one or multiple files. It inherits the file 
upload logic from WebBaseFileUpload.
    
Revision:
    2013/09/10  (HW, DAW)
        Initial version.
*/

df.WebFileUploadButton = function WebFileUploadButton(sName, oParent){
    df.WebFileUploadButton.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCaption", "Select file(s)");
    this.prop(df.tInt, "peAlign", -1);
    
    this._sControlClass = "WebButton WebUploadBtn";
};
df.defineClass("df.WebFileUploadButton", "df.WebBaseFileUpload",{

openHtml : function(aHtml){
    df.WebFileUploadButton.base.openHtml.call(this, aHtml);
    
    aHtml.push('<button id="', this._sControlId, '"', (!this.isEnabled() ? ' disabled="disabled"' : ''));
    if(this.peAlign >= 0){
        aHtml.push(' style="text-align: ', df.sys.gui.cssTextAlign(this.peAlign), '"');
    }
    aHtml.push('>', df.dom.encodeHtml(this.psCaption), '</button>'); 

    this.fileHtml(aHtml);
},

afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "button");
    
    df.WebFileUploadButton.base.afterRender.call(this);
    
    df.dom.on("click", this._eControl, this.onBtnClick, this);
},

/*
Event handler for the OnClick event of the button. It fires the OnClick event of the framework which 
is usually handled on the server.

@param  oEvent  Event object (df.events.DOMEvent).
@private
*/
onBtnClick : function(oEvent){
    var tTimer = null, eElem = this._eElem;

    if(this.isEnabled()){
        df.dom.addClass(eElem, df.CssHit);
        tTimer = setTimeout(function(){
            df.dom.removeClass(eElem, df.CssHit);
            tTimer = null;
        }, df.hitTimeout);
        
        this.selectFiles();
    }
},


/*
Setter method for psCaption which is the text shown on the button.

@param  sVal    The new value.
*/
set_psCaption : function(sVal){
    if(this._eControl){
        df.dom.setText(this._eControl, sVal);
    }
},

/*
Setter for the peAlign property which updates the textAlign style.

@param  eVal    The new value.
*/
set_peAlign : function(eVal){
    if(this._eControl){
        this._eControl.style.textAlign = df.sys.gui.cssTextAlign(eVal);
    }
},

/*
Augments the applyEnabled method and disables the button by setting the disabled attribute of the 
button HTML element.

@param  bVal    The new value.
*/
applyEnabled : function(bVal){
    df.WebFileUploadButton.base.applyEnabled.call(this, bVal);
    
    if(this._eControl){
        this._eControl.disabled = !bVal;
    }
}

});