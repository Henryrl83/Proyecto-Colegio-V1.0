/*
Name:
df.sys
Type:
    Library(object)

Revisions:
    2005/09/01  Created the initial version with a basic set of browser
    independent functions. (HW, DAE)

    2006/11/05  Restructured into dom, events, data, gui categories. (HW, DAE)

    2007/12/14  Converted into 2.0 structure. It is now called df.sys and the
    events functionallity is moved to a separate df.events version. (HW, DAE)

*/
/* global df */
/*
An important part of the Visual DataFlex AJAX Library is the layer that is build
between the browser and the engine. Its main goal is to straighten out the
differences between the supported browsers. It contains a lot of functionality
that cover the various parts of client side web development.
*/

df.sys = {

/*
If true the browser is supposed to be safari or part of the safari family.
*/
isSafari : false,
/*
True if the browser seems to be Google Chrome.
*/
isChrome : false,
/*
True if the browser seems to be Opera.
*/
isOpera : false,
/*
If true the browser is supposed to be part of the mozilla family (usually
FireFox).
*/
isMoz : false,
/*
True if the browser seems to be Internet Explorer. Also true if we where not
able to detect the browser type properly (if browser unknown threat it as IE
policy).
*/
isIE : false,
/* 
True if the browser seems to be Microsoft Edge.
*/
isEdge : false,
/*
True if the WebKit layout engine is used (Safari & Chrome).
*/
isWebkit : false,

isMobile : false,
isIOS : false,

/*
Indicates the browser version.
*/
iVersion : 0,

/*
The reflection library contains functionality related to prototypes, objects
and functions. Some of this functionality is closely related to the Visual DataFlex
AJAX Library and might not work on objects from outside the library.
*/
ref : {

/*
Determines the object type using "typeof" and for objects it tries to determine
the constructorname.

@param  oObject     Reference to the object of which the type should be determined.
@return The type of the object ("object", "function", "array", "undefined", ..).
*/
getType : function(oObject){
    var sType = typeof(oObject);

    if(sType === "object"){
        if(oObject === null || oObject === undefined){
            sType = "null";
        }else if(oObject.constructor === Array){
            sType = "array";
        }else if(oObject.constructor === Date){
            sType = "date";
        }else{
            sType = this.getConstructorName(oObject);
        }
    }

    return sType;
},

/*
It tries to determine the name of the constructor of the object. If the
constructor is not found "object" is returned.

@param  oObject     Reference to the object of which we want to determine the
        constructor name.
@return String with the constructorname ("object" if not found).
*/
getConstructorName : function(oObject){
    var sName = this.getMethodName(oObject.constructor);

    if(sName === ""){
        sName = "object";
    }

    return sName;
},

/*
Determines the name of the given function by converting the function its string
definition.

@param  fFunction   Reference to the function.
@return Name of the function ("unknownType" if not able to determine).
*/
getMethodName : function(fFunction){
    var sString;

    try {
        sString = fFunction.toString();
        return sString.substring(sString.indexOf("function") + 8, sString.indexOf('(')).replace(/ /g,'');
    }catch(e){
        return "";
    }
},

/*
Determines the global scope object. Within browsers this usually is the window
object.

@return Reference to the global scope object.
*/
getGlobalObj : function(){
    return window;
},

/*
Finds the (nested) object property by a path string (like "df.core.List")
without using an eval. Always starts at the global object.

@param  sPath   Path to the property (like "df.core.List").
@return The property (null if not found).
*/
getNestedProp : function(sPath){
    var aParts, oProp, iPart;

    //  Split into parts
    aParts = sPath.split(".");

    //  We start our search at the global object
    oProp = df.sys.ref.getGlobalObj();

    //  Loop through parts and object properties
    for(iPart = 0; iPart < aParts.length; iPart++){
        if(typeof oProp === "object" && oProp !== null){
            oProp = oProp[aParts[iPart]];
        }else{
            return null;
        }
    }

    return oProp;
}

},

/*
The math library contains functionality to perform calculations.
*/
math : {
/*
Fills out the given number with zero's until it has the required amount of digits.

@param  iNum    Number to convert.
@param  iDigits Number of digits.
@return String with the number outfilled with zero's.
*/
padZero : function(iNum, iDigits)
{
    var sResult = iNum.toString();

    while(sResult.length < iDigits){
        sResult = "0" + sResult;
    }

    return sResult;
},

isNumeric : function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

},

/*
Functionality for data conversions and other data related functions.
*/
data : {

/*
Parses a string into a number using the correct thousands and decimal separator.

@param  sVal            String containing the number to parse.
@param  sDecSep        The decimal separator used.
@param  sOptThousSepp   (optional) The thousands separator used.
@return Number.

*/
stringToNum : function(sVal, sDecSep, sOptThousSepp){
    return sVal && parseFloat(sVal.replace(sOptThousSepp || "", "").replace(sDecSep, "."));
},

/*
This method converts a numeric value to a string using the decimal separator that is configured.

@param  nVal        The numeric value.
@param  sDecSep     The decimal separator used.
@param  iPrecision  Number of decimals.
@return The string with the number.
@private
*/
numToString : function(nVal, sDecSep, iPrecision){
    var aVal, sVal;
    
    //  Make sure that we have a number
    nVal = nVal || 0.0;
    
    //  Parse to string
    sVal = nVal.toString().replace(".", sDecSep);
    
    //  Format
    if(iPrecision > 0){
        aVal = sVal.split(sDecSep);
        
        if(aVal.length < 2){
            aVal[1] = "";
        }
        aVal[1] = (aVal[1] + "0000000000000000000").substr(0, iPrecision);
        
        sVal = aVal[0] + sDecSep + aVal[1];
    }
        
    
    return sVal;
},

/*
Applies the date mask on the date.

@param  dValue          The date object.
@param  sMask           The mask string.
@param  sDateSeparator  Separator character that will be used in the date mask.
@return String with the masked data.
*/
applyDateMask : function(dValue, sMask, sDateSeparator, sOptTimeSeparator){
    var bMinute = false;
    
    return sMask.replace(/(m{1,4}|d{1,4}|yyyy|yy|\/|hh|ss|fff|f|\:)/gi, function (sValue, iPos){

        switch(sValue.toLowerCase()){
            case "m":
                bMinute = true;
                return dValue.getMonth() + 1;
            case "mm":
                if(bMinute){
                    bMinute = false;
                    return df.sys.math.padZero(dValue.getMinutes(), 2);
                }
                bMinute = true;
                return df.sys.math.padZero(dValue.getMonth() + 1, 2);
            case "mmm":
                bMinute = true;
                return df.sys.string.copyCase(df.lang.monthsShort[dValue.getMonth()], sValue);
            case "mmmm":
                bMinute = true;
                return df.sys.string.copyCase(df.lang.monthsLong[dValue.getMonth()], sValue);

            case "d":
                bMinute = false;
                return dValue.getDate();
            case "dd":
                bMinute = false;
                return df.sys.math.padZero(dValue.getDate(), 2);
            case "ddd":
                bMinute = false;
                return df.sys.string.copyCase(df.lang.daysShort[dValue.getDay()], sValue);
            case "dddd":
                bMinute = false;
                return df.sys.string.copyCase(df.lang.daysLong[dValue.getDay()], sValue);

            case "yy":
                bMinute = false;
                return df.sys.math.padZero(dValue.getFullYear() % 100, 2);
            case "yyyy":
                bMinute = false;
                return df.sys.math.padZero(dValue.getFullYear(), 4);

            case "/":
                bMinute = false;
                return sDateSeparator;
                
            case "hh":
                bMinute = true;
                return df.sys.math.padZero(dValue.getHours(), 2);
            case "ss":
                bMinute = true;
                return df.sys.math.padZero(dValue.getSeconds(), 2);
            case "f":
                bMinute = true;
                return dValue.getMilliseconds();
            case "fff":
                bMinute = true;
                return df.sys.math.padZero(dValue.getMilliseconds(), 3);
            case ":":
                bMinute = true;
                return sOptTimeSeparator || ":";
        }

        return sValue;
    });
},

/*
This method applies a numeric mask to a number. 

@param  nValue      Value as a number.
@param  sMask       The mask string.
@param  sDecSep     The decimal separator to use.
@param  sThousSep   The thousands separator to use.
@param  sCurSym     The currency symbol to use.
@return The string containing the masked number.
*/
applyNumMask : function(nValue, sMask, sDecSep, sThousSep, sCurSym){
    var aParts, aResult = [], sChar, bEscape, iChar, iNumChar, iCount, sBefore, sDecimals, 
        sMaskBefore, sMaskDecimals = null, sValue, iMaskBefore = 0, iMaskDecimals = 0, 
        bThousands = false, bBefore = true; 
    
    // Replace &curren;
    sMask = sMask.replace(/&curren;/g, sCurSym);
    
    //  Zero suppress (indicated by the "Z" as first mask character)
    if(sMask.charAt(0) === "Z"){
        if(nValue === 0.0){
            return "";
        }
        sMask = sMask.substr(1);
    }
    
    //  Determine which mask to use :D
    aParts = sMask.split(";");
    if(nValue < 0.0){
        if(aParts.length > 1){
            sMask = aParts[1];
        }else{
            sMask = "-" + aParts[0];
        }
    }else{
        sMask = aParts[0];
    }

    //  Split into before and and after decimal separator
    aParts = sMask.split(".");
    sMaskBefore = aParts[0];
    if(aParts.length > 1){
        sMaskDecimals = aParts[1];
    }

    
    //  Pre process mask
    for(iChar = 0; iChar < sMask.length; iChar++){
        switch(sMask.charAt(iChar)){
            case "\\":
                iChar++;
                break;
            case "#":
            case "0":
                if(bBefore){
                    if(iMaskBefore >= 0){
                        iMaskBefore++;
                    }
                }else{
                    if(iMaskDecimals >= 0){
                        iMaskDecimals++;
                    }
                }
                break;
            case "*":
                if(bBefore){
                    iMaskBefore = -1;
                }else{
                    iMaskDecimals = -1;
                }
                break;
            case ",":
                bThousands = true;
                break;
            case ".":
                bBefore = false;
                break;
        }
    }
    
    //  Convert number into string with number before and numbers after
    if(iMaskDecimals >= 0){
        nValue = nValue.toFixed(iMaskDecimals);
    }
    sValue = (nValue === 0.0 ? "" : String(nValue));
    aParts = sValue.split(".");
    sBefore = aParts[0];
    if(aParts.length > 1){
        sDecimals = aParts[1];
    }else{
        sDecimals = "";
    }
    if(sBefore.charAt(0) === "-"){
        sBefore = sBefore.substr(1);
    }
    
    //  BEFORE DECIMAL SEPARATOR
    iChar = sMaskBefore.length - 1;
    iNumChar = sBefore.length - 1;
    iCount = 0;
    while(iChar >= 0){
        sChar = sMaskBefore.charAt(iChar);
        bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
        
        if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
            while(iNumChar >= 0 || sChar === "0"){
                //  Append thousands separator if needed
                if(iCount >= 3){
                    iCount = 0;
                    if(bThousands){
                        aResult.unshift(sThousSep);
                    }
                }
                
                //  Append number
                aResult.unshift((iNumChar >= 0 ? sBefore.charAt(iNumChar) : "0"));
                iNumChar--;
                iCount++;
                
                //  Break out for non repeative characters
                if(sChar === "#" || sChar === "0"){
                    break;
                }
            }
        }else{
            // if(sChar === "$" && !bEscape){
                // sChar = sCurSym;
            // }
            if((sChar !== "," && sChar !== "\\") || bEscape){
                aResult.unshift(sChar);
            }
        }
        iChar--;
    }
    
    //  AFTER DECIMAL SEPARATOR
    if(sMaskDecimals !== null){
        
        let aAfter = [];
        
        iNumChar = 0;
        for(iChar = 0; iChar < sMaskDecimals.length; iChar++){
            sChar = sMaskDecimals.charAt(iChar);
            bEscape = (iChar > 0 && sMaskBefore.charAt(iChar - 1) === "\\");
            
           
            if(!bEscape && (sChar === "#" || sChar === "*" || sChar === "0")){
                while(iNumChar < sDecimals.length || sChar === "0"){
                    //  Append number
                    aAfter.push((iNumChar >= 0 ? sDecimals.charAt(iNumChar) : "0"));
                    iNumChar++;
                    
                    //  Break out for non repeative characters
                    if(sChar === "#" || sChar === "0"){
                        break;
                    }
                }
            }else{
                // if(sChar === "$" && !bEscape){
                    // sChar = sCurSym;
                // }
                if(sChar !== "\\" || bEscape){
                    aAfter.push(sChar);
                }
            }
        }

        if(aAfter.length){
            aResult.push(sDecSep, aAfter.join(""));
        }
    }
    
    return aResult.join("");
},

/*
Applies the windows mask the to the value by adding the mask characters. If 
the value doesn't matches the mask the value isn't completely displayed.

Params:
    sValue  Value to apply the mask on.
Returns:
    Masked value.
*/
applyWinMask : function(sValue, sMask){
    var iChar = 0, iValChar = 0, aResult = [], bFound, sChar;
    
    if(sValue === ""){
        return "";
    }
    if(sMask === ""){
        return sValue;
    }
    
    while(iChar < sMask.length){
        sChar = sMask.charAt(iChar);
        
        if(sChar === "\\" && sMask.length > (iChar + 1)){
            aResult.push(sMask.charAt(iChar + 1));
        }else{
            if(sChar === "#" || sChar === "@" || sChar === "!" || sChar === "*"){
                bFound = false;
                while(iValChar < sValue.length && !bFound){
                    if(this.acceptWinMaskChar(sValue.charAt(iValChar), sChar)){
                        aResult.push(sValue.charAt(iValChar));
                        bFound = true;
                    }
                    iValChar++;
                }
                if(!bFound){
                    break;
                }
            }else{
                //  Append mask display character
                aResult.push(sChar);
            }
        }
        iChar++;
    }
    
    return aResult.join("");
},

/*
Checks if the given character is allowed at the given position for windows 
masks.

Params:
    sChar   Character to check.
    iPos    Position to check. 
Returns:
    True if the character is allowed at the given position.

@private
*/
acceptWinMaskChar : function(sValChar, sChar){
    return ((sChar === "#" && sValChar.match(/[0-9]/)) ||
        (sChar === "@" && sValChar.match(/[a-zA-Z]/)) ||
        (sChar === "!" && sValChar.match(/[^a-zA-Z0-9]/)) ||
        sChar === "*");
},

/*
Parses a date or datetime string into a date object.

@param  sValue          String date (that confirms the format).
@param  sFormat         Date format (basic date format).
@return Date object representing the date (returns null if no value given).
*/
stringToDate : function(sValue, sFormat){
    var aValues = [], aFormat = [], bMinute = false, i, sV, iDate = 0, iMonth = 0, iYear = 0, iHour = 0, iSecond = 0, iMinute = 0, iFraction = 0, dToday = new Date(), dResult;
    
    //  Empty string return null.
    if(sValue.trim() === ""){
        return null;
    }
    
    //  Parse the values into an array
    aValues = sValue.split(/[^0-9]+/gi);
    
    //  Parse the format into an array
    aFormat = sFormat.split(/[^mdyhmsf]+/gi);

    //  Loop over values and put into the right variable
    for(i = 0; i < aValues.length; i++){
        sV = aValues[i];
        switch(aFormat[i]){
            case "d":
            case "dd":
                iDate = parseInt(sV, 10);
                bMinute = false;
                break;
            case "m":
                iMonth = parseInt(sV, 10);
                bMinute = true;
                break;
            case "mm":
                if(bMinute){
                    iMinute = parseInt(sV, 10);
                }else{
                    iMonth = parseInt(sV, 10);
                }
                break;
            case "yy":
            case "yyyy":
                iYear = parseInt(sV, 10);
                if(sV.length === 2){
                    iYear = (iYear > 50 ? iYear + 1900 : iYear + 2000);
                }else if(sV.length === 0){
                    iYear = dToday.getFullYear();
                }
                bMinute = false;
                break;
            case "hh":
                iHour = parseInt(sV, 10);
                bMinute = true;
                break;
            case "ss":
                iSecond = parseInt(sV, 10);
                bMinute = true;
                break;
            case "f":
            case "fff":
                iFraction = parseInt(sV, 10);
                break;
        }
    }
    
    //  Validate values
    if(!iYear){
        iYear = dToday.getFullYear();
    }else{
        iYear = (iYear > 0 ? (iYear < 9999 ? iYear : 9999) : 0);
    }
    if(!iMonth){
        iMonth = dToday.getMonth();
    }else{
        iMonth = (iMonth > 0 ? (iMonth <= 12 ? iMonth - 1 : 11) : 0);
    }
    if(!iDate){
        iDate = dToday.getDate();
    }else{
        iDate = (iDate > 0 ? (iDate <= 32 ? iDate : 31) : 1);
    }
    
    iHour = (iHour > 0 ? (iHour <= 23 ? iHour : (iHour === 24 ? 0 : 23)) : 0);
    iMinute = (iMinute > 0 ? (iMinute < 60 ? iMinute : 59) : 0);
    iSecond = (iSecond > 0 ? (iSecond < 60 ? iSecond : 59) : 0);
    iFraction = (iFraction > 0 ? (iFraction < 999 ? iFraction : 999) : 0);
    
    //  Set the determined values to the new data object, decrement if to high
    dResult = new Date(iYear, iMonth, iDate, iHour, iMinute, iSecond, iFraction);
    while(dResult.getMonth() !== iMonth){
        iDate--;
        dResult = new Date(iYear, iMonth, iDate, iHour, iMinute, iSecond, iFraction);
    }
    
    return dResult;
},

/*
Generates a string for the given date using the given format.

@param  dValue      Data object.
@param  sFormat     Date format (basic date format).
@return String representing the given date.
*/
dateToString : function(dValue, sFormat, sDateSeparator){
    return this.applyDateMask(dValue, sFormat, sDateSeparator || "/");
},

/*
Determines the week number of the given date object.

@param  dDate   Date object.
@return The week number.
*/
dateToWeek : function(dDate) {
    var week1, date;

    date = new Date(dDate.getTime());

    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
},

/*
Loops through the array and removes all items that match the given object.

@param  aArray  Reference to the array.
@param  oObj    Object reference or value to remove.
*/
removeFromArray : function(aArray, oObj){
    var i;
    
    for(i = 0; i < aArray.length; i++){
        if(aArray[i] === oObj){
            aArray.splice(i, 1);
        }
    }
},

/*
Expression used by the format method.

@private
*/
formatRegExp : /\{\{([0-9a-zA-Z]+)\}\}/gi,
/*
Formats a string based on a past object or array. Markers {{prop}} will be replaced with properties 
from the passed object or array. 

@code
sStr = df.sys.data.format('Hi {{name}}!', { name : 'John' }); // sStr will contain 'Hi John!'
sStr = df.sys.data.format('The {{0}} and {{1}}!', [ 'first', 'second' ]); // sStr will contain 'The first and second'
@code

@param  sStr    String containing markers to replace.
@param  oReps   Object or array containing properties to replace markers with.
@return Formatted string.
*/
format : function(sStr, oReps){
    var reps = oReps || { };
    
    
    return sStr.replace(this.formatRegExp, function(str, p1, offset, s){
        if(reps.hasOwnProperty(p1)){
            return reps[p1];
        }
        return str;
    });
},

/*
Properly formats a data size in the appropriate unit (like 131 kB or 15.4 MB or 900 GB).

@param  iBytes      The data size in bytes.
@return String containing the formatted size.
*/
markupDataSize : function(iBytes){
    var nVal;
    
    if (iBytes < 1024){
        return iBytes + " B";
    }
    
    //  kilobytes
    nVal = iBytes / 1024;
    if(nVal < 2048){
        return Math.round(nVal) + " kB";
    }
   
    //   megabytes
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " MB";
        }
        return Math.round(nVal) + " MB";
    }
    
    //  gigabytes
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " GB";
        }
        return Math.round(nVal) + " GB";
    }
    
    //  terabyte
    nVal = nVal / 1024;
    if(nVal < 2048){
        if(nVal < 100){
            return ((Math.round(nVal) * 10) / 10) + " TB";
        }
        return Math.round(nVal) + " TB";
    }
    
    //  petabyte
    nVal = nVal / 1024;
    if(nVal < 100){
        return ((Math.round(nVal) * 10) / 10) + " PB";
    }
    return Math.round(nVal) + " PB";

},

