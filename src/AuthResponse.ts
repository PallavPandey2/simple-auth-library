export type AuthResponse = {
    tokenType: string;
    idToken: string | null;
    accessToken: string| null;
    scopes?: Array<string>;
    expiresOn: Date| null;
    code?: string;
    refreshToken?: string| null;
};
