/* See license.txt for terms of usage */

DAY_NAMES = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
MONTH_NAMES = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

SITES_CONFIG =
{
  'stackoverflow': { iconUrl: 'http://stackoverflow.com/favicon.ico', siteUrl: 'http://stackoverflow.com/', apiBase: 'http://api.stackoverflow.com', userKey: 'swatch.so.uid', name: 'Stack Overflow', cssId: 'so-uid' },
  'serverfault': { iconUrl: 'http://serverfault.com/favicon.ico', siteUrl: 'http://serverfault.com/', apiBase: 'http://api.serverfault.com', userKey: 'swatch.sf.uid', name: 'Server Fault', cssId: 'sf-uid' },
  'superuser': { iconUrl: 'http://superuser.com/favicon.ico', siteUrl: 'http://superuser.com/', apiBase: 'http://api.superuser.com', userKey: 'swatch.su.uid', name: 'Super User', cssId: 'su-uid' },
  'metaso': { iconUrl: 'http://meta.stackoverflow.com/favicon.ico', siteUrl: 'http://meta.stackoverflow.com/', apiBase: 'http://api.meta.stackoverflow.com', userKey: 'swatch.mo.uid', name: 'Meta Stack Overflow', cssId: 'mo-uid' },
  'stackapps': { iconUrl: 'http://stackapps.com/favicon.ico', siteUrl: 'http://stackapps.com/', apiBase: 'http://api.stackapps.com', userKey: 'swatch.sa.uid', name: 'Stack Apps', cssId: 'sa-uid' }
};

API_KEY = 'DoTSH3_I7Emur-G8033suw';

Number.prototype.fancyNumber = function(type)
{
  if(type == 'short')
  {
    if(this > 10000)
    {
      return (this / 1000).toFixed(1) + 'k';
    }
    else
    {
      return '' + this;
    }
  }
  else if(type == 'comma')
  {
    var sval = '' + this.toFixed(0);

    var c = [];
    var offset = sval.length % 3;
    if(offset != 0)
    {
      c.push(sval.substr(0, offset));
    }

    for(var i=0; i<Math.floor(sval.length / 3); i++)
    {
      c.push(sval.substr((i*3) + offset, ((i+1)*3) + offset));
    }

    return c.join(',');
  }
  else
  {
    return '' + this;
  }
}

Date.prototype.simpleDateTimeFormat = function()
{
  return DAY_NAMES[this.getDay()] + ' ' + MONTH_NAMES[this.getMonth()] + ' ' + this.getDate() + ', ' + (this.getHours() <= 12 ? this.getHours() : this.getHours() - 12).pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2) + ' ' + (this.getHours() >= 12 ? 'PM' : 'AM');
}

Number.prototype.pad = function(length) 
{
  var str = '' + this;
  while (str.length < length) str = '0' + str;
  return str;
}

function sanitizeMention(input)
{
  return input == null ? null : input.replace('<a href', '<html:a onclick="gBrowser.selectedTab = gBrowser.addTab(this.href); return false;" href').replace('</a>', '</html:a>').replace('&hellip;', '...');
}