/* 
Escapes a string for safe usage within a regular expression.

@param  sStr    The string to escape.
@return Escaped string.
*/
escapeRegExp : function(sStr) {
  return sStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
},

/*
Comparison function used by the sortData function that compares text columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return Negative number if sVal1 < sVal2, positive for sVal1 > sVal2 and 0 when equal.

@private
*/
compareText : function(sVal1, sVal2){
    return sVal1.localeCompare(sVal2);
},
compareRevText : function(sVal1, sVal2){
    return -(sVal1.localeCompare(sVal2));
},


/*
Comparison function used by the sortData function that compares numeric columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 > sVal2 and 0 when equal.

@private
*/
compareBCD : function(sVal1, sVal2){
    return parseFloat(sVal1) - parseFloat(sVal2);
},
compareRevBCD : function(sVal1, sVal2){
    return -(parseFloat(sVal1) - parseFloat(sVal2));
},


/*
Comparison function used by the sortData function that compares date columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 >= sVal2.

@private
*/
compareDate : function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "yyyy/mm/dd", "-") < df.sys.data.stringToDate(sVal2, "yyyy/mm/dd", "-") ? -1 : 1;
},
compareRevDate : function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "yyyy/mm/dd", "-") < df.sys.data.stringToDate(sVal2, "yyyy/mm/dd", "-") ? 1 : -1;
},



