using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace netfw48.App_Start
{
    public class PageTypeImagesConfigSection : ConfigurationSection
    {
        [ConfigurationProperty("PageTypeImages")]
        public FoldersCollection PageTypeImages
        {
            get { return ((FoldersCollection)(base["PageTypeImages"])); }
        }
    }

    [ConfigurationCollection(typeof(FolderElement))]
    public class FoldersCollection : ConfigurationElementCollection
    {
        protected override ConfigurationElement CreateNewElement()
        {
            return new FolderElement();
        }
        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((FolderElement)(element)).Key;
        }
        public FolderElement this[int idx]
        {
            get { return (FolderElement)BaseGet(idx); }
        }
    }

    public class FolderElement : ConfigurationElement
    {
        [ConfigurationProperty("key", DefaultValue = "", IsKey = true, IsRequired = true)]
        public string Key
        {
            get { return ((string)(base["key"])); }
            set { base["key"] = value; }
        }

        [ConfigurationProperty("pageTitle", DefaultValue = "", IsKey = false, IsRequired = true)]
        public string PageTitle
        {
            get { return ((string)(base["pageTitle"])); }
            set { base["pageTitle"] = value; }
        }


        [ConfigurationProperty("path", DefaultValue = "", IsKey = false, IsRequired = false)]
        public string Path
        {
            get { return ((string)(base["path"])); }
            set { base["path"] = value; }
        }

        [ConfigurationProperty("publicationID", DefaultValue = "", IsKey = false, IsRequired = false)]
        public string PublicationID
        {
            get { return ((string)(base["publicationID"])); }
            set { base["publicationID"] = value; }
        }
    }

    public class PageTypeImage
    {
        public string PublicationID { get; set; }
        public string Path { get; set; }
        public string PageTitle { get; set; }
    }
}
