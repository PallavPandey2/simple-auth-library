export interface IAuthAgent {
    getAccessToken: (resolve: any, reject: any) => void;
}