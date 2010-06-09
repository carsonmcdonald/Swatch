/* See license.txt for terms of usage */

(function () {

function runningInNode () 
{
  return( (typeof require) == "function" &&
          (typeof exports) == "object" &&
          (typeof module) == "object" &&
          (typeof __filename) == "string" &&
          (typeof __dirname) == "string");
}

if (!runningInNode()) 
{
  if (!this.StackAppsAPI)
    this.StackAppsAPI = {};
  else if (this.StackAppsAPI)
    return; 

  exports = this.StackAppsAPI;
}

  function SAReq() 
  {
    this.pathParts = [];
    this.paramParts = [];
  }

  SAReq.prototype.addParam = function(paramKey, paramValue)
  {
    this.paramParts.push(paramKey + '=' + escape(paramValue));
  }

  SAReq.prototype.addPath = function(pathPart)
  {
    this.pathParts.push(pathPart);
  }

  SAReq.prototype.buildUrl = function()
  {
    var url = '/0.8/'; 

    url += this.pathParts.join('/'); 

    if(this.paramParts.length > 0)
    {
      url += '?' + this.paramParts.join('&');
    }

    return url;
  }

exports.SAReq = SAReq;

})();
