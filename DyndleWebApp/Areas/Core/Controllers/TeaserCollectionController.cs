using DD4T.ContentModel;
using DD4T.ContentModel.Contracts.Configuration;
using DD4T.ContentModel.Contracts.Logging;
using DD4T.ContentModel.Factories;
using DD4T.Core.Contracts.ViewModels;
using DD4T.Mvc.Controllers;
using DyndleWebApp.Models.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.Areas.Core.Controllers
{
    public class TeaserCollectionController : TridionControllerBase
    {
        private readonly IComponentFactory _componentFactory;
        private readonly IViewModelFactory _viewModelFactory;

        public TeaserCollectionController(
            IPageFactory pageFactory,
            IComponentPresentationFactory componentPresentationFactory,
            ILogger logger,
            IDD4TConfiguration configuration,
            IComponentFactory componentFactory,
            IViewModelFactory viewModelFactory)
            : base(pageFactory, componentPresentationFactory, logger, configuration)
        {
            _componentFactory = componentFactory;
            _viewModelFactory = viewModelFactory;
        }

    /*
        [ChildActionOnly]
        public ActionResult TeaserCollection(ComponentPresentation componentPresentation)
        {

            // Inspect ALL RouteData values
            foreach (var key in RouteData.Values.Keys)
            {
                var val = RouteData.Values[key];
                System.Diagnostics.Debug.WriteLine($"RouteData Key: {key}, Value: {val}, Type: {val?.GetType().Name}");
            }

            // Also check if the parameter itself has anything
            System.Diagnostics.Debug.WriteLine($"Parameter cp null: {componentPresentation == null}");
            System.Diagnostics.Debug.WriteLine($"Parameter cp.Component null: {componentPresentation?.Component == null}");

            // Get the real ComponentPresentation from RouteData (how Dyndle passes it)
            var cp = RouteData.Values["componentPresentation"] as IComponentPresentation;

            if (cp == null)
                return new EmptyResult();

            var model = _viewModelFactory.BuildViewModel(cp) as OfferingCollection;

            var viewModel = new TeaserCollectionViewModel();

            if (model?.teasers != null)
            {
                foreach (var linkedComponent in model.teasers)
                {
                    IComponent component;
                    _componentFactory.TryGetComponent(linkedComponent.Id, out component);

                    if (component != null)
                    {
                        var teaser = _viewModelFactory.BuildViewModel(component) as Teaser;
                        if (teaser != null)
                            viewModel.Teasers.Add(teaser);
                    }
                }
            }

            return View(viewModel);
        }
  */
    }
}