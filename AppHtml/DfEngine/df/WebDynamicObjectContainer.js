/* global df */
/*
Class:
    df.WebDynamicObjectContainer
Mixin:
    df.WebBaseContainer_mixin
Extends:
    df.WebBaseControl

This class is the client-side representation of the WebDynamicObjectContainer. This class
contains the logic required to support dynamic object creation in DataFlex.
*/

df.tQueuedSyncProp = {
    sO  : df.tString,
    sP  : df.tString,
    bA  : df.tBool,
    sV  : df.tString,
    tVT : {}
}

df.tSyncPropsWrapper = {
    bReset: df.tBool,
    aSyncProps: [{
        sO : df.tString,
        aP : [{
            sN : df.tString,
            sV : df.tString
        }]
    }]
    
};

df.tAdvSyncPropsWrapper = {
    bReset : df.tBool,
    aAdvSyncProps: [{
        sO : df.tString,
        sP : df.tString,
        tV : {}
    }]
    
};

//  Use the WebBaseContainer_mixin and inherit from WebBaseControl
df.WebDynamicObjectContainerBase = df.mixin("df.WebBaseContainer_mixin", "df.WebBaseControl");

df.WebDynamicObjectContainer = function WebDynamicObjectContainer(sName, oParent){
    //  Forward Send
    df.WebDynamicObjectContainer.base.constructor.call(this, sName, oParent);

    this.prop(df.tAdv, "ptSyncPropsWrapper", null);
    this.prop(df.tAdv, "ptAdvSyncPropsWrapper", null);

    this.addSync("ptSyncPropsWrapper");
    this.addSync("ptAdvSyncPropsWrapper");

    // Private variables
    this._aSyncPropQueue  = []; // Contains both regular and advanced syncprops
    this._bReset            = false;  // True if a reset of the container is incoming during this call
    this._aSyncPropCache    = [];
    this._aAdvSyncPropCache = [];

    // Configure super classes
    this._sBaseClass = "WebControl";
    this._sControlClass = "WebDynCon";
};