/*
Comparison function used by the sortData function that compares date columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 >= sVal2.

@private
*/
compareDateTime : function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "yyyy/mm/ddThh:mm:ss.fff", "-") < df.sys.data.stringToDate(sVal2, "yyyy/mm/ddThh:mm:ss.fff", "-") ? -1 : 1;
},
compareRevDateTime : function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "yyyy/mm/ddThh:mm:ss.fff", "-") < df.sys.data.stringToDate(sVal2, "yyyy/mm/ddThh:mm:ss.fff", "-") ? 1 : -1;
},



/*
Comparison function used by the sortData function that compares date columns.

@param  sVal1   First string value.
@param  sVal2   Second string value.
@return -1 if sVal1 < sVal2, 1 if sVal1 >= sVal2.

@private
*/
compareTime: function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "hh:mm:ss", "-") < df.sys.data.stringToDate(sVal2, "hh:mm:ss", "-") ? -1 : 1;
},
compareRevTime: function(sVal1, sVal2){
    if (sVal1 == sVal2) return 0;
    return df.sys.data.stringToDate(sVal1, "hh:mm:ss", "-") < df.sys.data.stringToDate(sVal2, "hh:mm:ss", "-") ? 1 : -1;
},


/* 
Returns the right comparison function based on the passed data type (ciTypeBCD, ciTypeDate, ..).

@param  eDataType   Integer indicating the data type.
@return Function that properly compares both type for usage within sorting algoritms (can be passed 
        to Array.sort).
*/
compareFunction : function(eDataType, bRev){
    switch(eDataType){
        case df.ciTypeBCD:
            return (bRev ? this.compareRevBCD : this.compareBCD);
        case df.ciTypeDate:
            return (bRev ? this.compareRevDate : this.compareDate);
        case df.ciTypeDateTime:
            return (bRev ? this.compareRevDateTime : this.compareDateTime);
        case df.ciTypeTime:
            return (bRev ? this.compareRevTime : this.compareTime);
        default:
            return (bRev ? this.compareRevText : this.compareText);
    }
},

