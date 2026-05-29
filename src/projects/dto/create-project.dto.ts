import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  mdaId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  sector!: string;

  @IsString()
  @IsNotEmpty()
  lga!: string;

  @IsString()
  @IsNotEmpty()
  senatorialDistrict!: string;

  @IsString()
  @IsNotEmpty()
  locationText!: string;

  @IsDateString()
  @IsNotEmpty()
  startDate!: string | Date;

  @IsDateString()
  @IsNotEmpty()
  endDate!: string | Date;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  approvedBudget!: number;

  @IsString()
  @IsNotEmpty()
  fundingSource!: string;

  @IsString()
  @IsOptional()
  contractor?: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
