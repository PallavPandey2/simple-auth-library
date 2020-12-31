import { AuthResponse } from "../AuthResponse";
import { AuthError } from "../AuthError";
import { Utils } from "../Utils";
import { Constants } from "../Constants";
import { TokenKey } from "../TokenKey";
import { IAuthConfig } from "../Config";
import { Storage } from '../Storage';
import { IResponseHandler } from "../handlersContracts/IResponseHandler";
import { IAccessTokenHandler } from "../handlersContracts/IAccessTokenHandler";

export type ResponseStateInfo = {
    state: string;
    stateMatch: boolean;
};


export default class ResponseHandler implements IResponseHandler {
    private tokenHandler: IAccessTokenHandler;
    constructor(tokenHandler: IAccessTokenHandler) {
        this.tokenHandler = tokenHandler;
    }

    public getHash(hash: string): string {
        if (hash.indexOf("#/") > -1) {
            hash = hash.substring(hash.indexOf("#/") + 2);
        } else if (hash.indexOf("#") > -1) {
            hash = hash.substring(1);
        }

        return hash;
    }

    public deserializeHash(hash: string) {
        hash = this.getHash(hash);
        return Utils.deserialize(hash);
    }

    public deserializeQuery(query: string) {
        return Utils.deserialize(query.slice(1));
    }

    public registerCallback(expectedState: string, resolve: Function, reject: Function): void {
        if (!window.promiseMappedToRenewStates[expectedState]) {
            window.promiseMappedToRenewStates[expectedState] = [];
        }
        window.promiseMappedToRenewStates[expectedState].push({ resolve: resolve, reject: reject });

        if (!window.callbackMappedToRenewStates[expectedState]) {
            window.callbackMappedToRenewStates[expectedState] = (response: AuthResponse, error: AuthError) => {

                for (let i = 0; i < window.promiseMappedToRenewStates[expectedState].length; ++i) {
                    try {
                        if (error) {
                            window.promiseMappedToRenewStates[expectedState][i].reject(error);
                        } else if (response) {
                            window.promiseMappedToRenewStates[expectedState][i].resolve(response);
                        } else {
                            throw AuthError.createUnexpectedError("Error and response are both null");
                        }
                    } catch (e) {

                    }
                }
                window.promiseMappedToRenewStates[expectedState] = null;
                window.callbackMappedToRenewStates[expectedState] = null;
            };
        }
    }

    public getResponseStateFromHash(cacheStorage: Storage, config: IAuthConfig, hash: string): ResponseStateInfo {
        const parameters = this.deserializeHash(hash);
        let stateResponse: ResponseStateInfo;
        if (!parameters) {
            throw AuthError.createUnexpectedError("Hash was not parsed correctly.");
        }
        if (parameters.hasOwnProperty(Constants.errorDescription) || parameters.hasOwnProperty(Constants.error)) {
            throw AuthError.createUnexpectedError(`${parameters[Constants.error]}:${parameters[Constants.errorDescription]}`);
        }
        if (parameters.hasOwnProperty("state")) {
            stateResponse = {
                state: parameters.state,
                stateMatch: false
            };
        } else {
            throw AuthError.createUnexpectedError("Hash does not contain state.");
        }
        const stateLogin = new TokenKey(config, Constants.stateLogin);
        if (cacheStorage && stateResponse.state === cacheStorage.getItem((JSON.stringify(stateLogin)))) {
            stateResponse.stateMatch = true;
            return stateResponse;
        }

        return stateResponse;
    }

    public getResponseStateFromQuery(cacheStorage: Storage, config: IAuthConfig, query: string): ResponseStateInfo {
        let stateResponse: ResponseStateInfo;
        var error = Utils.getUrlParameter(query, Constants.error);
        var state = Utils.getUrlParameter(query, "state");
        if (error) {
            throw AuthError.createUnexpectedError(`error:${error}`);
        }
        if (state) {
            stateResponse = {
                state: state,
                stateMatch: false
            };
        } else {
            throw AuthError.createUnexpectedError("Does not contain state.");
        }
        const stateLogin = new TokenKey(config, Constants.stateLogin);
        if (cacheStorage && stateResponse.state === cacheStorage.getItem((JSON.stringify(stateLogin)))) {
            stateResponse.stateMatch = true;
            return stateResponse;
        }

        return stateResponse;
    }

