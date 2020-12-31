import { IAuthConfig } from "../Config";
import { AuthResponse } from "../AuthResponse";
import { Constants } from "../Constants";
import { Utils } from "../Utils";
import { TokenKey } from "../TokenKey";
import { TokenValue } from "../TokenValue";
import { TokenCacheItem } from "../TokenCacheItem";
import { Storage, CacheLocation } from "../Storage";
import { IAccessTokenHandler } from "../handlersContracts/IAccessTokenHandler";

export default class AccessTokenHandler implements IAccessTokenHandler {
    constructor() {

    }

    public extractIdTokenFromCache(config: IAuthConfig, cacheStorage: Storage): TokenValue {
        var idToken: TokenValue = null;
        const tokenKey = new TokenKey(config, Constants.idToken);
        if (cacheStorage) {
            var token = cacheStorage.getItem(JSON.stringify(tokenKey));
            if (!Utils.isEmpty(token)) {
                idToken = JSON.parse(token);
            }
        }
        return idToken;
    }

    public extractAccessTokenFromCache(config: IAuthConfig, cacheStorage: Storage): TokenCacheItem {
        var accessToken;
        var accessTokenCacheItem;
        var accessTokenKey = new TokenKey(config, Constants.accessToken);
        if (this) {
            accessToken = cacheStorage.getItem(JSON.stringify(accessTokenKey));
        }
        if (!Utils.isEmpty(accessToken)) {
            accessTokenCacheItem = new TokenCacheItem(accessTokenKey, JSON.parse(accessToken));
        }
        return accessTokenCacheItem;
    }

    public getAllAccessTokens(tokenType: string, config: IAuthConfig, cacheStorage: Storage): Array<{ key: TokenKey, value: any }> {
        const results: Array<{ key: TokenKey, value: any }> = [];
        let accessTokenCacheItem: { key: TokenKey, value: any };
        const storage = window[CacheLocation.localStorage];
        var tokenKey = new TokenKey(config, tokenType);
        if (storage) {
            let key: string;
            for (key in storage) {
                if (storage.hasOwnProperty(key)) {
                    if (key.match("tokenType") && key.match("clientId") && key.match("scopes") && key.match("authEndpoint") && key.match("wsdlUrl") && key.match("oAuthGrantType") && key.match("userName")) {
                        var cacheTokenKey = JSON.parse(key);
                        if (cacheTokenKey.tokenType == tokenKey.tokenType && cacheTokenKey.clientId == tokenKey.clientId && cacheTokenKey.scopes == tokenKey.scopes && cacheTokenKey.authEndpoint == tokenKey.authEndpoint && cacheTokenKey.wsdlUrl == tokenKey.wsdlUrl && cacheTokenKey.oAuthGrantType == tokenKey.oAuthGrantType) {
                            const value = cacheStorage.getItem(key);
                            try {
                                if (value) {
                                    accessTokenCacheItem = new TokenCacheItem(JSON.parse(key), JSON.parse(value));
                                    results.push(accessTokenCacheItem);
                                }
                            }
                            catch (e) {
                                accessTokenCacheItem = { key: JSON.parse(key), value: value };
                                results.push(accessTokenCacheItem);
                            }
                        }
                    }
                }
            }
        }

        return results;
    }

    public saveAccessToken(cacheStorage: Storage, config: IAuthConfig, response: AuthResponse, parameters: any, tokenType: string): AuthResponse {
        let scope: string;
        let accessTokenResponse = { ...response };
        scope = parameters["scope"] || "";
        const consentedScopes = scope.split(" ");
        var expiresIn;
        var accessTokenKey;
        var accessTokenValue;
        var exp;
        if (tokenType == Constants.accessToken) {

            if (cacheStorage) {
                var accessTokenCacheItems;
                accessTokenCacheItems = this.getAllAccessTokens(Constants.accessToken, config, cacheStorage);
                for (let i = 0; i < accessTokenCacheItems.length; i++) {
                    const accessTokenCacheItem = accessTokenCacheItems[i];
                    cacheStorage.removeItem(JSON.stringify(accessTokenCacheItem.key));
                }

            }
            expiresIn = Utils.expiresIn(parameters[Constants.expiresIn] || 0).toString();
            accessTokenKey = new TokenKey(config, Constants.accessToken);
            accessTokenValue = new TokenValue(parameters[Constants.accessToken], response.idToken, expiresIn, response.refreshToken);

            if (cacheStorage) {
                cacheStorage.setItem(JSON.stringify(accessTokenKey), JSON.stringify(accessTokenValue));
            }

            accessTokenResponse.accessToken = parameters[Constants.accessToken];
            accessTokenResponse.scopes = consentedScopes;
            accessTokenResponse.tokenType = Constants.accessToken;
            exp = Number(expiresIn);
            if (exp) {
                accessTokenResponse.expiresOn = new Date((Utils.now() + exp) * 1000);
            }
        }

        if (tokenType == Constants.idToken) {
            expiresIn = Utils.expiresIn(parameters[Constants.expiresIn] || 0).toString();
            accessTokenKey = new TokenKey(config, Constants.idToken);
            accessTokenValue = new TokenValue(parameters[Constants.idToken], response.idToken, expiresIn, response.refreshToken);

            if (cacheStorage) {
                cacheStorage.setItem(JSON.stringify(accessTokenKey), JSON.stringify(accessTokenValue));
            }

            accessTokenResponse.accessToken = parameters[Constants.idToken];
            accessTokenResponse.scopes = consentedScopes;
            accessTokenResponse.tokenType = Constants.idToken;
            exp = Number(expiresIn);
            if (exp) {
                accessTokenResponse.expiresOn = new Date((Utils.now() + exp) * 1000);
            }
        }
        return accessTokenResponse;
    }

    public clearState(config: IAuthConfig, cacheStorage: Storage) {
        const stateLoginCacheItems = this.getAllAccessTokens(Constants.stateLogin, config, cacheStorage);
        for (let i = 0; i < stateLoginCacheItems.length; i++) {
            const stateLoginCacheItem = stateLoginCacheItems[i];
            cacheStorage.removeItem(JSON.stringify(stateLoginCacheItem.key));
        }
    }
}