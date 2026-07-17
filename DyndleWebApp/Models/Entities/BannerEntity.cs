using DD4T.ContentModel;
using DD4T.Mvc.ViewModels.Attributes;
using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System.Collections.Generic;
using System.Data.Services.Client;

namespace DyndleWebApp.Models.Entities
{
    [ContentModel("ItemList", true)]
    public class BannerEntity : EntityModel
    {
        [TextField(FieldName = "headline")]
        public virtual string Headline { get; set; }

        [EmbeddedSchemaField(FieldName = "itemListElement")]
        public virtual List<LinkedContent> ItemListElements { get; set; }
    } 
}