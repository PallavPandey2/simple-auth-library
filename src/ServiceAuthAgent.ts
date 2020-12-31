import { IAuthConfig } from "./Config";
import { CacheLocation, Storage } from "./Storage";
import { AuthResponse } from "./AuthResponse";
import { IAuthAgent } from "./IAuthAgent";

declare global {
    interface Window {
        activeRenewals: {};
        renewStates: Array<string>;
        callbackMappedToRenewStates: {};
        promiseMappedToRenewStates: {};
    }
}

export default class ServiceAuthAgent {
    public config: IAuthConfig;
    public cacheStorage: Storage;

    constructor(config: IAuthConfig) {
        window.activeRenewals = {};
        window.renewStates = [];
        window.callbackMappedToRenewStates = {};
        window.promiseMappedToRenewStates = {};
        this.config = config;
        try {
            this.cacheStorage = new Storage(CacheLocation.localStorage);
        }
        catch (e) {
            this.cacheStorage = undefined;
        }
    }

    public getAccessToken(agent: IAuthAgent): Promise<AuthResponse> {
        return new Promise<AuthResponse>((resolve, reject) => {
            agent.getAccessToken(resolve, reject);
        });
    }
}

