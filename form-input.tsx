import React, { useEffect } from 'react';

import { Controller, Control, RegisterOptions } from 'react-hook-form';

import Input from '@components/input';
import { TextFieldProps } from '@mui/material/TextField';
import { InputComponentCustomProps } from '@components/input/input';

interface FormInputProps {
  control: Control<any, any>;
  name: string;
  useValue?: boolean;
  isTable?: boolean;
  isManualMode?: boolean; // Add this new prop
  rules?: RegisterOptions;
  step?: number;
  setCustomValue?: (e: any) => void;
  onChangeHandler?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;
}

type FormInputComponentProps = TextFieldProps & InputComponentCustomProps & FormInputProps;

export const FormInput = ({
  name,
  control,
  rules,
  defaultValue,
  onChangeHandler,
  value,
  min,
  max,
  step,
  setCustomValue,
  inputRef,
  autoFocus,
  useValue = false,
  isTable = false,
  isManualMode = true, // Default to true (black border)
  type,
  disabled,
  ...rest
}: FormInputComponentProps): React.ReactElement => {
  useEffect(() => {
    if (setCustomValue) setCustomValue(String(defaultValue ?? value ?? (type === 'number' ? 0 : '0')));
  }, [value, defaultValue]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || value || ''}
      rules={rules}
      render={({ field: { onChange, value: formValue } }) => {
        return (
          <Input
            autoFocus={autoFocus}
            inputRef={inputRef}
            inputProps={{ step: step ?? '.01', min, max }}
            value={useValue === true && isTable != true ? value : formValue}
            lang="en"
            useValue={useValue}
            disabled={disabled}
            isManualMode={isManualMode} // Pass through the prop
            onChange={e => {
              // Use in case it needed to change manually the shape of react hook form value.
              // Use this callback along with setValue method provided by useForm hook.
              // Example could be find in use-pricing-form.tsx file.
              if (setCustomValue) {
                setCustomValue(e.target.value);
              } else {
                onChange(e);
              }
              if (onChangeHandler) onChangeHandler(e);
            }}
            {...rest}
          />
        );
      }}
    />
  );
};
