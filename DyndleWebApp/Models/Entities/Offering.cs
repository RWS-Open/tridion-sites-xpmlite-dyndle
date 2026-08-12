using DD4T.ContentModel;
using DD4T.ViewModels.Attributes;
using DD4T.ViewModels.Base;
using Dyndle.Modules.Core.Models;
using System.Collections.Generic;
using System.Data.Services.Client;

namespace DyndleWebApp.Models.Entities
{
    ///<summary>
    /// Class is auto-generated from Tridion schema Dyndle Offering (tcm:6-10679-8)
    /// Date: 7/26/2026 2:40:28 PM
    /// </summary>
    [ContentModel("Offering", true)]
    public partial class Offering : EntityModel
    {
        [TextField(FieldName = "headline")]
        public virtual string Headline { get; set; }

        [TextField(FieldName = "introduction")]
        public virtual string Introduction { get; set; }

   //     [EmbeddedSchemaField(EmbeddedModelType = typeof(Paragraph))]
        [EmbeddedSchemaField(FieldName = "body")]
        public virtual List<Paragraph> Body { get; set; }

        //[EmbeddedSchemaField(EmbeddedModelType = typeof(EmbeddedLink))]
        [EmbeddedSchemaField(FieldName = "link")]
        public virtual EmbeddedLink Link { get; set; }
    }


}