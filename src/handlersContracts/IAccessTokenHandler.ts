import { TokenCacheItem } from "../TokenCacheItem";
import { Storage } from "../Storage";
import { IAuthConfig } from "../Config";
import { AuthResponse } from "../AuthResponse";

export interface IAccessTokenHandler {
    saveAccessToken: (cacheStorage: Storage, config: IAuthConfig, accessTokenResponse: AuthResponse, data: any, tokenType: string) => AuthResponse;
    extractAccessTokenFromCache: (config: IAuthConfig, cacheStorage: Storage) => TokenCacheItem;
    extractIdTokenFromCache: (config: IAuthConfig, cacheStorage: Storage) => any;
    clearState: (config: IAuthConfig, cacheStorage: Storage) => void;
}