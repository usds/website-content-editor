import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {frontmatterCustomDialogOpen$} from '.';
import {
  editorRootElementRef$,
  iconComponentFor$,
  markdown$,
} from "@mdxeditor/editor";
import {useCellValues, usePublisher} from '@mdxeditor/gurx';

import styles from '../../styles/mdxeditor.copy.module.css';
import stylesCustom from '../../styles/mdxeditor.custom.module.css';
import {Fieldset, Grid, GridContainer, Checkbox, FileInput, Label} from "@trussworks/react-uswds";
import {BlogFrontMatterFields, CACHE_NAME, READING_WORDS_PER_MINUTE} from "../../types/commontypes.ts";
import {
  blogFieldsFixup,
  generateFields,
  getYamlBlogHeader,
  yamlToBlogFields
} from "../frontmatterUtils.ts";
import {TextareaFieldUSWDS, TextFieldUSWDS} from "../../components/formComponents.tsx";
import {cleanupFilename, forceTypeBoolean, getFilnamePartOfUrlPath} from "../../misc.ts";
import {showToast} from "../../components/showToast.tsx";

export interface FrontmatterCustomEditorProps {
  yaml: string
  onChange: (yaml: string) => void
}

//
export const FrontmatterCustomEditor = ({yaml, onChange}: FrontmatterCustomEditorProps) => {
  // open webcache is async so we do it once in a useEffect(Once) below so we don't have to await for it.
  const [webCache, setWebCache] = useState<Cache>();
  const [editorRootElementRef, iconComponentFor, frontmatterDialogOpen, markdown] = useCellValues(
    editorRootElementRef$,
    iconComponentFor$,
    frontmatterCustomDialogOpen$,
    markdown$
  );
  const setFrontmatterDialogOpen = usePublisher(frontmatterCustomDialogOpen$);

  const getFrontMatterFields = () => {
    const fields = yamlToBlogFields(yaml);
    // we do some basic cleanup. We'll need to set it back?
    fields.carousel_image = getFilnamePartOfUrlPath(fields.carousel_image);
    return fields;
  };

  // const [values, setValues] = React.useState<BlogFrontMatterFields>(frontMatterFields);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch, // used to show character count
    formState: {errors}
  } = useForm({
    values: getFrontMatterFields()
  });

  const useOnceRef = useRef(false);
  useEffect(() => {
    if (useOnceRef.current) {
      return;
    }
    useOnceRef.current = true;
    // sugar to call an async
    void (async () => {
      const webcache = await caches.open(CACHE_NAME);
      setWebCache(webcache);
    })();
  }, []);

  const onSubmit = React.useCallback(
    (frontMatterFields: BlogFrontMatterFields) => {
      const fixedUpFields = blogFieldsFixup(frontMatterFields);
      const yamlstr = getYamlBlogHeader(fixedUpFields);
      onChange(yamlstr);
      setFrontmatterDialogOpen(false);
    },
    [onChange, setFrontmatterDialogOpen]
  )

  const doCreateNewPermalink = () => {
    const title = getValues("title");
    if (title.trim() === "") {
      showToast("Title fields should filled out first.", "error");
      return;
    }

    const oldPermalink = getValues("permalink");
    const fields = getValues();
    const {basename, permalink} = generateFields(fields, true);

    if (oldPermalink !== permalink) {
      if (!confirm(`The permalink used to access this page will change.\n\nContinue?`)) {
        return;
      }
      // we'll need to update the basename too.
      setValue("basename", basename ?? "");
    }

    if (permalink?.length) {
      setValue("permalink", permalink);
    }
  }

  // const refreshPermalink = () => {}

  const recalcReadTime = () => {
    // ignore the frontmatter bit
    const bodyMd = markdown.split("---").pop() ?? "";
    if (bodyMd?.trim().length < READING_WORDS_PER_MINUTE) {
      showToast("Article body too short to estimate. Defaulting to 1 minute.", "warning");
      setValue("readtime_minutes", 1);
      return;
    }
    const wordCount = bodyMd
      .replace(/ *\([^)]*\) */ig, " ") // remove between ()
      .replace(/(<([^>]+)>)/ig, " ") // remove between <></>
      .replace(/[^a-zA-Z0-9\s+]/ig, "") // remove non-alphanumberic (like # and ##)
      .replace(/\s+/g, ' ')
      .trim()
      .split(" ").length;
    const readingTimeInMinutes = Math.ceil(wordCount / READING_WORDS_PER_MINUTE); // 200 words-per-minute
    setValue("readtime_minutes", readingTimeInMinutes);
  }
  const previewImgFilename = cleanupFilename(getValues("carousel_image"));
  const fileInputDefaultImage = previewImgFilename.length ? `/mdedit/img/${previewImgFilename}` : undefined

  console.log(`inital value for carousel_show: ${getValues("carousel_show")}`)
  return (
    <Fragment>
      <Dialog.Root open={frontmatterDialogOpen} onOpenChange={(open) => setFrontmatterDialogOpen(open)}>
        <Dialog.Portal container={editorRootElementRef?.current}>
          <Dialog.Overlay className={styles.dialogOverlay}/>
          <Dialog.Content className={classNames(styles.largeDialogContent, stylesCustom.largeDialogContentOverrides)}
                          data-editor-type="frontmatter">
            <form className={classNames(stylesCustom.frontmatterDialogForm)}
                  onSubmit={(e) => {
                    void handleSubmit(onSubmit)(e);
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onReset={(e) => {
                    setFrontmatterDialogOpen(false);
                    reset();
                    e.preventDefault();
                    e.stopPropagation();
                  }}
            >
              <div className={"text-bold"}>Page information<br/>(appears at top of post)</div>
              <Fieldset className={classNames("usa-form", stylesCustom.frontmatterDialogForm)}>
                <GridContainer className={"margin-bottom-2"}>
                  <TextFieldUSWDS
                    id={"title"}
                    {...register("title", {required: true})}
                    className={"usa-input--2xl usa-input--2xs"}
                    label={`Title [Characters: ${watch("title")?.length ?? 0} -- Ideally < 80]`}
                    required={true}
                    error={errors?.title?.message}
                  />

                  <TextFieldUSWDS
                    id={"date"}
                    {...register("date", {
                      required: true,
                      pattern: {
                        // pattern is for a date like "Jan 1, 2022"
                        value: /[JFMASOND][a-z]{2} [0-9]{1,2}, [0-9]{4}/,
                        message: "Date doesn't appear to be formatted correctly",
                      },
                    })}
                    className={"usa-input--2xl usa-input--2xs"}
                    label={`Date for post (format: "Apr 27, 2022")`}
                    error={errors?.date?.message}
                    required={true}
                  />

                  <TextFieldUSWDS
                    id={"permalink"}
                    {...register("permalink", {required: true})}
                    className={"usa-input--2xl usa-input--2xs"}
                    label={`Permalink for post`}
                    required={true}
                    error={errors?.permalink?.message}
                  />
                  <button type={"button"} onClick={() => doCreateNewPermalink()}>regenerate</button>

                  <TextFieldUSWDS id={"author"}
                                  {...register("author", {required: true})}
                                  className={"usa-input--2xl usa-input--2xs"}
                                  label={"Author(s) for post"}
                                  required={true}
                  />

                  <TextFieldUSWDS id={"readtime_minutes"}
                                  type={"number"}
                                  {...register("readtime_minutes", {
                                    required: true,
                                    min: 1, max: 60
                                  })}
                                  min="1" max="60"
                                  className={"usa-input--2xl usa-input--2xs"}
                                  error={errors?.readtime_minutes?.message}
                                  label={`Minutes to read based on ${READING_WORDS_PER_MINUTE} words-per-minute`}
                  />
                  <button type={"button"} onClick={() => recalcReadTime()}>Recalculate based on article</button>
                </GridContainer>

                <div className={"text-bold padding-top-3"}>Carousel/Listing Preview<br/>
                  (Summary card that appears elsewhere on the site)
                </div>
                <GridContainer className={"margin-bottom-2"}>
                  <TextFieldUSWDS id={"carousel_title"}
                                  {...register("carousel_title", {required: false})}
                                  className={"usa-input--2xl usa-input--2xs"}
                                  label={`Preview Title [Characters: ${watch("title")?.length ?? 0} -- Ideally < 80]`}
                                  error={errors?.carousel_title?.message}
                  />
                  <TextareaFieldUSWDS id={"carousel_summary"}
                                      {...register("carousel_summary", {required: false})}
                                      className={"usa-input--2xl usa-input--2xs"}
                                      aria-multiline={"true"}
                                      label={`Preview Summary [Characters: ${watch("carousel_summary")?.length ?? 0} -- Ideally < 250]`}
                  />

                  <Fieldset>
                    <Label htmlFor="carousel_image">
                      Image for Carousel
                    </Label>
                    {previewImgFilename && <img id={previewImgFilename} src={fileInputDefaultImage} className={"previewImgFilename"} />}
                    <br/>
                    {previewImgFilename}
                    <FileInput id={"carousel_image"}
                               {...register("carousel_image", {required: false})}
                               name={"carousel_image"}
                               crossOrigin={"use-credentials"}
                               className={"usa-input--2xl usa-input--2xs"}
                               chooseText={"click to upload image"}
                               errorText={errors?.carousel_image?.message}
                               accept={".jpg,.jpeg,.png"}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                 if (e.target?.files && e.target.files.length > 0) {
                                   const file = e.target.files[0];
                                   const filename = cleanupFilename(file.name);
                                   const newHeaders = new Headers();
                                   newHeaders.set('Content-Type','image/jpg'); // todo: support png.
                                   newHeaders.set('Content-Length', Number(file.size).toString());
                                   const response = new Response( file.stream(),
                                     { status: 200, statusText: "ok", headers: newHeaders } );
                                   void webCache?.put(`/mdedit/img/${filename}`, response.clone());
                                   setValue("carousel_image", filename);
                                 }}}
                    />
                  </Fieldset>

                  <TextFieldUSWDS id={"carousel_image_alt_text"}
                                  {...register("carousel_image_alt_text", {required: false})}
                                  className={"usa-input--2xl usa-input--2xs"}
                                  aria-multiline={"true"}
                                  label={"Preview Image Description (508 compliance)"}
                                  error={errors?.carousel_image_alt_text?.message}
                  />
                  <Controller
                    control={control}
                    name="carousel_show"
                    defaultValue={getValues("carousel_show")}
                    render={({field: {onChange, name, value}}) => {
                      const checked = forceTypeBoolean(value) ?? false;
                      return (
                        <Checkbox
                          id={"carousel_show_checkbox"}
                          name={"carousel_show_checkbox"}
                          label={"Promote to News and Blog page"}
                          checked={checked}
                          value={"true"}
                          onChange={onChange}
                          className={"usa-input--2xl usa-input--2xs"}/>);
                    }}/>
                </GridContainer>

                <GridContainer className={"margin-top-1em"}>
                  <Grid row style={{display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-2)'}}>
                    <button type="submit" className={styles.primaryButton}>
                      Save
                    </button>
                    <button type="reset" className={styles.secondaryButton}>
                      Cancel
                    </button>
                  </Grid>
                </GridContainer>
              </Fieldset>
            </form>
            <Dialog.Close asChild>
              <button className={styles.dialogCloseButton} aria-label="Close">
                {iconComponentFor('close')}
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Fragment>
  )
}

// const TableInput = React.forwardRef<
//   HTMLInputElement,
//   React.InputHTMLAttributes<HTMLInputElement> & { autofocusIfEmpty?: boolean; autoFocus?: boolean; value?: string }
// >(({className, autofocusIfEmpty: _, ...props}, ref) => {
//   return <input className={classNames(styles.propertyEditorInput, className)} {...props} ref={ref}/>
// })
