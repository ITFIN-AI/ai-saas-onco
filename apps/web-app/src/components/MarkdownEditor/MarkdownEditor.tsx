import React, { FunctionComponent, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import {
  MDXEditor,
  MDXEditorMethods,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  imagePlugin,
  diffSourcePlugin,
  CreateLink,
  InsertTable,
  InsertImage,
  ListsToggle,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  DiffSourceToggleWrapper,
  usePublisher,
  insertDirective$,
  directivesPlugin,
  DialogButton,
  DirectiveDescriptor,
  DirectiveEditorProps,
  Separator,
  InsertCodeBlock,
  ChangeCodeMirrorLanguage,
  ConditionalContents,
} from '@mdxeditor/editor';
import { v4 as uuid } from 'uuid';
import i18n from '~/i18nextConfig';
import { message } from 'antd';
import { VideoCameraAddOutlined } from '@ant-design/icons';

const parseVideoUrl = (url: string): string | null => {
  if (/^(https?:\/\/)?(www\.)?(youtube\.com\/|youtu\.be\/)/.test(url)) {
    const youtubeShortMatch = url.match(/youtu\.be\/([^?]+)/);
    const youtubeLongMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = youtubeShortMatch
      ? youtubeShortMatch[1]
      : youtubeLongMatch && youtubeLongMatch[1];

    return videoId ? 'https://www.youtube.com/embed/' + videoId : null;
  }
  if (/^(https?:\/\/)?(www\.)?(vimeo\.com\/)/.test(url)) {
    const vimeoMatch = url.match(/\/(\d+)(?:\/[a-z0-9]+)?$/i);
    const videoId = vimeoMatch && vimeoMatch[1];

    return videoId ? 'https://player.vimeo.com/video/' + videoId : null;
  }

  return null;
};

const VideoButton = () => {
  const insertDirective = usePublisher(insertDirective$);

  return (
    <DialogButton
      tooltipTitle="Insert video"
      submitButtonTitle="Insert video"
      dialogInputPlaceholder={`Enter URL form YouTube or Vimeo`}
      buttonContent={<VideoCameraAddOutlined style={{ fontSize: 24 }} />}
      onSubmit={(url) => {
        parseVideoUrl(url)
          ? insertDirective({
              name: 'video',
              type: 'textDirective',
              attributes: { url: parseVideoUrl(url) },
            })
          : message.error(i18n.t<string>('products:invalidVideoLink'));
      }}
    />
  );
};

const VideoDirectiveEditor = (props: DirectiveEditorProps) => {
  const url = props.mdastNode.attributes?.url;
  if (url) {
    return (
      <iframe
        width="560"
        height="315"
        src={url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  return null;
};

const VideoDirectiveDescriptor: DirectiveDescriptor = {
  type: 'textDirective',
  name: 'video',
  testNode(node) {
    return node.name === 'video';
  },
  attributes: [],
  hasChildren: true,
  Editor: VideoDirectiveEditor,
};

interface OwnProps {
  editorContent: string;
  setEditorContent?: React.Dispatch<React.SetStateAction<string>>;
  mdxEditorRef?: React.RefObject<MDXEditorMethods>;
  readOnly?: boolean;
  storageRef?: string;
}

type Props = OwnProps;

const MarkdownEditor: FunctionComponent<Props> = ({
  editorContent,
  setEditorContent,
  mdxEditorRef,
  readOnly,
  storageRef,
}) => {
  const mdxRef = mdxEditorRef ?? React.useRef<MDXEditorMethods>(null);

  useEffect(() => {
    if (editorContent && readOnly) {
      mdxRef?.current?.setMarkdown(editorContent);
    }
  }, [mdxRef, editorContent, readOnly]);

  const uploadToStorage = async (file: File): Promise<string> => {
    message.loading(i18n.t<string>('products:sending'));
    const ref = firebase.storage().ref(`${storageRef}/${uuid()}-${file.name}`);
    const snapshot = await ref.put(file);
    const fileUrl = await snapshot.ref.getDownloadURL();
    message.destroy();

    return fileUrl;
  };

  const imageUploadHandler = async (image: File) => {
    const response = await uploadToStorage(image);

    return response;
  };

  const codeBlockLanguages = {
    js: 'JavaScript',
    html: 'HTML',
    css: 'CSS',
    python: 'Python',
    java: 'Java',
    text: 'text',
  };

  const readOnlyPlugins = [
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    tablePlugin(),
    imagePlugin(),
    directivesPlugin({ directiveDescriptors: [VideoDirectiveDescriptor] }),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
    codeMirrorPlugin({ codeBlockLanguages }),
  ];

  const editModePlugins = [
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <ConditionalContents
            options={[
              {
                when: (editor) => editor?.editorType === 'codeblock',
                contents: () => <ChangeCodeMirrorLanguage />,
              },
              {
                fallback: () => (
                  <>
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <ListsToggle />
                    <Separator />
                    <CreateLink />
                    <InsertTable />
                    {storageRef && <InsertImage />}
                    <VideoButton />
                    <InsertCodeBlock />
                  </>
                ),
              },
            ]}
          />
          <DiffSourceToggleWrapper>
            <></>
          </DiffSourceToggleWrapper>
        </>
      ),
    }),
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    tablePlugin(),
    imagePlugin({ imageUploadHandler }),
    diffSourcePlugin(),
    directivesPlugin({ directiveDescriptors: [VideoDirectiveDescriptor] }),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
    codeMirrorPlugin({ codeBlockLanguages }),
  ];

  return (
    <div
      className={
        readOnly ? 'markdown markdown-container markdown-readonly' : 'markdown markdown-container'
      }
    >
      <MDXEditor
        autoFocus
        readOnly={readOnly}
        contentEditableClassName="markdown-editor"
        ref={mdxRef}
        markdown={editorContent}
        onChange={setEditorContent}
        plugins={readOnly ? readOnlyPlugins : editModePlugins}
      />
    </div>
  );
};

export default MarkdownEditor;
