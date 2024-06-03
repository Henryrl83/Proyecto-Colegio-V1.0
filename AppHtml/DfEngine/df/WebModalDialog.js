/*
Class:
    df.WebModalDialog
Extends:
    df.WebWindow

The modal dialog is basically a floating view that is modal. It is rendered as a window. The logic 
for making it floating and modal is in the WebWindow class so we keep the possibility to support MDI 
at some point in the future. Special functionality for the 'invoking view' is available in the class 
which is needed for the chained scope system.

Revision:
    2011/09/01  (HW, DAW) 
        Initial version.
*/

df.WebModalDialog = function WebModalDialog(sName, oParent){
    df.WebModalDialog.base.constructor.call(this, sName, oParent);
    
    this.event("OnEscape", df.cCallModeWait);
    
    this.pbFloating = true;
    this.pbModal = true;
    this.pbScroll = false;
};
df.defineClass("df.WebModalDialog", "df.WebWindow",{

/*
This method will fire the OnEscape event. If this event is not handled it will close the dialog if 
pbShowClose is true.
*/
doClose : function(){
    if(!this.fire('OnEscape')){
        df.WebModalDialog.base.doClose.call(this);
    }
},

/*
Returns the 'top layer' element. This is the insertion point for controls like floating panels. 
Usually this will return document.body, but for modal dialogs this is the dialog element, else 
the floating panel would show behind the the dialog.
*/
topLayer : function(){
    return this._eElem;
}

});