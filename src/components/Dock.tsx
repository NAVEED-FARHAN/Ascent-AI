import React, { PropsWithChildren, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import type { MotionProps } from "motion/react"

import { cn } from "../lib/utils"

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string
  iconSize?: number
  iconMagnification?: number
  disableMagnification?: boolean
  iconDistance?: number
  direction?: "top" | "middle" | "bottom"
  children: React.ReactNode
}

const DEFAULT_SIZE = 40
const DEFAULT_MAGNIFICATION = 60
const DEFAULT_DISTANCE = 140
const DEFAULT_DISABLEMAGNIFICATION = false

const dockVariants = cva(
  "mx-auto flex h-[68px] w-max items-center justify-center gap-2 rounded-[32px] border border-border-primary bg-bg-secondary/40 backdrop-blur-2xl px-3 py-2 shadow-xl relative before:absolute before:inset-0 before:rounded-[32px] before:border-t before:border-border-primary/20 before:pointer-events-none"
)

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = "middle",
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity)

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (
          React.isValidElement<DockIconProps>(child) &&
          child.type === DockIcon
        ) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: iconSize,
            magnification: iconMagnification,
            disableMagnification: disableMagnification,
            distance: iconDistance,
          })
        }
        return child
      })
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), {
          "items-start": direction === "top",
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
        })}
      >
        {renderChildren()}
      </motion.div>
    )
  }
)

Dock.displayName = "Dock"

export interface DockIconProps extends Omit<
  MotionProps & React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  size?: number
  magnification?: number
  disableMagnification?: boolean
  distance?: number
  mouseX?: MotionValue<number>
  className?: string
  children?: React.ReactNode
  label?: string
  active?: boolean
  hasNotification?: boolean
  props?: PropsWithChildren
}

const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  disableMagnification,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  label,
  active,
  hasNotification,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const defaultMouseX = useMotionValue(Infinity)

  const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const targetSize = disableMagnification ? size : magnification

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, targetSize, size]
  )

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  // We only scale the icon container, not the entire button with label
  const iconScale = useTransform(scaleSize, [size, targetSize], [1, targetSize / size])

  return (
    <motion.div
      ref={ref}
      onClick={props.onClick}
      className={cn(
        "relative flex flex-col items-center justify-center transition-all duration-300 px-3 py-2 rounded-2xl cursor-pointer group",
        active ? "bg-accent-glow text-white shadow-lg shadow-accent-glow/20" : "text-text-muted hover:bg-bg-secondary hover:text-text-primary",
        className
      )}
      {...props}
    >
      <motion.div
        style={{ scale: iconScale }}
        className="relative flex items-center justify-center w-5 h-5 mb-1"
      >
        {children}
        {hasNotification && (
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-bg-primary shadow-sm" />
        )}
      </motion.div>
      
      {label && (
        <span className={cn(
          "text-[9px] font-black uppercase tracking-widest transition-opacity duration-300",
          active ? "opacity-100 text-white" : "text-text-muted group-hover:text-text-primary"
        )}>
          {label}
        </span>
      )}
    </motion.div>
  )
}

const DockSeparator = () => (
  <div className="w-[1px] h-8 bg-border-primary mx-2" />
)

DockIcon.displayName = "DockIcon"

export { Dock, DockIcon, DockSeparator, dockVariants }
