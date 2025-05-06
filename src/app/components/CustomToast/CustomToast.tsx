import { toast, Toast, ToastOptions } from "react-hot-toast";
import styles from "./CustomToast.module.scss";

interface CustomToastProps {
  t: Toast;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export const CustomToast = ({ t, message, type }: CustomToastProps) => {
  return (
    <div
      className={`${styles.toast} ${styles[type]} ${
        t.visible ? styles.visible : styles.hidden
      }`}
      onClick={() => toast.dismiss(t.id)}
    >
      <div className={styles.icon}>
        {type === "success" && "✓"}
        {type === "error" && "✗"}
        {type === "info" && "ℹ"}
        {type === "warning" && "⚠"}
      </div>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.closeButton}
        onClick={() => toast.dismiss(t.id)}
      >
        &times;
      </button>
    </div>
  );
};

export const showCustomToast = (
  message: string,
  type: "success" | "error" | "info" | "warning",
  options?: ToastOptions
) => {
  return toast.custom(
    (t) => <CustomToast t={t} message={message} type={type} />,
    options
  );
};
