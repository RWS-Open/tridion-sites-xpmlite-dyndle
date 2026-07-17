using log4net;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Configuration;

namespace DyndleWebApp.Infrastructure
{
    /// <summary>
    /// Replaces DD4T's BinaryDistributionModule for Tridion Sites 10.x.
    /// Fetches binary bytes directly from the Content Service REST API
    /// since binary content is NOT stored in the broker DB in Tridion 10.
    /// Self-contained: reads Web.config directly, no DI container needed.
    /// </summary>
    public class BinaryProxyModule : IHttpModule
    {

        private static readonly ILog Log =
         LogManager.GetLogger("Dyndle.Binary");

        // Shared across all requests — HttpClient must be static
        private static readonly HttpClient Http = new HttpClient();

        // MIME type lookup — replaces switch expression (not available in C# 7.3)
        private static readonly Dictionary<string, string> MimeTypes =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { ".jpg",  "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".png",  "image/png"  },
                { ".gif",  "image/gif"  },
                { ".svg",  "image/svg+xml" },
                { ".pdf",  "application/pdf" }
            };

        // Extracts item ID from _tcm7-626 suffix in URL filename
        private static readonly Regex TcmSuffixRegex =
            new Regex(@"_tcm\d+-(\d+)\.", RegexOptions.Compiled);

        // Config — read once lazily from Web.config
        private static readonly Lazy<string> ContentServiceBase = new Lazy<string>(() =>
        {
            var ep = WebConfigurationManager.AppSettings["DD4T.ContentProviderEndPoint"]
                     ?? "https://sites.tridiondemo.com:8081/cd/api";
              
            return ep.TrimEnd('/');
        });

        private static readonly Lazy<int> PublicationId = new Lazy<int>(() =>
        {
            int id;
            return int.TryParse(
                WebConfigurationManager.AppSettings["DD4T.PublicationId"], out id) ? id : 7;
        });

        private static readonly Lazy<string> BinaryRootPath = new Lazy<string>(() =>
        {
            return WebConfigurationManager.AppSettings["DD4T.BinaryFileSystemPath"]
                   ?? "~/BinaryData";
        });

        private static readonly Lazy<Regex> UrlPattern = new Lazy<Regex>(() =>
        {
            var pattern = WebConfigurationManager.AppSettings["DD4T.BinaryUrlPattern"]
                          ?? @"^/media/.*\.(jpg|jpeg|png|gif|svg|pdf)$";
            return new Regex(pattern, RegexOptions.IgnoreCase | RegexOptions.Compiled);
        });

        public void Init(HttpApplication context)
        {
            context.BeginRequest += OnBeginRequest;
        }

