import { RESTAuthenticationType, SOAPAuthenticationType, IAuthConfig, ServiceType, IRESTAuthConfig, ISOAPAuthConfig } from "./Config";

export class TokenKey {
    public tokenType: string;
    public userName: string;
    public clientId: string;
    public scopes: string;
    public authEndpoint: string;
    public wsdlUrl: string;
    public oAuthGrantType: RESTAuthenticationType | SOAPAuthenticationType;

    constructor(config: IAuthConfig, tokenType: string) {
        this.tokenType = tokenType;
        this.userName = config.userName;
        this.oAuthGrantType = config.authenticationType;
        this.clientId = null;
        this.scopes = null;
        this.authEndpoint = null;
        this.wsdlUrl = null;

        if (config.serviceType == ServiceType.REST) {
            var restConfig: IRESTAuthConfig = config as IRESTAuthConfig;
            this.clientId = restConfig.clientId;
            this.scopes = restConfig.scopes ? restConfig.scopes.join(" ").toLowerCase() : "";
            this.authEndpoint = restConfig.authorizationEndpoint;
        }
        if (config.serviceType == ServiceType.SOAP) {
            var soapConfig: ISOAPAuthConfig = config as ISOAPAuthConfig;
            this.wsdlUrl = soapConfig.wsdlUrl;
        }
    }
}