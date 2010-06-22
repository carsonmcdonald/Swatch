/* See license.txt for terms of usage */

function SwatchUpdater()
{
  this.httpRequests = [];
  this.currentTimeout = null;
  this.lastUpdates = [];
  this.updateAvailableFrom = {} 
  this.currentSiteKey = null;
  this.currentSubState = 'rep';

  this.siteData = new SiteInfoSet();

  this.siteInfo = SITES_CONFIG;
}

SwatchUpdater.prototype.onLoad = function() 
{
  if(Prefs.getInteger('swatch.firstrun') == 0)
  {
    try 
    {
      var firefoxnav = document.getElementById("nav-bar");
      var curSet = firefoxnav.currentSet;
      if(curSet.indexOf("swatch-toolbarbutton") == -1)
      {
        var set = curSet + ",swatch-toolbarbutton";
        firefoxnav.setAttribute("currentset", set);
        firefoxnav.currentSet = set;
        document.persist("nav-bar", "currentset");
        // If you don't do the following call, funny things happen
        try 
        {
          BrowserToolboxCustomizeDone(true);
        }
        catch (e) { }
      }
    }
    catch(e) { }

    Prefs.setInteger('swatch.firstrun', 1);
    Prefs.setString('swatch.rep.display', 'short');
  }

  for(var siteKey in this.siteInfo)
  {
    if( Prefs.getInteger(this.siteInfo[siteKey].userKey) != 0) 
    {
      this.currentSiteKey = siteKey;
      this.currentSubState = 'rep';
    }
    this.updateAvailableFrom[siteKey] = {};

    var basePrefName = "swatch.current." + siteKey;
    if(Prefs.getInteger(basePrefName + ".mention.ts.hwm") == 0)
    {
      Prefs.setInteger(basePrefName + ".mention.ts.hwm", (new Date()).getTime() / 1000)
    }
  }

  this.update();
}

SwatchUpdater.prototype.onMenuItemCommand = function(e)
{
  window.openDialog("chrome://swatch/content/options.xul", "", "modal,centerscreen");
  this.onLoad();
}

SwatchUpdater.prototype.onMentionDetailClick = function(e)
{
  var selectedComment = this.siteData.getCurrentMentionForSite(this.currentSiteKey);
  gBrowser.selectedTab = gBrowser.addTab(this.siteInfo[this.currentSiteKey].siteUrl + '/questions/' + selectedComment.post_id);

/* todo fix all this
gBrowser.selectedTab.addEventListener("load", function () 
{ 
  var commentLink = gBrowser.contentDocument.getElementById('comments-link-' + selectedComment.post_id);

  var selectedPosX = 0;
  var selectedPosY = 0;
              
  while(commentLink != null)
  {
    selectedPosX += commentLink.offsetLeft;
    selectedPosY += commentLink.offsetTop;
    commentLink = commentLink.offsetParent;
  }
                        		      
 gBrowser.contentWindow.scrollTo(selectedPosX,selectedPosY);
 // commentLink.fireEvent("onclick");
}, true);
*/
}

SwatchUpdater.prototype.onMentionUserClick = function(e)
{
  var selectedComment = this.siteData.getCurrentMentionForSite(this.currentSiteKey);
  gBrowser.selectedTab = gBrowser.addTab(this.siteInfo[this.currentSiteKey].siteUrl + '/users/' + selectedComment.owner.user_id);
}

SwatchUpdater.prototype.moveOneMentionClick = function(e, incrementValue)
{
  if(this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) + incrementValue >= 0 && this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) + incrementValue < this.siteData.getTotalMentionsForSite(this.currentSiteKey))
  {
    var basePrefName = "swatch.current." + this.currentSiteKey;
    if(this.siteData.siteHasMentions(this.currentSiteKey) && Prefs.getInteger(basePrefName + ".mention.ts.hwm") < this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date)
    {
      Prefs.setInteger(basePrefName + ".mention.ts.hwm", this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date);
      this.updateAvailableFrom[this.currentSiteKey]['mention'] = this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) != 0; 
    }

    if(incrementValue == 1)
      this.siteData.incrementMentionIndexForSite(this.currentSiteKey);
    else
      this.siteData.decrementMentionIndexForSite(this.currentSiteKey);

    this.reconfigureView();
  }
}

