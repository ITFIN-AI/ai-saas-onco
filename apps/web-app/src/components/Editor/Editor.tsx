import React, { FC, PropsWithChildren, useCallback, useEffect, useId, useRef } from 'react';
import EditorJS, { API, BlockToolData, LogLevels, OutputData } from '@editorjs/editorjs';
import * as styles from '~/components/Editor/Editor.module.scss';
import Paragraph from '@editorjs/paragraph';

export interface EditorJsProps {
  autofocus?: boolean;
  instanceRef?: (instance: EditorJS) => void;
  onChange?: (api: API, data?: OutputData) => void;
  onReady?: (instance?: EditorJS) => void;
  withBorder?: boolean;
  onCompareBlocks?: (
    newBlocks: BlockToolData | undefined,
    oldBlocks: BlockToolData | undefined
  ) => boolean;
  data: Readonly<EditorJS.EditorConfig['data']>;
  tools: Readonly<EditorJS.EditorConfig['tools']>;
  readOnly?: Readonly<EditorJS.EditorConfig['readOnly']>;
}

export type Props = PropsWithChildren<Readonly<EditorJsProps>>;

const Editor: FC<Props> = ({
  tools,
  instanceRef,
  data,
  onReady,
  onChange,
  onCompareBlocks,
  children,
  withBorder = false,
  readOnly,
  autofocus,
}) => {
  const holder = useId();
  const editor = useRef<EditorJS>();
  const prevData = useRef<OutputData | undefined>();

  useEffect(() => {
    if (!editor.current) {
      const extendTools = {
        // default tools
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        ...tools,
      };

      editor.current = new EditorJS({
        data,
        holder,
        tools: extendTools,
        readOnly,
        logLevel: 'ERROR' as LogLevels,
        ...(onReady && {
          onReady: handleReady,
        }),
        ...(onChange && {
          onChange: handleChange,
        }),
        autofocus,
      });
    }

    return () => {
      if (editor.current && editor.current.destroy) {
        editor.current.destroy();
        editor.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    if (instanceRef && editor.current) {
      instanceRef(editor.current);
    }
  }, [instanceRef, editor]);

  const changeData = useCallback(
    async (data?: OutputData) => {
      if (!editor.current) {
        return;
      }

      // if previous data is the same as the new data, do not re-render
      if (prevData.current === data) {
        return;
      }
      prevData.current = data;

      await editor.current.isReady;
      if (!data) {
        editor.current.clear();
      } else {
        await editor.current.render(data);
      }
    },
    [editor, prevData]
  );

  useEffect(() => {
    (async () => changeData(data))();
  }, [changeData, data]);

  const handleReady = () => {
    if (!onReady || !editor.current) {
      return;
    }

    onReady(editor.current);
  };

  const handleChange = async (api: API) => {
    if (!onChange) {
      return;
    }

    const newData = await editor.current?.save();
    const isBlocksEqual = onCompareBlocks?.(newData?.blocks, data?.blocks);

    if (isBlocksEqual) {
      return;
    }

    onChange(api, newData);
  };

  return (
    <>
      {children || (
        <div
          id={holder}
          className={styles.customEditor}
          style={{
            border: withBorder ? '1px solid #d9d9d9' : 'none',
            borderRadius: 5.5,
          }}
        />
      )}
    </>
  );
};

export default Editor;
