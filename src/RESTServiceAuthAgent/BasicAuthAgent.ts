import { IRESTAuthConfig } from "../Config";
import { AuthResponse } from "../AuthResponse";
import { Constants } from "../Constants";
import { Storage } from '../Storage';
import { IAccessTokenHandler } from "../handlersContracts/IAccessTokenHandler";
import { IRESTServicePopupHandler } from "../handlersContracts/IRESTServicePopupHandler";
import HandlerFactory from "../HandlerFactory";
import { IAuthAgent } from "../IAuthAgent";

export default class BasicAuthAgent implements IAuthAgent {
    private config: IRESTAuthConfig;
    private cacheStorage: Storage;
    private tokenHandler: IAccessTokenHandler;
    private popupHandler: IRESTServicePopupHandler;
    constructor(config: IRESTAuthConfig, cacheStorage: Storage) {
        this.config = config;
        this.cacheStorage = cacheStorage;
        this.tokenHandler = HandlerFactory.getTokenHandler();
        this.popupHandler = HandlerFactory.getRESTServicePopupHandler();
    }

    public getAccessToken(resolve: any, reject: any) {
        let accessTokenCacheItem = this.tokenHandler.extractAccessTokenFromCache(this.config, this.cacheStorage);
        if (accessTokenCacheItem) {
            let response: AuthResponse = {
                tokenType: Constants.accessToken,
                idToken: null,
                accessToken: null,
                scopes: undefined,
                expiresOn: null,
            };
            response.accessToken = accessTokenCacheItem.value.accessToken;
            resolve(response);
        }
        else {
            this.popupHandler.basicAuthLoginPopupHelper(resolve, reject, this.config, this.cacheStorage);
        }
    }
}