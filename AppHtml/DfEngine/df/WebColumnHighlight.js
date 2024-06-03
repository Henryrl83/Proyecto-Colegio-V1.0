/* 
Class:
    df.WebColumnHighlight
Extends:
    df.WebColumnBase

Special column class that is able to highlight search phrases. It does this by altering cell values 
with a <span class="WebHighlight">..</span> wrapping each keyword. This allows the CSS to highlight 
the keyword.

Revision:
    2016/05/25  (HW, DAE)
*/

df.WebColumnHighlight = function WebColumnHighlight(sName, oParent){
    df.WebColumnHighlight.base.constructor.apply(this, arguments);
    
    this.prop(df.tString, "psHighlightCSSClass", "WebHighlight");

    this.prop(df.tString, "psHighlight", "");
    this.prop(df.tBool, "pbFullText", true);
    this.prop(df.tBool, "pbSeparateWords", true);
    this.prop(df.tBool, "pbCaseSensitive", false);
    
    this._oRegEx = null;
};
df.defineClass("df.WebColumnHighlight", "df.WebColumnBase",{

/* 
Augments the cellHtml function with support for the pbPassword property.

@param  tCell   Struct with cell data.
@return HTML content of the cell &bull;&bull; for passwords.
*/
cellHtml : function(sRowId, tCell){
    var tVal, oRegEx, sVal, sCssClass = this.psHighlightCSSClass;
    
    tVal = df.sys.data.serverToType(tCell.sValue, this.peDataType);
    sVal = this.typeToDisplay(tVal);
    
    if(!this.pbAllowHtml){
        sVal = df.dom.encodeHtml(sVal);
    }
    
    if(this.psHighlight){
        oRegEx = this.getRegEx();
        
        sVal = sVal.replace(oRegEx, function(match){
            return '<span class="' + sCssClass + '">' + match + '</span>';
        });
    }
    
    return (sVal !== '' ? sVal : '&nbsp;');
},

set_psHighlight : function(sVal){
    if(this.psHighlight !== sVal){
        this.psHighlight = sVal;
        this._oRegEx = null;
        //  this._oParent.redraw(); // We are not doing a list redraw because it causes a duplicate redraw in most cases. It does mean that to apply a new highlight you have to refresh the list yourself.
    }
},

set_psHighlightCSSClass : function(sVal){
    this.psHighlightCSSClass = sVal;
    
    this._oParent.redraw();  
},

set_pbFullText : function(bVal){
    this.pbFullText = bVal;
    this._oRegEx = null;
    this._oParent.redraw();
},

set_pbSeparateWords : function(bVal){
    this.pbSeparateWords = bVal;
    this._oRegEx = null;
    this._oParent.redraw();
},

set_pbCaseSensitive : function(bVal){
    this.pbCaseSensitive = bVal;
    this._oRegEx = null;
    this._oParent.redraw();
},

getRegEx : function(){
    var aHighlights, sRegex, i, sMod;
    
    if(!this._oRegEx){
        if(this.pbSeparateWords){
            aHighlights = this.psHighlight.split(" ");
        }else{
            aHighlights = [ this.psHighlight ];
        }
        
        for(i = 0; i < aHighlights.length; i++){
            aHighlights[i] = df.sys.data.escapeRegExp(aHighlights[i]);
        }
        sRegex = "(" + aHighlights.join("|") + ")";
        
        if(!this.pbFullText){
            sRegex = "^" + sRegex;
        }
        
        sMod = "g";
        if(!this.pbCaseSensitive){
            sMod += "i";
        }
        
        this._oRegEx = new RegExp(sRegex, sMod);
    }
    
    return this._oRegEx;
}

});