    public saveTokenFromResponse(cacheStorage: Storage, config: IAuthConfig, stateInfo: ResponseStateInfo, hash: string, query: string): AuthResponse {

        let response: AuthResponse = {
            tokenType: "",
            idToken: null,
            accessToken: null,
            expiresOn: null,
        };
        var hashParams = hash ? this.deserializeHash(hash) : (query ? this.deserializeQuery(query) : {});

        if (hashParams.hasOwnProperty(Constants.errorDescription) || hashParams.hasOwnProperty(Constants.error)) {
            // this.loginInProgress = false;
            // this.acquireTokenInProgress = false;
            throw AuthError.createUnexpectedError(`${hashParams[Constants.error]}:${hashParams[Constants.errorDescription]}`);
        }
        else {
            if (stateInfo.stateMatch) {
                if (hashParams.hasOwnProperty(Constants.sessionState)) {
                    if (cacheStorage) {
                        const sessionState = new TokenKey(config, Constants.saketaSessionState);
                        cacheStorage.setItem((JSON.stringify(sessionState)), hashParams[Constants.sessionState]);
                    }
                }
                if (hashParams.hasOwnProperty(Constants.code)) {
                    response.tokenType = Constants.code;
                    response.code = hashParams[Constants.code];
                }
                if (hashParams.hasOwnProperty(Constants.accessToken)) {
                    // this.acquireTokenInProgress = false;

                    if (hashParams.hasOwnProperty(Constants.idToken)) {
                        response.idToken = hashParams[Constants.idToken];
                    }
                    response = this.tokenHandler.saveAccessToken(cacheStorage, config, response, hashParams, Constants.accessToken);
                }
                if (hashParams.hasOwnProperty(Constants.idToken)) {
                    // this.loginInProgress = false;
                    response.idToken = hashParams[Constants.idToken];

                    this.tokenHandler.saveAccessToken(cacheStorage, config, response, hashParams, Constants.idToken);
                }
            }
        }
        return response;
    }

    public processCallBack(cacheStorage: Storage, config: IAuthConfig, stateInfo: ResponseStateInfo, parentCallback: Function, hash: string, query: string): void {
        let response: AuthResponse;
        let authErr: AuthError;
        if (hash) {
            if (!stateInfo) {
                stateInfo = this.getResponseStateFromHash(cacheStorage, config, hash);
            }
            try {
                response = this.saveTokenFromResponse(cacheStorage, config, stateInfo, hash, undefined);
            } catch (err) {
                authErr = err;
            }
        }
        if (query) {
            if (!stateInfo) {
                stateInfo = this.getResponseStateFromQuery(cacheStorage, config, query);
            }
            try {
                response = this.saveTokenFromResponse(cacheStorage, config, stateInfo, undefined, query);
            } catch (err) {
                authErr = err;
            }
        }
        parentCallback(response, authErr);
    }

    public handleAuthenticationResponseForHash(cacheStorage: Storage, config: IAuthConfig, hash: string): void {
        try {
            const stateInfo = this.getResponseStateFromHash(cacheStorage, config, hash);
            let tokenResponseCallback: (response: AuthResponse, error: AuthError) => void = null;
            tokenResponseCallback = window.callbackMappedToRenewStates[stateInfo.state];
            this.processCallBack(cacheStorage, config, stateInfo, tokenResponseCallback, hash, undefined);
        } catch (e) {
            throw e;
        }
    }

    public handleAuthenticationResponseForQuery(cacheStorage: Storage, config: IAuthConfig, query: string) {
        try {
            const stateInfo = this.getResponseStateFromQuery(cacheStorage, config, query);
            let tokenResponseCallback: (response: AuthResponse, error: AuthError) => void = null;
            tokenResponseCallback = window.callbackMappedToRenewStates[stateInfo.state];
            this.processCallBack(cacheStorage, config, stateInfo, tokenResponseCallback, undefined, query);
        } catch (e) {
            throw e;
        }
    }
}