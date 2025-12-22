import {
  Center,
  Divider,
  Flex,
  IconButton,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ListBullets,
  ListNumbers,
  TextBolder,
  TextHOne,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
} from "phosphor-react";
import { BiRedo, BiUndo } from "react-icons/bi";
import { HiOutlineBarsArrowDown } from "react-icons/hi2";
import { MdFormatClear } from "react-icons/md";
import { RiDoubleQuotesL, RiParagraph } from "react-icons/ri";
import { VscHorizontalRule } from "react-icons/vsc";

import "./tiptap.scss";

type MenuBarProps = {
  editor: Editor | null;
};
const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  return (
    <Flex alignItems="center" justify="center" wrap="wrap" gap={2}>
      <Tooltip openDelay={500} placement="top-start" label="Bold" rounded="md">
        <IconButton
          aria-label="Bold"
          variant="ghost"
          size="sm"
          icon={<TextBolder size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
          bg={editor.isActive("bold") ? "primary" : undefined}
          color={editor.isActive("bold") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Italics" rounded="md">
        <IconButton
          aria-label="Italics"
          variant="ghost"
          size="sm"
          icon={<TextItalic size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
          bg={editor.isActive("italic") ? "primary" : undefined}
          color={editor.isActive("italic") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Strikethrough" rounded="md">
        <IconButton
          aria-label="Strikethrough"
          variant="ghost"
          size="sm"
          icon={<TextStrikethrough size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
          bg={editor.isActive("strike") ? "primary" : undefined}
          color={editor.isActive("strike") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Center height="25px">
        <Divider orientation="vertical" />
      </Center>

      <Tooltip openDelay={500} placement="top-start" label="Heading" rounded="md">
        <IconButton
          aria-label="Heading"
          variant="ghost"
          size="sm"
          icon={<TextHOne size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "is-active" : ""}
          bg={editor.isActive("heading", { level: 1 }) ? "primary" : undefined}
          color={editor.isActive("heading", { level: 1 }) ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Sub Heading" rounded="md">
        <IconButton
          aria-label="Sub Heading"
          variant="ghost"
          size="sm"
          icon={<TextHTwo size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
          bg={editor.isActive("heading", { level: 2 }) ? "primary" : undefined}
          color={editor.isActive("heading", { level: 2 }) ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Paragraph" rounded="md">
        <IconButton
          aria-label="paragraph"
          variant="ghost"
          size="sm"
          icon={<RiParagraph size={18} />}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
          bg={editor.isActive("paragraph") ? "primary" : undefined}
          color={editor.isActive("paragraph") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Bullet List" rounded="md">
        <IconButton
          aria-label="Bullet List"
          variant="ghost"
          size="sm"
          icon={<ListBullets size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
          bg={editor.isActive("bulletList") ? "primary" : undefined}
          color={editor.isActive("bulletList") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Number List" rounded="md">
        <IconButton
          aria-label="Number List"
          variant="ghost"
          size="sm"
          icon={<ListNumbers size={18} weight="bold" />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
          bg={editor.isActive("orderedList") ? "primary" : undefined}
          color={editor.isActive("orderedList") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Center height="25px">
        <Divider orientation="vertical" />
      </Center>

      <Tooltip openDelay={500} placement="top-start" label="Block Quotes" rounded="md">
        <IconButton
          aria-label="Block Quotes"
          variant="ghost"
          size="sm"
          icon={<RiDoubleQuotesL size={18} />}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
          bg={editor.isActive("blockquote") ? "primary" : undefined}
          color={editor.isActive("blockquote") ? "primaryText" : undefined}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Horizontal Rule" rounded="md">
        <IconButton
          aria-label="Horizontal Rule"
          variant="ghost"
          size="sm"
          icon={<VscHorizontalRule size={25} />}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Tooltip openDelay={500} placement="top-start" label="Line Break" rounded="md">
        <IconButton
          aria-label="Line Break"
          variant="ghost"
          size="sm"
          icon={<HiOutlineBarsArrowDown size={20} />}
          onClick={() => editor.chain().focus().setHardBreak().run()}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Center height="25px">
        <Divider orientation="vertical" />
      </Center>

      <Tooltip openDelay={500} placement="top-start" label="Clear Formatting" rounded="md">
        <IconButton
          aria-label="Clear Formatting"
          variant="ghost"
          size="sm"
          icon={<MdFormatClear size={18} />}
          onClick={() => {
            editor.chain().focus().unsetAllMarks().run();
            editor.chain().focus().clearNodes().run();
          }}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>

      <Center height="25px">
        <Divider orientation="vertical" />
      </Center>

      <Tooltip openDelay={500} placement="top-start" label="Undo" rounded="md">
        <IconButton
          aria-label="Undo"
          variant="ghost"
          size="sm"
          icon={<BiUndo size={21} />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>
      <Tooltip openDelay={500} placement="top-start" label="Redo" rounded="md">
        <IconButton
          aria-label="Redo"
          variant="ghost"
          size="sm"
          icon={<BiRedo size={21} />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          _hover={{
            bg: "primary",
            color: "primaryText",
          }}
        />
      </Tooltip>
    </Flex>
  );
};

type TipTapProps = {
  value: string;
  isDisabled: boolean;
  onChange: (v: string) => void;
};
const TipTap = ({ value, onChange, isDisabled }: TipTapProps) => {
  const editor = useEditor({
    editable: !isDisabled,
    onUpdate: (v) => {
      onChange(v.editor.getHTML());
    },
    extensions: [StarterKit],

    content: value,
  });

  return (
    <VStack
      shadow="sm"
      p={3}
      rounded="2xl"
      backgroundColor={useColorModeValue("paper.300", "ocean.600")}
    >
      <MenuBar editor={editor} />
      <Prose
        rounded="md"
        border="1px solid"
        borderColor={useColorModeValue("ocean.500", "ocean.200")}
        padding={4}
        w="full"
      >
        <EditorContent height="600px" editor={editor} />
      </Prose>
    </VStack>
  );
};

export default TipTap;
