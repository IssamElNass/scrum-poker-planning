import { toast } from "sonner";

export function useToast() {
  return {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      if (props.variant === "destructive") {
        toast.error(props.title, {
          description: props.description,
        });
      } else {
        toast.success(props.title, {
          description: props.description,
        });
      }
    },
  };
}