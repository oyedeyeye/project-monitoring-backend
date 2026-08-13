import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client';

/**
 * Validated shape for POST /auth/register.
 *
 * The handler previously took `Record<string, any>`, which the global
 * ValidationPipe skips (no metatype to validate against) — so `role` arrived
 * unchecked from the request body. Declaring a real DTO class activates
 * whitelist + forbidNonWhitelisted for this route.
 */
export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  // Optional so the service's existing `|| 'MDA_OFFICER'` default still
  // applies; validated against the enum whenever it is supplied.
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsUUID()
  mdaId?: string;

  // Omitting the password switches register() to the emailed setup-token flow.
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