/*
This method determines the type specific value with a new value which is usually received from the 
server. The value is supplied in the 'server format' and is parsed into the private type specific 
value.

@param  sVal     The new value provided in the 'server format'.
@param eDataType The datatype that sVal needs to be converted to.
@return The type specific value (date object or number).
@private
*/
serverToType : function(sVal, eDataType){
    var tVal = sVal;
    
    if(eDataType === df.ciTypeBCD){
        tVal = df.sys.data.stringToNum(sVal, "."); 
    }else if(eDataType === df.ciTypeDate){
        tVal = df.sys.data.stringToDate(sVal, "yyyy/mm/dd", "-");
    }else if(eDataType === df.ciTypeDateTime){
        tVal = df.sys.data.stringToDate(sVal, "yyyy/mm/ddThh:mm:ss.fff");
    }else if(eDataType === df.ciTypeTime){
        tVal = df.sys.data.stringToDate(sVal, "hh:mm:ss");
    }
    
    return tVal;
},

/*
This method converts a type specific value to a display value.

@param  tVal        Value in type specific format (number or date object).
@param  eDataType   Indicates the type to convert the value to.
@param  oWebApp     Indicates the webapp context for fetching locale.
@param  bInputMask  Indicates whether the applied mask should be the one used in edit/input mode (focus).
@param  sMask       Indicates the mask to apply to the value.
@param  iPrecision  Indicates the precision of double (e.g. 1.234) if no mask is applied.

@return String with the display value.
*/
typeToDisplay : function(tVal, eDataType, oWebApp, bInputMask, sMask, iPrecision){
    var sVal = tVal;

    if(!bInputMask && sMask && eDataType !== df.ciTypeText){    //  If the field doesn't have the focus we need to apply a mask
        if(eDataType === df.ciTypeDate || eDataType === df.ciTypeDateTime || eDataType === df.ciTypeTime){ // Date mask
            sVal = (tVal && df.sys.data.applyDateMask(tVal, sMask, oWebApp.psDateSeparator, oWebApp.psTimeSeparator)) || "";
        }else if(eDataType === df.ciTypeBCD){ // Numeric mask
            sVal = (tVal !== null && df.sys.data.applyNumMask(tVal || 0.0, sMask, oWebApp.psDecimalSeparator, oWebApp.psThousandsSeparator, oWebApp.psCurrencySymbol)) || "";
        }
    }else if(sMask && eDataType === df.ciTypeText){  //  Window mask
            sVal = df.sys.data.applyWinMask(sVal, sMask);
    }else{  //  No mask
        if(tVal !== ""){    // Leave blank value alone
            if(eDataType === df.ciTypeBCD){   //  Plain number
                sVal = (tVal !== null && df.sys.data.numToString(tVal, oWebApp.psDecimalSeparator, iPrecision));
            }else if(eDataType === df.ciTypeDate){   //  Plain date
                sVal = (tVal && df.sys.data.dateToString(tVal, oWebApp.psDateFormat, oWebApp.psDateSeparator, oWebApp.psTimeSeparator)) || "";
            }else if(eDataType === df.ciTypeDateTime){   //  Plain date time
                sVal = (tVal && df.sys.data.dateToString(tVal, oWebApp.psDateTimeFormat, oWebApp.psDateSeparator, oWebApp.psTimeSeparator)) || "";
            }else if(eDataType === df.ciTypeTime){   //  Plain time
                sVal = (tVal && df.sys.data.dateToString(tVal, oWebApp.psTimeFormat, oWebApp.psDateSeparator, oWebApp.psTimeSeparator)) || "";
            }
        }
    }
    
    return sVal;
}

},

