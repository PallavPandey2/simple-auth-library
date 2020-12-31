import { TokenKey } from "./TokenKey";
import { TokenValue } from "./TokenValue";

export class TokenCacheItem {

  public key: TokenKey;
  public value: TokenValue;

  constructor(key: TokenKey, value: TokenValue) {
    this.key = key;
    this.value = value;
  }
}
