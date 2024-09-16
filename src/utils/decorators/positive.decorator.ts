import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isPositive', async: false })
export class IsPositiveConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        // Check if value is a positive number
        return typeof value === 'number' && value >= 0;
    }

    defaultMessage(): string {
        return 'Age must be a non-negative number';
    }
}

export function IsPositive(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPositiveConstraint,
        });
    };
}
