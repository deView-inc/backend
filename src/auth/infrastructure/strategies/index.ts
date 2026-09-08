import { BearerStrategy } from './bearer.strategy';
import { CookieStrategy } from './cookie.strategy';
import { GithubStrategy } from './github.strategy';
import { GoogleStrategy } from './google.strategy';

export const STRATEGIES = [BearerStrategy, CookieStrategy, GoogleStrategy, GithubStrategy];
