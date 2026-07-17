using Microsoft.Extensions.Caching.Memory;
using System;
using System.Linq;
using System.Net;

using System.Xml.Linq;
using System.Web;
using System.Configuration;
namespace DyndleWebApp.App_Code
{
    public static class CapabilityHelper
    {

        // Change this URL if required
        private static readonly string DiscoveryUrl = ConfigurationManager.AppSettings["discovery-service-uri"];
        private static readonly string previewWebServiceCapability = ConfigurationManager.AppSettings["previewWebServiceCapability"];

        private const string CacheKey = "PreviewWebServiceEnabled";

        public static bool IsPreviewEnabled()
        {
            if (HttpRuntime.Cache[CacheKey] != null)
                return (bool)HttpRuntime.Cache[CacheKey];

            bool result = CheckPreviewCapability();

            HttpRuntime.Cache.Insert(
                CacheKey,
                result,
                null,
                DateTime.Now.AddMinutes(5),
                System.Web.Caching.Cache.NoSlidingExpiration);

            return result;
        }
        private static string GetPreviewCapabilityUrl()
        {
            if (string.IsNullOrWhiteSpace(DiscoveryUrl))
                throw new ConfigurationErrorsException(
                    "AppSetting 'discovery-service-uri' is missing.");

            return DiscoveryUrl.TrimEnd('/') +
                   "/Environment/" + previewWebServiceCapability;
        }

        private static bool CheckPreviewCapability()
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(GetPreviewCapabilityUrl());
                request.Accept = "application/xml";

                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch (WebException ex)
            {
                if (ex.Response is HttpWebResponse response)
                {
                    if (response.StatusCode == HttpStatusCode.NotFound ||
                        response.StatusCode == HttpStatusCode.BadRequest)
                    {
                        return false;
                    }
                }

                return false;
            }
        }

        public static void ClearCache()
        {
            HttpRuntime.Cache.Remove(CacheKey);

        }
    }
}