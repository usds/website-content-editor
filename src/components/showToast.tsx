import {toast} from "react-toastify";

export const showToast = (
  message: React.ReactNode | Error,
  type: "success" | "warning" | "error" | "info",
) => {
  const toastId = (() =>{
    if (typeof(message) === "string") {
      const cleanmsg = message.replace(/\W/gi, "_").substring(0, 512);
      return `id_${cleanmsg}`;
    }
    return `id-1`;
  })();
  const msg = (message as Error)?.message ?? message;

  // basically the USWDS Alert UI
  toast(<div
      className={`usa-alert usa-alert--slim usa-alert--no-icon usa-alert--${type} rs-alert-toast`}
      data-testid="alerttoast"
    >
      <div className="usa-alert__body">
        {msg && <h2 className="usa-alert__heading">{msg}</h2>}
      </div>
    </div>,
    {
      toastId,
      autoClose: 15000,
      delay: 10,
      closeButton: true,
      position: "bottom-center",
      hideProgressBar: true,
    },
  );
  toast.clearWaitingQueue(); // don't pile up messages
};
