/*
Class:
    df.WebDatePicker
Extends:
    df.WebBaseDEO

This is the client-side representation of the cWebDatePicker class. It renders a datepicker control 
directly into the form. This datepicker will behave like a data entry object and display its value 
by highlighting the date it in the datepicker. The datepicker is rendered by the df.DatePicker 
class which is instantiated as sub object (_oPicker).

Revision:
    2012/04/02  (HW, DAW) 
        Initial version.
*/
df.WebDatePicker = function WebDatePicker(sName, oParent){
    df.WebDatePicker.base.constructor.call(this, sName, oParent);
    
    this.prop(df.tBool, "pbShowWeekNr", true);
    this.prop(df.tBool, "pbShowToday", true);
    this.prop(df.tInt, "piStartWeekAt", 1);
    
    this.event("OnDateClick", df.cCallModeWait);
    
    
    //  Client-side only event triggering at real time while the value changes
    this.OnRealtimeChange = new df.events.JSHandler();
    //  Triggered on enter
    this.OnEnter = new df.events.JSHandler();
    
    //  @privates
    this._eBuddy = null;
    this._bBuddyActive = true;
    this._eElem = null;
    this._eFocus = null;
    this._eBody = null;
    this._eDispMonth = null;
    this._eDispYear = null;
    
    this._dSelected = new Date();
    this._iWeekSelected = df.sys.data.dateToWeek(this._dSelected);
    this._iDisplayYear = this._dSelected.getFullYear();
    this._iDisplayMonth = this._dSelected.getMonth();
    this._iLastDisplayYear = this._iDisplayYear;
    this._iLastDisplayMonth = this._iDisplayMonth;
    
    //  Translations
    this._aMonthNames = df.lang.monthsLong;
    this._aMonthNamesShort = df.lang.monthsShort;
    this._aDaysShort = df.lang.daysShort;
    this._aDaysLong = df.lang.daysLong;
    
    this._sControlClass = "WebDatePicker";

    this.peDataType = df.ciTypeDate;
};
df.defineClass("df.WebDatePicker", "df.WebBaseDEO",{

// - - - Control API - - -

create : function(){
    var oWA = this.getWebApp();
    if(!this.psMask){
        if(oWA){
            this.psMask = oWA.psDateFormat;
        }
    }
},

/*
This method forwards the open html call to the date picker object. It inserts html for the anchor 
element that will keep the focus.

@param  aHtml   Stringbuilder array to which the HTML can be added.
@private
*/
openHtml : function(aHtml){


    df.WebDatePicker.base.openHtml.call(this, aHtml);
    
    aHtml.push('<div class="WebDatePicker_FocusHolder" ', (!this.isEnabled() ? 'tabindex="-1"' : 'tabindex="0"'), '>');
    
    aHtml.push(
        '<div class="WebDP">',
          '<div class="WebDP_Wrp">',
            '<div class="WebDP_Head">',
                '<div class="WebDP_BtnPrev"><span></span></div>',
                '<div class="WebDP_BtnNext"><span></span></div>',
                '<div class="WebDP_BtnYear"><span></span><div class="WebDP_YearMnu"></div></div>',
                '<div class="WebDP_BtnMonth"><span></span><div class="WebDP_MonthMnu"></div></div>',
                '<div style="clear: both;"></div>',
            '</div>',
            '<div class="WebDP_Body">'
    );
},

/*
This method forwards the closing html call to the date picker object.

@param  aHtml   Stringbuilder array to which the HTML can be added.
@private
*/
closeHtml : function(aHtml){
    aHtml.push(
            '</div>'
    );
    aHtml.push(
        '<div class="WebDP_Footer"', (!this.pbShowToday ? ' style="display: none"' : ''), '>',
            '<div class="WebDP_BtnToday">', this.getWebApp().getTrans("todayIs"), ' <span></span></div>',
        '</div>'
    );

    aHtml.push(
          '</div>',
        '</div>'
    );
    
    df.WebDatePicker.base.closeHtml.call(this, aHtml);
    
    aHtml.push('</div>');
},

/*
This method forwards the after rendering call to the date picker object. It gets references to DOM
elements and attach event handlers.

@private
*/
afterRender : function(){
    //  Get reference to wrapper and focus elements
    this._eFocus = df.dom.query(this._eElem, "div.WebDatePicker_FocusHolder");
    this._eBody = df.dom.query(this._eElem, "div.WebDP_Body");
    this._eFooter = df.dom.query(this._eElem, "div.WebDP_Footer");
    this._eDispMonth = df.dom.query(this._eElem, "div.WebDP_BtnMonth > span");
    this._eDispYear = df.dom.query(this._eElem, "div.WebDP_BtnYear > span");
    this._eDispToday = df.dom.query(this._eElem, "div.WebDP_BtnToday > span");
    
    
    df.WebDatePicker.base.afterRender.call(this);
    
    
    //  Add DOM listeners
    df.dom.on("click", this._eElem, this.onWrapClick, this);
    df.dom.on("click", this._eBody, this.onBodyClick, this);
    df.dom.on("click", df.dom.query(this._eElem, "div.WebDP_BtnNext"), this.onNextClick, this);
    df.dom.on("click", df.dom.query(this._eElem, "div.WebDP_BtnPrev"), this.onPrevClick, this);
    df.dom.on("click", df.dom.query(this._eElem, "div.WebDP_BtnMonth"), this.onMonthClick, this);
    df.dom.on("click", df.dom.query(this._eElem, "div.WebDP_BtnYear"), this.onYearClick, this);
    df.dom.on("click", df.dom.query(this._eElem, "div.WebDP_BtnToday"), this.onTodayClick, this);
    
    
    if(this._eBuddy){
        this._eFocus = this._eBuddy;
    }
    df.events.addDomKeyListener(this._eFocus, this.onKey, this);
    df.dom.on("focus", this._eFocus, this.onFocus, this);
    df.dom.on("blur", this._eFocus, this.onBlur, this);
    
    this.update();
},

// - - - Server API - - - 
set_pbShowWeekNr : function(bVal){
    this.pbShowWeekNr = bVal;
    
    this.displayCalendar();
},

set_pbShowToday : function(bVal){
    if(this._eFooter){
        this._eFooter.style.display = (bVal ? "" : "none");
    }
},

set_piStartWeekAt : function(iVal){
    this.piStartWeekAt = iVal;
    
    this.update();
},
// - - - Implementation - - -

/*
This method updates the display according to the current settings. It calls displayCalendar to 
re-render the calendar and it updates the year, month and today date in the header and footer.

@private
*/
update : function(){
    if(this._eElem){
        //  Update displayed month & year
        df.dom.setText(this._eDispMonth, this._aMonthNames[this._iDisplayMonth]);
        df.dom.setText(this._eDispYear, this._iDisplayYear);
        df.dom.setText(this._eDispToday, df.sys.data.applyDateMask((new Date()), this.psMask, this.getWebApp().psDateSeparator));
        
        this.displayCalendar();
    }
},

/*
This method renders the actual calendar. It will generate the HTML of the calendar table using the 
JavaScript Date object to determine the dates. If the month has changed it will add the new table to 
the DOM and set the CSS classes so that the change can be animated using CSS3 transitions. If the 
newly generated month is the same as the previous month it simply replaces the content of the body 
element to display the newly generated month.

@private
*/
displayCalendar : function(){
    var iDay, iDayPointer, aHtml = [], sCSS, dToday, dEnd, dDate, iRows, iYear, iMonth, eNew, eOld;
    
    if(!this._eBody){
        return;
    }
    
    aHtml.push('<div><table>');
    
    //  Generate dates
    iYear = this._iDisplayYear;
    iMonth = this._iDisplayMonth;
    
    dToday = new Date();
    dDate = new Date(iYear, iMonth, 1, 1, 1, 1);
    dEnd = new Date(iYear, (iMonth + 1), 1, 1, 1, 1);
    
    //  Header
    aHtml.push('<tr class="WebDP_BodyHead">');
    if(this.pbShowWeekNr){
        aHtml.push('<th class="WebDP_WeekNr">', this.getWebApp().getTrans("wk"), '</th>');
    }
    for(iDay = 0; iDay < 7; iDay++){
        sCSS = "";
        
        iDayPointer = (iDay + this.piStartWeekAt > 6 ? iDay + this.piStartWeekAt - 7 : iDay + this.piStartWeekAt);
        if(iDayPointer === 0 || iDayPointer === 6){
            sCSS = "WebDP_Weekend";
        }
        
        aHtml.push('<th class="', sCSS, '">', this.getDay(iDay, true), '</th>');
    }
    aHtml.push('</tr>');
    
    //  Calculate start date
    iDayPointer = dDate.getDay() - this.piStartWeekAt;
    if(iDayPointer < 0){
        iDayPointer = 7 + iDayPointer;
    }
    dDate.setDate(dDate.getDate() - iDayPointer);
    iDayPointer = 0;
    iRows = 0;
    
    
    //  Loop through the days
    aHtml.push('<tr>');
    
    while(dDate < dEnd || (iDayPointer < 7 && iDayPointer !== 0) || iRows < 6){
        
    
        //  Add weeknr & correct daypointer if needed
        if(iDayPointer === 0 || iDayPointer > 6){
            if(iRows > 0){
                aHtml.push('</tr><tr>');
            }
        
            iRows++;
            if(this.pbShowWeekNr){
                aHtml.push('<td class="WebDP_WeekNr">', df.sys.data.dateToWeek(dDate), '</td>');
            }
            iDayPointer = 0;
        }
        
        //  Determine styles
        sCSS = "WebDP_Day";
        if(dDate.getMonth() !== iMonth){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Overflow";
        }
        if(dDate.getDay() === 0|| dDate.getDay() === 6){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Weekend";
        }
        if(dDate.getDate() === this._dSelected.getDate() && dDate.getMonth() === this._dSelected.getMonth() && dDate.getFullYear() === this._dSelected.getFullYear()){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Selected" + (this.bHasFocus ? " focussed" : "");
        }
        if(dDate.getDate() === dToday.getDate() && dDate.getMonth() === dToday.getMonth() && dDate.getFullYear() === dToday.getFullYear()){
            sCSS += (sCSS !== "" ? " " : "") + "WebDP_Today";
        }
        
        //  Generate day cell
        aHtml.push('<td class="', sCSS, '" data-date="', dDate.getDate(), '" data-month="', dDate.getMonth(), '" data-year="', dDate.getFullYear(), '">', dDate.getDate(), '</td>');
        
        //  Move to the next day
        dDate.setDate(dDate.getDate() + 1);
        iDayPointer++;
    }
        
    aHtml.push('</table></div>');
    
    //  Only use animation when moving to different month
    if(this._iLastDisplayYear === this._iDisplayYear && this._iLastDisplayMonth === this._iDisplayMonth){
        this._eBody.innerHTML = aHtml.join('');
    }else{
        
        //  Clean old month
        eOld = df.dom.query(this._eBody, ".WebDP_Old");
        if(eOld){
            this._eBody.removeChild(eOld);
        }
        
        //  Create new month
        eNew = df.dom.create(aHtml.join(''));
        eOld = this._eBody.firstChild;
        
        if(eOld){
            //  Fix dimensions for animation
            eOld.firstChild.style.width = eOld.firstChild.clientWidth + "px";
            eOld.firstChild.style.height = eOld.firstChild.clientHeight + "px";
            
            //  Set animation initial class
            df.dom.addClass(eOld, "WebDP_Old");
        }
        //  Add new month
        this._eBody.appendChild(eNew);
        //  Set animation target class
        if(eOld){
            df.dom.addClass(eOld, ((this._iLastDisplayYear < this._iDisplayYear ||  (this._iLastDisplayYear === this._iDisplayYear && this._iLastDisplayMonth < this._iDisplayMonth)) ? "WebDP_HideNext" : "WebDP_HidePrev"));
        }
    }
    
    this._iLastDisplayYear = this._iDisplayYear;
    this._iLastDisplayMonth = this._iDisplayMonth;
},

/*
Change the currently selected date. The calendar will be refreshed with this new date.

@param  dSelected           Date object representing the new selected date.
@param  bOptNoAni           (optional) If true no animation will shown.
@param  bOptNoDisplayNow    (optional) If true it will not go to the displayed month but stay on the 
                            currently displayed date.

*/
setSelectedDate : function(dSelected, bOptNoAni, bOptNoDisplayNow){
    //  There is always a date selected!
    if(!dSelected){
        dSelected = new Date();
        this.fireRTChange();
    }
    
    //  Remember selected date
    this._dSelected = dSelected;
    this._iWeekSelected = df.sys.data.dateToWeek(this._dSelected);
    
    if(!bOptNoDisplayNow){
        this._iDisplayYear = this._dSelected.getFullYear();
        this._iDisplayMonth = this._dSelected.getMonth();
        
        if(bOptNoAni){
            //  Als set the last displayed so we don't get the animation
            this._iLastDisplayYear = this._iDisplayYear;
            this._iLastDisplayMonth = this._iDisplayMonth;
        }
    }
    
    this.update();
},

/*
@return The currently selected date (as Date object).
*/
getSelectedDate : function(){
    return new Date(this._dSelected.valueOf());
},

/*
Translates a weekday number into the textual description. It takes the piStartWeekAt into account. 
Can return the long description and the short description.

@param  iDay    Day of the week.
@param  bShort  If true the short translation is returned.
@return The name of the day ('Mon' or 'Monday').
@private
*/
getDay : function(iDay, bShort){
    iDay += this.piStartWeekAt;
    if(iDay > 6){
        iDay = iDay - 7;
    }
    
    return (bShort ? this._aDaysShort[iDay] : this._aDaysLong[iDay]);
},

/*
This method handles the onClick event of the year pull down button. It will generate the month menu 
and has internal event handlers for hiding the menu and selecting the month. 

@param  oEvent  The event object.
@private
*/
onMonthClick : function(oEvent){
    var eMenu, tMenuTimeout, aHtml = [], i, sCSS, hide, that = this;
    
    eMenu = df.dom.query(this._eElem, "div.WebDP_MonthMnu");
    
    //  Handles the onclick which selects the month
    function onClick(oEvent){
        var eLI = oEvent.getTarget();
        
        if(eLI.getAttribute('data-month')){
            this._iDisplayMonth = parseInt(eLI.getAttribute('data-month'), 10);
            
            hide();
            this.update();
            this.focus();
            
            oEvent.stop();
        }
    }
    
    //  Clears the hide timeout when hovering the menu
    function onOver(oEvent){
        clearTimeout(tMenuTimeout);
    }
    
    //  Sets the hide timeout when leaving the menu
    function onOut(oEvent){
        clearTimeout(tMenuTimeout);
        tMenuTimeout = setTimeout(hide, 1200);
    }
    
    //  Hides the menu 
    hide = function hide(){
        //  Clear event listeners
        df.dom.off("click", eMenu, onClick, this);
        df.dom.off("mouseover", eMenu, onOver, this);
        df.dom.off("mouseout", eMenu, onOut, this);
        
        eMenu.style.display = "none";
        
        clearTimeout(tMenuTimeout);
        that._fMonthHide = null;
    };
    
    if(this._fMonthHide){
        this._fMonthHide();
    }else{
        if(this.isEnabled()){
            this._fMonthHide = hide;
            
            //  Attach event listeners
            df.dom.on("click", eMenu, onClick, this);
            df.dom.on("mouseover", eMenu, onOver, this);
            df.dom.on("mouseout", eMenu, onOut, this);
            
            //  Generate menu
            aHtml.push('<ul>');
            for(i = 0; i < 12; i++){
                sCSS = (i === this._iDisplayMonth ? "WebDP_Current" : "");
            
                aHtml.push('<li data-month="', i, '" class="', sCSS, '">', this._aMonthNames[i], '</li>');
            }
            aHtml.push('</ul');
            
            //  Display menu
            eMenu.innerHTML =  aHtml.join('');
            eMenu.style.display = "inline";
            
            tMenuTimeout = setTimeout(hide, 2400);
            
            this.focus();  
            oEvent.stop();   
        }
    }
    
    
 
},

/*
This method handles the onClick event of the year pull down button. It will generate the year menu 
and has internal event handlers for hiding the menu and scrolling it up and down. 

@param  oEvent  The event object.
@private
*/
onYearClick : function(oEvent){
    var eMenu, eUp, eDown, tMenuTimeout, tScrollTimeout, aHtml = [], i, sCSS, hide, that = this;
    
    eMenu = df.dom.query(this._eElem, "div.WebDP_YearMnu");
    
    //  Handles the onclick which selects the month
    function onClick(oEvent){
        var eLI = oEvent.getTarget();
        
        if(eLI.getAttribute('data-year')){
            this._iDisplayYear = parseInt(eLI.getAttribute('data-year'), 10);
            
            hide();
            this.update();
            this.focus();
        }
        oEvent.stop();
    }
    
    //  Clears the hide timeout when hovering the menu
    function onOver(oEvent){
        clearTimeout(tMenuTimeout);
    }
    
    //  Sets the hide timeout when leaving the menu
    function onOut(oEvent){
        tMenuTimeout = setTimeout(hide, 1200);
    }
    
    //  Scrolls the menu one year up
    function scrollUp(){
        var iYear, eNew;
        
        //  Determine new year
        iYear = eUp.nextSibling.getAttribute("data-year");
        iYear--;
        
        //  Remove old element
        eDown.parentNode.removeChild(eDown.previousSibling);
        
        //  Create and insert new element
        eNew = document.createElement("li");
        df.dom.setText(eNew, iYear);
        eNew.setAttribute("data-year", iYear);
        eUp.parentNode.insertBefore(eNew, eUp.nextSibling);
    
    }
    
    //  Scrolls the menu one year down
    function scrollDown(){
        var iYear, eNew;
        
        //  Determine new year
        iYear = eDown.previousSibling.getAttribute("data-year");
        iYear++;
        
        //  Remove old element
        eUp.parentNode.removeChild(eUp.nextSibling);
        
        //  Create and insert new element
        eNew = document.createElement("li");
        df.dom.setText(eNew, iYear);
        eNew.setAttribute("data-year", iYear);
        eDown.parentNode.insertBefore(eNew, eDown);
    }
    
    //  Initiates the menu scrolling if the button up or down is clicked
    function onScroll(oEvent){
        var fFunc, eScroll;

        //  Determine which button is clicked
        eScroll = oEvent.getTarget();
        fFunc = (eScroll === eUp ? scrollUp : scrollDown);
        
        //  Function that executes the scrolling after a timeout
        function doScroll(){
            fFunc();
            
            tScrollTimeout = setTimeout(doScroll, 35);
        }
        
        //  Perform one scroll step
        fFunc();
        
        //  Set timout
        tScrollTimeout = setTimeout(doScroll, 300);
        
        //  Display button as being held down
        df.dom.addClass(eScroll, (eScroll === eUp ? "WebDP_UpDown" : "WebDP_DownDown"));
        
        oEvent.stop();
    }
    
    //  Stops the scrolling (cancel timeout and remove CSS classes)
    function onScrollStop(oEvent){
        clearTimeout(tScrollTimeout);
        
        df.dom.removeClass(eUp, "WebDP_UpDown");
        df.dom.removeClass(eDown, "WebDP_DownDown");
        
        oEvent.stop();
    }
    
    //  Hides the menu 
    hide = function hide(){
        eMenu.style.display = "none";
        
        //  Clear event listeners
        df.dom.off("click", eMenu, onClick, this);
        df.dom.off("mouseover", eMenu, onOver, this);
        df.dom.off("mouseout", eMenu, onOut, this);
        df.dom.off("mousedown", eUp, onScroll, this);
        df.dom.off("mouseout", eUp, onScrollStop, this);
        df.dom.off("mouseup", eUp, onScrollStop, this);
        df.dom.off("mousedown", eDown, onScroll, this);
        df.dom.off("mouseout", eDown, onScrollStop, this);
        df.dom.off("mouseup", eDown, onScrollStop, this);
        
        clearTimeout(tMenuTimeout);
        that._fYearHide = null;
    };
    
    if(this._fYearHide){
        this._fYearHide();
    }else{
        if(this.isEnabled()){
            this._fYearHide = hide;
            
            //  Generate menu
            aHtml.push('<ul>');
            aHtml.push('<li class="WebDP_Up"></li>');
            
            for(i = this._iDisplayYear - 4; i < this._iDisplayYear + 4; i++){
                sCSS = (i === this._iDisplayYear ? "WebDP_Current" : "");
            
                aHtml.push('<li data-year="', i, '" class="', sCSS, '">', i, '</li>');
            }
            aHtml.push('<li class="WebDP_Down"></li>');
            aHtml.push('</ul');
            
            
            //  Display menu
            eMenu.innerHTML =  aHtml.join('');
            eMenu.style.display = "inline";
            
            //  Get references to buttons
            eUp = df.dom.query(eMenu, 'li.WebDP_Up');
            eDown = df.dom.query(eMenu, 'li.WebDP_Down');
            
            //  Attach event listeners
            df.dom.on("click", eMenu, onClick, this);
            df.dom.on("mouseover", eMenu, onOver, this);
            df.dom.on("mouseout", eMenu, onOut, this);
            df.dom.on("mousedown", eUp, onScroll, this);
            df.dom.on("mouseout", eUp, onScrollStop, this);
            df.dom.on("mouseup", eUp, onScrollStop, this);
            df.dom.on("mousedown", eDown, onScroll, this);
            df.dom.on("mouseout", eDown, onScrollStop, this);
            df.dom.on("mouseup", eDown, onScrollStop, this);  
            
            tMenuTimeout = setTimeout(hide, 2400);
            
            
            this.focus();
            oEvent.stop();
        }
    }
},

/*
Handles the onclick event of the next button. It moves to the next month.

@param  oEvent  Event object.
@private
*/
onNextClick : function(oEvent){
    if(this.isEnabled()){
        this._iDisplayMonth++;
        if(this._iDisplayMonth >= 12){
            this._iDisplayYear++;
            this._iDisplayMonth = 0;
        }
        
        this.update();
        this.focus();
        oEvent.stop();
    }
},

/*
Handles the onclick event of the next button. It moves to the next month.

@param  oEvent  Event object.
@private
*/
onPrevClick : function(oEvent){
    if(this.isEnabled()){
        this._iDisplayMonth--;
        if(this._iDisplayMonth < 0){
            this._iDisplayYear--;
            this._iDisplayMonth = 11;
        }
        
        this.update();
        this.focus();
        oEvent.stop();
    }
},

/*
Handles the click event of one of the displayed days in the calendar. It 
selects the day, repaints the calendar and fires the onChange and onEnter 
events.

@param  oEvent  Event object.
@private
*/
onBodyClick : function(oEvent){
    var eCell = oEvent.getTarget(), dDate;
    
    if(this.isEnabled()){
        if(eCell.getAttribute("data-date")){
            dDate = new Date(parseInt(eCell.getAttribute("data-year"), 10), parseInt(eCell.getAttribute("data-month"), 10),parseInt(eCell.getAttribute("data-date"), 10), 1, 1, 1);
            
            this.focus();
            this.setSelectedDate(dDate, false, false);
            this.fireRTChange();
            this.fireEnter();
            this.fireDateClick();
            oEvent.stop();
        }
    }
},

/* 
Handles click events on elements that do not handle the click. It makes sure that the proper focus 
handling is performed so that the date picker won't hide.

@param  oEvent  Event object (see: df.events.DOMEvent)
@private
*/
onWrapClick : function(oEvent){
    if(this.isEnabled()){
        this.focus();
        oEvent.stop();
    }
},

/*
Handles the click event of the "today" date. It selects the current date.

@param  oEvent  Event object.
@private
*/
onTodayClick : function(oEvent){
    if(this.isEnabled()){
        this._dSelected = new Date();
        this._iDisplayYear = this._dSelected.getFullYear();
        this._iDisplayMonth = this._dSelected.getMonth();
        
        this.focus();
        this.update();
        this.fireRTChange();
        this.fireEnter();
        this.fireDateClick();
    }
},

/*
Handles the keypress event of focus holder element. If the pressed key matches 
one of the keys that are set it performs the action.

@param  oEvent  Event object.
@private
*/
onKey : function(oEvent){
    var dDate = new Date(this._dSelected.getTime());
    
    if(!this._bBuddyActive){
        return;
    }
    
    //  Generate key object to compare
    if(this.isEnabled()){
        if(oEvent.matchKey(df.settings.calendarKeys.dayUp)){ // Up (decrement with 7 days)
            dDate.setDate(dDate.getDate() - 7);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayDown)){ //  Down (increment with 7 days)
            dDate.setDate(dDate.getDate() + 7);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayLeft)){ // Left (decrement with one day)
            dDate.setDate(dDate.getDate() - 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.dayRight)){ // Right (increment with one day)
            dDate.setDate(dDate.getDate() + 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.monthUp)){ //  Month up
            dDate.setMonth(dDate.getMonth() + 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.monthDown)){ //    Month down
            dDate.setMonth(dDate.getMonth() - 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.yearUp)){ //   Year up
            dDate.setFullYear(dDate.getFullYear() + 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.yearDown)){ // Year down
            dDate.setFullYear(dDate.getFullYear() - 1);
            this.setSelectedDate(dDate);
            this.fireRTChange();
            
            oEvent.stop();
        }else if(oEvent.matchKey(df.settings.calendarKeys.enter)){ //    Enter
            this.fireDateClick();
            
            if(!this.fireEnter()){   //  WebDateForm will cancel onEnter to stop submit
                oEvent.stop();
            }
        }
    }
},


