using DD4T.ViewModels.Attributes;
using Dyndle.Modules.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DyndleWebApp.Models.Entities
{
    ///<summary>
    /// Class is auto-generated from Tridion schema Link1 (tcm:6-79-8)
    /// Date: 7/26/2026 2:40:28 PM
    /// </summary>
    [ContentModel("EmbeddedLink", false)]
    public partial class EmbeddedLink : EntityModel
    {
        [TextField]
        public virtual string LinkText { get; set; }
        [TextField]
        public virtual string ExternalLink { get; set; }
        [LinkedComponentField(LinkedComponentTypes = new[] { typeof(EntityModel), typeof(EntityModel) })]
        public virtual EntityModel InternalLink { get; set; }
        [TextField]
        public virtual string AlternateText { get; set; }
    }
}