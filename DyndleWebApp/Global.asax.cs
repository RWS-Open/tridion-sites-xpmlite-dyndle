using System;
using System.IO;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Autofac.Integration.Mvc;
using DD4T.Core.Contracts.ViewModels;
using DD4T.DI.Autofac;
using Dyndle.Modules.Core;
using Dyndle.Modules.Core.Contracts;
using DyndleWebApp.Controllers;
using DyndleWebApp.Infrastructure;
using Bootstrap = Dyndle.Modules.Core.Bootstrap;

namespace DyndleWebApp
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            log4net.Config.XmlConfigurator.Configure(new System.IO.FileInfo(Server.MapPath("~/log4net.config")));
            Bootstrap.Run();
              
            AreaRegistration.RegisterAllAreas();

            // Register your routes FIRST — before Dyndle's
            RouteTable.Routes.MapRoute(
                name: "PageRoute",
                url: "{*page}",
                defaults: new { controller = "Page", action = "Page" },
                namespaces: new[] { "DyndleWebApp.Controllers" }
            ); 

            RouteConfig.RegisterRoutes(RouteTable.Routes);

            var builder = new ContainerBuilder();
             
            foreach (var asm in Bootstrap.GetControllerAssemblies())
            {
                builder.RegisterControllers(asm);
            }
            builder.RegisterControllers(typeof(MvcApplication).Assembly);
            builder.Populate(Bootstrap.ServiceCollection);
            builder.UseDD4T();

            var container = builder.Build();
            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));

            // Only load view models if factory resolves successfully
            try
            {
                var vmFactory = DependencyResolver.Current.GetService<IViewModelFactory>();
                if (vmFactory != null)
                {
                    // This loads from all assemblies Dyndle knows about
                    vmFactory.LoadViewModels(Bootstrap.GetViewModelAssemblies());

                    // Also load from your own project assembly explicitly
                    vmFactory.LoadViewModels(new[] { typeof(MvcApplication).Assembly });
                }
            }
            catch (Exception ex)
            {
                // Log and continue — don't let this crash startup
                System.Diagnostics.Trace.TraceError("ViewModelFactory error: " + ex.Message);
            }

            Dyndle.Modules.Core.RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

      /*  protected void Application_BeginRequest()
        {
            CapabilityHelper.IsPreviewEnabled();
        }*/
        protected void Application_Error(object sender, EventArgs e)
        {
            var exception = Server.GetLastError();

          
            AppLogger.General.Error("Unhandled application error", exception);


            Server.ClearError();
            Response.Clear();

            var httpException = exception as HttpException
                             ?? exception?.InnerException as HttpException;

            int statusCode = httpException?.GetHttpCode() ?? 500;

            if (exception?.Message?.Contains("source") == true ||
                exception?.Message?.Contains("Value cannot be null") == true)
            {
                statusCode = 404;
            }

            Response.StatusCode = statusCode;

            
            string errorFile = statusCode == 404
                ? Server.MapPath("~/Views/Errors/404.html")
                : Server.MapPath("~/Views/Errors/500.html");

            if (System.IO.File.Exists(errorFile))
            {
                Response.ContentType = "text/html";
                Response.WriteFile(errorFile);
            }
            else
            {
                // ultimate fallback — inline HTML
                Response.Write(statusCode == 404
                    ? "<h1>404 - Page Not Found</h1><a href='/'>Go Home</a>"
                    : "<h1>500 - Server Error</h1><a href='/'>Go Home</a>");
            }

            Response.End();
        }
    }
}
