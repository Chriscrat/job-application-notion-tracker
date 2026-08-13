import { useState, type ReactNode } from 'react';
import type { ChatbotFormProps, CommandInput } from '../types';
import { sanitizeHtml } from '../utils/sanitize';

import * as styles from './ChatbotForm.css';

export function ChatbotForm({ action, onSubmit, onCancel, isExiting }: ChatbotFormProps): ReactNode {
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string | null>>({});

    const containerClass = isExiting ? `${styles.formContainer} ${styles.fadeOutAnimation}` : styles.formContainer;

    const validate = (): boolean => {
        const newErrors: Record<string, string | null> = {};

        action.inputs?.forEach((input) => {
            const value = values[input.name] ?? '';
            let error: string | null = null;

            if (input.required && !value.trim()) {
                error = 'Ce champ est requis';
            } else if (value && input.validation) {
                error = input.validation(value);
            }

            newErrors[input.name] = error;
        });

        setErrors(newErrors);
        return Object.values(newErrors).every((error) => error === null);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!validate()) return;
        onSubmit(values);
    };

    const handleChange = (input: CommandInput, value: string) => {
        setValues((prev) => ({ ...prev, [input.name]: value }));
        setErrors((prev) => ({ ...prev, [input.name]: null }));
    };

    const renderInput = (input: CommandInput): ReactNode => {
        const commonProps = {
            name: input.name,
            placeholder: input.placeholder,
            maxLength: input.maxLength,
            value: values[input.name] ?? input.defaultValue ?? '',
            onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(input, event.target.value),
            className: errors[input.name] ? styles.inputError : styles.input,
        };

        if (input.type === 'text' || input.type === 'url' || input.type === 'email') {
            return (
                <input
                    type={input.type === 'text' ? 'text' : input.type}
                    {...commonProps}
                />
            );
        }

        return (
            <textarea
                rows={6}
                {...commonProps}
            />
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={containerClass}
            noValidate
        >
            <h3
                className={styles.formTitle}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(action.label) }}
            />
            {action.description && (
                <p
                    className={styles.formLabel}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(action.description) }}
                />
            )}

            <div className={styles.formFields}>
                {action.inputs?.map((input) => (
                    <div
                        key={input.name}
                        className={styles.formField}
                    >
                        <label
                            className={styles.formLabel}
                            htmlFor={input.name}
                        >
                            {input.label}
                        </label>
                        {renderInput(input)}
                        {errors[input.name] && <span className={styles.errorMessage}>{errors[input.name]}</span>}
                    </div>
                ))}
            </div>

            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onCancel}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className={styles.submitButton}
                >
                    Valider
                </button>
            </div>
        </form>
    );
}