SwatchUpdater.prototype.onDetailHide = function(e)
{
  this.updateAvailableFrom[this.currentSiteKey]['rep'] = false;
  this.updateAvailableFrom[this.currentSiteKey]['badges'] = false;

  var basePrefName = "swatch.current." + this.currentSiteKey;
  if(this.siteData.siteHasMentions(this.currentSiteKey) && Prefs.getInteger(basePrefName + ".mention.ts.hwm") < this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date)
  {
    Prefs.setInteger(basePrefName + ".mention.ts.hwm", this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date);
    this.updateAvailableFrom[this.currentSiteKey]['mention'] = this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) != 0; 
  }

  this.reconfigureView();
}

SwatchUpdater.prototype.onDetailShow = function(e)
{
  for(var siteKey in this.siteInfo)
  {
    if( this.updateAvailableFrom[siteKey]['rep'] || this.updateAvailableFrom[siteKey]['badges'] || this.updateAvailableFrom[siteKey]['mention'] )
    {
      this.setNextAvailableState(1, false);
      this.reconfigureView();
      break;
    }
  }
}

SwatchUpdater.prototype.onSiteChangeClick = function(e, incrementValue)
{
  var basePrefName = "swatch.current." + this.currentSiteKey;
  if(this.siteData.siteHasMentions(this.currentSiteKey) && Prefs.getInteger(basePrefName + ".mention.ts.hwm") < this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date)
  {
    Prefs.setInteger(basePrefName + ".mention.ts.hwm", this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date);
    this.updateAvailableFrom[this.currentSiteKey]['mention'] = this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) != 0; 
  }

  var previousState = this.currentSiteKey;

  this.setNextAvailableState(incrementValue, false);

  this.updateAvailableFrom[previousState]['rep'] = false;
  this.updateAvailableFrom[previousState]['badges'] = false;

  this.reconfigureView();
}

SwatchUpdater.prototype.onStatusLabelClick = function(e)
{
  if(this.updateAvailableFrom[this.currentSiteKey] != null) this.updateAvailableFrom[this.currentSiteKey][this.currentSubState] = false;
  if(!this.siteData.siteIsInErrorState(this.currentSiteKey))
  {
    switch(this.currentSubState)
    {
      case 'rep':
        this.currentSubState = 'badges';
      break;
      case 'badges':
        this.currentSubState = 'rep';
      break;
      default:
        this.onStatusIconClick(e);
    }

    this.reconfigureView();
  }
}

SwatchUpdater.prototype.setNextAvailableState = function(direction, fromBar)
{
  for(var siteKey in this.siteInfo)
  {
    if(fromBar)
    {
      if( this.updateAvailableFrom[siteKey]['rep'] )
      {
        this.currentSiteKey = siteKey;
        this.currentSubState = 'rep';
        return;
      }
      if( this.updateAvailableFrom[siteKey]['badges'] )
      {
        this.currentSiteKey = siteKey;
        this.currentSubState = 'badges';
        return;
      }
    }
    else
    {
      if( this.updateAvailableFrom[siteKey]['rep'] || this.updateAvailableFrom[siteKey]['badges'] || this.updateAvailableFrom[siteKey]['mention'] )
      {
        this.currentSiteKey = siteKey;
        return;
      }
    }
  }

  var validSites = [];
  var currentIndex = 0;
  var index = 0;
  for(var siteKey in this.siteInfo)
  {
    if(this.currentSiteKey != siteKey && Prefs.getInteger(this.siteInfo[siteKey].userKey) > 0)
    {
      validSites.push(siteKey);
      index++;
    }
    if(this.currentSiteKey == siteKey)
      currentIndex = index;
  }

  if(direction == 1 && currentIndex+1 > validSites.length && validSites.length > 0)
  {
    this.currentSiteKey = validSites[0];
  }
  else if(direction == 1 && validSites.length > 0)
  {
    this.currentSiteKey = validSites[currentIndex];
  }
  else if(direction == -1 && currentIndex-1 < 0 && validSites.length > 0)
  {
    this.currentSiteKey = validSites[validSites.length-1];
  }
  else if(direction == -1 && validSites.length > 0)
  {
    this.currentSiteKey = validSites[currentIndex-1];
  }
}

