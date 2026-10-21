// Every example rendered by <ComponentPreview name="...">. Add new examples here.
import type { ComponentType } from "react"

import AlertDemo from "./alert-demo"
import BadgeDemo from "./badge-demo"
import ButtonDemo from "./button-demo"
import ButtonSizes from "./button-sizes"
import ButtonVariants from "./button-variants"
import CardDemo from "./card-demo"
import CheckboxDemo from "./checkbox-demo"
import DialogDemo from "./dialog-demo"
import DropdownMenuDemo from "./dropdown-menu-demo"
import InputDemo from "./input-demo"
import SelectDemo from "./select-demo"
import SwitchDemo from "./switch-demo"
import TabsDemo from "./tabs-demo"
import TooltipDemo from "./tooltip-demo"

export const examples: Record<string, ComponentType> = {
  "alert-demo": AlertDemo,
  "badge-demo": BadgeDemo,
  "button-demo": ButtonDemo,
  "button-sizes": ButtonSizes,
  "button-variants": ButtonVariants,
  "card-demo": CardDemo,
  "checkbox-demo": CheckboxDemo,
  "dialog-demo": DialogDemo,
  "dropdown-menu-demo": DropdownMenuDemo,
  "input-demo": InputDemo,
  "select-demo": SelectDemo,
  "switch-demo": SwitchDemo,
  "tabs-demo": TabsDemo,
  "tooltip-demo": TooltipDemo,
}
