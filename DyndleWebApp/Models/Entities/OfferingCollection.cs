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
    ///<summary>
    /// Class is auto-generated from Tridion schema Dyndle Offering Collection (tcm:6-10732-8)
    /// Date: 7/26/2026 2:40:28 PM
    /// </summary>
    [ContentModel("OfferingCollection", true)]
    public partial class OfferingCollection : EntityModel
    {

        //  [LinkedComponentField(LinkedComponentTypes = new[] { typeof(Offering) })]
        [LinkedComponentField(FieldName = "offerings", LinkedComponentTypes = new[] { typeof(Offering) })]
        public virtual List<Offering> Offerings { get; set; }
       
    }
}