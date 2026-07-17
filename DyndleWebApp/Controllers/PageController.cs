using DD4T.ContentModel.Contracts.Configuration;
using DD4T.ContentModel.Contracts.Logging;
using Dyndle.Modules.Core.Contracts;
using Dyndle.Modules.Core.Models;
using Dyndle.Modules.Core.Providers.Content;
using Dyndle.Modules.Core.Services.Preview;
using Dyndle.Modules.Core.Services.Redirection;
using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.Controllers
{
    public class PageController : Dyndle.Modules.Core.Controllers.PageController
    {
        private static readonly ILog Log = LogManager.GetLogger("Dyndle.Page");

        public PageController(
            IContentProvider contentProvider,
            ILogger logger,
            IPreviewContentService previewContentService,
            IList<IWebPageEnrichmentProvider> enrichmentProviders,
            IRedirectionService redirectionService,
            IDD4TConfiguration configuration)
            : base(contentProvider, logger, previewContentService,
                   enrichmentProviders, redirectionService, configuration)
        {
        }

        // ✅ correct signature — takes IWebPage not string
        public override ActionResult Page(IWebPage page)
        {
            Log.Debug($"Rendering page: {page?.Id}");

            try
            {
                return base.Page(page);
            }
            catch (Exception ex)
            {
                Log.Warn($"Page error: {page?.Id} → {ex.Message}");
                return NotFoundResult();
            }
        }

        // ✅ correct signature — takes HttpContextBase not HttpContext
        protected override void OnException(ExceptionContext filterContext)
        {
            Log.Error($"Unhandled exception for: {filterContext.HttpContext.Request.Url}",
                       filterContext.Exception);

            filterContext.ExceptionHandled = true;
            ShowNotFound(filterContext.HttpContext);  // HttpContextBase ✅
        }

        private ActionResult NotFoundResult()
        {
            ShowNotFound(new HttpContextWrapper(System.Web.HttpContext.Current));
            return null;
        }

        private void ShowNotFound(HttpContextBase ctx)  // ✅ HttpContextBase
        {
            ctx.Response.Clear();
            ctx.Response.StatusCode = 404;
            ctx.Response.ContentType = "text/html";

            string file = ctx.Server.MapPath("~/Views/Errors/404.html");

            if (System.IO.File.Exists(file))
                ctx.Response.WriteFile(file);
            else
                ctx.Response.Write(@"
                    <html><body style='text-align:center;padding:100px'>
                        <h1>404 - Page Not Found</h1>
                        <p>This page has not been published or not implemented yet.</p>
                        <a href='/'>Go to Home</a>
                    </body></html>");

            ctx.Response.End();
        }
    }

}