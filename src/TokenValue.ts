export class TokenValue {
    public accessToken: string;
    public idToken?: string;
    public expiresIn: string;
    public refreshToken?: string;

    constructor(accessToken: string, idToken: string, expiresIn: string, refreshToken?: string) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
    }
}