/*
Functions that ease the access of cookies.
*/
cookie : {

/*
Places a cookie.

@param  sVar            Name of cookie variable.
@param  sValue            Value of cookie variable.
@param  iExpires        Determines when the cookie expires in hours from right now.
@param  sOptPath        Optional path for which the cookie should be stored. Use '/' for the entire 
                        domain.
*/
set : function(sVar, sValue, iExpires, sOptPath){
    var date = new Date(), sParams = ""; 
    
    if(iExpires){
        date.setHours(date.getHours() + iExpires);
        sParams += "; expires=" + date.toGMTString();
    }
    
    if(sOptPath){
        sParams += "; path=" + sOptPath;
    }
        
    document.cookie = sVar + "=" + sValue + sParams;
},

/*
Removes cookie by expiring.

@param  sVar    Name of cookie variable.
*/
del : function(sVar){
    var date = new Date();
    
    date.setTime(date.getTime()-1);

    document.cookie = sVar + "=; expires=" + date.toGMTString();        
},

/*
Fetches cookie value.

@param  sVar        Name of cookie variable.
@param  sDefault    Variable to return when not found.
@return Value of the cookie variable (sDefault if not found).
*/
get : function(sVar, sDefault){
    var sResult = null, aVars, aVar, iVar;
    
    if(document.cookie){
        aVars = document.cookie.split(';');
        
        for(iVar = 0; iVar < aVars.length && sResult === null; iVar++){
            aVar = aVars[iVar].split('=');
            
            if(aVar.length > 1){
                if(aVar[0].trim() === sVar.trim()){
                    sResult = aVar[1];    
                }
            }
        }
    }
    
    if(sResult !== null){
        return sResult;
    }
    return sDefault;
}


},

/*
Functionality to create graphical components.
*/
gui : {

/*
Finds all the child elements of the given element that can be focussed and
disables the tabindex by setting a negative value.

@param  eParent    DOM element to search.
*/
disableTabIndexes : function(eParent){
    var iElem, aElems, eElem;

    aElems = df.dom.query(eParent, df.dom.cFocusSelector, true);

    for(iElem = 0; iElem < aElems.length; iElem++){
        eElem = aElems[iElem];
    
        if(eElem.getAttribute("data-dfOrigTabIndex") === null){
            eElem.setAttribute("data-dfTabIndexCount", 1);
            eElem.setAttribute("data-dfOrigTabIndex", eElem.tabIndex);
            eElem.tabIndex = "-1";
        }else{
            eElem.setAttribute("data-dfTabIndexCount", parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) + 1);
        }
    }
},

/*
Finds all the child elements of the given element that can contain tabs and
restores their tabindex (if it is modified by by the disableTabIndex method).

@param   eParent    DOM element to search.
*/
restoreTabIndexes : function(eParent){
    var iElem, aElems, eElem;
    
    aElems = df.dom.query(eParent, df.dom.cFocusSelector, true);

    for(iElem = 0; iElem < aElems.length; iElem++){
        eElem = aElems[iElem];
        if(parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) !== null){
            if(eElem.getAttribute("data-dfTabIndexCount") <= 1){
                eElem.tabIndex = eElem.getAttribute("data-dfOrigTabIndex");
                eElem.removeAttribute("data-dfOrigTabIndex");
                eElem.removeAttribute("data-dfTabIndexCount");
            }else{
                eElem.setAttribute("data-dfTabIndexCount", parseInt(eElem.getAttribute("data-dfTabIndexCount"), 10) - 1);
            }
        }
    }
},

