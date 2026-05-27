import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../lib/utils"

const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TooltipTrigger) return child
          if (child.type === TooltipContent) return isOpen ? child : null
        }
        return child
      })}
    </div>
  )
}

const TooltipTrigger = React.forwardRef<HTMLDivElement, { asChild?: boolean, children: React.ReactNode }>(
  ({ children, asChild, ...props }, ref) => (
    <div ref={ref} {...props}>{children}</div>
  )
)

const TooltipContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    className={cn(
      "absolute bottom-full mb-2 z-50 overflow-hidden rounded-md bg-bg-primary/90 backdrop-blur-md border border-border-pill px-3 py-1.5 text-xs text-text-primary shadow-md",
      className
    )}
  >
    {children}
  </motion.div>
)

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
