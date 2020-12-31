import { IRESTAuthConfig } from "../Config";
import { Storage } from "../Storage";

export interface IRESTServicePopupHandler {
    oauth2LoginPopupHelper: (resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage, interaction_required?: boolean) => void;
    oauth2RenewTokenPopupHelper: (resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage) => void;
    basicAuthLoginPopupHelper: (resolve: any, reject: any, config: IRESTAuthConfig, cacheStorage: Storage) => void;
}