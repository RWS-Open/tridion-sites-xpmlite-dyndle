using System.Collections.Generic;
using DD4T.Core.Contracts.ViewModels;
using DD4T.ViewModels.Attributes;
using Dyndle.Modules.Core.Attributes.ViewModels;
using Dyndle.Modules.Core.Models;

namespace DyndleWebApp.Models.Pages
{
    [PageViewModel(TemplateTitle = "Dyndle Dynamic Header Page - PT")]
    public class HeaderPage : WebPage
    {
        [PageTitle]
        public virtual string PageTitle { get; set; }

        [Regions]
        public virtual List<IRegionModel> Regions { get; set; }

        [ComponentPresentations]
        public virtual List<IEntityModel> Entities { get; set; }
    }
}