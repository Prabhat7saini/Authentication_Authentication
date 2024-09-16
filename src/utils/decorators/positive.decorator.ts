import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isPositive', async: false })
export class IsPositiveConstraint implements ValidatorConstraintInterface {
    validate(value: any): boolean {
        // Check if the value is a string
        if (typeof value === 'string') {
            // Try to convert the string to a number
            const num = parseFloat(value);
            // Check if the conversion was successful and the number is non-negative
            return !isNaN(num) && num >= 0;
        }
        // If not a string, validation fails
        return false;
    }

    defaultMessage(): string {
        return 'Value must be a non-negative number';
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