SwatchUpdater.prototype.onStatusIconClick = function(e)
{
  if(e.button == 2)
  {
    if(this.siteInfo[this.currentSiteKey] != null) 
    {
      gBrowser.selectedTab = gBrowser.addTab(this.siteInfo[this.currentSiteKey].siteUrl);
    }
  }
  else
  {
    if(this.siteInfo[this.currentSiteKey] != null)
    {
      var previousState = this.currentSiteKey;
      var previousSubState = this.currentSubState;

      this.setNextAvailableState(1, true);

      this.updateAvailableFrom[previousState][previousSubState] = false;
    }
    else if(this.siteData.siteIsInErrorState(this.currentSiteKey))
    {
      return;
    }
    else
    {
      this.onMenuItemCommand(e);
    }

    this.reconfigureView();
  }
}

SwatchUpdater.prototype.makeRequest = function(url, siteKey, callback)
{
  var httpRequest = new XMLHttpRequest();
  if(httpRequest.overrideMimeType) 
  {
    httpRequest.overrideMimeType('text/json');
  }

  if(!httpRequest) 
  {
    alert('Cannot create XMLHTTP instance');
    return false;
  }

  this.httpRequests.push({ httpRequest: httpRequest, siteKey: siteKey });

  var self = this;
  httpRequest.onreadystatechange = function() { self.processResponse(this, callback); }

  httpRequest.open('GET', url, true);
  httpRequest.send(null);
}

SwatchUpdater.prototype.processResponse = function(caller, callback)
{
  var httpRequest = null;
  var siteKey = null;
  var index;
  for(index = 0; index < this.httpRequests.length && httpRequest == null; index++)
  {
    if(caller == this.httpRequests[index].httpRequest)
    {
      httpRequest = this.httpRequests[index].httpRequest;
      siteKey = this.httpRequests[index].siteKey;
    }
  }

  if(httpRequest != null && httpRequest.readyState == 4) 
  {
    var parseError = null;
    if(httpRequest.status == 200) 
    {
      this.siteData.resetSiteErrorState(siteKey);
      try
      {
        callback(JSON.parse(httpRequest.responseText), siteKey);
      }
      catch(exp)
      {
        parseError = 'Error parsing response: ' + exp;
      }
    }
    else
    {
      if(httpRequest.responseText != null && httpRequest.responseText != '')
      {
        try
        {
          var errorResponse = JSON.parse(httpRequest.responseText);
          this.siteData.setSiteErrorState(siteKey, 'There was a problem with the request. Response value was "' + errorResponse.error.message + '"');
        }
        catch(exp)
        {
          parseError = 'Error parsing error response: ' + exp;
        }
      }
      else
      {
        this.siteData.setSiteErrorState(siteKey, 'There was a problem with the request. Status code = ' + httpRequest.status);
      }
    }

    if(parseError != null)
    {
      this.siteData.setSiteErrorState(siteKey, parseError);
    }

    this.httpRequests.splice(index-1, 1);

    this.siteData.setLastUpdatedTSForSite(siteKey, new Date());

    this.reconfigureView();
  }
}

