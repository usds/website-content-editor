
export const RequiredMarker = ({ required }: { required?: boolean }) => {
  // disable for usability study
  return required ? <span className={"usa-hint--required"}>*</span> : null;
};
