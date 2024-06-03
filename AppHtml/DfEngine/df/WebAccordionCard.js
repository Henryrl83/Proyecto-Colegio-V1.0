/* 
Class:
    df.WebAccordionCard
Extends:
    df.WebCard

Accordion control that based on card container technology. It supports multiple modes with 
pbMultiOpen, pbAutoHeight and pbOpenFirst. The df.WebAccordionCard implements the card interface.

Revision:
    2016/10/06  (HW, DAW)
        Refactored into df.WebAccordionContainer.
    2016/06/27  (HW, DAW)
        Migrated to DataFlex 18.2 with support for the deferred card rendering and isEnabled.
    2015/09/29  (HW, DAW)
        Initial version.
*/
df.WebAccordionCard = function(sName, oPrnt){
    df.WebAccordionCard.base.constructor.apply(this, arguments);
    
    this.prop(df.tBool, "pbExpanded", false);
    this.prop(df.tString, "psBtnBackgroundColor", "");
    
    this._bExpanded = false;
    
    this.addSync("pbExpanded");
    
    //  Configure super classes
    this._sControlClass = "WebAcCard";
    this._sBaseClass = "";
    this._bCC = false;   //  Used by the designer to filter cardcontainers from tab / accordion containers
};
df.defineClass("df.WebAccordionCard", "df.WebCard", {

/* 
Empty stub allowing sub classes to slip in HTML.

@private
*/
wrpOpenHtml : function(aHtml){
    aHtml.push('<div class="WebContainer">');
},

/* 
Empty stub allowing sub classes to slip in HTML.

@private
*/
wrpCloseHtml : function(aHtml){
    aHtml.push('</div>');
},

afterRender : function(){
    df.WebAccordionCard.base.afterRender.call(this);

    if(this._bPanels){
        df.dom.on("transitionend", this._eMainArea, this.onTransEndCancel, this);
    }else{
        df.dom.on("transitionend", this._eContent, this.onTransEndCancel, this);
    }
    
    if(this.psBtnBackgroundColor){
        this.set_psBtnBackgroundColor(this.psBtnBackgroundColor);
    }
},

show : function(){
    if(!this._bExpanded){
        df.WebAccordionCard.base.show.call(this);
    }
},

hide : function(){
    if(this._bExpanded && this._oParent.pbMultiOpen){
        this._bExpanded = false;
        this._hide();
        this.afterHide();
    }
},

/*
This event handler handles the click event of the tab button. 

@param  
*/
onBtnClick : function(oEvent){
    if(this.isEnabled()){
        if(!this._bExpanded){
            this.show();
        }else if(this._oParent.pbMultiOpen){
            this.hide();
        }
    }
    oEvent.stop();
},

/*
This method is called by the WebTabPanel to hide this tab page. Note that switching a tab always 
causes this method to be called regardless whether it was already hidden.

@param  bFirst  True if this method is called during initialization.
@private
*/
_hide : function(bFirst){
    if(this._eElem){
        this._eElem.style.visibility = "hidden";
        df.dom.addClass(this._eElem, "WebAcCard_Hidden");
        df.dom.removeClass(this._eElem, "WebAcCard_Visible");
        df.dom.removeClass(this._eBtn, "WebTab_Current");
        this._eElem.style.height = "0px";
    }
    
    if(!bFirst && this._bCurrent){
        this.fire('OnHide');
    }
    
    this._bCurrent = false;
},

/*
This method is called by the WebTabPanel to show this tab page.

@param  bFirst  True if this method is called during initialization.
@private
*/
_show : function(bFirst){
    if(!this._eElem && this._oParent._eElem){
        //  We render the card if it wasn't rendered yet
        var eElem = this.render();
        if(!this._eBtn){
            throw new df.Error(999, "Assertion: Accordion card should have a button element!");
        }else{
            if(this._eBtn.nextSibling){
                this._eBtn.parentNode.insertBefore(eElem, this._eBtn.nextSibling);
            }else{
                this._eBtn.parentNode.appendChild(eElem);
            }
        }
        
        this.afterRender();
        
        /* this.resizeHorizontal();
        this.resizeVertical(); */
        this._oParent.resize();
    }
    
    if(this._eElem){
        this._eElem.style.visibility = "inherit";
        df.dom.addClass(this._eElem, "WebAcCard_Visible");
        df.dom.removeClass(this._eElem, "WebAcCard_Hidden");
        df.dom.addClass(this._eBtn, "WebTab_Current");
        this._eElem.style.height = this._oParent.getCardHeight(this) + "px";
    }
    
    if(!bFirst && !this._bCurrent){
        this.fire('OnShow');
    }
    this._bCurrent = true;
},

get_pbExpanded : function(){
    return this._bExpanded;
},

set_pbExpanded : function(bVal){
    if(this._Elem && bVal !== this._bExpanded){
        this.show();
    }
},

set_psBtnBackgroundColor : function(sVal){
    if(this._eBtn){
        this._eBtn.style.background = sVal || '';
    }
},

/* 
Handles the transitionend of the content div and stops propagation. We don't want every transition 
of anything inside the container to trigger a resize. Only at the end of its own transition.

@param  oEv     DOM Event object.
@private
*/
onTransEndCancel : function(oEv){
    oEv.stopPropagation();
}
    
});