SwatchUpdater.prototype.processMentionsResponse = function(mentions, siteKey)
{
  if(mentions == null || mentions.length == 0) return;

  var basePrefName = "swatch.current." + siteKey;

  var newUser = Prefs.getInteger(basePrefName + ".mention.ts") == 0;
  var currentMentionIndex = this.siteData.getCurrentMentionIndexForSite(siteKey);

  if(!newUser && Prefs.getInteger(basePrefName + ".mention.ts") < mentions[0].creation_date)
  {
    this.updateAvailableFrom[siteKey]['mention'] = true; 

    this.addLastUpdate('New mention on ' + this.siteInfo[siteKey].name + ' from ' + mentions[0].owner.display_name);

    // If there is no current index find the one with the latest new timestamp
    for(var i=0; i<mentions.length; i++)
    { 
      if(Prefs.getInteger(basePrefName + ".mention.ts") >= mentions[i].creation_date)
      {
        currentMentionIndex = i-1;
        break;
      }
    }
  }

  this.siteData.setCurrentMentionIndexForSite(siteKey, currentMentionIndex);
  this.siteData.setMentionsForSite(siteKey, mentions);

  Prefs.setInteger(basePrefName + ".mention.ts", mentions[0].creation_date);
}

SwatchUpdater.prototype.processUserResponse = function(user, siteKey)
{
  this.siteData.setUserDataForSite(siteKey, user);

  var basePrefName = "swatch.current." + siteKey;

  var newUser = Prefs.getInteger(basePrefName + ".rep") == 0;

  if(Prefs.getInteger(basePrefName + ".rep") != user.reputation)
  {
    Prefs.setInteger(basePrefName + ".rep", user.reputation);

    if(!newUser)
    {
      this.addLastUpdate('Reputation change on ' + this.siteInfo[siteKey].name);
      this.updateAvailableFrom[siteKey]['rep'] = true; 
      this.currentSiteKey = siteKey;
      this.currentSubState = 'rep';
    }
  }

  if(Prefs.getInteger(basePrefName + ".badges.gold") != user.badge_counts.gold ||
     Prefs.getInteger(basePrefName + ".badges.silver") != user.badge_counts.silver ||
     Prefs.getInteger(basePrefName + ".badges.bronze") != user.badge_counts.bronze)
  {
    Prefs.setInteger(basePrefName + ".badges.gold", user.badge_counts.gold);
    Prefs.setInteger(basePrefName + ".badges.silver", user.badge_counts.silver);
    Prefs.setInteger(basePrefName + ".badges.bronze", user.badge_counts.bronze);

    if(!newUser)
    {
      this.addLastUpdate('Badge change on ' + this.siteInfo[siteKey].name);
      this.updateAvailableFrom[siteKey]['badges'] = true; 
      this.currentSiteKey = siteKey;
      this.currentSubState = 'badges';
    }
  }
}

SwatchUpdater.prototype.addLastUpdate = function(update)
{
  this.lastUpdates.push(update);
  if(this.lastUpdates.length > 5)
  {
    this.lastUpdates.splice(this.lastUpdates.length, 1);
  }
}

SwatchUpdater.prototype.rebuildToolbarTooltip = function()
{
  if(this.lastUpdates.length == 0)
  {
    return "  No recent updates.  ";
  }
  else
  {
    return '  ' + this.lastUpdates.reverse().join('  \n\n  ') + '  ';
  }
}