/*
Hides plugins inside the element in Internet Explorer by removing them from the document object 
model. Internet Explorer has problems doing that by itself.  It will return an array with 
information which can be used to restore the elements into the DOM. 

@param  eElem    The element to search.
@return Array with details for restorePlugins.
*/
hidePlugins : function(eElem){
    var aElems, i, aHidden = [];
    
    //  Only for Internet Explorer
    if(df.sys.isIE){
        //  Find problematic elements
        aElems = df.dom.query(eElem, "iframe, object, embed", true);
        
        for(i = 0; i < aElems.length; i++){
            eElem = aElems[i];
            
            //  Check if not already hidden
            if(eElem.getAttribute("data-df-hiddenplugin") !== "yes"){
                
                //  Remember
                aHidden.push(eElem);
                
                //  Hide
                eElem.style.display = "none";
                
                //  Mark as already hidden
                eElem.setAttribute("data-df-hiddenplugin", "yes");
            }
        }
    }
    
    return aHidden;
},

/*
Restores plugin elements that are hidden by hidePlugins. It inserts the elements back into the DOM 
based on the passed details.

@param  aHidden     Details of the hidden elements as it is returned by hidePlugins.
*/
restorePlugins : function(aHidden){
    var i;
    
    for(i = 0; i < aHidden.length; i++){
        //  Display
        aHidden[i].style.display = "";
        
        //  Unmark
        aHidden[i].removeAttribute("data-df-hiddenplugin");
    }
},


/*
Bubbles up in the dom measuring the total offsets until the next absolute
(or fixed) positioned element in the DOM. This is are values that can be used
as the style.left and style.top to position an absolute (or fixed) element on
the same position.

@param  eElement The object to get offset(s) from.
@return Object { top : 500, left : 500 } with the offset values.
*/
getAbsoluteOffset : function(eElement){
    var oReturn = { left : 0, top : 0 }, bFirst = true;

    if (eElement.offsetParent){
        while (eElement && (bFirst || df.sys.gui.getCurrentStyle(eElement).position !== "absolute") && df.sys.gui.getCurrentStyle(eElement).position !== "fixed" && df.sys.gui.getCurrentStyle(eElement).position !== "relative"){
            bFirst = false;
            oReturn.top += eElement.offsetTop;
            oReturn.left += eElement.offsetLeft;
            eElement = eElement.offsetParent;
        }
    }else if (eElement.y){
        oReturn.left += eElement.x;
        oReturn.top += eElement.y;
    }

    return oReturn;

},

/*
@return The full display width (of the frame / window).
*/
getViewportHeight : function(){
    if (window.innerHeight !== undefined){
        return window.innerHeight;
    }

    if (document.compatMode === "CSS1Compat"){
        return document.documentElement.clientHeight;
    }
    if (document.body){
        return document.body.clientHeight;
    }
    return null;
},

/*
@return The full display height (of the frame / window).
*/
getViewportWidth : function(){
    if (document.compatMode === 'CSS1Compat'){
        return document.documentElement.clientWidth;
    }
    if (document.body){
        return document.body.clientWidth;
    }
    if (window.innerWidth !== undefined){
        return window.innerWidth;
    }
    
    return null;
},

/*
Determines the 'real size' of the element.

@return Object with width and height property.
*/
getSize : function(eElem){
    if(df.sys.isIE || df.sys.isWebkit){
        return { width : eElem.offsetWidth, height : eElem.offsetHeight };
    }
    var oStyle = df.sys.gui.getCurrentStyle(eElem);
    return { width : parseInt(oStyle.getPropertyValue("width"), 10), height : parseInt(oStyle.getPropertyValue("height"), 10) };
},


/*
Returns the current or computed style of the DOM element.

@param  eElem    Reference to a DOM element.
@return The browsers current style element.
*/
getCurrentStyle : function(eElem){
    return (typeof(window.getComputedStyle) === "function" ? window.getComputedStyle(eElem, null) : eElem.currentStyle);
},


/*
Calculates the vertical space consumed by margin, padding and border by querying the browser its 
calculated css values. Several combinations of padding, margin and border values are available as 
different modes.

0 = all (padding + margin + border)
1 = outside (margin + border) 
2 = inside (padding) 
3 = outside border box (margin only)

@param  iOptType    (optional) The mode to use, if not provided mode 0 is used.
@return The total number of pixels consumed by the specified parts of the box model.
*/
getVertBoxDiff : function(eElem, iOptType){
    var iDiff = 0, oStyle = df.sys.gui.getCurrentStyle(eElem);
    
    iOptType = iOptType || 0;
    
    if(iOptType === 0 || iOptType === 1 || iOptType === 3){
        iDiff += parseFloat(oStyle.marginTop) || 0;
    }
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.borderTopWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingTop) || 0;
    }
    
    if(iOptType === 0 || iOptType === 1 || iOptType === 3){
        iDiff += parseFloat(oStyle.marginBottom) || 0;
    }
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.borderBottomWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingBottom) || 0;
    }
    
    return iDiff;
},

/*
Calculates the horizontal space consumed by margin, padding and border by querying the browser its 
calculated css values. Several combinations of padding, margin and border values are available as 
different modes.

0 = all (padding + margin + border)
1 = outside (margin + border) 
2 = inside (padding) 
3 = outside border box (margin only)

@param  iOptType    (optional) The mode to use, if not provided mode 0 is used.
@return The total number of pixels consumed by the specified parts of the box model.
*/
getHorizBoxDiff : function(eElem, iOptType){
    var iDiff = 0, oStyle = df.sys.gui.getCurrentStyle(eElem);
    
    iOptType = iOptType || 0;
    
    if(iOptType === 0 || iOptType === 1 || iOptType === 3){
        iDiff += parseFloat(oStyle.marginLeft) || 0;
    }
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.borderLeftWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingLeft) || 0;
    }
    
    if(iOptType === 0 || iOptType === 1 || iOptType === 3){
        iDiff += parseFloat(oStyle.marginRight) || 0;
    }
    if(iOptType === 0 || iOptType === 1){
        iDiff += parseFloat(oStyle.borderRightWidth) || 0;
    }
    if(iOptType === 0 || iOptType === 2){
        iDiff += parseFloat(oStyle.paddingRight) || 0;
    }
    
    return iDiff;
},

