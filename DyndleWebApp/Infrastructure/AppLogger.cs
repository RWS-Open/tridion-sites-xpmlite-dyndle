using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DyndleWebApp.Infrastructure
{
    public static class AppLogger
    {
        // one logger per named category
        public static ILog Page = LogManager.GetLogger("Dyndle.Page");
        public static ILog Nav = LogManager.GetLogger("Dyndle.Navigation");
        public static ILog Binary = LogManager.GetLogger("Dyndle.Binary");
        public static ILog General = LogManager.GetLogger("DyndleWebApp");
    }
}