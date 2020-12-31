import { Utils } from "../Utils";
import { ResponseMode } from "../Config";
import { Constants } from "../Constants";

export enum ResponseTypes {
    id_token = "id_token",
    token = "token",
    id_token_token = "id_token token",
    code = "code"
}

export class ServerRequestParameters {
    public authEndpoint: string;
    public clientId: string;
    public scopes: Array<string>;

    public nonce: string;
    public state: string;

    public responseType: ResponseTypes;
    public redirectUri: string;

    public promptValue: string;
    public responseMode: ResponseMode;

    constructor(authEndpoint: string, clientId: string, scopes: Array<string>, responseType: ResponseTypes, redirectUri: string, state: string, promptValue: string, responseMode: ResponseMode) {
        this.authEndpoint = authEndpoint;
        this.clientId = clientId;
        this.scopes = scopes;

        this.nonce = Utils.createNewGuid();
        this.state = state && !Utils.isEmpty(state) ? state : Utils.createNewGuid();

        this.responseType = responseType;
        this.redirectUri = redirectUri;
        this.promptValue = promptValue;
        this.responseMode = responseMode;
    }

    public createNavigateUrl(): string {
        const str = this.createNavigationUrlString(this.scopes);
        let authEndpoint: string = this.authEndpoint;
        if (authEndpoint.indexOf("?") < 0) {
            authEndpoint += "?";
        } else {
            authEndpoint += "&";
        }

        const requestUrl: string = `${authEndpoint}${str.join("&")}`;
        var responseMode = this.responseMode == ResponseMode.Fragment ? Constants.response_mode_fragment : "";
        return requestUrl + responseMode;
    }

    private createNavigationUrlString(scopes: Array<string>): Array<string> {
        var _scopes: Array<string> = JSON.parse(JSON.stringify(scopes));
        if (!_scopes) {
            _scopes = [this.clientId];
        }

        if (_scopes.indexOf(this.clientId) === -1) {
            _scopes.push(this.clientId);
        }
        const str: Array<string> = [];
        str.push("response_type=" + this.responseType);

        _scopes = this.translateclientIdUsedInScope(_scopes);
        str.push("scope=" + encodeURIComponent(this.parseScope(_scopes)));
        str.push("client_id=" + encodeURIComponent(this.clientId));
        str.push("redirect_uri=" + encodeURIComponent(this.redirectUri));
        str.push("state=" + encodeURIComponent(this.state));
        if (this.responseType != ResponseTypes.code)
            str.push("nonce=" + encodeURIComponent(this.nonce));

        str.push("client_info=1");

        if (this.promptValue) {
            str.push("prompt=" + encodeURIComponent(this.promptValue));
        }
        return str;
    }

    private translateclientIdUsedInScope(scopes: Array<string>): Array<string> {
        let newScopes = scopes;
        const clientIdIndex: number = newScopes.indexOf(this.clientId);
        if (clientIdIndex >= 0) {
            newScopes.splice(clientIdIndex, 1);
            if (this.responseType != ResponseTypes.code) {
                if (newScopes.indexOf("openid") === -1) {
                    newScopes.push("openid");
                }
                if (newScopes.indexOf("profile") === -1) {
                    newScopes.push("profile");
                }
            }
        }
        return newScopes;
    }

    private parseScope(scopes: Array<string>): string {
        let scopeList: string = "";
        if (scopes) {
            for (let i: number = 0; i < scopes.length; ++i) {
                scopeList += (i !== scopes.length - 1) ? scopes[i] + " " : scopes[i];
            }
        }

        return scopeList;
    }
}
