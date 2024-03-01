import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import React from 'react';
import {useForm} from 'react-hook-form';

import styles from '../styles/mdxeditor.copy.module.css';
import stylesCustom from '../styles/mdxeditor.custom.module.css';

import {useCellValues, usePublisher} from '@mdxeditor/gurx';
import {
  closeImageDialog$,
  editorRootElementRef$,
  imageDialogState$,
  saveImage$
} from "@mdxeditor/editor";
import {getFilnamePartOfUrlPath} from "../misc.ts";

interface ImageCustomFormFields {
  src?: string;
  title?: string;
  altText?: string;
  shortcode?: boolean;
  file?: FileList;
}

// InsertImageParameters
export const ImageDialogCustom: React.FC = () => {
  const [state, editorRootElementRef] = useCellValues(
    imageDialogState$,
    editorRootElementRef$
  )
  const saveImage = usePublisher<ImageCustomFormFields>(saveImage$);
  const closeImageDialog = usePublisher(closeImageDialog$);

  // eslint-disable @typescript-eslint/no-unused-vars
  const {
    register,
    handleSubmit,
    // control,
    getValues,
    reset
  } = useForm<ImageCustomFormFields>(
    {
      values: state.type === 'editing' ? (state.initialValues) : {}
    });

  const filename = getFilnamePartOfUrlPath(getValues()?.src);

  return <Dialog.Root
    open={state.type !== 'inactive'}
    onOpenChange={(open) => {
      if (!open) {
        closeImageDialog();
        reset({src: '', title: '', altText: ''});
      }
    }}
  >
    <Dialog.Portal container={editorRootElementRef?.current}>
      <Dialog.Overlay className={styles.dialogOverlay}/>
      <Dialog.Content
        className={classNames(styles.largeDialogContent, stylesCustom.largeDialogContentOverrides)}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <form
          onSubmit={(e) => {
            void handleSubmit(saveImage)(e);
            reset({src: '', title: '', altText: ''});
            e.preventDefault();
            e.stopPropagation();
          }}
          className={styles.multiFieldForm}
        >
          <div className={stylesCustom.dialogTitle}>Embedded image</div>
          <div className={styles.formField}>
            <label htmlFor={"imgFileUpload"}>
              Click to select image from your device
            </label>
            <input type="file" {...register('file')} />
            {filename.length? `Current: "${filename}"`: null }
          </div>

          {/*<div className={styles.formField}>*/}
          {/*  <label htmlFor="shortcode"> <input id={"shortcode"} type={"checkbox"} {...register('shortcode')}*/}
          {/*                                     className={""}/> Check to generate shortcode name</label>*/}
          {/*</div>*/}

          <div className={styles.formField}>
            <label htmlFor="altText">Alt (Accessibility: detailed image description):</label>
            <input autoComplete={"nope"} type="text" {...register('altText')} className={styles.textInput}/>
          </div>

          <div className={styles.formField}>
            <label htmlFor="title">Optional Title: (Text displayed for a mouse hover)</label>
            <input autoComplete={"nope"} type="text" {...register('title')} className={styles.textInput}/>
          </div>

          <div className={stylesCustom.imageSaveDialogButtons}>
            <button type="submit" title="Save" aria-label="Save" className={classNames(styles.primaryButton)}>
              Save
            </button>
            <Dialog.Close asChild>
              <button type="reset" title="Cancel" aria-label="Cancel" className={classNames(styles.secondaryButton)}>
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}
