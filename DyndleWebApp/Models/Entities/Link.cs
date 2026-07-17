using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DyndleWebApp.Models.Entities
{
    // Embedded schema for the link field
    public class Link : EntityModel
    {
        // XML Name: linkText | Type: Text
        [TextField(FieldName = "linkText")]
        public virtual string LinkText { get; set; }

        // XML Name: externalLink | Type: External Link
        [TextField(FieldName = "externalLink")]
        public virtual string ExternalLink { get; set; }

        // XML Name: internalLink | Type: Component Link
        [LinkedComponentField(FieldName = "internalLink")]
        public virtual EntityModel InternalLink { get; set; }

        // XML Name: alternateText | Type: Text
        [TextField(FieldName = "alternateText")]
        public virtual string AlternateText { get; set; }

        // ── Computed helper — returns whichever link is set ──────────────
        public string Url => ExternalLink ?? InternalLink?.Id?.ToString();
    }
}