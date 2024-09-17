import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordComplex', async: false })
export class IsPasswordComplexConstraint
  implements ValidatorConstraintInterface
{
  validate(password: string): boolean {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  }

  defaultMessage(): string {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long';
  }
}

export function IsPasswordComplex(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordComplex',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordComplexConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isAlphabetic', async: false })
export class IsAlphabeticConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    // Ensure the value is a string and only contains letters and spaces
    return typeof value === 'string' && /^[A-Za-z\s]+$/.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must contain only letters and spaces and cannot include numbers`;
  }
}

export function IsAlphabetic(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAlphabetic',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphabeticConstraint,
    });
  };
}
