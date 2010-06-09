/* See license.txt for terms of usage */

var currentValues = null;

function returnOptions()
{
  if(currentValues == null || document.getElementById('user-find-results').selectedCount <= 0)
  {
    window.arguments[1].uid = -1;
  }
  else
  {
    window.arguments[1].uid = currentValues[document.getElementById('user-find-results').selectedIndex];
  }
}

function userLookup()
{
  var uidId = window.arguments[0];

  document.getElementById('results-info').value = 'Searching...';

  var userList = document.getElementById('user-find-results');
  while(userList.hasChildNodes())
  {
    userList.removeChild(userList.firstChild);
  }

  var request = new StackAppsAPI.SAReq();
  request.addPath('users');
  request.addParam('key', API_KEY);
  request.addParam('filter', document.getElementById('user-find').value);

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

  httpRequest.onreadystatechange = function() { alertContents(this, null); }

// todo can this be switched off the cssid to the index value?
  var url;
  for(var siteInfo in SITES_CONFIG)
  {
    if(SITES_CONFIG[siteInfo].cssId == uidId)
    {
      url = SITES_CONFIG[siteInfo].apiBase + request.buildUrl();
      break;
    }
  }

  httpRequest.open('GET', url, true);
  httpRequest.send(null);
}

function alertContents(httpRequest, callback)
{ 
  if(httpRequest.readyState == 4)
  { 
    var needsReconfigure = false;
    if (httpRequest.status == 200)
    {
      var users = JSON.parse(httpRequest.responseText);

      if(users.users.length == 0)
      {
        document.getElementById('results-info').value = 'No profiles found.';
      }
      else
      {
        document.getElementById('results-info').value = '';
        var userList = document.getElementById('user-find-results');

        currentValues = [];
        for(var user in users.users)
        {
          var listItem = document.createElement("richlistitem");

          currentValues.push(users.users[user].user_id);

          var image = document.createElement("image");
          image.setAttribute("src", 'http://www.gravatar.com/avatar/' + users.users[user].email_hash + '?s=64&d=identicon&r=PG');
          image.setAttribute("width", '64');
          image.setAttribute("height", '64');
          image.setAttribute("style", 'padding:5px; width: 64; height: 64;');
          listItem.appendChild(image);

          var label = document.createElement("label");
          label.setAttribute("value", users.users[user].display_name);
          listItem.appendChild(label);

          userList.appendChild(listItem);
        }
      }
    }
    else
    {
      alert('There was a problem with the request. Status code = ' + httpRequest.status);
    }
  }
}
