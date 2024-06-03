/*
Class:
    df.WebGroup
Mixin:
    df.WebBaseContainer_mixin
Extends:
    df.WebBaseControl

This class is the client-side representation of the WebGroup class. It is the first class that is 
both a container and a control at the same time and uses WebBaseContainer as a mixin.

Revision:
    2013/11/11  (HW, DAW)
        Refactored into a mixin to support the new WebGroup.
*/

//  Use the WebBaseContainer_mixin and inherit from WebBaseControl
df.WebGroupBase = df.mixin("df.WebBaseContainer_mixin", "df.WebBaseControl");

df.WebGroup = function WebGroup(sName, oParent){
    df.WebGroup.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tString, "psCaption", "");
    this.prop(df.tBool, "pbShowBorder", true);
    this.prop(df.tBool, "pbShowCaption", true);
    this.prop(df.tBool, "pbCollapsible", false);
    this.prop(df.tBool, "pbExpanded", true);
    
    this.event("OnExpand", df.cCallModeDefault);
    this.event("OnCollapse", df.cCallModeDefault);

    // @privates
    this._eCaption = null;
    
    // Configure super classes
    this._sBaseClass = "WebControl";
    this._sControlClass = "WebGroup";
};
df.defineClass("df.WebGroup", "df.WebGroupBase", {

/* 
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 
The WebGroup generates a label and the WebContainer div.

@param  aHtml   String array used as string builder.
@private
*/
wrpOpenHtml : function(aHtml){
    aHtml.push('<div class="WebContainer">');
},


/* 
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 
The WebGroup generates a label and the WebContainer div.

@param  aHtml   String array used as string builder.
@private
*/
wrpCloseHtml : function(aHtml){
    aHtml.push('</div>');
    aHtml.push('<label class="WebGrp_Caption">', df.dom.encodeHtml(this.psCaption), '</label>');
    aHtml.push('<div class="WebGrp_ExpandBtn"></div>');
},

/* 
Hook for getting references to the elements during the rendering process before child elements are 
created. We get references to the caption eelement.
*/
getRef : function(){
    df.WebGroup.base.getRef.call(this);
    
    //  Do this before afterRender to prevent issues with nested groups..
    this._eCaption = df.dom.query(this._eElem, "label.WebGrp_Caption");
    this._eControl = df.dom.query(this._eElem, "div.WebCon_Inner > div");
    this._eExpandBtn = df.dom.query(this._eElem, "div.WebGrp_ExpandBtn");
},

afterRender : function(){
    df.WebGroup.base.afterRender.call(this);
    
    df.dom.on("click", this._eExpandBtn, this.onExpandClick, this);
    df.dom.on("transitionend", this._eElem, this.onTransEnd, this);
    if(this._eContent){
        df.dom.on("transitionend", this._eContent, this.onTransEndCancel, this);
    }
},

/*
Augment the genClass function to add classes indicating wether a caption and / or a border is shown.

@private
*/
genClass : function(){
    var sClass = df.WebGroup.base.genClass.call(this);
    
    if(this.pbShowCaption){
        sClass += " WebGrp_HasCaption";
    }
    if(this.pbShowBorder){
        sClass += " WebGrp_HasBorder";
    }
    if(this.pbCollapsible){
        sClass += " WebGrp_Collapsible " + (this.pbExpanded ? "WebGrp_Expanded" : "WebGrp_Collapsed");
    }
    
    return sClass;
},

/* 
Setter method that updates the caption (including the CSS classname on the outer element indicating 
if the is a caption).

@param  sVal    New caption.
*/
set_psCaption : function(sVal){
    if(this._eCaption){
        df.dom.setText(this._eCaption, sVal);
        
        this.sizeChanged();
    }
},

/* 
Toggles the WebGrp_HasCaption CSS class which hides / shows the caption of the group. If false no 
space will be reserved for the caption.

@param  bVal    New value for the property.
*/
set_pbShowCaption : function(bVal){
    if(this._eElem){
        df.dom.toggleClass(this._eElem, "WebGrp_HasCaption", bVal);
        
        this.sizeChanged();
    }
},

/* 
Setter method that shows / hides the border by changing the CSS classname set on the outermost 
element.

@param  bVal    New value.
*/
set_pbShowBorder : function(bVal){
    if(this._eElem){
        df.dom.toggleClass(this._eElem, "WebGrp_HasBorder", bVal);
        
        this.sizeChanged();
    }
},

set_pbCollapsible : function(bVal){
    if(this._eElem){
        df.dom.toggleClass(this._eElem, "WebGrp_Collapsible", bVal);
        if(bVal){
            df.dom.addClass(this._eElem, (this.pbExpanded ? "WebGrp_Expanded" : "WebGrp_Collapsed"));
        }else{
            df.dom.removeClass(this._eElem, "WebGrp_Expanded WebGrp_Collapsed");
        }
    }
},

set_pbExpanded : function(bVal){
    if(this._eElem && this.pbCollapsible && this.pbExpanded !== bVal){
        if(bVal){
            df.dom.addClass(this._eElem, "WebGrp_Expanded");
            df.dom.removeClass(this._eElem, "WebGrp_Collapsed");

            this.fire("OnExpand");
        }else{
            df.dom.addClass(this._eElem, "WebGrp_Collapsed");
            df.dom.removeClass(this._eElem, "WebGrp_Expanded");

            this.fire("OnCollapse");
        }
        
        this.sizeChanged(true);
    }
},

onExpandClick : function(oEv){
    if(this.isEnabled()){
        this.set('pbExpanded', !this.pbExpanded);
    }
},

/* 
On transitionend (which triggers after the transition for opening / closing a card finishes) we will 
trigger a resize.

@param  oEv     DOM Event object.
@private
*/
onTransEnd : function(oEv){
    this.sizeChanged(true);
},

/* 
Handles the transitionend of the content div and stops propagation. We don't want every transition 
of anything inside the container to trigger a resize. Only at the end of its own transition.

@param  oEv     DOM Event object.
@private
*/
onTransEndCancel : function(oEv){
    oEv.stopPropagation();
},

/*
The getMinHeight function is called by the column layout resize system implemented in 
WebBaseContainer. It determines the minimal height that the control needs to render itself. The 
WebGroup uses the getRequiredHeight function to determine the required height. The  getHeightDiff 
function is used to calculate the height taken by a border / padding on the group itself.

@return The minimal height needed in pixels.
*/
getMinHeight : function(){
    var iHeight = 0;

    //  Give child containers a chance to resize
    this.resize();
    
    if(this.pbScroll){
        if(this.pbFillHeight){
            iHeight = this.piMinHeight;
        }else{
            iHeight = Math.max(this.piHeight, this.piMinHeight);
        }
    }else{
        //  Determine natural height
        iHeight = this.getRequiredHeight();
    }
    
    //  Add control height difference
    if(this._eControl){
        iHeight += df.sys.gui.getVertBoxDiff(this._eControl);
        iHeight += df.sys.gui.getVertBoxDiff(this._eInner);
        iHeight += df.sys.gui.getVertBoxDiff(this._eControlWrp);
    }
    
    //  Respect piMinHeight
    if(iHeight < this.piMinHeight){
        iHeight = this.piMinHeight;
    }
    
    return iHeight;
},


/*
Augments the getHeightDiff function and extends it so that it incorporates the space around a 
WebGroup which is both a container and a control at the same time.

bOut        Container
            +------
bIn         |  Sizer
            |  +------
bContentOut |  |  Content
            |  |  +------
bContentIn  |  |  |

@param  bOut        Margin & border of the container element.
@param  bIn         Padding of the container + margin & border of the sizer.
@param  bContentOut Padding of the sizer + margin & border of the content element.
@param  bCOntentIn  Padding of the content element.
@private
*/
/* getHeightDiff : function(bOut, bIn, bContentOut, bContentIn){
    var iHeight = df.WebGroup.base.getHeightDiff.apply(this, arguments);
    if(bOut){
        if(this._eInner){
            iHeight += df.sys.gui.getVertBoxDiff(this._eInner, 0);
        }
    }
    return iHeight;
    
}, */

/* 
Override the setHeight and set the height on the container div which will properly stretch the 
control and will make the container sizing logic function properly.

@param  iHeight     The full height of the control (outermost element).
@private
*/
setHeight : function(iHeight, bSense){
    if(this._eControl){
        //  If a negative value is given we should size 'naturally'
        if(iHeight > 0){
            iHeight -= this.getVertHeightDiff();
            
            iHeight = (iHeight < 0 ? 0 : iHeight);  //  FIX: IE8 doesn't handle negative values real well and this seems to happen somehow

            //  Set the height
            this._eContainer.style.height = iHeight + "px";
        }else{
            this._eContainer.style.height = "";
        }
    
    }
},

/*
Augment and add the container diff.

@private
*/
getVertHeightDiff : function(){
    var iResult = df.WebGroup.base.getVertHeightDiff.call(this);
    
    iResult += df.sys.gui.getVertBoxDiff(this._eContainer, 3);  //  Due to box-model: border-box we use mode 3

    return iResult;
},

/*
Augment container height difference and add the control height diff to the outermost part.

@private
*/
getHeightDiff : function(bOut, bIn, bContentOut, bContentIn){
    let iHeight = df.WebGroup.base.getHeightDiff.call(this,bOut, bIn, bContentOut, bContentIn);

    if(bOut){
        iHeight += this.getVertHeightDiff();
    }

    return iHeight;
},


set_psBackgroundColor : function(sVal){
    if(this._eContainer){
        this._eContainer.style.background = sVal || '';
    }
    if(this._eCaption){
        this._eCaption.style.background = sVal || '';
    }
},

onFocus : function(oEV){
    //  Intercept onfocus as a group cannot take the focus
},

onBlur : function(oEV){
    //  Intercept onfocus as a group cannot take the focus
}

});
