export interface SendResetPasswordEmailDTO {
  email: string;
  authorId?: string;
  lang?: string;
  continueUrl?: string;
}
