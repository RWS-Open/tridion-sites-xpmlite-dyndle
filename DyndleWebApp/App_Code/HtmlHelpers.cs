using DD4T.Core.Contracts.ViewModels;
using DD4T.ViewModels.Attributes;
using Dyndle.Modules.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace DyndleWebApp.App_Code
{
    public static class FieldNameHtmlHelper 
    {
        public static MvcHtmlString DataFieldName<TModel, TValue>(
            this HtmlHelper<TModel> html,
            Expression<Func<TModel, TValue>> expression,
            int index = 0) 
        {
            var memberExpr = (expression.Body as MemberExpression)
                          ?? ((expression.Body as UnaryExpression)?.Operand as MemberExpression);

            if (memberExpr == null) return MvcHtmlString.Empty;

            var prop = memberExpr.Member as PropertyInfo;
            var fieldName = prop?.GetCustomAttribute<TextFieldAttribute>()?.FieldName
                         ?? prop?.Name.ToLower();

            // renders both data-fieldname and data-index together
            return MvcHtmlString.Create(
                $"data-fieldname=\"{fieldName}\" data-index=\"{index}\"");
        }



     
        public static MvcHtmlString RegionMarkup(this HtmlHelper html)
        {
            var region = html.ViewData.Model as IRegionModel;

            if (region == null) return MvcHtmlString.Empty;

            return MvcHtmlString.Create(
                $"typeof=\"Region\" data-region=\"{region.Name}\"");
        }

  
        public static MvcHtmlString EntityMarkup(this HtmlHelper html)
        {
            var entity = html.ViewData.Model as Dyndle.Modules.Core.Models.EntityModel;

            if (entity == null) return MvcHtmlString.Empty;

            var componentId = entity.Id?.ToString();

            if (string.IsNullOrEmpty(componentId)) return MvcHtmlString.Empty;

            return MvcHtmlString.Create($"data-component-id=\"{componentId}\"");
        }
    }
}