df.defineClass("df.WebDynamicObjectContainer", "df.WebDynamicObjectContainerBase", {

/* 
Hook for getting references to the elements during the rendering process before child elements are 
created.

@private
*/
getRef : function(){
    df.WebDynamicObjectContainer.base.getRef.call(this);
    
    //  Do this before afterRender to prevent issues with nested groups..
    this._eControl = df.dom.query(this._eElem, "div.WebCon_Inner > div");
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
    
    //  Determine natural height
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
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 
We insert the WebContainer div.

@param  aHtml   String array used as string builder.
@private
*/
wrpOpenHtml : function(aHtml){
    aHtml.push('<div class="WebContainer">');
},


/* 
Called by the WebBaseContainer openHtml to insert HTML between the control and the container HTML. 

@param  aHtml   String array used as string builder.
@private
*/
wrpCloseHtml : function(aHtml){
    aHtml.push('</div>');
},


    /* 
    Published method that allows the server to send a list
    of queued synchronized properties to the client so that
    these can be applied after the objects are created.
    */ 
    loadQueuedSyncProps : function() {
        var aQueuedSyncProps = this._tActionData, tQueuedSyncProp;

        for (var i = 0; i < aQueuedSyncProps.length; i++) {
            tQueuedSyncProp = aQueuedSyncProps[i];

            if (tQueuedSyncProp.bA) {
                tQueuedSyncProp.tV = this.deserializeVT(sVal.c[4]);
            }
    
            this._aSyncPropQueue.push(tQueuedSyncProp);
        }
    },

    /* 
    Published method that allows the server to send an new
    structure of dynamic objects to the client to be rendered.
    */ 
    loadDynamicObjects : function() {
        var oObj, tDef, aObjects = this._tActionData;

        for (var i = 0; i < aObjects.length; i++) {
            tDef = aObjects[i];
            oObj = this.initDynamicObject(tDef, this, false);

            // Set owner to WebDynamicObjectContainer
            oObj._oOwner = this; 
        }

        if (this._eElem) {
            this.renderChildren();
            this.afterRender();
            this.position();

            this.getWebApp().resize();
        }
    
        this.emptyPropCache();
    },

    /* 
    Published method that allows the server to insert an object
    into the client's data structure.
    */ 
    insertDynamicObject : function(sParent, sInsertAfter) {
        var tDef = this._tActionData, oObj, oParent, oInsertAfter, iIndex;

        oParent = this.getWebApp().findObj(sParent) || this;
        oInsertAfter = oParent[sInsertAfter] || null;
        oObj = this.initDynamicObject(tDef, oParent, true);
        
        if (this._eElem) {
            // Insert the object in its parent's children structure
            iIndex = oInsertAfter !== null ? oParent._aChildren.indexOf(oInsertAfter) + 1 : 0;
            oParent.insertChild(oObj, iIndex);

            // Render the child object
            oParent.renderChild(oObj);

            this.getWebApp().resize();
        }
    },
	
	/*
    Published method that allows the server to insert an object
    into the client's data structure at a specific index.
    */
    insertDynamicObjectAtIndex : function(sParent, iIndex) {
        var tDef = this._tActionData, oObj, oParent;

        oParent = this.getWebApp().findObj(sParent) || this;
        oObj = this.initDynamicObject(tDef, oParent, true);
        
        if (this._eElem) {
            // Insert the object in its parent's children structure 
            // at the specified index
            oParent.insertChild(oObj, iIndex);

            // Render the child object
            oParent.renderChild(oObj);

            this.getWebApp().resize();
        }
    },

    /* 
    Published method that allows the server to insert an object
    into the client's data structure. This function specifically
    inserts the object at the beginning of its parent's list of children.
    */ 
    prependDynamicObject : function(sParent) {
        var tDef = this._tActionData, oObj, oParent;

        oParent = this.getWebApp().findObj(sParent) || this;
        oObj = this.initDynamicObject(tDef, oParent, true);
        
        if (this._eElem) {
            // Insert the object in its parent's children structure
            oParent.insertChild(oObj, 0);

            // Render the child object
            oParent.renderChild(oObj);

            this.getWebApp().resize();
        }
    },

    /* 
    Published method that allows the server to insert an object
    into the client's data structure. This function specifically
    inserts the object at the end of its parent's list of children.
    */ 
    appendDynamicObject : function(sParent) {
        var tDef = this._tActionData, oObj, oParent, iIndex;

        oParent = this.getWebApp().findObj(sParent) || this;
        oObj = this.initDynamicObject(tDef, oParent, true);
        
        if (this._eElem) {
            // Insert the object in its parent's children structure
            iIndex = oParent._aUIObjects.length;
            oParent.insertChild(oObj, iIndex);

            // Render the child object
            oParent.renderChild(oObj);

            this.getWebApp().resize();
        }
    },
	
	/*
	Published method that moves the given dynamic object
	behind the second passed dynamic object.
	*/
	moveDynamicObject : function(sDynamicObjectId, sInsertAfter) {
		var oObj, eObj, oOldParent, oInsertAfter, oNewParent, iResizeCount, webApp = this.getWebApp(), iIndex;
		
        oObj = webApp.findObj(sDynamicObjectId);
        oInsertAfter = webApp.findObj(sInsertAfter);
        oNewParent = oInsertAfter._oParent;
        oOldParent = oObj._oParent;
        
        // Store object's DOM element
        eObj = oObj._eElem;

        // Update object's parent
        oObj._oParent = oNewParent;
        
        // Move object
        oOldParent.removeChild(oObj);

        iIndex = oInsertAfter !== null ? oNewParent._aChildren.indexOf(oInsertAfter) + 1 : 0;
        oNewParent.insertChild(oObj, iIndex, oInsertAfter);
        oNewParent.renderChild(oObj, eObj);
		
		// Resize the webapp. 
        // For some reason, the web app requires x amount of resizes, where
        // x = depth(oObj) - 1. The depth of an object is defined by how
        // far into the object structure it is located, starting from the view.
        iResizeCount = oObj.getObjectLevel();
        for (var i = 0; i < iResizeCount; i++) {
            webApp.resize();
        }
    },
    
    /*
	Published method that moves the given dynamic object
	behind the second passed dynamic object.
	*/
	moveDynamicObjectToIndex : function(sDynamicObjectId, sParentId, iIndex) {
		var oObj, eObj, oOldParent, oNewParent, iResizeCount, webApp = this.getWebApp();
		
        oObj = webApp.findObj(sDynamicObjectId);
        oNewParent = webApp.findObj(sParentId);
        oOldParent = oObj._oParent;
        
        // Store object's DOM element
        eObj = oObj._eElem;

        // Update object's parent
        oObj._oParent = oNewParent;
        
        // Move object
        oOldParent.removeChild(oObj);

        oNewParent.insertChild(oObj, iIndex);
        oNewParent.renderChild(oObj, eObj);
		
		// Resize the webapp. 
        // For some reason, the web app requires x amount of resizes, where
        // x = depth(oObj) - 1. The depth of an object is defined by how
        // far into the object structure it is located, starting from the view.
        iResizeCount = oObj.getObjectLevel();
        for (var i = 0; i < iResizeCount; i++) {
            webApp.resize();
        }
	},
	
    /*
    Published method that destroys the given dynamic object 
    and removes it from the container.
    */
    destroyDynamicObject : function(sDynamicObjectId) {
        var oObj, oParent, iResizeCount;

        oObj = this.getWebApp().findObj(sDynamicObjectId);

        oParent = oObj._oParent;
        oParent.removeChild(oObj);
        oParent.unrenderChild(oObj);

        // Destroy the actual object
        oObj.destroy();

        // Resize the webapp. 
        // For some reason, the web app requires x amount of resizes, where
        // x = depth(oObj) - 1. The depth of an object is defined by how
        // far into the object structure it is located, starting from the view.
        iResizeCount = oParent.getObjectLevel();
        for (var i = 0; i < iResizeCount; i++) {
            this.getWebApp().resize();
        }
    },

    /*
    Initializes a dynamic web object.
    */
    initDynamicObject : function(tDef, oParent, bInsert) {
        var i, sP, oObj, FConstructor, webApp = this.getWebApp();

        //  Check for name conflict
        if(!oParent[tDef.sName]){

            //  Find constructor
            FConstructor = webApp.getConstructor(tDef.sType, tDef);
            if(typeof(FConstructor) === "function"){

                //  Create new instance
                oParent[tDef.sName] = oObj = new FConstructor(tDef.sName, oParent);
            }else{
                throw new df.Error(999, "Could not find class '{{0}}'", this, [tDef.sType]);
            }
        }else{
            throw new df.Error(999, "Naming conflict with child object '{{0}}'", this, [tDef.sName]);
        }
        
        //  Set the published property values
        for(i = 0; i < tDef.aProps.length; i++){
            sP = tDef.aProps[i].sN;

            //  Check naming convention
            if(sP.charAt(0) !== "_"){
                //  Check if not conficting with child object or function
                if(!oObj[sP] || (typeof(oObj[sP]) !== "object" && typeof(oObj[sP]) !== "function")){
                    oObj._set(sP, tDef.aProps[i].sV, false, false);
                }else{
                    throw new df.Error(999, "Naming conflict with property '{{0}}' of object '{{1}}'", this, [ sP,  tDef.sName ] );
                }
            }else{
                throw new df.Error(999, "Published property '{{0}}' of object '{{1}}' properties should not start with an '_'", this, [tDef.aProps[i].sV, tDef.sName ]);
            }
        }

        //  Set the advanced typed published property values
        if(tDef.aAdvP){
            for(i = 0; i < tDef.aAdvP.length; i++){
                sP = tDef.aAdvP[i].sN;

                //  Check naming convention
                if(sP.charAt(0) !== "_"){
                    if(!oObj[sP] || (typeof(oObj[sP]) !== "object" && typeof(oObj[sP]) !== "function")){
                        //  Make sure to mark it as advanced (this is used to determine this when sending a call
                        if(!oObj._oTypes[sP]){
                            oObj._oTypes[sP] = df.tAdv;
                        }

                        //  Actually set the property value
                        oObj._set(sP, tDef.aAdvP[i].tV, false, false);
                    }else{
                        throw new df.Error(999, "Naming conflict with property '{{0}}' of object '{{1}}'", this, [ sP,  tDef.sName ] );
                    }
                }else{
                    throw new df.Error(999, "Published property '{{0}}' of object '{{1}}' properties should not start with an '_'", this, [tDef.aAdvP[i].sV, tDef.sName ]);
                }
            }
        }

        // Apply queued WebSet operations
        this.applyQueuedSyncProps(oObj);

        // Set owner to WebDynamicObjectContainer
        oObj._oOwner = this; 

        if (!bInsert) {
            webApp.newWebObject(oObj, oParent);
        } 

        //  Create children
        for(i = 0; i < tDef.aObjs.length; i++){
            this.initDynamicObject.call(this, tDef.aObjs[i], oObj, false);
        }

        //  Call create
        oObj.create(tDef);

        return oObj;
    },

    /*
    Resets the container, including all saved properties.
    */ 
    resetContainer : function() {
        for (var i = 0; i < this._aChildren.length; i++) {
            this._aChildren[i].destroy();
        }

        this._aChildren = [];
        this._aFloats = [];
        this._aUIObjects = [];
        this._aPanels = [];

        // Reset variables
        this._aSyncPropQueue  = [];
        this._bReset = false;

        this.getWebApp().resize();
    },

    /*
    Finds and applies all queued SyncProps for the given dynamic object.
    */
    applyQueuedSyncProps : function(oObj) {
        var vPropValue, aQueue, tQueuedSyncProp;

        aQueue = this._aSyncPropQueue.filter(function (e) { return e.sO === oObj.getLongName(); })
        this._aSyncPropQueue = this._aSyncPropQueue.filter(function(e) { return e.sO !== oObj._sName; });


        // Apply queued synchronized property changes
        for (var i = 0; i < aQueue.length; i++) {
            tQueuedSyncProp = aQueue[i];

            if (tQueuedSyncProp.bA) {
                vPropValue = tQueuedSyncProp.tVT;
            } else {
                vPropValue = tQueuedSyncProp.sV;
            }
            oObj.addSync(tQueuedSyncProp.sP);
            oObj.set(tQueuedSyncProp.sP, vPropValue);
        }
    },

    /*
    Checks for all cached property operations whether they are still valid applies/discards
    appropriately.
    */
    emptyPropCache : function() {
        this.handleSyncProps(this._aSyncPropCache);
        this.handleAdvSyncProps(this._aAdvSyncPropCache);

        this._aSyncPropCache = [];
        this._aAdvSyncPropCache = [];
    },

    /*
    This method gathers the synchronized properties for this Web Object.

    @param  aObjs   Reference to the array of synchronized property objects to which the properties are added.
    @param  aAdvProps   Reference to the array in which the advanced sync props are gathered.
    @private
    */
    getSynced : function(aObjs, aAdvProps){
        var sProp, aProps = [], val, sObj = this.getLongName();
        
        //  Gather synchronized properties
        for(sProp in this._oSynced){
            if(this._oSynced.hasOwnProperty(sProp)){
                val = this.get(sProp);
                
                if(this._oTypes[sProp]){
                    val = this.toServerType(val, this._oTypes[sProp]);
                }
                if(val === undefined){
                    val = null;
                }
                
                //  Switch between advanced and local synchronized properties
                if(this._oTypes[sProp] === df.tAdv){
                    aAdvProps.push({
                        sO : sObj,
                        sP : sProp,
                        tV : val
                    });
                }else{
                    aProps.push({
                        sN : sProp,
                        sV : val
                    });
                }
            }
        }
        
        //  If synced props where found we add it to the list with wrappers
        if(aProps.length > 0){
            aObjs.push({
                sO : sObj,
                aP : aProps
            });
        }
    },

    /* 
    Updates web properties based on the set of web property values provided. It expects the web property 
    values to be provided in the format they are received from the server.

    @param  aProps  Array of web property values.
    @private
    */
    handleSyncProps : function(aProps){
        var i, oWO, tObj, x, webApp = this.getWebApp();
    
        //  Loop through objects with synced props
        for(i = 0; i < aProps.length; i++){
            tObj = aProps[i];

            //  Find WebObject
            oWO = webApp.findObj(tObj.sO);
            if(oWO){
                //  Loop through props and set them
                for(x = 0; x < tObj.aP.length; x++){
                    oWO._set(tObj.aP[x].sN, tObj.aP[x].sV, true, true);
                }
            
            } else {
                // I'm not yet sure what we should do here...
            }
        } 
    },

	/* 
    Updates advanced web properties based on the set of web property values provided. It expects the web 
    property values to be provided in the format they are received from the server.

    @param  aProps  Array of web property values.
    @private
    */
    handleAdvSyncProps : function(aAdvSyncP){
        var i, tP, oWO, webApp = this.getWebApp();
        
        //  Store advanced sync props
        for(i = 0; i < aAdvSyncP.length; i++){
            tP = aAdvSyncP[i];
            //  Find WebObject
            oWO = webApp.findObj(tP.sO);
            
            if(oWO){
                //  Loop through props and set them
                oWO._set(tP.sP, tP.tV, true, true);
            }else{
                // I'm not yet sure what we should do here...
            }
        }
    },

    /* 
    Setter method for the server variable 'ptSyncPropsWrapper'.
    Receives data regarding synchronized properties from the server
    and sets the values on the client accordingly.
    */ 
    set_ptSyncPropsWrapper : function(sVal) {
        var tSyncPropsWrapper;
        tSyncPropsWrapper = df.sys.vt.deserialize(sVal, df.tSyncPropsWrapper);

        // Only handle syncprops if there is no incoming reset of the container. If there is, we cache this
        // operation for now and execute it when the reset is done.
        if (!tSyncPropsWrapper.bReset) {
            this.handleSyncProps(tSyncPropsWrapper.aSyncProps);
        } else {
            this._bReset = true;
            this._aSyncPropCache = this._aSyncPropCache.concat(tSyncPropsWrapper.aSyncProps);
        }
        
    },

    /* 
    Getter method for the server variable 'ptSyncPropsWrapper'.
    Collects the values of all registered synchronized properties
    and sends them to the server.
    */
    get_ptSyncPropsWrapper : function() {
        var aPropList = [], aAdvPropList = [], tSyncPropsWrapper;
        
        for (var i = 0; i < this._aChildren.length; i++) {
            this._aChildren[i].getSynced(aPropList, aAdvPropList);
        }

        // Sort the properties array for each object
        for (var iObj = 0; iObj < aPropList.length; iObj++) {
            aPropList[iObj].aP.sort(function (a, b) { 
                return (a.sN > b.sN) ? 1 : ((b.sN > a.sN) ? -1 : 0);
            })
        }

        tSyncPropsWrapper = {
            bReset: this._bReset,
            aSyncProps: aPropList
        }

        return df.sys.vt.serialize(tSyncPropsWrapper, df.tSyncPropsWrapper);
    },

    /* 
    Setter method for the server variable 'ptAdvSyncPropsWrapper'.
    Receives data regarding advanced synchronized properties from 
    the server and sets the values on the client accordingly.
    */
    set_ptAdvSyncPropsWrapper : function(sVal) {
        var tAdvSyncPropsWrapper;

        tAdvSyncPropsWrapper = df.sys.vt.deserialize(sVal, df.tAdvSyncPropsWrapper);
		
        // The framework expects an unparsed ValueTree, so copy it over from the unparsed parameter
        for (var i = 0; i < sVal.c[1].c.length; i++) {
            tAdvSyncPropsWrapper.aAdvSyncProps[i].tV = sVal.c[1].c[i].c[2];
        }

        // Only handle advanced syncprops if there is no incoming reset of the container. If there is, we cache this
        // operation for now and execute it when the reset is done.
        if (!tAdvSyncPropsWrapper.bReset) {
            this.handleAdvSyncProps(tAdvSyncPropsWrapper.aAdvSyncProps);
        } else {
            this._bReset = true;
            this._aAdvSyncPropCache = this._aAdvSyncPropCache.concat(tAdvSyncPropsWrapper.aAdvSyncProps);
        }
    },

    /* 
    Getter method for the server variable 'ptAdvSyncPropsWrapper'.
    Collects the values of all registered advanced 
    synchronized properties and sends them to the server.
    */
    get_ptAdvSyncPropsWrapper : function() {
        var aPropList = [], aAdvPropList = [], tAdvSyncPropsWrapper;
        
        for (var i = 0; i < this._aChildren.length; i++) {
            this._aChildren[i].getSynced(aPropList, aAdvPropList);
        }

        // Sort the properties array for each object
        for (var iObj = 0; iObj < aAdvPropList.length; iObj++) {
            aAdvPropList[iObj].aP.sort(function (a, b) {
                return (a.sN > b.sN) ? 1 : ((b.sN > a.sN) ? -1 : 0);
            })
        }

        tAdvSyncPropsWrapper = {
            bReset: this._bReset,
            aAdvSyncProps: aAdvPropList
        }

        return df.sys.vt.serialize(tAdvSyncPropsWrapper, df.tAdvSyncPropsWrapper);
    },

    /*
    Override to add the $ instead of the . between object names.
    */
    getLongNamePrnt : function(){
        return this.getLongName() + "$";
    },

    onFocus : function(oEV){
        //  Intercept onfocus as a container cannot take the focus
    },

    onBlur : function(oEV){
        //  Intercept onfocus as a container cannot take the focus
    },

    /*
    Serializes an array of advanced syncprops
    */
    serializeAdvSyncProps :function(tStruct) {
        function composeAdvSyncProp(oObj) {
            return {
                v: "",
                c: [{
                    v: oObj.sO.toString(),
                    c: []
                }, {
                    v: oObj.sP.toString(),
                    c: []
                }, this.serializeVT(oObj.tV)]
            };
        }
    
        function composeAdvSyncPropsArray(aArray) {
            var tVT = {
                    v: "",
                    c: []
                },
                i;
            for (i = 0; i < aArray.length; i++) {
                tVT.c.push(composeAdvSyncProp(aArray[i]));
            }
            return tVT;
        }
    
        function composeAdvSyncPropsObject(oObj) {
            return {
                v: "",
                c: [{
                    v: oObj.sO.toString(),
                    c: []
                }, composeAdvSyncPropsArray(oObj.aP)]
            };
        }
    
        function composeAdvSyncPropsObjectArray(aArray) {
            var tVT = {
                    v: "",
                    c: []
                },
                i;
            for (i = 0; i < aArray.length; i++) {
                tVT.c.push(composeAdvSyncPropsObject(aArray[i]));
            }
            return tVT;
        }
        try {
            return composeAdvSyncPropsObjectArray(tStruct);
        } catch (oErr) {
            throw new df.Error(999, "Unable to serialize AdvSyncProps array, invalid data format!\n\r\n\rMSG: {{0}}", this, [oErr.message]);
        }
    }
});
