import { IAuthConfig } from "../Config";
import { Storage } from "../Storage";

export interface IPopupHandler {
    openWindow: (urlNavigate: string, title: string, interval: number, config: IAuthConfig, cacheStorage: Storage, reject?: Function) => Window;
}