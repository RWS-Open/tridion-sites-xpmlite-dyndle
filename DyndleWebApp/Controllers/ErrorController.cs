using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.Controllers
{
    public class ErrorController : Controller
    {
      
        public ActionResult NotFound()
        {
            Response.StatusCode = 404;
            return View("~/Areas/Core/Views/Page/PageNotFound.cshtml");
        }

        public ActionResult ServerError()
        {
            Response.StatusCode = 500;
            return View("~/Areas/Core/Views/Page/ServerError.cshtml");
        }
    }
}