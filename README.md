# Setup Guide for Dyndle Web app with XPM Lite

This web application is build using [Dyndle](https://dyndle.com/) and [XPM Lite](https://github.com/RWS-Open/tridion-sites-xpmlite-dxa-dotnet)

## ✨ Features

- Supports XPM Lite for inline editing.

## 🛠 Requirements

- [Tridion Sites 10.1+](https://www.rws.com/content-management/tridion/sites/)

## Development

- Used Visual studio 2022 and .Net framework 4.8

## 🚀 Deployment

- Download the Deployable_Dyndle_app.publish.zip ZIP file(Deployable_Dyndle_app.publish.zip) from the [releases page](https://github.com/RWS-Open/tridion-sites-xpmlite-dyndle/releases).

- Unzip the Deployable_Dyndle_app.publish.zip file.

- Host the web application in IIS and Browse


## 🔧 Configuration Steps 

- Update web.config in the Tridion Sites Website folder:

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
					<add key="Dyndle.StagingSite" value="true"/>
            </appSettings>
        </configuration>
    ```
 
  
### Note: 
- Works only in staging environments where Experience Space is accessible 
- Hide the XPM Lite toolbar in production by removing the PreviewWebServiceCapability from the Discovery Service