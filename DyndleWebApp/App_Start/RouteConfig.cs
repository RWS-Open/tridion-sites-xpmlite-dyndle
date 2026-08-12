using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace DyndleWebApp
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Test route — verify this hits first
            //routes.MapRoute(
            //    name: "Test",
            //    url: "test/{action}",
            //    defaults: new { controller = "Test", action = "Index" },
            //    namespaces: new[] { "DyndleWebApp.Controllers" }
            //);

            //      routes.MapRoute(
            //    name: "TeaserCollection",
            //    url: "TeaserCollection/{action}",
            //    defaults: new { controller = "TeaserCollection", action = "TeaserCollection" },
            //    namespaces: new[] { "DyndleWebApp.Controllers" }
            //);

            // Register your routes FIRST — before Dyndle's
            //routes.MapRoute(
            //    name: "PageRoute",
            //    url: "{*page}",
            //    defaults: new { controller = "Page", action = "Page" },
            //    namespaces: new[] { "DyndleWebApp.Controllers" }
            //);

            routes.MapRoute(
         name: "PageRoute",
         url: "{*page}",
         defaults: new { controller = "Page", action = "Page" },
         namespaces: new[] { "DyndleWebApp.Controllers" }
     );


            Dyndle.Modules.Core.RouteConfig.RegisterRoutes(routes);
        }
    }
}
