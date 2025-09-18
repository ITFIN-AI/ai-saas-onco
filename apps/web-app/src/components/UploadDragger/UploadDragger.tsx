import React, { FunctionComponent, memo, useEffect, useState } from 'react';
import { Upload, message } from 'antd';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import last from 'lodash.last';
import { InboxOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import { useTranslation } from 'react-i18next';

export interface RcCustomRequestOptions {
  onProgress: (
    event: {
      percent: number;
    },
    file: RcFile
  ) => void;
  onError: (error: Error, response?: unknown, file?: RcFile) => void;
  onSuccess: (response: object, file: RcFile) => void;
  data: object;
  filename: string;
  file: RcFile;
  withCredentials: boolean;
  action: string;
  headers: object;
}

interface OwnProps {
  storageRef: string;
  onChange?: (urls: { url: string; name: string; uid: string }[]) => void;
  fileList?: { url: string; name: string; uid: string }[];
  multiple?: boolean;
  readonly?: boolean;
}

type Props = OwnProps;

const beforeUpload = (file: RcFile, _: RcFile[], limitInMB = 4000) => {
  const validationType =
    file.type === 'application/pdf' ||
    file.type === 'image/jpg' ||
    file.type === 'image/gif' ||
    file.type === 'image/png';
  const extension = last(file.name.split('.'));
  const allowedExtension = [
    'txt',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'mp3',
    'mp4',
    'csv',
    'zip',
    'jpg',
    'jpeg',
    'mobi',
    'epub',
  ];
  if (!extension || (!validationType && !allowedExtension.includes(extension))) {
    message.error(
      'Rozszerzenie pliku jest niedopuszczalne, wyślij plik w formacie jpg/gif/png/pdf/mobi/epub/txt/doc/docx/xls/xlsx/ppt/pptx/mp3/mp4/csv/zip.'
    );
  }
  const isToLarge = file.size / 1024 / 1024 > limitInMB;
  if (isToLarge) {
    message.error(`Plik nie może być większy niż ${limitInMB}MB.`);
  }

  return Boolean(
    (validationType || (extension && allowedExtension.includes(extension))) && !isToLarge
  );
};

interface File extends RcFile {
  url: string | null;
}

const UploadField: FunctionComponent<Props> = ({
  storageRef,
  onChange,
  fileList: defaultFileList,
  multiple,
  readonly,
}) => {
  const { t } = useTranslation('common');

  const [fileList, updateFileList] = useState<UploadFile<File>[]>(() => {
    if (defaultFileList?.length) {
      return defaultFileList.map(
        (item) =>
          ({
            url: item.url,
            name: item.name,
            size: 0,
            uid: item.uid,
            status: 'done',
          }) as UploadFile<File>
      );
    }

    return [];
  });

  useEffect(() => {
    onChange?.(
      fileList
        .filter((item) => item.status === 'done' && item.url)
        .map((item) => ({ url: item.url ?? '', name: item.name ?? '', uid: item.uid }))
    );
    // eslint-disable-next-line
  }, [fileList]);

  const uploadToStorage = ({ file, onSuccess }: RcCustomRequestOptions) => {
    const ref = firebase.storage().ref(`${storageRef}/${file.uid}-${file.name}`);
    // @ts-ignore
    updateFileList((prev) => [
      ...prev,
      {
        type: file.type,
        name: file.name,
        uid: file.uid,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        size: file.size,
        percent: 0,
        status: 'uploading',
      },
    ]);

    const uploadTask = ref.put(file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        updateFileList((prev) =>
          prev.map((savedFile) => {
            if (savedFile.uid === file.uid) {
              return {
                ...savedFile,
                percent: progress,
              };
            }

            return savedFile;
          })
        );
      },
      () => {
        message.error('Twój plik nie został dodany. Spróbuj jeszcze raz');
        updateFileList((prev) =>
          prev.map((savedFile) => {
            if (savedFile.uid === file.uid) {
              return {
                ...savedFile,
                status: 'error',
              };
            }

            return savedFile;
          })
        );
      },
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          onSuccess({}, file);
          updateFileList((prev) =>
            prev.map((savedFile) => {
              if (savedFile.uid === file.uid) {
                return {
                  ...savedFile,
                  status: 'done',
                  url: downloadURL,
                };
              }

              return savedFile;
            })
          );
        });
      }
    );
  };

  const onRemove = (file: UploadFile<File>) => {
    try {
      updateFileList((prev) =>
        prev.filter((savedFile) => {
          if (savedFile.uid !== file.uid) {
            return true;
          }

          if (savedFile.uid && savedFile.status === 'done') {
            const ref = firebase.storage().ref(`${storageRef}/${savedFile.uid}-${savedFile.name}`);
            ref.delete();
          }

          return false;
        })
      );
      onChange?.(
        fileList
          .filter((item) => item.url !== file.url)
          .map((item) => ({ url: item.url ?? '', name: item.name ?? '', uid: item.uid }))
      );
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  return (
    <>
      <Upload.Dragger
        name="file"
        beforeUpload={beforeUpload}
        onRemove={onRemove}
        fileList={fileList}
        multiple={multiple}
        listType="picture"
        // @ts-ignore
        customRequest={uploadToStorage}
        disabled={readonly}
        style={{ ...(readonly && { display: 'none' }) }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{t<string>('upload.clickOrDrag')}</p>
        <p className="ant-upload-hint">{t<string>('upload.fileUpload')}</p>
      </Upload.Dragger>
    </>
  );
};

export default memo(UploadField);
