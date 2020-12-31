export enum ResponseMode {
    Fragment,
    Query
}

export enum ServiceType {
    REST,
    SOAP
}

export enum RESTAuthenticationType {
    None = "None",
    Basic = "Basic",
    OAuth = "OAuth",
    OAuth2_ImplicitGrant = "OAuth2_ImplicitGrant",
    OAuth2_AuthCodeGrant = "OAuth2_AuthCodeGrant"
}

export enum SOAPAuthenticationType {
    None = "None",
    SOAPBasic = "SOAPBasic",
    SOAPWSSecurity = "SOAPWSSecurity"
}

export interface IAuthConfig {
    userName?: string;
    redirectURI: string;
    responseMode?: ResponseMode;
    serviceType: ServiceType;
    authenticationType: RESTAuthenticationType | SOAPAuthenticationType;
}

export interface IRESTAuthConfig extends IAuthConfig {
    domain?: string;
    clientId: string;
    clientSecret?: string;
    tokenEndPoint?: string;
    authorizationEndpoint: string;
    scopes?: string[];
    authenticationType: RESTAuthenticationType;
}

export interface ISOAPAuthConfig extends IAuthConfig {
    authenticationType: SOAPAuthenticationType;
    wsdlUrl: string;
}