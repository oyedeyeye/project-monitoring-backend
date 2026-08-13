import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Validated shape for PUT /users/:id.
 *
 * Replaces the raw `Prisma.UserUpdateInput` the handler used to accept. That
 * type let a caller write `passwordHash` / `resetPasswordToken` directly, and
 * hid the role behind nested forms (`profile.update.role`,
 * `profile.upsert.update.role`, …) that an authorization check cannot
 * reliably inspect. A flat DTO gives `role` exactly one place to appear.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  // Nullable: webmasters are not attached to an MDA.
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsUUID()
  mdaId?: string | null;

  // Plaintext; hashed by the controller before it reaches Prisma.
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
