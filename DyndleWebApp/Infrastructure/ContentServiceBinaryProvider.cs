

using DD4T.ContentModel;
using DD4T.ContentModel.Contracts.Configuration;
using DD4T.ContentModel.Contracts.Logging;
using DD4T.ContentModel.Contracts.Providers;
using System;
using System.IO;
using System.Net.Http;
using System.Text.RegularExpressions;

namespace DyndleWebApp.Infrastructure
{

    public class ContentServiceBinaryProvider : IBinaryProvider
    {
        private static readonly HttpClient HttpClient = new HttpClient();
        private readonly IDD4TConfiguration _config;
        private readonly ILogger _logger;

        // Parse item ID from URL like /media/shutterstock_..._tcm7-626.jpg → 626
        private static readonly Regex TcmIdRegex =
            new Regex(@"_tcm\d+-(\d+)\.", RegexOptions.Compiled);

        public ContentServiceBinaryProvider(IDD4TConfiguration config, ILogger logger)
        {
            _config = config;
            _logger = logger;
        }

        public int PublicationId
        {
            get => _config.PublicationId;
            set { }
        }

        public byte[] GetBinaryByUrl(string url)
        {
            _logger.Debug($"[ContentServiceBinaryProvider] GetBinaryByUrl: {url}");

            int itemId = ExtractItemId(url);
            if (itemId <= 0)
            {
                _logger.Warning($"[ContentServiceBinaryProvider] Could not extract item ID from URL: {url}");
                return null;
            }

            return FetchFromContentService(itemId);
        }

        public byte[] GetBinaryByUri(string tcmUri)
        {
            _logger.Debug($"[ContentServiceBinaryProvider] GetBinaryByUri: {tcmUri}");

            // tcmUri format: tcm:7-626 or tcm:7-626-16
            var match = Regex.Match(tcmUri, @"tcm:\d+-(\d+)");
            if (!match.Success) return null;

            int itemId = int.Parse(match.Groups[1].Value);
            return FetchFromContentService(itemId);
        }

        public DateTime GetLastPublishedDateByUrl(string url)
        {
            // Return MinValue to force DD4T to always re-fetch if file missing
            // For production, query the broker meta via CIL here
            return DateTime.MinValue;
        }

        public DateTime GetLastPublishedDateByUri(string tcmUri)
        {
            return DateTime.MinValue;
        }

        public string GetUrlForUri(string tcmUri)
        {
            return null; // Not needed for basic binary serving
        }

        // ── private helpers ──────────────────────────────────────────────────

        private int ExtractItemId(string url)
        {
            // Try _tcm7-626 pattern in URL first
            var match = TcmIdRegex.Match(url);
            if (match.Success)
                return int.Parse(match.Groups[1].Value);

            // Fallback: use CIL BinaryMetaFactory if no TCM ID in URL
            try
            {
                var metaFactory = new Tridion.ContentDelivery.Meta.BinaryMetaFactory();
                var meta = metaFactory.GetMetaByUrl(PublicationId, url);
                return meta?.Id ?? -1;
            }
            catch (Exception ex)
            {
                _logger.Error($"[ContentServiceBinaryProvider] BinaryMetaFactory failed: {ex.Message}");
                return -1;
            }
        }

        private byte[] FetchFromContentService(int itemId)
        {
            // Uses DD4T.ContentProviderEndPoint from Web.config
            var endPoint = _config.ContentProviderEndPoint
                           ?? "https://sites.tridiondemo.com:8081/cd/api";

            // Remove trailing /cd/api if already in EndPoint, build clean URL
            var baseUrl = endPoint.TrimEnd('/');
            // endPoint is "https://sites.tridiondemo.com:8081/cd/api"
            // binary URL pattern: /cd/api/binary/{namespaceId}/{pubId}/{itemId}
            var downloadUrl = $"{baseUrl}/binary/1/{PublicationId}/{itemId}";

            _logger.Debug($"[ContentServiceBinaryProvider] Fetching: {downloadUrl}");

            try
            {
                var bytes = HttpClient.GetByteArrayAsync(downloadUrl).Result;
                _logger.Debug($"[ContentServiceBinaryProvider] Got {bytes?.Length ?? 0} bytes for itemId {itemId}");
                return bytes;
            }
            catch (Exception ex)
            {
                _logger.Error($"[ContentServiceBinaryProvider] Failed to fetch {downloadUrl}: {ex.Message}");
                return null;
            }
        }

        public Stream GetBinaryStreamByUri(string uri)
        {
            throw new NotImplementedException();
        }

        public Stream GetBinaryStreamByUrl(string url)
        {
            throw new NotImplementedException();
        }

        DateTime IBinaryProvider.GetLastPublishedDateByUri(string uri)
        {
            throw new NotImplementedException();
        }

        DateTime IBinaryProvider.GetLastPublishedDateByUrl(string url)
        {
            throw new NotImplementedException();
        }

        public IBinaryMeta GetBinaryMetaByUri(string uri)
        {
            throw new NotImplementedException();
        }

        public IBinaryMeta GetBinaryMetaByUrl(string url)
        {
            throw new NotImplementedException();
        }
    }
}