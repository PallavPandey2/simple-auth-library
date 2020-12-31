import { IPopupHandler } from "./handlersContracts/IPopupHandler";
import PopupHandler from "./handlers/PopupHandler";
import { IResponseHandler } from "./handlersContracts/IResponseHandler";
import ResponseHandler from "./handlers/ResponseHandler";
import { IAccessTokenHandler } from "./handlersContracts/IAccessTokenHandler";
import AccessTokenHandler from "./handlers/AccessTokenHandler";
import { IRESTServicePopupHandler } from "./handlersContracts/IRESTServicePopupHandler";
import RESTServicePopupHandler from "./handlers/RESTServicePopupHandler";

export default class HandlerFactory {
    public static getPopupHandler(): IPopupHandler {
        return new PopupHandler(HandlerFactory.getResponseHandler());
    }

    public static getResponseHandler(): IResponseHandler {
        return new ResponseHandler(HandlerFactory.getTokenHandler());
    }

    public static getTokenHandler(): IAccessTokenHandler {
        return new AccessTokenHandler();
    }

    public static getRESTServicePopupHandler(): IRESTServicePopupHandler {
        return new RESTServicePopupHandler(HandlerFactory.getResponseHandler(), HandlerFactory.getPopupHandler());
    }
}