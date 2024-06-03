/*
Class:
    df.WebMenuItemCheckbox
Extends:
    df.WebMenuItem

This class represents a static menu item. These menu item doesn’t have any rendering logic which is 
in the menu classes. Through a system with a menu hub, menu listeners and menu providers the menu 
classes know which items it needs to render. This item contains a pbChecked property and through proxy is rendered.
    
Revision:
    2021/10/13  (BN, DAW)
        Initial Version.
*/

df.WebMenuItemCheckbox = function WebMenuItemCheckbox(sName, oParent){
    df.WebMenuItemCheckbox.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbChecked", false);
    this.addSync("pbChecked");
};
df.defineClass("df.WebMenuItemCheckbox", "df.WebMenuItem",{
    
/* 
Called by a menu engine when this menu item is clicked. It triggers the OnClick event and if needed 
performs a load view (psLoadViewOnClick).
*/
itemClick : function(tItem, fReturn, oEnv){
    if (tItem.hRef) {
        tItem.hRef.set_pbChecked(!tItem.hRef.isChecked());
    }
    return df.WebMenuItemCheckbox.base.itemClick.apply(this, arguments);
},

/*
This function returns whether the object is checked.
Do mind that this does not keep in mind the fact,
That if the object does not have the property it always indicates false.
*/
isChecked : function() {
    return this.pbChecked === true;
},

//  - - - Setters - - - 

/*
This setter method updates the DOM with the new checked state for a cWebMenuCheckbox.

@param  bVal   The new value.
@private
*/
set_pbChecked : function(bVal) {
    this.pbChecked = bVal;
    this.notifyChange();
}

});