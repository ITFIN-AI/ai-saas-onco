import { AdminOperationType } from 'shared/enums/AdminOperationType';

interface ChangePasswordDto {
  type: AdminOperationType.ChangePassword;
  uid: string;
  newPassword: string;
}

interface AddAdminRoleDto {
  type: AdminOperationType.AddAdminRole;
  uid: string;
}

export type AdminHandlerDTO = ChangePasswordDto | AddAdminRoleDto;
