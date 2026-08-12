using Dyndle.Modules.Core.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.Controllers
{
    public class HomeController : Controller
    {
        public virtual ContentResult Page(IWebPage page)
        {
            if (page != null)
            {
                return Content(JsonConvert.SerializeObject(page.ModelData, Formatting.Indented), "application/json");
            }
            else
            {
                return Content("Page not found");
            }
        }
    }
}