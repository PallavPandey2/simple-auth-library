export const AuthErrorMessage = {
    unexpectedError: {
        code: "unexpected_error",
        desc: "Unexpected error in authentication."
    }
};

export class AuthError extends Error {

    public errorCode: string;
    public errorMessage: string;

    constructor(errorCode: string, errorMessage?: string) {
        super(errorMessage);

        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.name = "AuthError";
    }

    public static createUnexpectedError(errDesc: string) {
        return new AuthError(AuthErrorMessage.unexpectedError.code, `${AuthErrorMessage.unexpectedError.desc}: ${errDesc}`);
    }
}
