using DD4T.ContentModel;
using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DyndleWebApp.Models.Entities
{
    public class Paragraph : EntityModel
    {
        [TextField(FieldName = "subheading")]
        public virtual string Subheading { get; set; }

        [TextField(FieldName = "content")]
        public virtual string Content { get; set; }

        // ✅ Multimedia Link field — use MultimediaField not MediaEntry
        [MultimediaField(FieldName = "media")]
        public virtual IMultimedia Media { get; set; }

        [TextField(FieldName = "caption")]
        public virtual string caption { get; set; }

    }
}