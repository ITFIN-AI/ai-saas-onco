export interface CreateApiTokenDTO {
  name: string;
  expiresIn: null | '1d' | '7d' | '30d' | '365d';
}
