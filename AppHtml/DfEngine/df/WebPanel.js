/*
Class:
    df.WebPanel
Extends:
    df.WebBaseContainer

The panel is a very flexible UI container component that can be docked inside other container 
components. It can docked into 5 regions: top, left, center, right, bottom. Within the container it 
is possible to place controls or other panels. There should always be a main panel. Panels can be 
resizable. The panel is a fairly complicated component as it relies a lot on the floating of HTML 
elements combined with some pixel calculations. Especially the fact that panels can be scrollable 
makes the panel pretty sensitive to browser differences.

+------------------+
|        TOP       |
+------------------+
| L |          | R |
| E |          | I | 
| F |  CENTER  | G |
| T |          | H |
|   |          | T |
+------------------+
|      BOTTOM      |
+------------------+
    
Revision:
    2011/08/02  (HW, DAW) 
        Initial version.
*/
/* global df */
df.WebPanel = function WebPanel(sName, oParent){
    df.WebPanel.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tInt, "peRegion", 0);
    this.prop(df.tBool, "pbResizable", false);
    
    //@privates
    this._eDivider = null;
    
    //  Configure super classes
    
    this._bWrapDiv = true;
    this._sControlClass = "WebPanel";
};
df.defineClass("df.WebPanel", "df.WebBaseContainer",{

afterRender : function(){
    df.WebPanel.base.afterRender.call(this);
    
    this.set_pbResizable(this.pbResizable);
},

set_pbResizable : function(bVal){
    if(this._eElem){
        if(bVal && this.peRegion !== df.ciRegionCenter){
            //  Create divider if not there
            if(!this._eDivider){
                this._eDivider = df.dom.create('<div></div>');
                this._eElem.appendChild(this._eDivider);
                df.dom.on("mousedown", this._eDivider, this.onResize, this);
            }
            
            this._eDivider.className = (this.peRegion === df.ciRegionLeft || this.peRegion === df.ciRegionRight ? 'WebPanel_DividerVertical' : 'WebPanel_DividerHorizontal');
            this._eDivider.style.right = "";
            this._eDivider.style.left = "";
            this._eDivider.style.top = "";
            this._eDivider.style.bottom = "";
            if(this.peRegion === df.ciRegionLeft){
                this._eDivider.style.right = "0px";
            }else if(this.peRegion === df.ciRegionRight){
                this._eDivider.style.left = "0px";
            }else if(this.peRegion === df.ciRegionBottom){
                this._eDivider.style.top = "0px";
            }else if(this.peRegion === df.ciRegionTop){
                this._eDivider.style.bottom = "0px";
            }
        }else{
            if(this._eDivider){
                df.dom.off("mousedown", this._eDivider, this.onResize, this);
                this._eElem.removeChild(this._eDivider);
                this._eDivider = null;
            }
        }
    }
},

set_peRegion : function(eVal){
    if(this._eElem && this.peRegion !== eVal){
        this.peRegion = eVal;
        
        this.setOuterWidth(0);
        this.setOuterHeight(0);
        
        this.sizeChanged(true);
        this.set_pbResizable(this.pbResizable);
    }
},

onResize : function(oEvent){
    var eMask, eGhost, iCurLeft, iStartLeft, iMin = 0, iMax = 0, iCurTop, iStartTop, iStartMouseY, iStartMouseX;
    
    if(!this.isEnabled()){
        return;
    }
    
    eGhost = df.dom.create('<div class="' + (this.peRegion === df.ciRegionLeft || this.peRegion === df.ciRegionRight ? 'WebPanel_DividerVertical_Ghost' : 'WebPanel_DividerHorizontal_Ghost') + '"></div>');
    
    eMask = df.gui.dragMask(this.topLayer() || document.body);
    
    if(this.peRegion === df.ciRegionTop || this.peRegion === df.ciRegionBottom){  //  Horizontal
        eMask.style.cursor = "n-resize";
        
        //  Determine start position
        if(this.peRegion === df.ciRegionTop){
            iCurTop = this._eElem.clientHeight;
            
            iMin = (this.piMinHeight > 2 ? this.piMinHeight : 2);
            iMax = iCurTop + this._oParent._eMainArea.clientHeight;
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinHeight > 0){
                iMax = iMax - this._oParent._oRegionCenter.piMinHeight;
            }
        }else{  //  Bottom
            iCurTop = this._oParent._eMainArea.clientHeight;
            if(this._oParent._eRegionTop){
                iCurTop += this._oParent._eRegionTop.clientHeight;
                
                iMin = this._oParent._eRegionTop.clientHeight;
            }
            
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinHeight > 0){
                iMin += this._oParent._oRegionCenter.piMinHeight;
            }
            iMax = iCurTop + this._eElem.clientHeight - (this.piMinHeight > 0 ? this.piMinHeight : 0) - 10;
        }
        
        //  Configure ghost slider
        eGhost.style.top = iCurTop + "px";
                
        this._oParent._eMainArea.parentNode.appendChild(eGhost);
    }else{ //   Vertical
        eMask.style.cursor = "e-resize";
        
        //  Determine start position
        if(this.peRegion === df.ciRegionLeft){
            iCurLeft = this._eElem.clientWidth;
            
            iMin = (this.piMinWidth > 2 ? this.piMinWidth : 2);
            
            iMax = iCurLeft + this._oParent._eRegionCenter.clientWidth;
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinWidth > 0){
                iMax = iMax - this._oParent._oRegionCenter.piMinWidth;
            }else{
                iMax = iMax - 4;
            }
        }else{  //  Right
            iCurLeft = this._oParent._eMainArea.clientWidth - this._eElem.clientWidth;
            
             if(this._oParent._eRegionLeft){
                iMin = this._oParent._eRegionLeft.clientWidth;
            }
            
            if(this._oParent._oRegionCenter && this._oParent._oRegionCenter.piMinWidth > 0){
                iMin += this._oParent._oRegionCenter.piMinWidth;
            }
            iMax = iCurLeft + this._eElem.clientWidth - (this.piMinWidth > 0 ? this.piMinWidth : 0) - 10;
        }
        
        //  Configure ghost divider
        eGhost.style.left = iCurLeft + "px";
                
        this._oParent._eMainArea.appendChild(eGhost);
        
    }
    
    iStartLeft = iCurLeft;
    iStartTop = iCurTop;
    iStartMouseX = oEvent.getMouseX();
    iStartMouseY = oEvent.getMouseY();
    
    function onResize(oEvent){
        
        if(this.peRegion === df.ciRegionTop || this.peRegion === df.ciRegionBottom){
            iCurTop = iStartTop - (iStartMouseY - oEvent.getMouseY());
            
            iCurTop = (iCurTop < iMax ? (iCurTop > iMin ? iCurTop : iMin) : iMax);
            eGhost.style.top = iCurTop + "px";
        }else{
            iCurLeft = iStartLeft - (iStartMouseX - oEvent.getMouseX());
            iCurLeft = (iCurLeft < iMax ? (iCurLeft > iMin ? iCurLeft : iMin) : iMax);
            
            eGhost.style.left = iCurLeft + "px";
        }        
    }
    
    function onStopResize(oEvent){
        df.dom.off("mouseup", eMask, onStopResize, this);
        df.dom.off("mouseup", window, onStopResize, this);
        df.dom.off("mousemove", eMask, onResize, this);

        eMask.parentNode.removeChild(eMask);
        if(eGhost){
            eGhost.parentNode.removeChild(eGhost);
        }
        
        if(this.peRegion === df.ciRegionTop){
            this.piHeight = iCurTop;
            this._eElem.style.height = this.piHeight + "px";
        }else if(this.peRegion === df.ciRegionBottom){
            this.piHeight = this._eElem.clientHeight + (iStartTop - iCurTop);
            this._eElem.style.height = this.piHeight + "px";
        }else if(this.peRegion === df.ciRegionLeft){
            this.piWidth = iCurLeft;
            this._eElem.style.width = this.piWidth + "px";
        }else if(this.peRegion === df.ciRegionRight){
            this.piWidth = this._eElem.clientWidth + (iStartLeft - iCurLeft);
            this._eElem.style.width = this.piWidth + "px";
        }
        
        
        this.sizeChanged();
    }
    
    df.dom.on("mousemove", eMask, onResize, this);
    df.dom.on("mouseup", window, onStopResize, this);
    df.dom.on("mouseup", eMask, onStopResize, this);
    
	oEvent.stop();
}

});