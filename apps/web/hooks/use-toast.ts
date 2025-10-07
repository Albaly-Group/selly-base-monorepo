import { useCallback } from "react"

interface Toast {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = useCallback(({ title, description, variant }: Toast) => {
    // For now, use browser alert as a simple fallback
    // In production, you'd want to use a proper toast library like sonner or react-hot-toast
    const message = description ? `${title}\n${description}` : title
    
    if (variant === "destructive") {
      console.error(message)
      alert(message)
    } else {
      console.log(message)
      // For success messages, we just log them to avoid alert spam
      if (title === "Success") {
        console.info(message)
      }
    }
  }, [])

  return { toast }
}
