import { AuthError } from "../AuthError";
import { Constants } from "../Constants";
import { IAuthConfig } from "../Config";
import { Storage } from "../Storage";
import { IPopupHandler } from "../handlersContracts/IPopupHandler";
import { IResponseHandler } from "../handlersContracts/IResponseHandler";

export default class PopupHandler implements IPopupHandler {
    private responseHandler: IResponseHandler;
    constructor(responseHandler: IResponseHandler) {
        this.responseHandler = responseHandler;
    }

    public openPopup(urlNavigate: string, title: string, popUpWidth: number, popUpHeight: number) {
        try {
            const winLeft = window.screenLeft ? window.screenLeft : window.screenX;
            const winTop = window.screenTop ? window.screenTop : window.screenY;
            const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            const left = ((width / 2) - (popUpWidth / 2)) + winLeft;
            const top = ((height / 2) - (popUpHeight / 2)) + winTop;


            const popupWindow = window.open(urlNavigate, title, "width=" + popUpWidth + ", height=" + popUpHeight + ", top=" + top + ", left=" + left);

            if (!popupWindow) {
                throw AuthError.createUnexpectedError("Unable to open popup");
            }
            if (popupWindow.focus) {
                popupWindow.focus();
            }
            return popupWindow;
        } catch (e) {
            // this.loginInProgress = false;
            // this.acquireTokenInProgress = false;
            throw AuthError.createUnexpectedError("Unable to open popup");
        }
    }

    public openWindow(urlNavigate: string, title: string, interval: number, config: IAuthConfig, cacheStorage: Storage, reject?: Function): Window {
        var popupWindow: Window;
        try {
            popupWindow = this.openPopup(urlNavigate, title, Constants.popUpWidth, Constants.popUpHeight);
        } catch (e) {
            // instance.loginInProgress = false;
            // instance.acquireTokenInProgress = false;
            if (reject) {
                reject(AuthError.createUnexpectedError("Unabe to open popup"));
            }
            return null;
        }
        var counter: number = 0;
        const pollTimer = window.setInterval(() => {
            // if (popupWindow && popupWindow.closed && (instance.loginInProgress || instance.acquireTokenInProgress)) {
            if (popupWindow && popupWindow.closed) {
                if (reject) {
                    reject(AuthError.createUnexpectedError("User cancelled login"));
                }
                window.clearInterval(pollTimer);
                // instance.loginInProgress = false;
                // instance.acquireTokenInProgress = false;
            }

            if (counter == 30000) {
                if (reject) {
                    reject(AuthError.createUnexpectedError("Request Timeout"));
                }
                window.clearInterval(pollTimer);
                // instance.loginInProgress = false;
                // instance.acquireTokenInProgress = false;
            }
            counter = counter + 1;
            try {
                const popUpWindowLocation = popupWindow.location;
                if (popUpWindowLocation.href.indexOf(config.redirectURI) === 0) {
                    window.clearInterval(pollTimer);
                    // instance.loginInProgress = false;
                    // instance.acquireTokenInProgress = false;
                    popupWindow.window.close();
                    if (popUpWindowLocation.hash) {
                        try {
                            this.responseHandler.handleAuthenticationResponseForHash(cacheStorage, config, popUpWindowLocation.hash);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                    else {
                        try {
                            this.responseHandler.handleAuthenticationResponseForQuery(cacheStorage, config, popUpWindowLocation.search);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                }
            } catch (e) {
            }
        }, interval);
        return popupWindow;
    }
}