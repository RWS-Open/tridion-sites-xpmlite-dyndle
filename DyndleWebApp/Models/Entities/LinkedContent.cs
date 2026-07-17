using DD4T.ContentModel;
using DD4T.Mvc.ViewModels.Attributes;
using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
namespace DyndleWebApp.Models.Entities
{
    [ContentModel("LinkedContent", true)]      // ← matches schema root element name in CM
    public class LinkedContent : EntityModel
    {
        [TextField(FieldName = "subheading")]
        public virtual string subheading { get; set; }

        [RichTextField(FieldName = "content")]
        public virtual string Content { get; set; }

        // ✅ Multimedia Link field — use MultimediaField not MediaEntry
        [MultimediaField(FieldName = "media")]
        public virtual IMultimedia Media { get; set; }

        // link is an Embedded Schema — map as EmbeddedSchemaField
        [EmbeddedSchemaField(FieldName = "link")]
        public virtual Link Link { get; set; }
    }
}