/*
Fires the onChange event.

@private
*/
fireRTChange : function(){
    //this.onChange.fire(this, { dValue : this.getSelectedDate() });
    this.OnRealtimeChange.fire(this, { dValue : this.getSelectedDate() });
},

/*
Fires the onEnter event.

@private
*/
fireEnter : function(){
    return this.OnEnter.fire(this, { dValue : this.getSelectedDate() });
},

/* 
Fires the onDateClick event.

@private
*/
fireDateClick : function(){
    this.fire("OnDateClick", [ this.get('psValue') ]);
},

/*
Override the refreshDisplay method to update the date picker with the new value. Note that 
peDataType should be set the 'date' type.

@param  tVal    Type specific value (should be a date).
@private
*/
refreshDisplay : function(tVal){
    if(this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime){
        this.setSelectedDate(tVal, true, false);
    }
},

/*
Override the updateTypeVal method which reads the value from the display and sets it to the type 
specific property (this._tValue). Note that peDataType should be set the 'date' type.

@private
*/
updateTypeVal : function(){
    if(this.peDataType === df.ciTypeDate || this.peDataType === df.ciTypeDateTime){
        this._tValue = this.getSelectedDate();
    }
},

/*
Augments applyEnabled to disable the focus by setting the tab index.

@param  bVal    The new value.
@private
*/
applyEnabled : function(bVal){
    df.WebDatePicker.base.applyEnabled.call(this, bVal);
    
    if(this._eFocus){
        df.dom.setTabIndex(this._eFocus, (bVal ? 0 : -1));
    }
},
// - - - - - - - Focus - - - - - - -

