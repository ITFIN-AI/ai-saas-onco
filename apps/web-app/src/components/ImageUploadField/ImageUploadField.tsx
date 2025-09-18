import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Button, Upload, message, Modal } from 'antd';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { UploadOutlined } from '@ant-design/icons';
import { RcFile } from 'antd/lib/upload';
import { UploadFile } from 'antd/lib/upload/interface';
import ImgCrop from 'antd-img-crop';
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
  onChange?: (urls: string[]) => void;
  fileList?: string[];
  multiple?: boolean;
  withCrop?: boolean;
  disabled?: boolean;
  shouldRemovePermanently?: boolean;
}

type Props = OwnProps;

const beforeUpload = (file: RcFile) => {
  const validationType =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.type === 'image/gif' ||
    file.type === 'image/png';
  if (!validationType) {
    message.error('Rozszerzenie pliku jest niedopuszczalne, wyślij zdjęcie w formacie jpg/gif/png');
  }
  const isLt1M = file.size / 1024 / 1024 < 1;
  if (!isLt1M) {
    message.error('Zdjęcie nie może być większe niż 1MB');
  }

  return validationType && isLt1M;
};

interface File extends RcFile {
  url: string | null;
}

const ImageUploadField: FunctionComponent<Props> = ({
  storageRef,
  onChange,
  fileList: defaultFileList,
  multiple,
  withCrop = true,
  disabled = false,
  shouldRemovePermanently = true,
}) => {
  const { t } = useTranslation('common');
  // @ts-ignore
  const [fileList, updateFileList] = useState<UploadFile<File>[]>(() => {
    if (defaultFileList && defaultFileList.length) {
      return [
        {
          url: defaultFileList[0],
          name: 'default',
          size: 0,
          uid: '-1',
          status: 'done',
          type: 'image/png',
        },
      ];
    }

    return [];
  });

  useEffect(() => {
    if (defaultFileList && defaultFileList.length) {
      updateFileList([
        {
          url: defaultFileList[0],
          name: 'default',
          size: 0,
          uid: '-1',
          status: 'done',
          type: 'image/png',
        } as UploadFile<File>,
      ]);
    } else {
      updateFileList([]);
    }
  }, [defaultFileList]);

  const [preview, setPreviewImg] = useState<string | null>(null);

  const onPreview = useCallback(
    (file: UploadFile<File>) => {
      setPreviewImg((file?.url || file?.thumbUrl) ?? null);
    },
    [setPreviewImg]
  );

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
        message.error(t<string>('validationErrors.cannotAddImage'));
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
      async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          onSuccess({}, file);
          onChange?.([
            ...fileList.map((item) => item?.url).filter((url): url is string => url !== undefined),
            downloadURL,
          ]);
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
        } catch (e) {
          message.error(t<string>('validationErrors.cannotAddImage'));
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
        }
      }
    );
  };

  const onRemove = async (file: UploadFile<File>) => {
    updateFileList((prev) => prev.filter((savedFile) => savedFile.url !== file.url));
    onChange?.(fileList.map((item) => item?.url || '').filter((url) => url && url !== file.url));
    try {
      if (file.uid && (file.status === 'done' || file.uid === '-1')) {
        if (file.uid === '-1' && file.url) {
          if (shouldRemovePermanently) {
            const ref = firebase.storage().refFromURL(file.url);
            await ref.delete();
          }
        } else {
          const ref = firebase.storage().ref(`${storageRef}/${file.uid}-${file.name}`);
          await ref.delete();
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Remove file error:', e);
    }
  };

  if (!withCrop) {
    return (
      <>
        <Upload
          name="logo"
          listType="picture-card"
          beforeUpload={beforeUpload}
          onPreview={onPreview}
          onRemove={onRemove}
          fileList={fileList}
          multiple={multiple}
          // @ts-ignore
          customRequest={uploadToStorage}
        >
          {!multiple && fileList.length >= 1 ? null : (
            <Button type="text" icon={<UploadOutlined />} />
          )}
        </Upload>
        <Modal visible={!!preview} footer={null} onCancel={() => setPreviewImg(null)}>
          <img alt="example" style={{ width: '100%', marginTop: 15 }} src={preview ?? undefined} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <ImgCrop showGrid>
        <Upload
          name="logo"
          listType="picture-card"
          beforeUpload={beforeUpload}
          onPreview={onPreview}
          onRemove={onRemove}
          fileList={fileList}
          multiple={multiple}
          // @ts-ignore
          customRequest={uploadToStorage}
          disabled={disabled}
        >
          {!multiple && fileList.length >= 1 ? null : (
            <Button type="text" icon={<UploadOutlined />} />
          )}
        </Upload>
      </ImgCrop>
      <Modal visible={!!preview} footer={null} onCancel={() => setPreviewImg(null)}>
        <img alt="example" style={{ width: '100%', marginTop: 15 }} src={preview ?? undefined} />
      </Modal>
    </>
  );
};

export default ImageUploadField;
