using DD4T.ContentModel.Contracts.Logging;
using DD4T.ContentModel.Factories;
using DD4T.Core.Contracts.ViewModels;
using Dyndle.Modules.Core.Controllers;
using Dyndle.Modules.Core.Models;
using Dyndle.Modules.Core.Providers.Content;
using DyndleWebApp.Models.Entities;
 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.Areas.Core.Controllers
{
    public class OfferingCollectionController : EntityController
    {
        private readonly IComponentFactory _componentFactory;
        private readonly IViewModelFactory _viewModelFactory;

        public OfferingCollectionController(
            IContentProvider contentProvider,
            ILogger logger,
            IComponentFactory componentFactory,
            IViewModelFactory viewModelFactory)
            : base(contentProvider, logger)
        {
            _componentFactory = componentFactory;
            _viewModelFactory = viewModelFactory;
        }


        [ChildActionOnly]
        public   ActionResult OfferEntity(IEntityModel entity)
        {
            var collection = entity as OfferingCollection;

            if (collection != null)
            {
                var resolved = new List<Offering>();

                // This works - you confirmed dd4tComponent has the data
                var dd4tComponent = _componentFactory.GetComponent(entity.Id.ToString());

                if (dd4tComponent != null)
                {
                    var component = (DD4T.ContentModel.Component)dd4tComponent;

                    // Get the offerings field
                    if (component.Fields.ContainsKey("offerings"))
                    {
                        var offeringsField = component.Fields["offerings"];

                        // Iterate each linked component (LightSolar CI, CII etc)
                        foreach (var linkedComponent in offeringsField.LinkedComponentValues)
                        {
                            // Build Offering view model from each linked component directly
                            var offering = _viewModelFactory.BuildViewModel<Offering>(linkedComponent);

                            if (offering != null)
                            {
                                System.Diagnostics.Trace.TraceInformation(
                                    $"Offering mapped: Headline={offering.Headline}");
                                resolved.Add(offering);
                            }
                        }
                    }
                }

                collection.Offerings = resolved;
            }

            // Explicit path so MVC doesn't look in /OfferingCollection/ folder
            return PartialView($"~/Areas/Core/Views/Entity/{entity.MvcData.View}.cshtml", entity);
        }

         
    }
}