/* 
This function tests if the element is sized by its content. It determines this by adding a temporary 
element and if the size changes we know the element is sized by its content.

@param  eElem   DOM Element.
@return True if the element its size is determined by its content.
*/
isSizedByContent : function(eElem){
    var iCH, bRes;
    
    iCH = eElem.clientHeight;
    
    eElem.appendChild(df.dom.create('<div style="width: 100%; height: 20px;">&nbsp</div>'));
    
    bRes = (iCH !== eElem.clientHeight);
    
    eElem.removeChild(eElem.lastChild);
    
    return bRes;
},
    
/* 
Cross browser method for getting a boundingclientrect object.

@param  eElem   The DOM element.
@return Bounding rectangle object { top:x, right:x, bottom:x, left:x, width:x, height:x }.
*/
getBoundRect : function(eElem){
    var oR = eElem.getBoundingClientRect();
    
    if (typeof oR.width !== 'number') {  //  Internet Explorer 8 doesn't support width & height
        return {
            top : oR.top,
            right : oR.right,
            bottom : oR.bottom,
            left : oR.left,
            width : oR.right - oR.left,
            height : oR.bottom - oR.top
        };
    }
    
    return oR;
},

/* 
Copies the values of a ClientRect into a JavaScript Object. This makes the properties writable so 
they can be used for translations.

@param  oR  ClientRect object.
@return JavaScript Object.
*/
rectToObj : function(oR){
    return {
        top : oR.top,
        right : oR.right,
        bottom : oR.bottom,
        left : oR.left,
        width : oR.width,
        height : oR.height
    };
},

/* 
Returns the properly prefixed name for setting CSS transformations. As optimization a closure is 
used in which the result is cached.

@return String with the browser dependent property name for transform.
*/
getTransformProp : (function(){
    var sPrefix = null;
    
    function getTrans() {
        var i, aPre = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
        for(i = 0; i < aPre.length; i++) {
            if(document.createElement('div').style[aPre[i]] !== undefined) {
                return aPre[i];
            }
        }
        return false;
    }
    
    return function(){
        if(sPrefix === null){
            sPrefix = getTrans();
        }
        
        return sPrefix;
    };
}()),

/*
Sets the CSS class of the body element with a class name that indicates the used
browser. The used classnames are df-ie, df-safari, df-chrome, df-opera,
df-mozilla for the different browsers. For internet explorer the extra
classnames df-ie6, df-ie7, df-ie8 are also attached. Browsers using the
webkit engine (like chrome and safari) also get the df-webkit class.

The function is called automatically after loading. It uses the df.sys.is.. and
df.sys.iVersion indicators to determine browser versions.
*/
initCSS : function(){
    var aC, sB = document.body.className;
    
    //  Check if classnames are already applied to the body, if so filter out the device classes and fill array with existing classnames
    if(sB){
        sB = sB.replace(/\bdf-ie*|df-safari|df-chrome|df-opera|df-mozilla|df-webkit|df-mobile\b/g, "").trim();
        aC = sB.split(' ');
    }else{
        aC = [];
    }
    
    //  Determine browser classes to add
    if(df.sys.isIE){
        aC.push("df-ie");
        
        aC.push(df.sys.iVersion <= 6 ? " df-ie6" : " df-ie" + df.sys.iVersion); //  For IE we also add version specific classes
    }else if(df.sys.isSafari){
        aC.push("df-safari");
    }else if(df.sys.isChrome){
        aC.push("df-chrome");
    }else if(df.sys.isOpera){
        aC.push("df-opera");
    }else if(df.sys.isMoz){
        aC.push("df-mozilla");
    }

    //  WebKit engine gets its own class
    if(df.sys.isWebkit){
        aC.push("df-webkit");
    }
    
    //  Mobile devices get the mobile class
    if(df.sys.isMobile){
        aC.push("df-mobile");
    }
    
    //  Apply the changed classname
    document.body.className = aC.join(" ");
},

/* 
Checks if the element is on the screen by looking at the scrollbar positions. It doesn't check if 
the the element (or one of its parent elements) are visible or not. 

TODO: Extend with support for horizontal scrolling.
TODO: Check what happens if one of the parents was made invisible using display or visibility.

@param  eElem    DOM Element.
*/
isOnScreen : function(el){
	var rect = el.getBoundingClientRect(), top = rect.top, height = rect.height, left = rect.left, width = rect.width;
	
	el = el.offsetParent;
	
	while (el && el != document.body) {
		rect = el.getBoundingClientRect();
		if (top > rect.bottom){
			return false;
		}
		
		if(left > rect.right){
			return false;
		}
		
		
		// Check if the element is out of view due to a container scrolling
		if ((top + height) <= rect.top){
			return false;
		}
		
		if(left + width <= rect.left){
			return false;
		}
		
		el = el.offsetParent;
	}
	
	// Check its within the document viewport
	return top <= document.documentElement.clientHeight;
},

/* 
Attaches event handlers to all parent elements that can scroll. Because scroll events don't bubble 
this is the only way to find out if an element is moving on the screen because of a scroll event.

@param  eElem       DOM element.
@param  fListen     Event handler function.
@param  oEnv        Environment object used for the event handler.

@return     Array of DOM elements used by removeScrollListeners to clean out the event handler.
*/
addScrollListeners : function(eElem, fListen, oEnv){
    var aElems = [];
    
    while(eElem){
        //if(eElem.scrollHeight > eElem.offsetHeight || eElem.scrollWidth > eElem.offsetWidth){
            aElems.push(eElem);
            df.dom.on("scroll", eElem, fListen, oEnv);
        //}
        eElem = eElem.offsetParent;
    }
    
    return aElems;
},

/* 
Removes the event handlers attached by addScrollListeners based on the passed array.

@return     Array of DOM elements created by addScrollListeners.
*/
removeScrollListeners : function(aElems, fListen, oEnv){
    var eElem;
    
    while(eElem = aElems.shift()){
        df.dom.off("scroll", eElem, fListen, oEnv);
    }
},


