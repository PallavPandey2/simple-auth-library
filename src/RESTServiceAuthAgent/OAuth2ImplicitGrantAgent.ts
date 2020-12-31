import { IRESTAuthConfig } from "../Config";
import { Storage } from '../Storage';
import { AuthResponse } from "../AuthResponse";
import { TokenKey } from "../TokenKey";
import { Constants } from "../Constants";
import { Utils } from "../Utils";
import { AuthError } from "../AuthError";
import { IResponseHandler } from "../handlersContracts/IResponseHandler";
import { IAccessTokenHandler } from "../handlersContracts/IAccessTokenHandler";
import HandlerFactory from "../HandlerFactory";
import { IRESTServicePopupHandler } from "../handlersContracts/IRESTServicePopupHandler";

export default class OAuth2ImplicitGrantAgent {
    private config: IRESTAuthConfig;
    private cacheStorage: Storage;
    private tokenHandler: IAccessTokenHandler;
    private responseHandler: IResponseHandler;
    private popupHandler: IRESTServicePopupHandler;
    constructor(config: IRESTAuthConfig, cacheStorage: Storage) {
        this.config = config;
        this.cacheStorage = cacheStorage;
        this.tokenHandler = HandlerFactory.getTokenHandler();
        this.responseHandler = HandlerFactory.getResponseHandler();
        this.popupHandler = HandlerFactory.getRESTServicePopupHandler();
    }


    private acquireTokenSilent(): Promise<AuthResponse> {

        return new Promise<AuthResponse>((resolve: any, reject: any) => {

            let accessTokenCacheItem = this.tokenHandler.extractAccessTokenFromCache(this.config, this.cacheStorage);
            if (accessTokenCacheItem) {
                let expired = Number(accessTokenCacheItem.value.expiresIn);
                if (expired && (expired > Utils.now() + 300)) {
                    let response: AuthResponse = {
                        tokenType: Constants.accessToken,
                        idToken: null,
                        accessToken: accessTokenCacheItem.value.accessToken,
                        scopes: accessTokenCacheItem.key.scopes.split(" "),
                        expiresOn: new Date(expired * 1000),
                    };
                    resolve(response);
                }
                else {
                    this.popupHandler.oauth2RenewTokenPopupHelper(resolve, reject, this.config, this.cacheStorage);
                }
            }
            else {
                this.popupHandler.oauth2RenewTokenPopupHelper(resolve, reject, this.config, this.cacheStorage);
            }
        });
    }

    private getImplicitGrantAccessToken() {
        return new Promise<AuthResponse>((resolve, reject) => {
            const stateKey = new TokenKey(this.config, Constants.stateLogin);
            var state = this.cacheStorage.getItem((JSON.stringify(stateKey)));
            if (state) {
                this.responseHandler.registerCallback(state, resolve, reject);
            }
            else {
                let adalIdToken = this.tokenHandler.extractIdTokenFromCache(this.config, this.cacheStorage);
                if (adalIdToken) {
                    this.acquireTokenSilent().then((response: AuthResponse) => {
                        resolve(response);
                    }).catch((e) => {
                        if (e.errorMessage.indexOf("interaction_required") >= 0) {
                            this.popupHandler.oauth2LoginPopupHelper(resolve, reject, this.config, this.cacheStorage, true);
                        }
                        else {
                            this.popupHandler.oauth2LoginPopupHelper(resolve, reject, this.config, this.cacheStorage);
                        }
                    });
                }
                else {
                    this.popupHandler.oauth2LoginPopupHelper(resolve, reject, this.config, this.cacheStorage);
                }
            }
        });
    }

    public getAccessToken(resolve: any, reject: any) {
        this.getImplicitGrantAccessToken().then((response: AuthResponse) => {
            this.tokenHandler.clearState(this.config, this.cacheStorage);
            if (response.tokenType == Constants.accessToken) {
                resolve(response);
            }
            else {
                reject(AuthError.createUnexpectedError("error fetching access token"));
            }
        }).catch((e) => {
            this.tokenHandler.clearState(this.config, this.cacheStorage);
            reject(e);
        });
    }
}