/* See license.txt for terms of usage */

SiteInfo = function()
{
  this.userInfo = null;
  this.lastUpdatedTS = null;
  this.siteErrorState = null;

  this.mentions = null;
  this.mentionIndex = 0;
};

SiteInfo.prototype = 
{
  decrementMentionIndex: function()
  {
    if(this.mentionIndex > 0) this.mentionIndex--;
  },

  incrementMentionIndex: function()
  {
    if(this.mentionIndex < this.mentions.length) this.mentionIndex++;
  },

  setCurrentMentionIndex: function(mentionIndex)
  {
    this.mentionIndex = mentionIndex;
  },

  getCurrentMention: function()
  {
    return this.mentions == null || this.mentions.length == 0 ? null : this.mentions[this.mentionIndex];
  },

  setMentions: function(mentions)
  {
    this.mentions = mentions;
  },

  calculateBadgeWidth: function()
  {
    if(this.userInfo == null)
    {
      return 0;
    }

    var width = 75;

    if(this.userInfo.badge_counts.gold > 10) width += 10;
    if(this.userInfo.badge_counts.gold > 100) width += 10;
    if(this.userInfo.badge_counts.silver > 10) width += 10;
    if(this.userInfo.badge_counts.silver > 100) width += 10;
    if(this.userInfo.badge_counts.bronze > 10) width += 10;
    if(this.userInfo.badge_counts.bronze > 100) width += 10;

    return width;
  }
};


SiteInfoSet = function()
{
  this.siteData = {};
  for(var siteKey in SITES_CONFIG)
  {
    this.siteData[siteKey] = new SiteInfo();
  }
};

SiteInfoSet.prototype = 
{
  decrementMentionIndexForSite: function(siteKey)
  {
    this.siteData[siteKey].decrementMentionIndex();
  },

  incrementMentionIndexForSite: function(siteKey)
  {
    this.siteData[siteKey].incrementMentionIndex();
  },

  siteHasMentions: function(siteKey)
  {
    return this.siteData[siteKey] != null && this.siteData[siteKey].mentions != null && this.siteData[siteKey].mentions.length > 0;
  },

  getCurrentMentionForSite: function(siteKey)
  {
    return this.siteData[siteKey] == null ? null : this.siteData[siteKey].getCurrentMention();
  },

  setCurrentMentionIndexForSite: function(siteKey, mentionIndex)
  {
    this.siteData[siteKey].setCurrentMentionIndex(mentionIndex);
  },

  getCurrentMentionIndexForSite: function(siteKey)
  {
    return this.siteData[siteKey] == null ? null : this.siteData[siteKey].mentionIndex;
  },

  getTotalMentionsForSite: function(siteKey)
  {
    return (this.siteData[siteKey] == null || this.siteData[siteKey].mentions == null) ? 0 : this.siteData[siteKey].mentions.length;
  },

  setMentionsForSite: function(siteKey, mentions)
  {
    this.siteData[siteKey].setMentions(mentions);
  },

  getSiteErrorState: function(siteKey, errorState)
  {
    return this.siteData[siteKey] == null ? null : this.siteData[siteKey].siteErrorState;
  },

  setSiteErrorState: function(siteKey, errorState)
  {
    this.siteData[siteKey].siteErrorState = errorState;
  },

  resetSiteErrorState: function(siteKey)
  {
    this.siteData[siteKey].siteErrorState = null;
  },

  siteIsInErrorState: function(siteKey)
  {
    return this.siteData[siteKey] != null && this.siteData[siteKey].siteErrorState != null;
  },

  getFormatedLastUpdatedTSForSite: function(siteKey)
  {
    return this.siteData[siteKey].lastUpdatedTS == null ? 'Now' : this.siteData[siteKey].lastUpdatedTS.simpleDateTimeFormat();
  },

  setLastUpdatedTSForSite: function(siteKey, ts)
  {
    this.siteData[siteKey].lastUpdatedTS = ts;
  },

  getDisplayableBadgesForSite: function(siteKey)
  {
    var badgeDis = '';
    if(this.siteData[siteKey].userInfo.badge_counts.gold > 0)
      badgeDis += '<span style="font-size: 75%; color: #FC0;">&#9679;</span>' + this.siteData[siteKey].userInfo.badge_counts.gold + ' ';
    if(this.siteData[siteKey].userInfo.badge_counts.silver > 0)
      badgeDis += '<span style="font-size: 75%; color: #C0C0C0;">&#9679;</span>' + this.siteData[siteKey].userInfo.badge_counts.silver + ' ';
    if(this.siteData[siteKey].userInfo.badge_counts.bronze > 0)
      badgeDis += '<span style="font-size: 75%; color: #C96;">&#9679;</span>' + this.siteData[siteKey].userInfo.badge_counts.bronze + '';
   return badgeDis;
  },

  getReputationForSite: function(siteKey) 
  {
    return this.siteData[siteKey].userInfo.reputation;
  },

  hasDataForSite: function(siteKey) 
  {
    return this.siteData[siteKey] != null && this.siteData[siteKey].userInfo != null
  },

  setUserDataForSite: function(siteKey, user)
  {
    this.siteData[siteKey].userInfo = user;
  },

  hasMultipleSites: function()
  {
    var dataCount = 0;
    for(var siteKey in this.siteData)
    {
      if(this.siteData[siteKey].userInfo != null) dataCount++;
    }
    return dataCount > 0;
  },

  calculateWidgetBadge: function()
  {
    var widestBadge = 75;
    for(var siteKey in this.siteData)
    {
      var width = this.siteData[siteKey].calculateBadgeWidth();
      if(width > widestBadge) widestBadge = width;
    }
    return widestBadge;
  }
};