SwatchUpdater.prototype.reconfigureView = function()
{
  if(document.getElementById('swatch-toolbarbutton') != null)
  {
    var alertState = null;
    for(var siteKey in this.siteInfo)
    {
      if( this.updateAvailableFrom[siteKey]['rep'] || this.updateAvailableFrom[siteKey]['badges'] || this.updateAvailableFrom[siteKey]['mention'] )
      {
        alertState = 'alert';
        break;
      }
    }
    document.getElementById('swatch-toolbarbutton').setAttribute('swatchstate', alertState);
  }

  document.getElementById('status-label-container').setAttribute("style", '');
  if(document.getElementById('swatch-badge-display') != null) document.getElementById('swatch-badge-display').setAttribute("style", '');
  if(document.getElementById('swatch-rep-display') != null) document.getElementById('swatch-rep-display').setAttribute("style", '');

  if(this.updateAvailableFrom[this.currentSiteKey] != null && this.updateAvailableFrom[this.currentSiteKey]['rep'])
  {
    if(this.currentSubState == 'rep')
    {
      document.getElementById('status-label-container').setAttribute("style", 'background-color: #ffff66;');
    }
    document.getElementById('swatch-rep-display').setAttribute("style", 'background-color: #ffff66;');
  }

  if(this.updateAvailableFrom[this.currentSiteKey] != null && this.updateAvailableFrom[this.currentSiteKey]['badges'])
  {
    if(this.currentSubState == 'badges')
    {
      document.getElementById('status-label-container').setAttribute("style", 'background-color: #ffff66;');
    }
    document.getElementById('swatch-badge-display').setAttribute("style", 'background-color: #ffff66;');
  }

  if(document.getElementById('swatch-new-mention') != null) document.getElementById('swatch-new-mention').setAttribute("style", 'display: none');
  var basePrefName = "swatch.current." + this.currentSiteKey;
  if(this.siteData.siteHasMentions(this.currentSiteKey) && Prefs.getInteger(basePrefName + ".mention.ts.hwm") < this.siteData.getCurrentMentionForSite(this.currentSiteKey).creation_date)
  {
    document.getElementById('swatch-new-mention').setAttribute("style", 'display: block; padding-top: 10px;');
  }

  if(this.siteData.hasDataForSite(this.currentSiteKey))
  {
    document.getElementById('status-icon').src = this.siteInfo[this.currentSiteKey].iconUrl; 
    if(document.getElementById('site-icon') != null) document.getElementById('site-icon').src = this.siteInfo[this.currentSiteKey].iconUrl; 
    document.getElementById('status-icon').tooltipText = this.siteInfo[this.currentSiteKey].siteUrl;
    if(document.getElementById('site-icon') != null) document.getElementById('site-icon').tooltipText = this.siteInfo[this.currentSiteKey].siteUrl;
    if(document.getElementById('swatch-toolbarbutton') != null) document.getElementById('swatch-toolbarbutton').tooltipText = this.rebuildToolbarTooltip();

    if(document.getElementById('swatch-service-title') != null) document.getElementById('swatch-service-title').value = this.siteInfo[this.currentSiteKey].name; 

    document.getElementById('status-label-container').width = this.siteData.calculateWidgetBadge();

    var rep = this.siteData.getReputationForSite(this.currentSiteKey).fancyNumber(Prefs.getString('swatch.rep.display'));
    var badgeDis = this.siteData.getDisplayableBadgesForSite(this.currentSiteKey);

    switch(this.currentSubState)
    {
      case 'badges':
        document.getElementById('status-label').innerHTML = badgeDis;
        break;
      case 'rep':
      default:
        document.getElementById('status-label').innerHTML = rep;
    }

    if(document.getElementById('swatch-rep-display') != null) document.getElementById('swatch-rep-display').value = rep;
    if(document.getElementById('swatch-badge-display') != null) document.getElementById('swatch-badge-display').innerHTML = badgeDis;

    document.getElementById('status-label-container').tooltipText = 'Last refresh: ' + this.siteData.getFormatedLastUpdatedTSForSite(this.currentSiteKey); 

    if(document.getElementById('swatch-down-mention') != null) document.getElementById('swatch-down-mention').src = (this.siteData.siteHasMentions(this.currentSiteKey) && this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey)+1 >= this.siteData.getTotalMentionsForSite(this.currentSiteKey)) ? 'chrome://swatch/skin/images/resultset_down_disabled.png' : 'chrome://swatch/skin/images/resultset_down.png';
    if(document.getElementById('swatch-up-mention') != null) document.getElementById('swatch-up-mention').src = (this.siteData.getCurrentMentionIndexForSite(this.currentSiteKey) <= 0) ? 'chrome://swatch/skin/images/resultset_up_disabled.png' : 'chrome://swatch/skin/images/resultset_up.png';
    if(document.getElementById('swatch-next-site') != null) document.getElementById('swatch-next-site').src = (this.siteData.hasMultipleSites()) ? 'chrome://swatch/skin/images/resultset_next.png' : 'chrome://swatch/skin/images/resultset_next_disabled.png';
    if(document.getElementById('swatch-previous-site') != null) document.getElementById('swatch-previous-site').src = (this.siteData.hasMultipleSites()) ? 'chrome://swatch/skin/images/resultset_previous.png' : 'chrome://swatch/skin/images/resultset_previous_disabled.png';

    if(!this.siteData.siteHasMentions(this.currentSiteKey))
    {
      if(document.getElementById('swatch-mentions-error') != null) document.getElementById('swatch-mentions-error').hidden = true;
      if(document.getElementById('swatch-no-mentions') != null) document.getElementById('swatch-no-mentions').hidden = false;
      if(document.getElementById('swatch-mentions') != null) document.getElementById('swatch-mentions').hidden = true;
    }
    else
    {
      if(document.getElementById('swatch-mentions-error') != null) document.getElementById('swatch-mentions-error').hidden = true;
      if(document.getElementById('swatch-no-mentions') != null) document.getElementById('swatch-no-mentions').hidden = true;
      if(document.getElementById('swatch-mentions') != null) document.getElementById('swatch-mentions').hidden = false;

      var selectedComment = this.siteData.getCurrentMentionForSite(this.currentSiteKey);
      if(document.getElementById('swatch-mention-title') != null) document.getElementById('swatch-mention-title').value = 'See orginal ' + selectedComment.post_type;
      if(document.getElementById('swatch-mention-comment') != null) document.getElementById('swatch-mention-comment').innerHTML = '<html:div>' + sanitizeMention(selectedComment.body) + '</html:div>';

      if(document.getElementById('swatch-mention-byuser') != null) document.getElementById('swatch-mention-byuser').value = selectedComment.owner.display_name;
      if(document.getElementById('swatch-mention-time') != null) document.getElementById('swatch-mention-time').value = new Date(selectedComment.creation_date * 1000).simpleDateTimeFormat();

      //document.getElementById('swatch-mention-reply').value = '@' + selectedComment.owner.display_name;
    }
  }
  else if(this.siteData.siteIsInErrorState(this.currentSiteKey))
  {
    document.getElementById('status-icon').src = this.siteInfo[this.currentSiteKey].iconUrl; 
    document.getElementById('status-icon').tooltipText = this.siteData.getSiteErrorState(this.currentSiteKey);
    document.getElementById('status-label').innerHTML = 'Error';
    document.getElementById('status-label-container').tooltipText = document.getElementById('status-icon').tooltipText;

    if(document.getElementById('swatch-rep-display') != null) document.getElementById('swatch-rep-display').value = 'NA';
    if(document.getElementById('swatch-badge-display') != null) document.getElementById('swatch-badge-display').innerHTML = 'NA';

    if(document.getElementById('swatch-down-mention') != null) document.getElementById('swatch-down-mention').src = 'chrome://swatch/skin/images/resultset_down_disabled.png';
    if(document.getElementById('swatch-up-mention') != null) document.getElementById('swatch-up-mention').src = 'chrome://swatch/skin/images/resultset_up_disabled.png';
    if(document.getElementById('swatch-mentions-error') != null) document.getElementById('swatch-mentions-error').hidden = false;
    if(document.getElementById('swatch-mentions-error-value') != null) document.getElementById('swatch-mentions-error-value').innerHTML = this.siteData.getSiteErrorState(this.currentSiteKey);
    if(document.getElementById('swatch-no-mentions') != null) document.getElementById('swatch-no-mentions').hidden = true;
    if(document.getElementById('swatch-mentions') != null) document.getElementById('swatch-mentions').hidden = true;
  }
  else
  {
    document.getElementById('status-icon').src = 'chrome://swatch/skin/images/error.png';
    document.getElementById('status-icon').tooltipText = 'No user account configured. Click to configure.'
    document.getElementById('status-label').innerHTML = 'Configure';
    document.getElementById('status-label-container').tooltipText = document.getElementById('status-icon').tooltipText;

    if(document.getElementById('swatch-rep-display') != null) document.getElementById('swatch-rep-display').value = 'NA';
    if(document.getElementById('swatch-badge-display') != null) document.getElementById('swatch-badge-display').innerHTML = 'NA';

    if(document.getElementById('swatch-down-mention') != null) document.getElementById('swatch-down-mention').src = 'chrome://swatch/skin/images/resultset_down_disabled.png';
    if(document.getElementById('swatch-up-mention') != null) document.getElementById('swatch-up-mention').src = 'chrome://swatch/skin/images/resultset_up_disabled.png';
    if(document.getElementById('swatch-mentions-error') != null) document.getElementById('swatch-mentions-error').hidden = false;
    if(document.getElementById('swatch-mentions-error-value') != null) document.getElementById('swatch-mentions-error-value').innerHTML = this.siteData.getSiteErrorState(this.currentSiteKey);
    if(document.getElementById('swatch-no-mentions') != null) document.getElementById('swatch-no-mentions').hidden = true;
    if(document.getElementById('swatch-mentions') != null) document.getElementById('swatch-mentions').hidden = true;
  }
}

