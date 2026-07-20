"use client";

import { useEffect, useRef, useState } from "react";
import { Info, X } from "lucide-react";

/**
 * InfoPopup — a reusable "ⓘ" icon that opens a modal with rich content.
 *
 * Props:
 *   title      {string}    — Modal header title
 *   children   {ReactNode} — Popup body content
 *   iconSize   {number}    — Size of the ⓘ icon (default 14)
 *   className  {string}    — Extra classes for the trigger button
 */
export default function InfoPopup({
  title,
  children,
  iconSize = 14,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  // Open / close the native <dialog> element
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  // Close on backdrop click (clicking outside the dialog box)
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) setOpen(false);
  };

  // Close on Escape (native dialog already handles this, but we sync state)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClose = () => setOpen(false);
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Info: ${title}`}
        className={`info-popup-trigger inline-flex items-center justify-center rounded-full p-0.5 text-(--text-tertiary) transition-all duration-150 hover:bg-(--accent-muted) hover:text-(--text-primary) focus:ring-2 focus:ring-(--accent-muted) focus:outline-none ${className}`}
      >
        <Info size={iconSize} strokeWidth={1.8} />
      </button>

      {/* Native dialog for accessibility */}
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        className="info-popup-dialog"
      >
        <div className="info-popup-box animate-scale-in">
          {/* Header */}
          <div className="info-popup-header">
            <div className="info-popup-header-left">
              <span className="info-popup-header-icon">
                <Info size={15} strokeWidth={1.8} />
              </span>
              <h2 className="info-popup-title">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="info-popup-close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="info-popup-body">{children}</div>
        </div>
      </dialog>
    </>
  );
}
