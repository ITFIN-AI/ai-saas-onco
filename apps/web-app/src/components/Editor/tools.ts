import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Warning from '@editorjs/warning';
import Code from '@editorjs/code';
import Image from '@editorjs/image';
import Raw from '@editorjs/raw';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import CheckList from '@editorjs/checklist';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';
import { v4 as uuid } from 'uuid';
import { message } from 'antd';
import CodeBox from './RichCodeBox/RichCodeBox';
import i18n from '~/i18nextConfig';

export const EDITOR_JS_TOOLS = {
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        codepen: true,
        vimeo: {
          // eslint-disable-next-line
          regex: /(?:https?:\/\/)?(?:www.)?(?:player.)?vimeo.co(?:.+\/([^/]\d+)(?:#t=[\d]+)?s?$)/,
          embedUrl: 'https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0',
          html: '<iframe allowfullscreen style="width:100%;" height="320" frameborder="0" ></iframe>',
          height: 320,
          width: 580,
        },
        imgur: true,
        gfycat: true,
        twitter: true,
        instagram: true,
      },
    },
  },
  table: Table,
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      placeholder: i18n.t<string>('products:resourcePlaceholder'),
    },
  },
  list: List,
  warning: Warning,
  code: Code,
  image: Image,
  raw: Raw,
  header: Header,
  quote: Quote,
  marker: Marker,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  codebox: {
    class: CodeBox,
    config: {
      useDefaultTheme: 'light',
    },
  },
};

export const createTools = ({ storageRef }: { storageRef: string }) => ({
  embed: {
    class: Embed,
    config: {
      services: {
        youtube: true,
        codepen: true,
        vimeo: {
          // eslint-disable-next-line
          regex: /(?:https?:\/\/)?(?:www.)?(?:player.)?vimeo.co(?:.+\/([^/]\d+)(?:#t=[\d]+)?s?$)/,
          embedUrl: 'https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0',
          html: '<iframe allowfullscreen webkitallowfullscreen mozallowfullscreen style="width:100%;" height="320" frameborder="0" ></iframe>',
          height: 320,
          width: 580,
        },
        imgur: true,
        gfycat: true,
        twitter: true,
        instagram: true,
      },
    },
  },
  table: Table,
  paragraph: {
    class: Paragraph,
    inlineToolbar: true,
    config: {
      placeholder: i18n.t<string>('products:resourcePlaceholder'),
    },
  },
  list: List,
  warning: Warning,
  code: Code,
  image: {
    class: Image,
    config: {
      uploader: {
        /**
         * Send URL-string to the server. Backend should load image by this URL and return an uploaded image data
         * @param {string} url - pasted image URL
         * @return {Promise.<{success, file: {url}}>}
         */
        uploadByUrl(url: string) {
          // your ajax request for uploading
          return Promise.resolve({
            success: 1,
            file: {
              url,
              // any other image data you want to store, such as width, height, color, extension, etc
            },
          });
        },
        async uploadByFile(file: File) {
          // your own uploading logic here
          message.loading(i18n.t<string>('products:sending'));
          const ref = firebase.storage().ref(`${storageRef}/${uuid()}-${file.name}`);
          const snapshot = await ref.put(file);
          const fileUrl = await snapshot.ref.getDownloadURL();
          message.destroy();

          return {
            success: 1,
            file: {
              url: fileUrl,
              size: file.size,
              name: file.name,
              type: file.type,
            },
          };
        },
      },
    },
  },
  raw: Raw,
  header: Header,
  quote: Quote,
  marker: Marker,
  checklist: CheckList,
  delimiter: Delimiter,
  inlineCode: InlineCode,
  codebox: {
    class: CodeBox,
    config: {
      useDefaultTheme: 'light',
    },
  },
});
