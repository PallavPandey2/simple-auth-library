import { Constants, PromptState } from "../Constants";
import { TokenKey } from "../TokenKey";
import { RESTAuthenticationType, IRESTAuthConfig } from "../Config";
import { Storage } from "../Storage";
import { IPopupHandler } from "../handlersContracts/IPopupHandler";
import { Utils } from "../Utils";
import { IResponseHandler } from "../handlersContracts/IResponseHandler";
import { IRESTServicePopupHandler } from "../handlersContracts/IRESTServicePopupHandler";
import { ServerRequestParameters, ResponseTypes } from "../RESTServiceAuthAgent/ServerRequestParameters";

export default class RESTServicePopupHandler implements IRESTServicePopupHandler {
    private responseHandler: IResponseHandler;
    private popupHandler: IPopupHandler;
    constructor(responseHandler: IResponseHandler, popupHandler: IPopupHandler) {
        this.responseHandler = responseHandler;
        this.popupHandler = popupHandler;
    }

    public oauth2LoginPopupHelper(resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage, interaction_required?: boolean) {
        let responseType = config.authenticationType == RESTAuthenticationType.OAuth2_AuthCodeGrant ?
            ResponseTypes.code :
            (interaction_required ? ResponseTypes.token : ResponseTypes.id_token_token);
        let serverAuthenticationRequest = new ServerRequestParameters(config.authorizationEndpoint, config.clientId, config.scopes, responseType, config.redirectURI, "", interaction_required ? PromptState.SELECT_ACCOUNT : PromptState.LOGIN, config.responseMode);
        const popUpWindow = this.popupHandler.openWindow("about:blank", "_blank", 1, config, cacheStorage, reject);
        if (!popUpWindow) {
            return;
        }
        if (cacheStorage) {
            const stateLogin = new TokenKey(config, Constants.stateLogin);
            const nonceIdToken = new TokenKey(config, Constants.nonceIdToken);
            cacheStorage.setItem((JSON.stringify(stateLogin)), serverAuthenticationRequest.state, false);
            cacheStorage.setItem((JSON.stringify(nonceIdToken)), serverAuthenticationRequest.nonce, true);
        }

        let urlNavigate = serverAuthenticationRequest.createNavigateUrl();

        this.responseHandler.registerCallback(serverAuthenticationRequest.state, resolve, reject);

        if (popUpWindow) {
            popUpWindow.location.href = urlNavigate;
        }
    }

    public oauth2RenewTokenPopupHelper(resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage) {
        var stateLogin;
        const scope = config.scopes.join(" ").toLowerCase();
        var state;
        if (cacheStorage) {
            stateLogin = new TokenKey(config, Constants.stateLogin);
            state = cacheStorage.getItem((JSON.stringify(stateLogin)));
        }
        let serverAuthenticationRequest = new ServerRequestParameters(config.authorizationEndpoint, config.clientId, config.scopes, ResponseTypes.token, config.redirectURI, state, PromptState.NONE, config.responseMode);
        if (state == undefined || state == null || state == "")
            cacheStorage.setItem((JSON.stringify(stateLogin)), serverAuthenticationRequest.state, false);
        var urlNavigate = serverAuthenticationRequest.createNavigateUrl();
        this.responseHandler.registerCallback(serverAuthenticationRequest.state, resolve, reject);
        const popup = this.popupHandler.openWindow("about:blank", "_blank", 1, config, cacheStorage, reject);
        popup.location.href = urlNavigate;
    }

    public basicAuthLoginPopupHelper(resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage) {
        const popUpWindow = this.popupHandler.openWindow("about:blank", "_blank", 1, config, cacheStorage, reject);
        if (!popUpWindow) {
            return;
        }
        const state = Utils.createNewGuid();
        if (cacheStorage) {
            const stateLogin = new TokenKey(config, Constants.stateLogin);
            cacheStorage.setItem((JSON.stringify(stateLogin)), state, false);
        }

        let html: string = require('./../BasicAuthLogin.html');
        var queryObject = {};
        queryObject[Constants.redirectURI] = config.redirectURI;
        queryObject['state'] = state;
        queryObject[Constants.loginFor] = config.domain;

        // let urlNavigate = `https://saketacdn.blob.core.windows.net/basicauth/BasicAuthLogin.html?${Constants.redirectURI}=${config.redirectURI}&${Constants.loginFor}=${config.domain}&state=${state}`;

        this.responseHandler.registerCallback(state, resolve, reject);

        if (popUpWindow) {
            popUpWindow["queryObject"] = queryObject;
            let scriptTag = popUpWindow.document.createElement('script');
            let script = popUpWindow.document.createTextNode(`
            function validateEmail(mail) {
                return /^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$/.test(mail);
            }
    
            function onChangeInput(type) {
                if (document.getElementById('username').value && document.getElementById('password').value) {
                    if (validateEmail(document.getElementById('username').value)) {
                        document.getElementById('loginBtn').disabled = false;
                    } else {
                        document.getElementById('loginBtn').disabled = true;
                    }
                } else {
                    document.getElementById('loginBtn').disabled = true;
                }
            }
    
            function onClickLogin() {
                queryObject=window.queryObject;
                if (queryObject && queryObject['redirect_uri']) {
                    window.location.href = queryObject['redirect_uri'] + '?' + 'state=' + queryObject['state'] + '&access_token=' + btoa(document.getElementById('username').value + ':' + document.getElementById('password').value);
                }
            }
            `);
            scriptTag.appendChild(script);
            popUpWindow.document.head.appendChild(scriptTag);
            popUpWindow.document.body.innerHTML = html;
        }
    }
}