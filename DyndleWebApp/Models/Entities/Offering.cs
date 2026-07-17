using DD4T.ContentModel;
using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System.Collections.Generic;
using System.Data.Services.Client;

namespace DyndleWebApp.Models.Entities
{
    [ContentModel("Offering", true)]
    public class Offering : EntityModel
    {
        [TextField(FieldName = "headline")]
        public virtual string Headline { get; set; }

        [TextField(FieldName = "introduction")]
        public virtual string introduction { get; set; }

        [EmbeddedSchemaField(FieldName = "body")]
        public virtual List<Paragraph> body { get; set; }

        // link is an Embedded Schema — map as EmbeddedSchemaField
        [EmbeddedSchemaField(FieldName = "link")]
        public virtual Link Link { get; set; }


    }


}