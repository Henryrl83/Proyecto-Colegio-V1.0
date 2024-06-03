df.tDragDropDataKvPair = {
    sKey : df.tString,
    sValue : df.tString
};

df.tGenericDragDropData = {
    aDragData : [df.tDragDropDataKvPair],
    aDropData : [df.tDragDropDataKvPair]
};

df.WebDragDropHelper = function WebDragDropHelper(sName, oParent){
    df.WebDragDropHelper.base.constructor.call(this, sName, oParent);
    
    //  Events
    this.event("OnHelperReady", df.cCallModeWait);

    // Internals
    this._aSources = []         // { oControl : objectRef, aActions : [] }
    this._aTargets = []         // { oControl : objectRef, aActions : [] }
    this._oDragData = null;     // Will store information about the drag upon a drag start
                                // Format :
                                // { 
                                //  oControl : <Control that started the drag>,
                                //  eElem : <Element that started the drag>,
                                //  oData : <Data for this drag>,
                                //  eType : <Type of drag that was performed>
                                // }
    this._oDragObj = null;      // Object that is currently being dragged ( {item: ... , element: "<div ..>"})
};

df.defineClass("df.WebDragDropHelper", "df.WebObject",{

    create : function(){
        df.WebDragDropHelper.base.create.call(this);

        this.fire("OnHelperReady");
    },

    registerDragSource : function(sObjName, sAction) {
        var oObj = this.getWebApp().findObj(sObjName);
        let bExists = false;

        // Check if object exists
        for (let i = 0; i < this._aSources.length; i++) {
            let curSource = this._aSources[i];
            if (curSource.oControl == oObj) {
                // Add the action
                curSource.aActions.push(parseInt(sAction));
                bExists = true;
            }
        }

        // If it doesn't exist, add a new object
        if (!bExists) {
            const newSource = {
                oControl : oObj,
                aActions : [parseInt(sAction)]
            }
            this._aSources.push(newSource);
        }

        // this._aSources.add(oObj);
        
        // Register helper at source
        oObj.registerDragSource(this, parseInt(sAction));
    },

    registerDropTarget : function(sObjName, sAction) {
        var oObj = this.getWebApp().findObj(sObjName);

        let bExists = false;

        // Check if object exists
        for (let i = 0; i < this._aTargets.length; i++) {
            let curTarget = this._aTargets[i];
            if (curTarget.oControl == oObj) {
                // Add the action
                curTarget.aActions.push(parseInt(sAction));
                bExists = true;
            }
        }

        // If it doesn't exist, add a new object
        if (!bExists) {
            const newTarget = {
                oControl : oObj,
                aActions : [parseInt(sAction)]
            }
            this._aTargets.push(newTarget);
        }

        // Register helper at target
        oObj.registerDropTarget(this, parseInt(sAction));
        // oObj.initDropZones();
    },

    highlightDropZones : function() {
        this._aTargets.forEach(oTarget => {
            oTarget.oControl.highlightDropZones(this);
        });
    },

    onDragStart : function(oEv, oDragObj, eElem, oDragData, eAction) {
        // Only highlight if this helper is responsible for handling the drag from the source, otherwise stop here
        if (oDragData && this.supportsDragAction(oDragObj, eAction)) {
            this.highlightDropZones();
            this._oDragData = {
                oControl : oDragObj,
                eElem : eElem,
                oData : oDragData
            }
        } else {
            return false;
        }
    },

    onDragEnd : function(oEv) {
        this.cleanupHelper();
        df.dragdrop.stopDropZones();
    },

    cleanupHelper : function() {
        this._aTargets.forEach(oTarget => {
            oTarget.oControl.cleanupDropZones();
        });
        this._oDragData = null;
    },

    serializeDragDropData : df.sys.vt.generateSerializer(df.tGenericDragDropData),

    onDrop : function(oEv, oSourceDfObj, oDropZone) {
        const oDragData = this._oDragData;
        
        if (oDragData && oDropZone && this.supportsDropAction(oDropZone._oControl, oDropZone._eDropAction) ) {
            const oDropData = oDropZone.getDropData();

            // Send OnDrop serveraction
            var oDragDropData = {
                DragData : this._oDragData.oData,
                DropData : oDropData
            }

            this.serverAction("Drop", [this._oDragData.oControl.getLongName(), oDropZone._oControl.getLongName(), oDropZone._eDropPosition], oDragDropData);
        }

        this.onDragEnd(oEv);
    },

    onDragOver : function() {

    },

    destroyDragObj : function () {
        this._oDragObj.destroy();
        this._oDragObj = null;
    },

    supportsDragAction(oControl, eAction) {
        for (let i = 0; i < this._aSources.length; i++) {
            let curSource = this._aSources[i];
            if (curSource.oControl == oControl) {
                for (let j = 0; j < curSource.aActions.length; j++) {
                    if (curSource.aActions[j] == eAction) {
                        return true;
                    }
                }
            }
        }

        return false;
    },

    supportsDropAction(oControl, eAction) {
        for (let i = 0; i < this._aTargets.length; i++) {
            let curTarget = this._aTargets[i];
            if (curTarget.oControl == oControl) {
                for (let j = 0; j < curTarget.aActions.length; j++) {
                    if (curTarget.aActions[j] == eAction) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

});