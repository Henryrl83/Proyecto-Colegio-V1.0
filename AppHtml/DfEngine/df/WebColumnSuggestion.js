/*
Class:
    df.WebColumnSuggestion
Mixin:
    df.WebColumn_mixin (df.WebColumnSuggestionBase)
Extends:
    df.WebForm

This is the client-side representation of the cWebColumnSuggestion control.

Revision:
    2013/12/11  (HW, DAW) 
        Initial version.
*/

//  Generate new base class using df.WebColumn_mixin and df.WebDateForm
df.WebColumnSuggestionBase = df.mixin("df.WebColumn_mixin", "df.WebSuggestionForm");


df.WebColumnSuggestion = function WebColumnSuggestion(sName, oParent){
    df.WebColumnSuggestion.base.constructor.call(this, sName, oParent);
    
    //  Configure super class
    this._sCellClass = "WebCol";
};
df.defineClass("df.WebColumnSuggestion", "df.WebColumnSuggestionBase",{

/*
Augments the key handler and implements key up and key down before the weblist gets a chance to 
handle them.

@param  oEvent  Event object (see df.events.DOMEvent).
@private
*/
onKey : function(oEvent){
    var oKeys = df.settings.suggestionKeys;
    
    
    
    
    if(this._bSuggestVisible){
        if(oEvent.matchKey(oKeys.moveUp)){
            this.suggestMove(-1);
            oEvent.stop();
            return;
        }
        if(oEvent.matchKey(oKeys.moveDown)){
            this.suggestMove(1);
            oEvent.stop();
            return;
        }
    }
    
    df.WebColumnSuggestion.base.onKey.call(this, oEvent);
    
}

});