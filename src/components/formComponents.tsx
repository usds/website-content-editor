import {TextInputProps} from "@trussworks/react-uswds/lib/components/forms/TextInput/TextInput";
import React, {ChangeEventHandler, forwardRef, Fragment} from "react";
import {
  Checkbox,
  ErrorMessage, Fieldset,
  FileInput,
  FileInputRef,
  FormGroup,
  Label,
  Textarea,
  TextInput
} from "@trussworks/react-uswds";
import {TextareaProps} from "@trussworks/react-uswds/lib/components/forms/Textarea/Textarea";
import {RequiredMarker} from "./RequiredMarker.tsx";
import {FileInputForwardRef} from "@trussworks/react-uswds/lib/components/forms/FileInput/FileInput";

export type TextFieldUswdsProps = {
  label: string;
  error?: string;
  // change required to optional with this + Omit<>
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'tel' | 'url';
} & Omit<TextInputProps, "type">;

export type TextareaFieldUswdsProps = {
  label: string;
  error?: string;
  required?: boolean;
  // why are these missing from TextareaProps?
  rows?: number;
  cols?: number;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>; // no idea why this is missing
} & TextareaProps;

export type InputRef<T> = string | ((instance: T | null) => void) | React.RefObject<T> | null | undefined;

export type TextInputRef = InputRef<HTMLInputElement>;
export type TextAreaRef = InputRef<HTMLTextAreaElement>;


// eslint-disable-next-line react/display-name
export const TextFieldUSWDS = React.forwardRef(
  ({id, name, label, error, type, key, required, ...props}: TextFieldUswdsProps,
   ref: TextInputRef) => {
    return (
      <Fieldset>
        {label !== undefined ?
          <Label htmlFor={name} className={"grid-col-fill"}>
            {label}
            <RequiredMarker required={required}/>
          </Label> : null}
        {error !== undefined ? <ErrorMessage>{error}</ErrorMessage> : null}
        <TextInput
          id={id}
          name={name ?? id}
          key={key ?? id}
          type={type ?? "text"}
          inputRef={ref}
          className="usa-input flex-fill"
          required={required}
          {...props}
        />
      </Fieldset>
    );
  }
);

// eslint-disable-next-line react/display-name
export const TextareaFieldUSWDS = React.forwardRef(
  ({id, label, error, required, ...props}: TextareaFieldUswdsProps,
   ref: TextAreaRef) => {
    return (
      <Fieldset>
        {label !== undefined ?
          <Label htmlFor={id} className={"grid-col-fill"}>
            {label}
            <RequiredMarker required={required}/>
          </Label> : null}
        {error !== undefined ? <ErrorMessage>{error}</ErrorMessage> : null}
        <Textarea
          id={id}
          inputRef={ref}
          className="usa-input flex-fill"
          {...props}
        />
      </Fieldset>
    );
  });

