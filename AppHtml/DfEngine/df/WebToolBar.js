/*
Class:
    df.WebToolBar
Extends:
    df.WebMenuBar

The WebToolBar is a control that renders a toolbar inside a commandbar. Regular menu items can be 
used within the toolbar that have an icon and / or a caption.
    
Revision:
    2011/09/27  (HW, DAW) 
        Initial version.
    2015/01/20  (HW, DAW)
        Refactored for new style menu system. The rendering logic moved from the WebMenuItem class 
        to the menu classes itself. The WebToolBar now extends the WebMenuBar inheriting its 
        rendering logic. This also means that the WebToolbar now can be positioned as a control.New 
        is support for overflowing into a sub menu.
*/

df.WebToolBar = function WebToolBar(sName, oParent){
    df.WebToolBar.base.constructor.apply(this, arguments);
    
    this.prop(df.tBool, "pbShowCaption", false);
    this.prop(df.tInt, "peAlign", df.ciAlignLeft);
    this.prop(df.tBool, "pbShowIcons", true);
    this.prop(df.tString, "psSubItemCaption", "More..");
    
    // @privates
    this._eControl = null;
    
    this._bWrapDiv = true;
    this._sControlClass = "WebToolBar";
};
df.defineClass("df.WebToolBar", "df.WebMenuBar",{

openHtml : function(aHtml){
    df.WebToolBar.base.openHtml.call(this, aHtml);
},

closeHtml : function(aHtml){
    df.WebToolBar.base.closeHtml.call(this, aHtml);
},



afterRender : function(){
    this._eControl = df.dom.query(this._eElem, "ul");
    
    df.WebToolBar.base.afterRender.call(this);
    
    this.set_pbShowCaption(this.pbShowCaption);
    this.set_pbShowIcons(this.pbShowIcons);
    this.set_peAlign(this.peAlign);
},


refreshMenu : function(){
    df.WebToolBar.base.refreshMenu.apply(this, arguments);
    
    this.adjustWidth();
},

genMenuHtml : function(aHtml){
    df.WebToolBar.base.genMenuHtml.call(this, aHtml);
    
    aHtml.push('<li data-df-item="subitems" class="WebMenuItem WebTlb_SubItems WebTlb_NoFit" style="display: none;"><div><span class="WebItm_Icon">&nbsp;</span><a href="javascript: void(0);" target="_self">', this.psSubItemCaption, '</a></div><ul></ul></li>');
},

onMenuClick : function(oEvent){
    var eElem;
    
    df.WebToolBar.base.onMenuClick.call(this, oEvent);
    
    if(!oEvent.bCanceled){
        eElem = oEvent.getTarget();
        while(eElem && eElem !== this._eElem){
            if(eElem.hasAttribute("data-df-item")){
                //  (HW) FIX FireFox: In case of the action menu menu button the focus goes to the wrong place for FF, force it to go the control element. 
                this._eControl.focus();
                
                
                if(this._bSubMenuOpened){
                    this.collapseAll();
                }else{
                    this.expandSub();
                }
                
                oEvent.stop();
                return;
                
            }
            
            eElem = eElem.parentNode;
        }
    }
},

expandSub : function(){
    var eSubBtn, eSubMen, oRect, iLeft, iViewport;
    
    eSubBtn = df.dom.query(this._eControl, "li.WebTlb_NoFit");
    eSubMen = eSubBtn.lastChild;
    
    
    if(eSubMen){
        //  Display submenu
        df.dom.addClass(eSubBtn, "WebItm_Expanded");
        this._bSubMenuOpened = true;
        
        
        //  Position sub menu
        oRect = eSubBtn.getBoundingClientRect();
        iLeft = oRect.left;
        iViewport = df.sys.gui.getViewportWidth();
        
        
        if(iLeft + eSubMen.offsetWidth > iViewport){
            iLeft = oRect.right - eSubMen.offsetWidth;
            
            if(iLeft < 0){
                iLeft = 5;
            }
        }
        
        
        eSubMen.style.top = oRect.bottom + "px";
        eSubMen.style.left = iLeft + "px";
    
        
        
    }
},

collapseAll : function(){
    var eSubBtn;
    
    if(this._bSubMenuOpened){
        eSubBtn = df.dom.query(this._eControl, "li.WebTlb_NoFit");
        df.dom.addClass(eSubBtn, "WebItm_Expanded");
        this._bSubMenuOpened = false;
    }
    
    df.WebToolBar.base.collapseAll.apply(this, arguments);
},

adjustWidth : function(){
    var iSpace, aItems, eItem, i, eSubMen, eSubBtn;
    
    if(this._eControl){
        iSpace = this._eControlWrp.clientWidth;
        eSubBtn = df.dom.query(this._eControl, "li.WebTlb_NoFit");
        
        if(this._eControl.scrollWidth > iSpace){
            aItems = df.dom.query(this._eElem, "ul.WebBarRoot > li.WebMenuItem", true);

            if(aItems.length > 1){
                eSubMen = df.dom.query(this._eControl, "li.WebTlb_NoFit > ul");
            
                eSubBtn.style.display = "";
                
                i = aItems.length - 2;
                while(this._eControl.scrollWidth > iSpace && i >= 0){
                    eItem = aItems[i];
                    eSubMen.appendChild(eItem);
                    i--;
             
                }
            }
        }else{
            eSubBtn.style.display = "none";
        }
    }
},

resize : function(){
    var iSpace = this._eControlWrp.clientWidth;
    
    if(this._iLastResizeSpace !== iSpace){
        this._iLastResizeSpace = iSpace;
        this.adjustWidth();
    }
},

genClass : function(){
    var sClass = df.WebToolBar.base.genClass.apply(this, arguments);
    
    sClass += (this._oParent instanceof df.WebCommandBar ? " WebTlb_Command" : " WebTlb_Standalone");
        
    return sClass;
},



/*
This setter method adds or removes the CSS class that shows caption.

@param  bVal   The new value.
@private
*/
set_pbShowCaption : function(bVal){
    if(this._eControl){
        df.dom.toggleClass(this._eControl, "WebTlb_HideCaption", !bVal);
        
        this.refreshMenu();
    }
},

/* 
Shows / hides the icons by adding / removing the HideIcons CSS class based on the new value.

@param  bVal    New value.
@private
*/
set_pbShowIcons : function(bVal){
    if(this._eControl){
        df.dom.toggleClass(this._eControl, "WebTlb_HideIcons", !bVal);
        this.refreshMenu();
    }
},

set_peAlign : function(eVal){
    if(this._eControlWrp){
        this._eControlWrp.style.textAlign = (["left", "center", "right"])[eVal];
    }
}

});