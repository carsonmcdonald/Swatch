/* See license.txt for terms of usage */

var Prefs =
{
  del: function(preference)
  {
    if(this.isSet(preference))
    {
      this.getPreferencesService().clearUserPref(preference);
    }
  },
  
  getBoolean: function(preference, userPreference)
  {
    if(!userPreference || this.isPreferenceSet(preference))
    {
      try
      {
        return this.getPreferencesService().getBoolPref(preference);
      }
      catch(exception)
      {
      }
    }
  
    return false;
  },
  
  getInteger: function(preference, userPreference)
  {
    if(!userPreference || this.isPreferenceSet(preference))
    {
      try
      {
        return this.getPreferencesService().getIntPref(preference);
      }
      catch(exception)
      {
      }
    }
  
    return 0;
  },
  
  getPreferencesService: function()
  {
    return Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("");
  },
  
  getString: function(preference, userPreference)
  {
    if(!userPreference || this.isPreferenceSet(preference))
    {
      try
      {
        return this.getPreferencesService().getComplexValue(preference, Components.interfaces.nsISupportsString).data;
      }
      catch(exception)
      {
      }
    }
  
    return null;
  },
  
  isPreferenceSet: function(preference)
  {
    return preference && this.getPreferencesService().prefHasUserValue(preference);
  },
  
  setBoolean: function(preference, value)
  {
    this.getPreferencesService().setBoolPref(preference, value);
  },
  
  setInteger: function(preference, value)
  {
    this.getPreferencesService().setIntPref(preference, value);
  },
  
  setString: function(preference, value)
  {
    var supportsStringInterface = Components.interfaces.nsISupportsString;
    var string                  = Components.classes["@mozilla.org/supports-string;1"].createInstance(supportsStringInterface);
  
    string.data = value;
  
    this.getPreferencesService().setComplexValue(preference, supportsStringInterface, string);
  }
};
