export {}
declare global {
    interface Window {
        getConfig: () => {
            staging:string
            openapi_baseurl:string,
            contentServiceUrl:string,
            authorization_baseurl:string;
            client_id:string;
            redirect_uri:string;
            experience_space_url:string;
            //siteMorseKey:string
            default_binary_folderId:string
        };
        login:() => void;
        getPageTypeImages:() => {
                "PublicationID": string,
                "Path": string,
                "PageTitle": string
        }[];
    }
}
