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
        public new ActionResult OfferEntity(IEntityModel entity)
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
            return PartialView("~/Areas/Core/Views/Entity/ProductEntity.cshtml", entity);
        }

        // Match the exact signature from EntityController
        [ChildActionOnly]
        public new ActionResult OfferEntity12121(IEntityModel entity)
        {
            var collection = entity as OfferingCollection;

            if (collection != null)
            {
                var resolved = new List<Offering>();
                // Fetch the raw DD4T component directly from broker using the entity Id
             //   var rawComponent = _componentFactory.GetComponent(entity.Id.ToString());

               
                    try
                    {
                        System.Diagnostics.Trace.TraceInformation($"Stub ID: '{entity.Id}'");

                        var dd4tComponent = _componentFactory.GetComponent(entity.Id.ToString());
                        if (dd4tComponent != null)
                        {
                            var offering = _viewModelFactory
                                .BuildViewModel<Offering>(dd4tComponent);
                            if (offering != null)
                                resolved.Add(offering);
                        }
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Trace.TraceError(
                            $"Could not resolve Offering {entity.Id.ToString()}: {ex.Message}");
                    }
                

                collection.Offerings = resolved;
            }

            // Call base to do the normal view resolution
            return base.Entity(entity);
        }

        [ChildActionOnly]
        public new ActionResult OfferEntit222y(IEntityModel entity)
        {
            System.Diagnostics.Trace.TraceInformation("=== OfferEntity Debug ===");
            System.Diagnostics.Trace.TraceInformation($"Type: {entity?.GetType().FullName}");
            System.Diagnostics.Trace.TraceInformation($"Id: {entity?.Id}");

            var collection = entity as OfferingCollection;
            System.Diagnostics.Trace.TraceInformation($"Cast success: {collection != null}");
            System.Diagnostics.Trace.TraceInformation($"Offerings null: {collection?.Offerings == null}");
            System.Diagnostics.Trace.TraceInformation($"Offerings count: {collection?.Offerings?.Count}");

            // Fetch the raw DD4T component directly from broker using the entity Id
            var rawComponent = _componentFactory.GetComponent(entity.Id.ToString());

            System.Diagnostics.Trace.TraceInformation("=== DD4T In-Memory Debug ===");
            System.Diagnostics.Trace.TraceInformation($"Interfaces: {string.Join(", ", entity.GetType().GetInterfaces().Select(i => i.Name))}");

            // Try every possible cast to get to the raw fields
            var cp = entity as DD4T.ContentModel.IComponentPresentation;
            var comp = entity as DD4T.ContentModel.IComponent;


            // Dump all properties via reflection
            if (collection != null)
            {
                foreach (var prop in collection.GetType().GetProperties())
                {
                    try
                    {
                        var val = prop.GetValue(collection);
                        System.Diagnostics.Trace.TraceInformation($"  Prop [{prop.Name}] = {val ?? "NULL"}");
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Trace.TraceInformation($"  Prop [{prop.Name}] = ERROR: {ex.Message}");
                    }
                }
            }

            return base.Entity(entity);
        }
    }
}