        private void OnBeginRequest(object sender, EventArgs e)
        {
            var app = (HttpApplication)sender;
            var ctx = app.Context;
            var relativeUrl = ctx.Request.Url.AbsolutePath;

         

            // ✅ Skip static content folders — let IIS serve them directly
            if (relativeUrl.StartsWith("/Content/", StringComparison.OrdinalIgnoreCase) ||
                relativeUrl.StartsWith("/Scripts/", StringComparison.OrdinalIgnoreCase) ||
                relativeUrl.StartsWith("/fonts/", StringComparison.OrdinalIgnoreCase))
                return;

            // Only intercept binary URLs matching the configured pattern
            if (!UrlPattern.Value.IsMatch(relativeUrl))
                return;

            // Resolve physical disk cache path
            var physicalPath = ResolvePhysicalPath(app, relativeUrl);

            // If already cached on disk and non-empty, serve directly
            if (File.Exists(physicalPath) && new FileInfo(physicalPath).Length > 0)
            {
                Log.Debug("Serving from disk cache: " + physicalPath);
                ServeFile(ctx, physicalPath);
                return;
            }

            // Delete any 0-byte stale file left by old BinaryDistributionModule
            if (File.Exists(physicalPath))
                TryDeleteFile(physicalPath);

            // Extract item ID from URL (e.g. _tcm7-626 → 626)
            int itemId = ExtractItemId(relativeUrl, app);
            if (itemId <= 0)
            {
                Log.Debug("Could not extract item ID from: " + relativeUrl);
                ctx.Response.StatusCode = 404;
                ctx.Response.End();
                return;
            }

            // Build Content Service download URL
            // Format: /cd/api/binary/{namespaceId}/{publicationId}/{itemId}
            var downloadUrl = string.Format(
                "{0}/binary/1/{1}/{2}",
                ContentServiceBase.Value,
                PublicationId.Value,
                itemId);

            Log.Debug("Fetching from Content Service: " + downloadUrl);

            byte[] bytes;
            try
            {
                bytes = Http.GetByteArrayAsync(downloadUrl).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                Log.Error("ERROR fetching " + downloadUrl + ": " + ex.Message);
                ctx.Response.StatusCode = 502;
                ctx.Response.End();
                return;
            }

            if (bytes == null || bytes.Length == 0)
            {
                Log.Debug("Content Service returned empty response for itemId " + itemId);
                ctx.Response.StatusCode = 404;
                ctx.Response.End();
                return;
            }

            Log.Debug(string.Format("Got {0} bytes for itemId {1}", bytes.Length, itemId));

            // Write to disk cache
            try
            {
                var dir = Path.GetDirectoryName(physicalPath);
                if (!string.IsNullOrEmpty(dir))
                    Directory.CreateDirectory(dir);

                File.WriteAllBytes(physicalPath, bytes);
                Log.Debug("Written to disk: " + physicalPath);
            }
            catch (Exception ex)
            {
                Log.Debug("ERROR writing to disk " + physicalPath + ": " + ex.Message);
                // Disk write failed — serve from memory instead
                ServeBytes(ctx, bytes, GetMimeType(physicalPath));
                return;
            }

            ServeFile(ctx, physicalPath);
        }

        // ── helpers ──────────────────────────────────────────────────────────

        private string ResolvePhysicalPath(HttpApplication app, string relativeUrl)
        {
            var root = BinaryRootPath.Value;

            // Handle ~/BinaryData style virtual paths
            var physicalRoot = root.StartsWith("~")
                ? app.Server.MapPath(root)
                : root;

            // /media/image.jpg → BinaryData\media\image.jpg
            var filePart = relativeUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            return Path.Combine(physicalRoot, filePart);
        }

        private int ExtractItemId(string url, HttpApplication app)
        {
            // Primary: parse _tcm7-626 suffix directly from URL
            var match = TcmSuffixRegex.Match(url);
            if (match.Success)
                return int.Parse(match.Groups[1].Value);

            // Fallback: CIL BinaryMetaFactory lookup (for clean URLs without TCM suffix)
            try
            {
                var metaFactory = new Tridion.ContentDelivery.Meta.BinaryMetaFactory();
                var meta = metaFactory.GetMetaByUrl(PublicationId.Value, url);
                if (meta != null)
                    return meta.Id;
            }
            catch (Exception ex)
            {
                Log.Error("BinaryMetaFactory fallback failed: " + ex.Message);
            }

            return -1;
        }

        private static void ServeFile(HttpContext ctx, string physicalPath)
        {
            ctx.Response.ContentType = GetMimeType(physicalPath);
            ctx.Response.TransmitFile(physicalPath);
            ctx.Response.End();
        }

        private static void ServeBytes(HttpContext ctx, byte[] bytes, string mimeType)
        {
            ctx.Response.ContentType = mimeType;
            ctx.Response.BinaryWrite(bytes);
            ctx.Response.End();
        }

        private static string GetMimeType(string path)
        {
            var ext = Path.GetExtension(path);
            if (string.IsNullOrEmpty(ext))
                return "application/octet-stream";

            string mimeType;
            return MimeTypes.TryGetValue(ext, out mimeType)
                ? mimeType
                : "application/octet-stream";
        }

        private static void TryDeleteFile(string path)
        {
            try { File.Delete(path); }
            catch { /* ignore — file may be locked */ }
        }
 

        public void Dispose() { }
    }
}