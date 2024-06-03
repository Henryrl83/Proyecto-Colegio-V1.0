import { WebListView } from "./WebListView.js";
import { WebListModel } from "./WebListModel.js";
import { WebListController } from "./WebListController.js";

/* global df */

/*
Class:
    df.WebHtmlList
Extends:
    df.WebList

This class is a customizable version of the WebList that can be customized using HTML templates. 
Note that it does not support headers, sorting and that sort of stuff. It is just meant for 
displaying lists of data in customizable format while still enjoying the ease of automatic data 
binding on the server.

To do this we had to subclass the WebListRowModel, the WebListView and the WebList itself.
    
Revision:
    2020/02/27  (HW, DAW) 
        Initial version.
*/


/*
Subclass WebListRowModel to augment HTML generation for the row.
*/
df.WebHtmlListRowModel = function WebHtmlListRowModel(oList, oModel){
    df.WebHtmlListRowModel.base.constructor.call(this, oList, oModel);

    this.rRegEx = /{{([a-zA-Z0-9_\-]*)}}/g;
};
df.defineClass("df.WebHtmlListRowModel", "df.WebListRowModel", {

/*
Called to generate the HTML for a single row. Uses the regex to search for markers and replaces 
them with column values calling cellHtml on the columns.

@param  tRow    Struct with row data.
@param  aHtml   Array string builder for output.
@param  bZebra  True of odd rows, false for even.
*/
rowHtml : function(tRow, aHtml, bZebra){
    var oL = this.oL, oR = this.oR, that = this;
    
    aHtml.push(oL._sHtmlTemplate.replace(this.rRegEx, function(sMatch, sP1){
        if(sP1 == "dfrowid"){
            return tRow.sRowId;
        }
        var oCol = oL._oColMap[sP1];
        if(oCol){
            return that.cellHtml(oCol, tRow, tRow.aCells[oCol._iColIndex]);
        }
        return sMatch;
    }));
}

});

/*
Subclass WebListView to add psHtmlBefore, psHtmlAfter and OnElemClick logic.
*/
export class WebHtmlListView extends WebListView{
    
/*
Called to generate the HTML for the table. Augmented to isnert psHtmlBefore and psHtmlAfter.

@param  aHtml   Array used as string builder.
*/
tableHtml(aHtml){
    aHtml.push(this.oL.psHtmlBefore);
    super.tableHtml(aHtml);
    aHtml.push(this.oL.psHtmlAfter);
}

/* 
This function handles the click event on the list table. It determines which row and which column is 
clicked. It will trigger the cellClick on the column object and change row if needed.

@param  oEvent  Event object.
@private
*/
onTableClick(oEv){
    var eElem = oEv.getTarget(), eRow = null, iCol = -1, that = this, sRowId = null, sElemClick = null, bRowClick = true;
    
    //  Check enabled state
    if(!this.oL.isEnabled() || this.bCancelClick){
        return;
    }
    
    //  We need to determine if and which row was clicked so we start at the clicked element and move up untill we find the row
    while(eElem.parentNode && eElem !== this.eBody && !sRowId){
        if(eElem.hasAttribute("data-ServerOnElemClick")){
            sElemClick = eElem.getAttribute("data-ServerOnElemClick");
        }

        //  Check if we found the tr element and if it is part of the table
        if(eElem.hasAttribute("data-dfisrow")){  
            sRowId = eElem.getAttribute("data-dfrowid");
        }
        eElem = eElem.parentNode;
    }

    //  Fire element click
    if(sElemClick){
        bRowClick = this.oL.fire("OnElemClick", [ sRowId || "", sElemClick ]);
    }

    //  Trigger regular cell click
    if(bRowClick && sRowId){
        //  Trigger cell click
        if(this.oC.cellClick(oEv, sRowId, iCol)){
            this._bPreventSubmit = true;
            setTimeout(function(){
                that.bPreventSubmit = false;
            }, 250);
            oEv.stop();    
        }
    }
}

/*
No partial update supported..
*/
refreshCell(sRowId, oCol){
    this.refreshDisplay();
}

/*
No partial update supported..
*/
refreshRow(sRowId, sNewRowId){
    this.refreshDisplay();
}

}

/*
The actual WebHtmlList subclass of WebList using the changed MVC components above.
*/
df.WebHtmlList = function WebHtmlList(oParent, sName){
    df.WebHtmlList.base.constructor.call(this, oParent, sName);

    this.prop(df.tString, "psHtmlBefore", "");
    this.prop(df.tString, "psHtmlTemplate", "");
    this.prop(df.tString, "psHtmlAfter", "");

    this._oColMap = {};
    this._sHtmlTemplate; // This is used as an internal reference to build the RowHtml

    this.event("OnElemClick", df.cCallModeWait);

    this._sControlClass = "WebHtmlList";
};
df.defineClass("df.WebHtmlList", "df.WebList", {


/* 
Initialize the HTML template.
*/
create : function(){
    this._sHtmlTemplate = this.initTemplate(this.psHtmlTemplate);

    df.WebHtmlList.base.create.call(this);
},   

/*
Override modules.
*/
createTouchHandler : function(){
    return null;
},

createPlaceHolder : function(){
    return null;
},

createHeaderView : function(){
    return null;
},

createRowModel : function(){
    return new df.WebHtmlListRowModel(this, this._oModel);
},

createView : function(){
    return new WebHtmlListView(this, this._oModel, this._oController);
},

createController : function(){
    return new WebListController(this, this._oModel);
},

createModel : function(){
    return new WebListModel(this);
},

/*
Override and skip WebList logic.
*/
openHtml : function(aHtml){
    //  We skip over WebList
    df.WebList.base.openHtml.call(this,aHtml);
    
    this._oBody.genHtml(aHtml);
},

/*
Override and skip weblist logic.
*/
afterRender : function(){
    var oObj;
    
    this._eControl = this._eFocus = df.dom.query(this._eElem, 'div.WebList_Focus');
    
    if(this._oHeader){
        this._oHeader.afterRender(this._eElem);
    }
    
    this._oBody.afterRender(this._eElem);
    
    //  Skip weblist
    df.WebList.base.afterRender.call(this);

    //  We set _bRenderChildren to true so that events like afterShow properly reach columns components (needed for previewer as well)
    this._bRenderChildren = true;
    
    this.updateEnabled();
},

/*
Augmented to intercept the column objects and build a column map used to find columns by their name.

@param  oChild  New child object.
*/
addChild : function(oChild){
    df.WebHtmlList.base.addChild.call(this, oChild);

    if(oChild._bIsColumn){
        this._oColMap[oChild._sName] = oChild;
    }
},

/*
Initialzies a template by injecting data-dfisrow and data-df-rowid attributes into the outermost element.

@param  sTemplate   The HTML template for a row.
@return Altered template with nessecary attributes.
@private
*/
initTemplate : function(sTemplate){
    return sTemplate.replace(/<\/?\w+/i, function(sMatch){
        return sMatch + ' data-dfisrow="true" data-dfrowid="{{dfrowid}}"';
    });
},

/*
Client action to update the template without making psHtmlTemplate a synchronized property.

@client-action
*/
updateTemplate : function(sNewTemplate){
    this.set_psHtmlTemplate(sNewTemplate);
},

/*
Setters for web properties.
*/
set_psHtmlTemplate : function(sVal){
    this._sHtmlTemplate = this.initTemplate(sVal);
    this.redraw();
},

set_psHtmlBefore : function(sVal){
    this.psHtmlBefore = sVal;
    this.redraw();
},

set_psHtmlAfter : function(sVal){
    this.psHtmlAfter = sVal;
    this.redraw();
}

});