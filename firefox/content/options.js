/* See license.txt for terms of usage */

var SwatchOptions =
{
  loadOptions: function()
  {
    var siteList = document.getElementById('site-list');

    for(var site in SITES_CONFIG)
    {
      var siteInfo = SITES_CONFIG[site];

      var rowItem = document.createElement("row");
      rowItem.setAttribute("align", "center");

      var siteLabel = document.createElement("label");
      siteLabel.setAttribute("control", siteInfo.cssId);
      siteLabel.setAttribute("value", siteInfo.name);
      rowItem.appendChild(siteLabel);

      var textBox = document.createElement("textbox");
      textBox.setAttribute("id", siteInfo.cssId);
      textBox.setAttribute("disabled", 'true');
      rowItem.appendChild(textBox);

      var button = document.createElement("button");
      button.setAttribute("label", 'Search');
      button.setAttribute("image", 'chrome://swatch/skin/images/magnifier.png');
      button.setAttribute("accesskey", 'S');
      button.setAttribute("oncommand", "userSearch('" + siteInfo.cssId + "');");
      rowItem.appendChild(button);

      siteList.appendChild(rowItem);

      document.getElementById(siteInfo.cssId).value = Prefs.getInteger(siteInfo.userKey);
    }
  },

  saveOptions: function()
  {
    for(var site in SITES_CONFIG)
    {
      Prefs.setInteger(SITES_CONFIG[site].userKey, document.getElementById(SITES_CONFIG[site].cssId).value);
    }
  }
};

function userSearch(uidId)
{
  var results = {uid: -1};
  window.openDialog("chrome://swatch/content/finduser.xul", "", "modal,centerscreen", uidId, results);

  if(results.uid != -1)
  {
    document.getElementById(uidId).value = results['uid'];
  }
}
