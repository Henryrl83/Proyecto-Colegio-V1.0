
/*
Class:
    df.WebBaseView
Extends:
    df.WebBaseContainer

This class contains the shared code between WebView and WebWindow.
    
Revision:
    2023/05/17  (HW, DAW)
        Initial version.
*/
df.WebBaseView = function WebBaseView(sName, oParent){
    df.WebBaseView.base.constructor.call(this, sName, oParent);

    //  Properties
    this.prop(df.tInt, "piMaxWidth", 0);
    this.prop(df.tInt, "piMinWidth", 0);
    this.prop(df.tInt, "piMinHeight", 0);

    this.prop(df.tString, "psCaption", "");
    this.prop(df.tBool, "pbShowCaption", true);
    this.prop(df.tBool, "pbFocusFirstOnShow", true);

    //  Events
    this.event("OnSubmit", df.cCallModeWait);
    this.event("OnShow", df.cCallModeWait);
    this.event("OnHide", df.cCallModeDefault); // Note that OnHide must be a default call because it is usually followed by an OnShow that should not be cancelled
    this.event("OnResizeWindow", df.cCallModeDefault);
    
    //  Set action modes
    this.setActionMode("HandleDeleteKey", df.cCallModeWait);
    this.setActionMode("HandleSaveKey", df.cCallModeWait);

    //  Privates
    this._oCurrentObj = null;               // The (last) object inside the view that currently had / has the focus
    this._eRenderTo = null;
    this._bRendered = false;

    //  Configure parents
    this.pbScroll = true;
}
df.defineClass("df.WebBaseView", "df.WebBaseContainer",{

show : function(){
    if(this._bStandalone){
        this._show();
    }else{
        this.getWebApp().showView(this._sName, false);
    }
},

hide : function(){
    if(this._bStandalone){
        this._hide(false);
    }else{
        this.getWebApp().hideView(this._sName);
    }
},

windowResize : function(iBrowserWidth, iBrowserHeight){
    if(this._bRendered){
        this.fire("OnResizeWindow", [ iBrowserWidth, iBrowserHeight ], function(){ 
            this.centerWindow();
        });
    }else{
        this._bFireOnResize = true;
    }
},

centerWindow : function(){

},

/*
This method is called by the panel layout system to set the width of this panel. If 0 is passed then 
the panel is allowed to take all space available so we don't need to set it on the DOM elements. We 
override this method here because the HTML structure is different and this might be a floating 
window instead of a panel (which means that we can ignore this call).

@param  iWidth  The new panel width.
*/
setOuterWidth : function(iWidth){

},


/* 
Determines the invoking view based on the psInvokingView web property. It makes sure that the object 
exists and is a valid view.

@return Reference to the invoking view object (null if not set / available).
*/
getInvoking : function(){
    var oWebApp;
    
    if(this.psInvokingView){
        oWebApp = this.getWebApp();
        
        if(oWebApp[this.psInvokingView] instanceof df.WebBaseView){
            return oWebApp[this.psInvokingView];
        }
    }
    return null;
},

/* 
Returns the focus to this view, to the last object that had the focus. This method is called by 
WebWindow when a modal window is closed and this is the invoking view.

@private
*/
returnFocus : function(){
    if(this._oCurrentObj){
        this._oCurrentObj.conditionalFocus();
    }else{
        this.conditionalFocus();
    }
},

/* 
Called by WebBaseUIObject whenever an object receives the focus. The view remembers this object so 
that returnFocus can return the focus to the right object.

@param  oObj    The object that now has the focus.
@private
*/
objFocus : function(oObj){
    this._oCurrentObj = oObj;
},

set_piHeight : function(iVal){
    this.piHeight = iVal;
    
    iVal = (iVal > this.piMinHeight ? iVal : this.piMinHeight);
    
    if(iVal > 0){
        if(this._eElem){    
            //this.setOuterHeight(iVal);
            this.setInnerHeight(iVal);
        }
    }
    this.sizeChanged();
},

set_psCaption : function(sVal){
    this.psCaption = sVal;
    
    this.updateCaption();
},

set_pbShowCaption : function(bVal){
    this.pbShowCaption = bVal;
    
    this.updateCaption();
},

/* 
Updates the caption based on the psCaption and pbShowCaptiona properties. The label element should 
only be there if pbShowCaption is true and psCaption is set.

@private
*/
updateCaption : function(){
    if(!this._eElem) return;

    this._eLbl.style.display = (this.pbShowCaption ? "" : "none");
    df.dom.setText(this._eLbl, this.psCaption);
},

/*
Fires the submit event to the server.

@return True if event handlers where active.
*/
fireSubmit : function(){
    // Trigger validate on the focussed object before triggering the key handler. Validate will
    // fire OnChange and autofind if nessecary. This prevents those events from triggering after a
    // view change that this key action could trigger.
    if(this.getWebApp()._oCurrentObj && this.getWebApp()._oCurrentObj.validate){ 
        this.getWebApp()._oCurrentObj.validate();
    }

    return this.fire('OnSubmit');
},

/*
This method handles the keypress event of the window. It will initiate actions that belong to the pressed key if needed.

@param  oEvent  The event object with event details.
@private
*/
onKey : function(oEvent){
    if(oEvent.matchKey(df.settings.formKeys.submit)){ 
        if(this.fireSubmit()){
            oEvent.stop();
        }
    }
},


});
