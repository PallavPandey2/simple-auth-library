import { IAuthConfig } from "../Config";
import { Storage } from '../Storage';

export interface IResponseHandler {
    registerCallback: (expectedState: string, resolve: Function, reject: Function) => void;
    handleAuthenticationResponseForHash: (cacheStorage: Storage, config: IAuthConfig, hash: string) => void;
    handleAuthenticationResponseForQuery: (cacheStorage: Storage, config: IAuthConfig, query: string) => void;
}