/*
We override the focus method and make it give the focus to the hidden focus holder element.

@return True if the List can take the focus.
*/
focus : function(){
    if(this._bFocusAble && this.isEnabled() && this._eFocus){
        this._eFocus.focus();
        this._bLozingFocus = false;
        
        this.objFocus();
        return true;
    }
    return false;
},

/*
Override the onFocus method and manually display the calendar as focused. The onBlur will remove the 
focus after a timeout (since the onBlur also fires when performing an action within the control). So 
we have set _bLozingFocus to false to make sure that this doesn't happen when the timer fires.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onFocus : function(oEvent){
    if(!this._bBuddyActive){
        return;
    }
    
    if(this._bFocusAble && this.isEnabled() && this._eFocus){
        this.objFocus();
    
        if(this._eElem){
            df.dom.addClass(this._eElem, "WebCon_Focus");
        }
        
        this._bHasFocus = true;
        this._bLozingFocus = false;
    }
},

/*
Override the onBlur method and manually display the calendar as blurred. We do this after a short 
timeout because the onBlur also fires when performing an action within the calendar. So onFocus can 
cancel the blur action when being fired within this timeout.

@param  oEvent  Event object (see: df.events.DOMEvent).
@private
*/
onBlur : function(oEvent){
    var that = this;
    
    if(!this._bBuddyActive){
        return;
    }
    
    this._bLozingFocus = true;

    this.fireChange();
    
    setTimeout(function(){
        if(that._bLozingFocus){
            //  Do not forward send as it potentially causes the value to be reset by refreshDisplay which makes the calendar go back to its displayed date
            that.updateTypeVal();
    
            that.fireAutoFind();
            
            if(that._eElem){
                df.dom.removeClass(that._eElem, "WebCon_Focus");
            }  
            
            that._bLozingFocus = false;
        }
    }, 100);
}

});




