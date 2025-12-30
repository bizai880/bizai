"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-gray-900 group-[.toaster]:text-gray-950 dark:group-[.toaster]:text-gray-50 group-[.toaster]:border-gray-200 dark:group-[.toaster]:border-gray-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gray-900 dark:group-[.toast]:bg-gray-50 group-[.toast]:text-gray-50 dark:group-[.toast]:text-gray-900",
          cancelButton:
            "group-[.toast]:bg-gray-100 dark:group-[.toast]:bg-gray-800 group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400",
        },
        // دعم اللغة العربية
        dir: "rtl",
      }}
      // مواضع مختلفة للرسائل
      position="top-center"
      expand={true}
      visibleToasts={5}
      // إعدادات الرسائل العربية
      richColors
      closeButton
      // دعم الحركات
      pauseWhenPageIsHidden
      {...props}
    />
  );
};

export { Toaster };