import {
  Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup,
  MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarTrigger,
} from "@/registry/proto-lab/ui/menubar"

export default function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Engagement</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New workshop <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem>Add finding <MenubarShortcut>⌘F</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Export report</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem defaultChecked>Show billable hours</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show archived projects</MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Practice</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup defaultValue="cx">
            <MenubarRadioItem value="cx">Customer Experience</MenubarRadioItem>
            <MenubarRadioItem value="da">Data &amp; Analytics</MenubarRadioItem>
            <MenubarRadioItem value="mc">Management Consulting</MenubarRadioItem>
            <MenubarRadioItem value="si">Systems Integration</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
