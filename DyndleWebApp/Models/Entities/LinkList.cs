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
    [ContentModel("LinkList", true)]      // ← matches schema root element name in CM
    public class LinkList : EntityModel
    {
        [TextField(FieldName = "headline")]
        public virtual string heading { get; set; } 

        // link is an Embedded Schema — map as EmbeddedSchemaField
        [EmbeddedSchemaField(FieldName = "link")]
        public virtual List<Link> Links { get; set; }
    }
}