import React, { ReactElement, useEffect, useState } from 'react';

import {
  FilledInputProps,
  InputAdornment,
  InputProps,
  OutlinedInputProps,
  TextField,
  TextFieldProps
} from '@mui/material';

import styles from './input.scss';

type SMALL = 'small';
type MEDIUM = 'medium';

type FILLED = 'filled';
type STANDARD = 'standard';
type OUTLINED = 'outlined';

type START = 'start';
type END = 'end';

interface InputOptions {
  startAdornment?: { position: START | END; text: string };
  endAdornment?: { position: START | END; text: string };
}

export interface InputComponentCustomProps {
  labelName: string;
  size?: SMALL | MEDIUM;
  variant?: FILLED | STANDARD | OUTLINED;
  disabled?: boolean;
  inputOptions?: InputOptions;
  value?: string | number | null;
  maxWidth?: string;
  minWidth?: string;
  inputRef?: any;
  min?: string;
  max?: string;
  useValue?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type InputComponentProps = TextFieldProps & InputComponentCustomProps;
var pasted = '';

export const getPasted = () => {
  return pasted
}
export const clearPasted = () => {
  pasted = ''
}

const Input = ({
  labelName,
  size = 'small',
  variant = 'outlined',
  disabled = false,
  inputOptions,
  maxWidth = '100%',
  minWidth = '100%',
  onChange,
  inputRef,
  value,
  useValue = false,
  min,
  max,
  type,
  autoFocus,
  inputProps,
  sx,
  ...rest
}: InputComponentProps): ReactElement => {

  const [newValue, setNewValue] = useState<any>(type === 'number' ? "" : '');
  
  const configInputProps = ():
    | Partial<InputProps>
    | Partial<FilledInputProps>
    | Partial<OutlinedInputProps>
    | undefined => {
    const inputPropsConfig: { [key: string]: any } = { step: 'any', min, max, ...inputProps };
    if (inputOptions) {
      if (inputOptions.endAdornment) {
        inputPropsConfig.endAdornment = (
          <InputAdornment position={inputOptions.endAdornment.position}>
            {inputOptions.endAdornment.text}
          </InputAdornment>
        );
      }
      if (inputOptions.startAdornment) {
        inputPropsConfig.startAdornment = (
          <InputAdornment position={inputOptions.startAdornment.position}>
            {inputOptions.startAdornment.text}
          </InputAdornment>
        );
      }
    }
    return inputPropsConfig;
  };

  const onChangeHandler = (evnt: React.ChangeEvent<HTMLInputElement>): void => {
    let event = evnt;
    if (pasted != "" && pasted != null && useValue) {
      event.target.value = pasted.split('---')[0] ?.split('___')[0] ? pasted.split('---')[0] ?.split('___')[0] : pasted.split('___')[0]
      console.log('event==>pasted', event.target.value)
    }
    if (onChange) onChange(event);
    if (!useValue) {
      setNewValue((type === 'number' ? Number(event.target.value) : event.target.value));
    }
  };

  useEffect(() => {
    if (value != null) {
      if (useValue) {
        setNewValue(value.toString());
      }
      else {
        setNewValue(value.toString());
      }
    }
  }, [value]);

  const onPaste = (event: any) => {
    let data = event.clipboardData.getData("text/plain").split("\n")
    console.log("data.length", event.clipboardData.getData("text/plain").split("\n").length)
    data = data.slice(0, data.length - 1).join("---").replaceAll("\r", "").replaceAll("%", "").replaceAll(",", "").replaceAll("$","").replaceAll("#","");

    pasted = data.split("\t").map((item: any)=>item.trim()).join("___").replaceAll("\r", "")

    console.log("Pasted: ", pasted);
  };

  // Check if field is readonly from inputProps
  const isReadOnly = inputProps?.readOnly === true;
  
  // Determine if field is editable (not disabled and not readonly)
  const isEditable = !disabled && !isReadOnly;
  
  // Set border color: Black for editable, Grey for non-editable
  const borderColor = isEditable ? '#000000' : '#9e9e9e';

  // Merge styling with existing sx prop
  const mergedSx = {
    maxWidth,
    minWidth,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: borderColor,
        borderWidth: '2px',
        borderRadius: '5px'
      },
      '&:hover fieldset': {
        borderColor: borderColor,
      },
      '&.Mui-focused fieldset': {
        borderColor: borderColor,
      },
      '&.Mui-disabled fieldset': {
        borderColor: '#9e9e9e',
      }
    },
    ...sx
  };

  return (
    <TextField
      autoFocus={autoFocus}
      onPaste={onPaste}
      disabled={disabled}
      inputRef={inputRef}
      id={labelName}
      label={labelName}
      fullWidth
      onKeyDown={event => {
        event.stopPropagation();
      }}
      onChange={onChangeHandler}
      value={newValue}
      size={size}
      type={type}
      variant={variant}
      InputProps={configInputProps()}
      sx={mergedSx}
      {...rest}
    />
  );
};

export default Input;