cssTextAlign : function(eAlign){
    switch(eAlign){
        case df.ciAlignLeft:
            return "left";
        case df.ciAlignCenter:
            return "center";
        case df.ciAlignRight:
            return "right";
    }

    return "";
}

},

/*
Library object that contains several string functions that seem to be missing
the in the ECMAScript standard.
*/
string : {

/*
Removes spaces before and after the given string.

@param  sString        String to trim.
@return Trimmed string.
@deprecated
*/
trim : function(sString){
    return sString.trim();
},

/*
Removes spaces before the given string.

@param  sString    String to trim.
@return Trimmed string.
*/
ltrim : function(sString){
    return sString.replace(/^\s+/,"");
},

/*
Removes spaces after the given string.

@param  sString    String to trim.
@return Trimmed string.
*/
rtrim : function(sString){
    return sString.replace(/\s+$/,"");
},

/*
Modifies the casing of the value string according to the sample string.

@param  sValue  String of which the casing is adjusted.
@param  sSample String determining the casing.
@return String with the modified casing.
*/
copyCase : function(sValue, sSample){
    var bUpper, iChar, sResult = "";

    for(iChar = 0; iChar < sValue.length; iChar++){
        bUpper = (iChar < sSample.length ? sSample.charAt(iChar) === sSample.charAt(iChar).toUpperCase() : bUpper);

        sResult += (bUpper ? sValue.charAt(iChar).toUpperCase() : sValue.charAt(iChar).toLowerCase());
    }

    return sResult;
},

/* 
Moved this function to the dom libary for shorter access. 

Todo: Replace all usage.
*/
encodeHtml : df.dom.encodeHtml

},

/* 
Determines if the HTML5 input type is supported by creating a test DOM element. It caches the 
responses to keep the performance high on multiple requests.

@param  sType   The HTML5 input type ("date", "number", "email").
*/
supportHtml5Input : (function(){
    var oCache = {};    
    
    return function test(sType){
        var eElem;
    
        if(typeof oCache[sType] === "boolean"){
            return oCache[sType];
        }
        eElem = document.createElement("input");
        eElem.setAttribute("type", sType);
        
        oCache[sType] = (eElem.type === sType);
        return oCache[sType];
    };    
}()),

/* 
Performs the device detection based on the user agent string. This sets / updates the isSafari, 
isIE, .. properties!
*/
detectDevice : function(){
    //  Check if something actually changed
    if(this._sPrevUA !== navigator.userAgent){
        this._sPrevUA = navigator.userAgent;
        
        //  Reset values
        this.isSafari = false;
        this.isChrome = false;
        this.isOpera = false;
        this.isMoz = false;
        this.isIE = false;
        this.isEdge = false;
        this.isWebkit = false;
        this.isMobile = false;
        this.isIOS = false;

        /*
        Performing the version checks. In most situations we try to use object
        detection, but sometimes we still need version checks.
        */
        if(navigator.userAgent.indexOf("Trident") >= 0){    //  Recognize IE 11 and higher
            df.sys.isIE = true;
            if(document.documentMode){
                df.sys.iVersion = document.documentMode;
            }else if(navigator.appVersion.indexOf("MSIE") >= 0){
                df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE") + 4), 10);
            }else{
                df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("rv:") + 3), 10);
            }
        }else if(navigator.userAgent.indexOf("Edge/") >= 0){
            df.sys.isEdge = true;
            df.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Edge/") + 5));
        }else if(navigator.userAgent.indexOf("Chrome") >= 0){
            df.sys.isChrome = true;
            df.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Chrome/") + 7));
        }else if (navigator.userAgent.indexOf("Safari") >= 0){
            df.sys.isSafari = true;
            df.sys.iVersion = parseFloat(navigator.appVersion.substr(navigator.appVersion.indexOf("Version/") + 8));
        }else if (navigator.product === "Gecko"){
            df.sys.isMoz = true;
            df.sys.iVersion = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Firefox/") + 8));
        }else if (navigator.userAgent.indexOf("Opera") >= 0){
            df.sys.isOpera = true;
            df.sys.iVersion = parseFloat(navigator.appVersion);
        }else{  //  Default to IE if we don't know
            df.sys.isIE = true;
            df.sys.iVersion = parseInt(navigator.appVersion.substr(navigator.appVersion.indexOf("MSIE") + 4), 10);
            
            if(document.documentMode){
                df.sys.iVersion = document.documentMode;
            }
        }
        /*
        Determine if this is a mobile device (tablet or mobile phone).
        */
        if(/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/i.test(navigator.userAgent)){
            df.sys.isMobile = true;
        }
        if(/(iPad|iPhone|iPod)/g.test( navigator.userAgent )){
            df.sys.isIOS = true;
        }

        if (navigator.userAgent.indexOf("AppleWebKit") >= 0){
            df.sys.isWebkit = true;
        }
        
        //  Make sure that the autoInit function after the DOM is initialized (Which can be in the future but also can be right now)
        df.dom.ready(df.sys.gui.initCSS, window);
    }
}

};

df.sys.detectDevice();


//  - - - - Add missing JavaScript features for older browsers - - - - 

// <=IE11 Array.find
if (!Array.prototype.find) {
  Array.prototype.find = function(callback) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    } else if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }
    var list = Object(this);
    // Makes sures is always has an positive integer as length.
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    for (var i = 0; i < length; i++) {
      var element = list[i];
      if ( callback.call(thisArg, element, i, list) ) {
        return element;
      }
    }
  };
}

//  Polyfull for NodeList forEach (IE11)
if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
        thisArg = thisArg || window;
        for (var i = 0; i < this.length; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

//  Polyfill for Object.values (IE)
if(!Object.values){
    Object.values = function values(obj){
        var vals = [];
        for (var key in obj) {
            if(obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)){
                vals.push(obj[key]);
            }
        }
        return vals;
    };
}

// <=IE11 does not have a replaceAll; allocate it here.
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replacement) {
        return this.split(search).join(replacement);
    };
}

// <=IE11 matches
if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
}

// <=IE11 closest
if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
  
      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
}
  
