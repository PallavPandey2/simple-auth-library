export class Constants {
  static get errorDescription(): string { return "error_description"; }
  static get error(): string { return "error"; }

  static get scope(): string { return "scope"; }
  static get clientInfo(): string { return "client_info"; }
  static get clientId(): string { return "clientId"; }

  static get idToken(): string { return "id_token"; }
  static get adalIdToken(): string { return "adal.idtoken"; }
  static get accessToken(): string { return "access_token"; }
  static get code(): string { return "code"; }
  static get expiresIn(): string { return "expires_in"; }
  static get sessionState(): string { return "session_state"; }
  static get claims(): string { return "claims"; }
  static get loginFor(): string { return "loginFor"; }
  static get redirectURI(): string { return "redirect_uri"; }

  static get prompt_select_account(): string { return "&prompt=select_account"; }
  static get prompt_none(): string { return "&prompt=none"; }
  static get prompt(): string { return "prompt"; }

  static get response_mode_fragment(): string { return "&response_mode=fragment"; }
  static get resourceDelimiter(): string { return "|"; }

  static get stateLogin(): string { return "state-login"; }
  static get stateAcquireToken(): string { return "state-acquireToken"; }
  static get stateRenew(): string { return "state-renew"; }
  static get nonceIdToken(): string { return "nonce-idtoken"; }

  static get saketaSessionState(): string { return "session-state"; }

  private static _popUpWidth: number = 483;
  static get popUpWidth(): number { return this._popUpWidth; }
  static set popUpWidth(width: number) {
    this._popUpWidth = width;
  }
  private static _popUpHeight: number = 600;
  static get popUpHeight(): number { return this._popUpHeight; }
  static set popUpHeight(height: number) {
    this._popUpHeight = height;
  }

  static get login(): string { return "LOGIN"; }
  static get renewToken(): string { return "RENEW_TOKEN"; }
  static get unknown(): string { return "UNKNOWN"; }

  static get homeAccountIdentifier(): string { return "homeAccountIdentifier"; }

  static get common(): string { return "common"; }
  static get openidScope(): string { return "openid"; }
  static get profileScope(): string { return "profile"; }

}

export const PromptState = {
  LOGIN: "login",
  SELECT_ACCOUNT: "select_account",
  CONSENT: "consent",
  NONE: "none",
};
