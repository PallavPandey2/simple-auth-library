import { IRESTAuthConfig, RESTAuthenticationType } from "../Config";
import OAuth2ImplicitGrantAgent from "./OAuth2ImplicitGrantAgent";
import BasicAuthAgent from "./BasicAuthAgent";
import { IAuthAgent } from "../IAuthAgent";
import ServiceAuthAgent from "../ServiceAuthAgent";
import { AuthResponse } from "../AuthResponse";

export default class RESTServiceAuthAgent extends ServiceAuthAgent {
    constructor(config: IRESTAuthConfig) {
        super(config);
    }

    public getAccessToken(): Promise<AuthResponse> {
        var agent: IAuthAgent;
        var config: IRESTAuthConfig = this.config as IRESTAuthConfig;
        switch (this.config.authenticationType) {
            case (RESTAuthenticationType.OAuth2_ImplicitGrant):
                agent = new OAuth2ImplicitGrantAgent(config, this.cacheStorage);
                break;
            case (RESTAuthenticationType.Basic):
                agent = new BasicAuthAgent(config, this.cacheStorage);
                break;
        }
        return super.getAccessToken(agent);
    }
}