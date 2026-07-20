# Dyndle Web Application with XPM Lite

## Overview

This web application is **built using Dyndle and XPM Lite** to enable inline editing with Tridion Sites.

## Features

- Supports XPM Lite inline editing.
- Compatible with Tridion Sites 10.1+.
- Pre-configured deployment package.
- IIS hosting support.

## Prerequisites

- Tridion Sites 10.1 or later
- Visual Studio 2022
- .NET Framework 4.8
- IIS

## Development Environment

- Visual Studio 2022
- .NET Framework 4.8

## Quick Start

1. Download [`XPMLite_Dyndle.zip`](https://github.com/RWS-Open/tridion-sites-xpmlite-dyndle/releases) from the project's Releases page.
2. Extract the archive.
3. Deploy the application to IIS.
4. Browse the hosted application.

## Integrating XPM Lite

### 1. Update the root `web.config`

Update the required `appSettings` values such as:

- `discovery-service-uri`
- `previewWebServiceCapability`
- `DD4T.ContentProviderEndPoint`
- `DD4T.PublicationId`

 ```xml
        <configuration>
            <appSettings> 
					<add key="webpages:Version" value="3.0.0.0"/>
					<add key="webpages:Enabled" value="false"/>
					<add key="ClientValidationEnabled" value="true"/>
					<add key="UnobtrusiveJavaScriptEnabled" value="true"/>
					<!-- Tridion Discovery Service URL -->
					<add key="discovery-service-uri" value="https://your-tridion-discovery-service-url:8082/discovery.svc"/>
					<!-- Tridion Preview Service Capability -->
					<add key="previewWebServiceCapability" value="PreviewWebServiceCapability"/> 
					<add key="DD4T.PublicationId" value="7"/> 
					<add key="Dyndle.ControllerNamespaces" value="DyndleWebApp.Controllers,Dyndle.Modules.Core.Controllers"/> 
					<add key="Dyndle.ViewModelNamespaces" value="DyndleWebApp.Models"/> 
					<add key="DD4T.WelcomeFile" value="index.html"/> 
					<add key="DD4T.LogLevel" value="Error"/> 
					<add key="DD4T.SerializationFormat" value="JSON"/> 
					<add key="DD4T.JsonSerializerMaxDepth" value="128"/> 
					<add key="Dyndle.DefaultRegionView" value="Region"/> 
					<add key="DD4T.BinaryUrlPattern" value="^/media/.*\.(jpg|jpeg|png|gif|svg|pdf)$"/> 
					<add key="DD4T.BinaryFileSystemPath" value="~/BinaryData"/>
					<add key="DD4T.ContentProviderEndPoint" value="https://your-tridion-content-service-url:8081/cd/api"/> 
					<add key="DD4T.CacheSettings.Binary" value="0"/> 
            </appSettings>
        </configuration>
```

### 2. Update the Area Views `Web.config`

Update the Razor namespaces in the `Areas/Core/Views/Web.config` file.

	 ```xml
			  <system.web.webPages.razor>
		<host factoryType="System.Web.Mvc.MvcWebRazorHostFactory, System.Web.Mvc, Version=5.2.9.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" />
		<pages pageBaseType="System.Web.Mvc.WebViewPage">
		  <namespaces>
			<add namespace="System.Web.Mvc" />
			<add namespace="System.Web.Mvc.Ajax" />
			<add namespace="System.Web.Mvc.Html" />
			<add namespace="System.Web.Routing" />
			<add namespace="DyndleWebApp" />
			<add namespace="DyndleWebApp.Models"/>
			<add namespace="DD4T.Mvc.Html"/>
			<add namespace="System.Linq" />
			<add namespace="System.Linq.Expressions" />
			<add namespace="DyndleWebApp.App_Code" />
			<add namespace="Dyndle.Modules.Navigation.Html" /> 
		  </namespaces>
		</pages>
	  </system.web.webPages.razor>
	```	

### 3. Configure XPM Lite

Configure the following settings in Dyndle website root web.config file:

- `client_id`
- `redirect_uri`
- `openapi_baseurl`
- `authorization_baseurl`
- `contentServiceUrl`
- `experience_space_url`

  	```xml
        <configuration>
            <appSettings>
                 <!-- Start XPMLITE --> 
					<add key="client_id" value=""/>
					<add key="redirect_uri" value=""/>
					<add key="openapi_baseurl" value="https://your-tridion-content-manager-url/api/v3.0"/>
					<add key="authorization_baseurl" value="https://your-tridion-access-manager-url/access-management/connect"/>
					<add key="contentServiceUrl" value="https://your-tridion-content-service-url:8081/cd/api"/>
				    <add key="experience_space_url" value="https://your-tridion-content-manager-url/ui/editor"/>

				<!-- End XPMLITE --> 
            </appSettings>
        </configuration>
	```
### 4. Download the [Latest XPMLite Release Assets](https://github.com/RWS-Open/tridion-sites-xpmlite-dxa-dotnet/releases)

Download the latest compiled XPM Lite assets and copy them into the appropriate JavaScript and CSS folders in the web application.

### 5. Update the Layout

Update the application's layout page so it references the copied assets. [`Reference layout file`](https://github.com/sanjaybhupali/tridion-sites-xpmlite-dyndle/blob/main/DyndleWebApp/Areas/Core/Views/Shared/_Layout.cshtml)

### 6. Add the App_Code Files

Create an `App_Code` folder in Dyndle Website root directory if it does not exist and copy all files from the repository's `App_Code` directory into it.

## Notes

- Works only in staging environments where Experience Space is accessible.
- Remove the `PreviewWebServiceCapability` from the Discovery Service configuration for production environments to hide the XPM Lite toolbar.

## Troubleshooting

- Verify all service URLs are reachable.
- Ensure the Publication ID is correct.
- Confirm IIS has read permissions for the application.
- Clear browser cache after updating assets.

## License

Refer to the project repository for licensing information.
