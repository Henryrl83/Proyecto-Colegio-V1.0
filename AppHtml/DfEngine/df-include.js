/*
This file includes the DataFlex Engine by generating the include statements for both the JavaScript 
and CSS.

Revision:
    2012/07/16  (HW, DAW) 
        Initial version.
*/



var df = (function(){  
    var aScripts, sRoot = "", bMinified, bShowBuffer, sPreloadTheme, sIncludePath, sVersionId, sV;
    
    //  Note: The following line is parsed and checked by the studio
    sVersionId = "24.0.27.52";
    
    //  Determine current include location
    aScripts = document.getElementsByTagName("script");
    sIncludePath = aScripts[aScripts.length - 1].src;
    if(sIncludePath.indexOf('DfEngine/df-include.js') > 0){
        sRoot = sIncludePath.substr(0, sIncludePath.indexOf('DfEngine/df-include.js'));
    }
    //  Determine version GET parameter
    sV = "?v=" + sVersionId;
    
    //  Determine include variables
    sRoot = (typeof(sDfRootPath) === "string" && sDfRootPath) || sRoot;   //  Path to include files relative to
    bMinified = !((typeof(bDfDebug) === "boolean" && bDfDebug) || document.location.href.toLowerCase().indexOf('dfdebug=true') > 0); //  Minified or full version
    bShowBuffer = ((typeof(bDfShowBuffer) === "boolean" && bDfShowBuffer) || document.location.href.toLowerCase().indexOf('dfshowbuffer=true') > 0); //  Include buffer debuggin tools
    sPreloadTheme = (typeof(sDfPreloadTheme) === "string" && sDfPreloadTheme) || null;  //  Preload a theme or not
    
    if(typeof(sDfBuildNr) === "string" && sDfBuildNr){  //  Add a custom string to the version GET parameter of the URL
        sV += "." + sDfBuildNr;
    }
    
    //  Writes a single include statement using the proper path and version extension
    function includeJS(sPath, bModule){
        document.write('<script src="' + sRoot + 'DfEngine/' + sPath + sV + '"' + (bModule ? ' type="module"' : '') + '></script>');
    }
    
    //  Include CSS (optionally preload a theme)
    document.write('<link href="' + sRoot + 'DfEngine/system.css' + sV + '" rel="stylesheet" type="text/css" />');
    if(sPreloadTheme){
        document.write('<link href="' + sRoot + 'CssThemes/' + sPreloadTheme + '/theme.css' + sV + '" rel="stylesheet" type="text/css" />');
        document.write('<link href="' + sRoot + 'CssStyle/application.css' + sV + '" rel="stylesheet" type="text/css" />');
    }
    
    //  Switch between full and minified
    if(bMinified){
        includeJS('df-min.js', false);
    }else{
        includeJS('df.js');

        includeJS('df/settings.js');
        includeJS('df/events.js');
        includeJS('df/dom.js');
        includeJS('df/sys.js');
        includeJS('df/sys/json.js');
        includeJS('df/sys/vt.js');
        includeJS('df/ajax/HttpRequest.js');
        includeJS('df/ajax/JSONCall.js');

        // Helper classes
        includeJS('df/ServerAction.js');
        includeJS('df/InfoBalloon.js');
        includeJS('df/MobRuleController.js');
        includeJS('df/GroupHub.js');

        // Web Object classes
        includeJS('df/WebObject.js');
        includeJS('df/dragdrop/WebDragDropMixin.js');
        includeJS('df/WebBaseUIObject.js');
        includeJS('df/WebBaseContainer.js');
        includeJS('df/WebBaseControl.js');
        includeJS('df/WebBaseDEO.js');
        includeJS('df/WebBaseForm.js');
        includeJS('df/WebBaseFileUpload.js');
        includeJS('df/WebBaseMenu.js');
        includeJS('df/WebPanel.js');
        includeJS('df/BaseApp.js');
        includeJS('df/WebApp.js');
        includeJS('df/LocalApp.js');
        includeJS('df/WebBaseView.js');
        includeJS('df/WebView.js');
        includeJS('df/WebWindow.js');
        includeJS('df/WebModalDialog.js');
        includeJS('df/WebButton.js');
        includeJS('df/WebLabel.js');
        includeJS('df/WebForm.js');
        includeJS('df/WebDateForm.js');
        includeJS('df/WebDynamicObjectContainer.js');
        includeJS('df/WebCheckbox.js');
        includeJS('df/WebEdit.js');
        includeJS('df/WebCombo.js');
        includeJS('df/WebBaseSelectionForm.js');
        includeJS('df/WebSuggestionForm.js');
        includeJS('df/WebSelectionForm.js');
        includeJS('df/WebTagsForm.js');
        includeJS('df/WebList.js', true);
        includeJS('df/WebListTouchHandler.js');
        includeJS('df/WebListRowModel.js');
        includeJS('df/WebListPlaceHolderView.js');
        includeJS('df/WebListHeaderView.js', true);
        includeJS('df/WebListFooterView.js', true);
        includeJS('df/WebListSwipeButton.js');
        includeJS('df/WebListExpandPanel.js');
        includeJS('df/WebGrid.js', true);
        includeJS('df/WebMultiSelectList.js', true);
        includeJS('df/WebMultiSelectListRowModel.js');
        includeJS('df/WebColumn_mixin.js');
        includeJS('df/WebColumn.js');
        includeJS('df/WebColumnCombo.js');
        includeJS('df/WebColumnCheckbox.js');
        includeJS('df/WebColumnDate.js');
        includeJS('df/WebColumnButton.js');
        includeJS('df/WebColumnImage.js');
        includeJS('df/WebColumnSuggestion.js');
        includeJS('df/WebColumnLink.js');
        includeJS('df/WebColumnTags.js');
        includeJS('df/WebColumnSelectionIndicator.js');
        includeJS('df/WebCommandBar.js');
        includeJS('df/WebMenuBar.js');
        includeJS('df/WebMenuGroup.js');
        includeJS('df/WebToolBar.js');
        includeJS('df/WebActionBar.js');
        includeJS('df/WebMenuItem.js');
        includeJS('df/WebMenuItemCheckbox.js');
        includeJS('df/WebMenuColumnBase.js');
        includeJS('df/WebMenuColumnList.js');
        includeJS('df/WebMenuColumnRestorer.js');
        includeJS('df/WebMenuGroupingSelector.js', true);
        includeJS('df/WebCardContainer.js');
        includeJS('df/WebCard.js');
        includeJS('df/WebTabContainer.js');
        includeJS('df/WebTabPage.js');
        includeJS('df/WebDatePicker.js');
        includeJS('df/WebTreeView.js');
        includeJS('df/WebIFrame.js');
        includeJS('df/WebImage.js');
        includeJS('df/WebHtmlBox.js');
        includeJS('df/WebRadio.js');
        includeJS('df/WebSlider.js');
        includeJS('df/WebSpacer.js');
        includeJS('df/WebHorizontalLine.js');
        includeJS('df/WebTimer.js');
        includeJS('df/WebProgressBar.js');
        includeJS('df/WebFileUploadButton.js');
        includeJS('df/WebFileUploadForm.js');
        includeJS('df/WebGroup.js');
        includeJS('df/WebBreadcrumb.js');
        includeJS('df/WebFloatingPanel.js');
        includeJS('df/WebMenuButton.js');
        includeJS('df/WebMenuList.js');
        includeJS('df/WebColorPicker.js');
        includeJS('df/WebColorForm.js');
        includeJS('df/WebColumnHighlight.js');
        includeJS('df/WebAccordionContainer.js');
        includeJS('df/WebAccordionCard.js');
        includeJS('df/WebHtmlList.js', true);
        includeJS('df/WebGeoLocation.js');
        includeJS('df/WebContextMenu.js');
        includeJS('df/WebDrawing.js');
        includeJS('df/dragdrop/WebDropZone.js');
        includeJS('df/dragdrop/WebDragDropHelper.js');
        includeJS('df/dragdrop/WebDragDropFileHelper.js');
    }
    
    if(bShowBuffer){
        //  Debugging things
        includeJS('DebugBuffer.js');
    }
    
    return {
        psVersionId : sVersionId
    };
}());