SwatchUpdater.prototype.update = function() 
{
  var foundConfig = false;
  for(var siteKey in this.siteInfo)
  {
    if( Prefs.getInteger(this.siteInfo[siteKey].userKey) != 0)
    {
      foundConfig = true;
      break;
    }
  }

  if( !foundConfig )
  {
    this.currentSiteKey = 'noconfig';
    this.reconfigureView();
  }
  else if(this.httpRequests.length == 0)
  {
    var self = this;
    for(var siteKey in this.siteInfo)
    {
      if( Prefs.getInteger(this.siteInfo[siteKey].userKey) != 0)
      {
        var request = new StackAppsAPI.SAReq();
        request.addPath('users');
        request.addPath(Prefs.getInteger(this.siteInfo[siteKey].userKey));
        request.addParam('key', API_KEY);
        this.makeRequest(this.siteInfo[siteKey].apiBase + request.buildUrl(), siteKey, function(users, sk) { self.processUserResponse(users.users[0], sk); });

        request = new StackAppsAPI.SAReq();
        request.addPath('users');
        request.addPath(Prefs.getInteger(this.siteInfo[siteKey].userKey));
        request.addPath('mentioned');
        request.addParam('key', API_KEY);
        this.makeRequest(this.siteInfo[siteKey].apiBase + request.buildUrl(), siteKey, function(mentions, sk) { self.processMentionsResponse(mentions.comments, sk); });
      }
    }
  }

  clearTimeout(this.currentTimeout);
  this.currentTimeout = setTimeout('onTimeout()', (Prefs.getInteger("swatch.refresh") < 60 ? 60 : Prefs.getInteger("swatch.refresh")) * 1000);
}

var swatchUpdater = new SwatchUpdater();
window.addEventListener("load", function(e) { swatchUpdater.onLoad(e); }, false); 

function onTimeout()
{
  swatchUpdater.update();
}

function onMenuItemCommand(e)
{
  swatchUpdater.onMenuItemCommand(e);
}

function onStatusLabelClick(e)
{
  swatchUpdater.onStatusLabelClick(e);
}

function onStatusIconClick(e)
{
  swatchUpdater.onStatusIconClick(e);
}

function onMentionDetailClick(e)
{
  swatchUpdater.onMentionDetailClick(e);
}

function onMentionUserClick(e)
{
  swatchUpdater.onMentionUserClick(e);
}

function moveOneMentionClick(e, incrementValue)
{
  swatchUpdater.moveOneMentionClick(e, incrementValue);
}

function onSiteChangeClick(e, incrementValue)
{
  swatchUpdater.onSiteChangeClick(e, incrementValue);
}

function onDetailHide(e)
{
  swatchUpdater.onDetailHide(e);
}

function onDetailShow(e)
{
  swatchUpdater.onDetailShow(e);
}
